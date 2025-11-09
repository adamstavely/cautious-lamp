import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Body, Headers, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ComponentRequestsService } from './component-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { VoteRequestDto } from './dto/vote-request.dto';

@Controller('api/v1/component-requests')
export class ComponentRequestsController {
  constructor(private readonly requestsService: ComponentRequestsService) {}

  private extractApiKey(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  private validateRequest(authHeader: string | undefined): void {
    const apiKey = this.extractApiKey(authHeader);
    if (!apiKey || apiKey !== 'test-api-key-123') {
      throw new UnauthorizedException('Invalid or missing API key');
    }
  }

  @Get('test')
  testRoute() {
    return { message: 'ComponentRequestsController is working', timestamp: new Date().toISOString() };
  }

  @Get()
  getAllRequests(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('requestedBy') requestedBy?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.requestsService.getAllRequests({
      status,
      category,
      priority,
      assignedTo,
      requestedBy,
    });
  }

  @Get('analytics')
  getAnalytics(@Headers('authorization') authHeader?: string) {
    this.validateRequest(authHeader);
    return this.requestsService.getRequestAnalytics();
  }

  @Get('duplicates')
  checkDuplicates(
    @Query('title') title: string,
    @Query('description') description?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    if (!title) {
      throw new BadRequestException('Title is required');
    }
    return this.requestsService.checkForDuplicates(title, description);
  }

  @Get(':id')
  getRequest(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.getRequest(id);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post()
  createRequest(
    @Body() createDto: CreateRequestDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    // Check for duplicates before creating
    const duplicates = this.requestsService.checkForDuplicates(
      createDto.title,
      createDto.description
    );
    if (duplicates.similar.length > 0) {
      return {
        duplicateWarning: true,
        similarRequests: duplicates.similar,
        request: this.requestsService.createRequest(createDto),
      };
    }
    return this.requestsService.createRequest(createDto);
  }

  @Put(':id')
  updateRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequestDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.updateRequest(id, updateDto);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Delete(':id')
  deleteRequest(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.requestsService.deleteRequest(id);
    if (!deleted) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return { success: true, id };
  }

  @Post(':id/vote')
  voteRequest(
    @Param('id') id: string,
    @Body() voteDto: VoteRequestDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.voteRequest(id, voteDto.userId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body() transitionDto: TransitionStatusDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    try {
      const request = this.requestsService.transitionStatus(
        id,
        transitionDto.status,
        transitionDto.userId,
        transitionDto.comment
      );
      if (!request) {
        throw new BadRequestException(`Request '${id}' not found`);
      }
      return request;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':id/assign')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.assignRequest(id, body.userId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() commentDto: AddCommentDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const comment = this.requestsService.addComment(id, commentDto);
    return comment;
  }

  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.requestsService.getComments(id);
  }

  @Post(':id/approve')
  approveRequest(
    @Param('id') id: string,
    @Body() body: { userId: string; stage?: 'design' | 'technical' | 'final' },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.approveRequest(id, body.userId, body.stage);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/reject')
  rejectRequest(
    @Param('id') id: string,
    @Body() body: { userId: string; reason: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.rejectRequest(id, body.userId, body.reason);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/promote')
  promoteToSystem(
    @Param('id') id: string,
    @Body() body: { componentId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.promoteToSystem(id, body.componentId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/link-component')
  linkToComponent(
    @Param('id') id: string,
    @Body() body: { componentId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.linkToComponent(id, body.componentId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/unlink-component')
  unlinkFromComponent(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const request = this.requestsService.unlinkFromComponent(id);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }
}

