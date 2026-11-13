import { ServiceUnavailableException } from '@nestjs/common';
import { ReviewFilesService, contentDisposition } from './review-files.service';

describe('ReviewFilesService', () => {
  const saved = { secret: process.env.REVIEW_FILE_SECRET, env: process.env.NODE_ENV };

  afterEach(() => {
    if (saved.secret === undefined) delete process.env.REVIEW_FILE_SECRET;
    else process.env.REVIEW_FILE_SECRET = saved.secret;
    process.env.NODE_ENV = saved.env;
  });

  function signedParts(files: ReviewFilesService, now = Date.now()) {
    const url = new URL(`http://x${files.signedPath('rev_abc', 'f_def', now)}`);
    return {
      pathname: url.pathname,
      fileId: url.pathname.split('/').pop()!,
      expires: url.searchParams.get('expires')!,
      sig: url.searchParams.get('sig')!,
    };
  }

  describe('signed URLs', () => {
    beforeEach(() => {
      process.env.REVIEW_FILE_SECRET = 'secret-one';
    });

    it('verifies a fresh signature', () => {
      const files = new ReviewFilesService();
      const { pathname, fileId, expires, sig } = signedParts(files);
      expect(pathname).toBe('/api/v1/review-files/rev_abc.f_def');
      expect(Number(expires) - Math.floor(Date.now() / 1000)).toBeLessThanOrEqual(600);
      expect(files.verify(fileId, expires, sig)).toBe(true);
    });

    it('rejects an expired signature', () => {
      const files = new ReviewFilesService();
      const { fileId, expires, sig } = signedParts(files, Date.now() - 11 * 60 * 1000);
      expect(files.verify(fileId, expires, sig)).toBe(false);
    });

    it('rejects tampering with the file id, expiry or signature', () => {
      const files = new ReviewFilesService();
      const { fileId, expires, sig } = signedParts(files);
      expect(files.verify('rev_abc.f_other', expires, sig)).toBe(false);
      expect(files.verify(fileId, String(Number(expires) + 3600), sig)).toBe(false);
      expect(files.verify(fileId, expires, sig.slice(0, -1) + (sig.endsWith('A') ? 'B' : 'A'))).toBe(false);
      expect(files.verify(fileId, expires, '')).toBe(false);
      expect(files.verify(fileId, 'soon', sig)).toBe(false);
    });

    it('rejects signatures made with another secret', () => {
      const { fileId, expires, sig } = signedParts(new ReviewFilesService());
      process.env.REVIEW_FILE_SECRET = 'secret-two';
      expect(new ReviewFilesService().verify(fileId, expires, sig)).toBe(false);
    });
  });

  describe('secret configuration', () => {
    it('uses a random secret in development', () => {
      delete process.env.REVIEW_FILE_SECRET;
      process.env.NODE_ENV = 'development';
      const files = new ReviewFilesService();
      const { fileId, expires, sig } = signedParts(files);
      expect(files.verify(fileId, expires, sig)).toBe(true);
    });

    it('refuses to sign or serve outside development without a secret', () => {
      delete process.env.REVIEW_FILE_SECRET;
      process.env.NODE_ENV = 'production';
      const files = new ReviewFilesService();
      expect(() => files.signedPath('rev_abc', 'f_def')).toThrow(ServiceUnavailableException);
      expect(() => files.verify('rev_abc.f_def', String(Math.floor(Date.now() / 1000) + 60), 'x')).toThrow(
        ServiceUnavailableException,
      );
    });
  });

  it('parses only well-formed file ids', () => {
    expect(ReviewFilesService.parseFileId('rev_abc.f_def')).toEqual({ reviewId: 'rev_abc', storageId: 'f_def' });
    for (const bad of ['rev_abc', '../x.f_def', 'rev_abc.f_def.x', 'rev_abc./etc', '']) {
      expect(ReviewFilesService.parseFileId(bad)).toBeNull();
    }
  });

  it('builds a header-safe inline Content-Disposition', () => {
    expect(contentDisposition('Design "v2"\r\nX-Evil: 1.pdf')).toBe(
      `inline; filename="Design v2X-Evil: 1.pdf"; filename*=UTF-8''Design%20v2X-Evil%3A%201.pdf`,
    );
    expect(contentDisposition('Café.png')).toBe(`inline; filename="Caf_.png"; filename*=UTF-8''Caf%C3%A9.png`);
  });
});
