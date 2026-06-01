const test = require('node:test');
const assert = require('node:assert/strict');

const {
  splitIntoChunks,
  deterministicEmbedding,
  cosineSimilarity
} = require('../srv/lib/text-utils');

test('splitIntoChunks cria blocos com overlap', () => {
  const text = 'A'.repeat(1000) + ' ' + 'B'.repeat(1000);
  const chunks = splitIntoChunks(text, 600, 100);

  assert.ok(chunks.length >= 3);
  assert.equal(chunks[0].chunkIndex, 0);
  assert.ok(chunks[0].chunkText.length <= 600);
});

test('deterministicEmbedding retorna vetor normalizado com tamanho fixo', () => {
  const emb = deterministicEmbedding('texto de teste', 128);
  assert.equal(emb.length, 128);

  const norm = Math.sqrt(emb.reduce((acc, v) => acc + v * v, 0));
  assert.ok(Math.abs(norm - 1) < 0.000001);
});

test('cosineSimilarity respeita proximidade semântica aproximada', () => {
  const a = deterministicEmbedding('configurar destination para dms');
  const b = deterministicEmbedding('configurar destination para dms');
  const c = deterministicEmbedding('receita de bolo de cenoura');

  const ab = cosineSimilarity(a, b);
  const ac = cosineSimilarity(a, c);

  assert.ok(ab > ac);
});
