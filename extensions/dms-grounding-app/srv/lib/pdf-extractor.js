async function extractTextFromPdfBuffer(pdfBuffer) {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    return '';
  }

  try {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(pdfBuffer);
    return typeof result?.text === 'string' ? result.text.trim() : '';
  } catch (error) {
    return '';
  }
}

module.exports = { extractTextFromPdfBuffer };
