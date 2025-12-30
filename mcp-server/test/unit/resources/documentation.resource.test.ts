import * as fs from 'fs';
import * as path from 'path';
import { listDocumentationResources, readDocumentationResource } from '../../../src/resources/documentation.resource';

jest.mock('fs');
jest.mock('../../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Documentation Resource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listDocumentationResources', () => {
    it('should list markdown files', () => {
      const mockEntries = [
        { name: 'index.md', isFile: () => true, isDirectory: () => false },
        { name: 'guide.md', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true },
      ];

      (mockFs.existsSync as jest.Mock).mockReturnValue(true);
      (mockFs.readdirSync as jest.Mock).mockReturnValue(mockEntries);
      (mockFs.readFileSync as jest.Mock).mockReturnValue('# Content');

      const result = listDocumentationResources();

      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle missing directory', () => {
      (mockFs.existsSync as jest.Mock).mockReturnValue(false);

      const result = listDocumentationResources();

      expect(result).toEqual([]);
    });
  });

  describe('readDocumentationResource', () => {
    it('should read a documentation file', async () => {
      const mockContent = '# Documentation Content';
      (mockFs.readFileSync as jest.Mock).mockReturnValue(mockContent);

      const result = await readDocumentationResource('design-system://docs/index');

      expect(result).toBe(mockContent);
    });

    it('should throw error for invalid URI', async () => {
      await expect(readDocumentationResource('invalid-uri')).rejects.toThrow('Invalid documentation URI');
    });

    it('should throw error for path traversal attempt', async () => {
      await expect(readDocumentationResource('design-system://docs/../../etc/passwd')).rejects.toThrow('Invalid documentation path');
    });
  });
});


