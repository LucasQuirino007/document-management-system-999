const documentsService = require('../services/documents.service');

function getOwner(request) {
  return request.get('X-User-Id');
}

async function upload(request, response, next) {
  try {
    const document = await documentsService.createDocument(getOwner(request), request.file);
    response.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

function list(request, response, next) {
  try {
    response.json({ documents: documentsService.listDocuments(getOwner(request)) });
  } catch (error) {
    next(error);
  }
}

async function download(request, response, next) {
  try {
    const document = await documentsService.getDownload(getOwner(request), request.params.id);
    response.download(document.filePath, sanitizeFilename(document.originalName), {
      headers: { 'Content-Type': document.mimeType },
    });
  } catch (error) {
    next(error);
  }
}

function sanitizeFilename(filename) {
  return String(filename || 'documento').replace(/[\r\n"\\/]/g, '_');
}

module.exports = { upload, list, download };