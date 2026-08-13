const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const app = require('../src/app');
const documentsRepository = require('../src/repositories/documents.repository');

// Teste de fumaça do seed: garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('o repositório rejeita caminhos fora do diretório de armazenamento', async () => {
  const rejectedPath = path.resolve('/tmp/escape');
  await assert.rejects(
    () => documentsRepository.add({ originalname: 'evil.txt', size: 12, mimetype: 'text/plain', path: rejectedPath }, 'demo-user'),
    /INVALID_STORAGE_PATH|STORAGE_PATH/
  );
});

test('o repositório não remove arquivos fora do diretório de armazenamento', async () => {
  const unsafeDocument = { id: 'doc_unsafe', filePath: path.resolve('/tmp/escape.txt') };
  await assert.doesNotReject(() => documentsRepository.remove(unsafeDocument));
  assert.strictEqual(unsafeDocument.id, 'doc_unsafe');
});
