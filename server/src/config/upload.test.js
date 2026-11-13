import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { existsSyncMock, mkdirSyncMock, diskStorageMock, multerMock } = vi.hoisted(() => {
  const diskStorageMock = vi.fn((options) => options);
  const multerMock = Object.assign(vi.fn((options) => options), { diskStorage: diskStorageMock });
  return {
    existsSyncMock: vi.fn(() => false),
    mkdirSyncMock: vi.fn(),
    diskStorageMock,
    multerMock,
  };
});

vi.mock('fs', () => ({
  default: { existsSync: existsSyncMock, mkdirSync: mkdirSyncMock },
}));

vi.mock('multer', () => ({ default: multerMock }));

vi.mock('uuid', () => ({ v4: () => 'uuid-1' }));

const UPLOAD_PATH = path.join('C:', 'jobkatta-uploads');

const load = async () => {
  vi.resetModules();
  process.env.UPLOAD_PATH = UPLOAD_PATH;
  return import('./upload.js');
};

beforeEach(() => {
  vi.clearAllMocks();
  existsSyncMock.mockReturnValue(false);
  vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
});

describe('upload directories', () => {
  it('creates resumes, photos, and logos when they are missing', async () => {
    await load();
    expect(mkdirSyncMock).toHaveBeenCalledWith(path.join(UPLOAD_PATH, 'resumes'), { recursive: true });
    expect(mkdirSyncMock).toHaveBeenCalledWith(path.join(UPLOAD_PATH, 'photos'), { recursive: true });
    expect(mkdirSyncMock).toHaveBeenCalledWith(path.join(UPLOAD_PATH, 'logos'), { recursive: true });
  });

  it('does not create a directory that already exists', async () => {
    existsSyncMock.mockReturnValue(true);
    await load();
    expect(mkdirSyncMock).not.toHaveBeenCalled();
  });

  it('exposes the configured upload path', async () => {
    const upload = await load();
    expect(upload.getUploadPath()).toBe(UPLOAD_PATH);
  });
});

describe('upload limits and filters', () => {
  it('limits photos, logos, and resumes to 2 MB', async () => {
    const upload = await load();
    for (const uploader of [upload.uploadPhoto, upload.uploadLogo, upload.uploadResume]) {
      expect(uploader.limits).toEqual({ fileSize: 2 * 1024 * 1024 });
    }
  });

  it('stores photos under photos and keeps a safe lowercase extension', async () => {
    const upload = await load();
    const storage = upload.uploadPhoto.storage;
    const destination = vi.fn();
    storage.destination({}, {}, destination);
    expect(destination).toHaveBeenCalledWith(null, path.join(UPLOAD_PATH, 'photos'));

    const filename = vi.fn();
    storage.filename({}, { originalname: 'Avatar.PNG' }, filename);
    expect(filename).toHaveBeenCalledWith(null, '1700000000000-uuid-1.png');
  });

  it('accepts jpeg, png, and webp, and rejects other photo types', async () => {
    const upload = await load();
    const filter = upload.uploadPhoto.fileFilter;
    const accept = vi.fn();
    filter({}, { mimetype: 'image/webp' }, accept);
    expect(accept).toHaveBeenCalledWith(null, true);

    const reject = vi.fn();
    filter({}, { mimetype: 'image/gif' }, reject);
    expect(reject.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(reject.mock.calls[0][0].message).toBe('Only JPG, PNG or WebP images are allowed');
    expect(reject.mock.calls[0][1]).toBe(false);
    expect(upload.uploadLogo.fileFilter).toBe(filter);
  });

  it('stores resumes under resumes and accepts pdf and word files', async () => {
    const upload = await load();
    const storage = upload.uploadResume.storage;
    const destination = vi.fn();
    storage.destination({}, {}, destination);
    expect(destination).toHaveBeenCalledWith(null, path.join(UPLOAD_PATH, 'resumes'));

    const filter = upload.uploadResume.fileFilter;
    const accept = vi.fn();
    filter({}, { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }, accept);
    expect(accept).toHaveBeenCalledWith(null, true);

    const reject = vi.fn();
    filter({}, { mimetype: 'image/png' }, reject);
    expect(reject.mock.calls[0][0].message).toBe('Only PDF, DOC or DOCX files are allowed');
  });
});
