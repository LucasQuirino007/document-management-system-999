const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');

const storageDirectory = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');
const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10485760);
const allowedMimeTypes = new Set(
  (process.env.ALLOWED_MIME_TYPES || 'application/pdf,image/jpeg,image/png,text/plain')
    .split(',')
    .map((mimeType) => mimeType.trim())
    .filter(Boolean),
);
const documents = new Map();

const diskStorage = multer.diskStorage({
  destination: async (request, file, callback) => {
    try {
      await fs.mkdir(storageDirectory, { recursive: true });
      callback(null, storageDirectory);
    } catch (error) {
      callback(error);
    }
  },
  filename: (request, file, callback) => {
    callback(null, `document_${crypto.randomUUID()}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: maxFileSize },
  fileFilter: (request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('File type not allowed');
      error.code = 'FILE_TYPE_NOT_ALLOWED';
      return callback(error);
    }
    return callback(null, true);
  },
});

async function add(file, owner) {
  const id = `doc_${crypto.randomUUID()}`;
  const metadata = {
    id,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype,
  };

  documents.set(id, { ...metadata, filePath: file.path });
  return metadata;
}

function listByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((first, second) => {
      const dateOrder = second.uploadedAt.localeCompare(first.uploadedAt);
      return dateOrder || second.id.localeCompare(first.id);
    })
    .map(toPublicMetadata);
}

function findOwned(id, owner) {
  const document = documents.get(id);
  if (!document || document.owner !== owner) return null;
  return { ...document };
}

async function remove(document) {
  documents.delete(document.id);
  await fs.unlink(document.filePath).catch(() => {});
}

function toPublicMetadata(document) {
  const { filePath, ...metadata } = document;
  return metadata;
}

module.exports = {
  add,
  findOwned,
  listByOwner,
  remove,
  upload,
};