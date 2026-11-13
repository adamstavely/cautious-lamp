import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

const execFileMock = jest.fn();
jest.mock('child_process', () => ({
  execFile: (...args: unknown[]) => execFileMock(...args),
}));

import { PhotosensitivityService } from './photosensitivity.service';

describe('PhotosensitivityService', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'iris-'));
    execFileMock.mockReset();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('passes the video path as an argument, never through a shell', async () => {
    const video = path.join(dir, 'x.$(touch pwned).mp4');
    await fs.writeFile(video, 'not really a video');
    execFileMock.mockImplementation((file, args, options, callback) => {
      const output = args[args.indexOf('-o') + 1];
      require('fs').writeFileSync(output, '[]');
      callback(null, { stdout: '', stderr: '' });
    });

    const service = new PhotosensitivityService();
    await service.analyzeVideo(video, { outputJson: true });

    const [file, args] = execFileMock.mock.calls[0];
    expect(file).toBe(process.env.IRIS_EXECUTABLE_PATH || 'iris');
    expect(args).toContain(video);
  });

  it('deletes the uploaded video after analysis, even when IRIS fails', async () => {
    const video = path.join(dir, 'clip.mp4');
    await fs.writeFile(video, 'not really a video');
    execFileMock.mockImplementation((file, args, options, callback) => callback(new Error('iris not found')));

    const service = new PhotosensitivityService();
    await expect(service.analyzeVideo(video)).rejects.toThrow('Video analysis failed');
    await expect(fs.access(video)).rejects.toThrow();
  });
});
