import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  INestApplication,
  Logger,
  NotFoundException,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { IsString } from 'class-validator';
import { CustomThrottlerGuard } from '../rate-limiting/rate-limit.guard';
import { globalValidationPipe } from '../validation/global-validation';
import { ApiExceptionFilter, codeForStatus } from './api-exception.filter';

class NameDto {
  @IsString() name: string;
}

@Controller('t')
class ThrowingController {
  @Get('ok')
  ok() {
    return { ok: true };
  }

  @Post('validated')
  validated(@Body() body: NameDto) {
    return body;
  }

  @Get('bad-request')
  badRequest() {
    throw new BadRequestException('Current password is incorrect');
  }

  @Get('not-found')
  notFound() {
    throw new NotFoundException('Workspace not found');
  }

  @Get('conflict')
  conflict() {
    throw new ConflictException('A workspace with this name already exists');
  }

  @Get('forbidden-with-code')
  forbiddenWithCode() {
    throw new ForbiddenException({ statusCode: 403, code: 'PASSWORD_CHANGE_REQUIRED', message: 'Change your password' });
  }

  @Get('string-body')
  stringBody() {
    throw new HttpException('Busy', 503);
  }

  @Get('unavailable')
  unavailable() {
    throw new ServiceUnavailableException({ message: 'Elasticsearch is unavailable', retryAfterSeconds: 5 });
  }

  @Get('crash')
  crash() {
    throw new Error('connect ECONNREFUSED 10.0.0.5:9200');
  }
}

/** The global filter over HTTP, with the global validation pipe and the throttler as main.ts and app.module.ts set them up */
describe('ApiExceptionFilter', () => {
  let app: INestApplication;
  let base: string;

  const call = async (method: string, route: string, body?: unknown) => {
    const res = await fetch(`${base}/t/${route}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, headers: res.headers, body: await res.json() };
  };

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 60_000, limit: 20 }] })],
      controllers: [ThrowingController],
      providers: [{ provide: APP_GUARD, useClass: CustomThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    app.useGlobalPipes(globalValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('adds a code from the status and keeps statusCode, message and error', async () => {
    expect(await call('GET', 'not-found')).toMatchObject({
      status: 404,
      body: { statusCode: 404, code: 'NOT_FOUND', message: 'Workspace not found', error: 'Not Found' },
    });
    expect((await call('GET', 'conflict')).body).toMatchObject({ statusCode: 409, code: 'CONFLICT', error: 'Conflict' });
    expect((await call('GET', 'bad-request')).body).toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR', message: 'Current password is incorrect' });
  });

  it('gives validation failures VALIDATION_ERROR with the field messages', async () => {
    const res = await call('POST', 'validated', { name: 3, extra: true });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR', error: 'Bad Request' });
    expect(res.body.message).toEqual(expect.arrayContaining(['property extra should not exist', 'name must be a string']));
  });

  it('keeps a code the route set, and the rest of its body', async () => {
    expect((await call('GET', 'forbidden-with-code')).body).toEqual({
      statusCode: 403,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'Change your password',
      error: 'Forbidden',
    });
    expect((await call('GET', 'unavailable')).body).toMatchObject({ statusCode: 503, code: 'SERVICE_UNAVAILABLE', retryAfterSeconds: 5 });
  });

  it('fills in a body thrown as a string', async () => {
    expect((await call('GET', 'string-body')).body).toEqual({ statusCode: 503, code: 'SERVICE_UNAVAILABLE', message: 'Busy', error: 'Service Unavailable' });
  });

  it('answers an unexpected error with a plain 500 and logs it', async () => {
    const res = await call('GET', 'crash');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ statusCode: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', error: 'Internal Server Error' });
    expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('codes unknown routes NOT_FOUND', async () => {
    expect((await call('GET', 'nowhere')).body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('sends the rate limit headers on successful responses, and RATE_LIMIT_EXCEEDED with Retry-After past the limit', async () => {
    const first = await fetch(`${base}/t/ok`);
    expect(first.status).toBe(200);
    expect(first.headers.get('x-ratelimit-limit')).toBe('20');
    const remaining = Number(first.headers.get('x-ratelimit-remaining'));
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThan(20);
    const reset = Number(first.headers.get('x-ratelimit-reset'));
    expect(reset).toBeGreaterThan(0);
    expect(reset).toBeLessThanOrEqual(60);

    let limited: Awaited<ReturnType<typeof call>> | undefined;
    for (let i = 0; i < 25 && !limited; i++) {
      const res = await call('GET', 'ok');
      if (res.status === 429) limited = res;
    }
    expect(limited).toBeDefined();
    expect(limited!.body).toMatchObject({ statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' });
    expect(limited!.headers.get('x-ratelimit-remaining')).toBe('0');
    const retryAfter = Number(limited!.headers.get('retry-after'));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
    expect(limited!.headers.get('x-ratelimit-reset')).toBe(String(retryAfter));
    // Each route counts separately
    expect((await call('GET', 'conflict')).status).toBe(409);
  });
});

describe('codeForStatus', () => {
  it('names statuses as stable codes', () => {
    expect(codeForStatus(401)).toBe('UNAUTHORIZED');
    expect(codeForStatus(413)).toBe('PAYLOAD_TOO_LARGE');
    expect(codeForStatus(429)).toBe('RATE_LIMIT_EXCEEDED');
    expect(codeForStatus(503)).toBe('SERVICE_UNAVAILABLE');
    expect(codeForStatus(599)).toBe('INTERNAL_SERVER_ERROR');
    expect(codeForStatus(499)).toBe('HTTP_499');
  });
});
