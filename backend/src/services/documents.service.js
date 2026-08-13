const documentsRepository = require('../repositories/documents.repository');

class DocumentError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function validateOwner(owner) {
  if (typeof owner !== 'string' || !owner.trim()) {
    throw new DocumentError('USER_REQUIRED', 'O usuario e obrigatorio.', 400);
  }
  return owner.trim();
}

async function createDocument(owner, file) {
  const validatedOwner = validateOwner(owner);
  if (!file) {
    throw new DocumentError('FILE_REQUIRED', 'O arquivo e obrigatorio.', 400);
  }

  try {
    return await documentsRepository.add(file, validatedOwner);
  } catch (error) {
    await documentsRepository.remove({ id: null, filePath: file.path });
    throw new DocumentError('STORAGE_ERROR', 'Nao foi possivel registrar o documento.', 500);
  }
}

function listDocuments(owner) {
  return documentsRepository.listByOwner(validateOwner(owner));
}

async function getDownload(owner, id) {
  const validatedOwner = validateOwner(owner);
  if (typeof id !== 'string' || !/^doc_[a-f0-9-]+$/i.test(id)) {
    throw new DocumentError('INVALID_ID', 'O identificador do documento e invalido.', 400);
  }

  const document = documentsRepository.findOwned(id, validatedOwner);
  if (!document) {
    throw new DocumentError('DOCUMENT_NOT_FOUND', 'Documento nao encontrado.', 404);
  }

  try {
    await require('node:fs/promises').access(document.filePath);
    return document;
  } catch (error) {
    throw new DocumentError('DOCUMENT_NOT_FOUND', 'Documento nao encontrado.', 404);
  }
}

module.exports = {
  DocumentError,
  createDocument,
  getDownload,
  listDocuments,
};