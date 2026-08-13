const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const documentsRepository = require('../repositories/documents.repository');

const router = express.Router();

router.post('/upload', documentsRepository.upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

router.use((error, request, response, next) => {
  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === 'LIMIT_FILE_SIZE';
    return response.status(isTooLarge ? 413 : 400).json({
      error: {
        code: isTooLarge ? 'FILE_TOO_LARGE' : 'FILE_REQUIRED',
        message: isTooLarge ? 'O arquivo excede o limite permitido.' : 'O arquivo e obrigatorio.',
      },
    });
  }
  if (error.code === 'FILE_TYPE_NOT_ALLOWED') {
    return response.status(415).json({
      error: { code: 'FILE_TYPE_NOT_ALLOWED', message: 'O tipo de arquivo nao e permitido.' },
    });
  }
  return next(error);
});

module.exports = router;