const test = require('node:test');
const assert = require('node:assert/strict');
const { extractTextFromPdfBuffer } = require('../srv/lib/pdf-extractor');

test('extractTextFromPdfBuffer retorna string vazia para buffer inválido', async () => {
  const result = await extractTextFromPdfBuffer(Buffer.from('not-a-pdf'));
  assert.equal(result, '');
});
