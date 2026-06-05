import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '..', '..', '..', 'uploads');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(UPLOAD_PATH, 'resumes'));
ensureDir(path.join(UPLOAD_PATH, 'photos'));
ensureDir(path.join(UPLOAD_PATH, 'logos'));

const storageFor = (subfolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_PATH, subfolder)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    },
  });

const PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const RESUME_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const photoFilter = (_req, file, cb) => {
  PHOTO_MIME.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only JPG, PNG or WebP images are allowed'), false);
};

const resumeFilter = (_req, file, cb) => {
  RESUME_MIME.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only PDF, DOC or DOCX files are allowed'), false);
};

export const uploadPhoto = multer({ storage: storageFor('photos'), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: photoFilter });
export const uploadLogo = multer({ storage: storageFor('logos'), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: photoFilter });
export const uploadResume = multer({ storage: storageFor('resumes'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: resumeFilter });

export const getUploadPath = () => UPLOAD_PATH;
