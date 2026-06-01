const { deterministicEmbedding } = require('./text-utils');

class EmbeddingProvider {
  constructor() {
    this.useAiCore = process.env.GROUNDING_USE_AICORE === 'true';
    this.modelName = process.env.GROUNDING_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.resourceGroup = process.env.GROUNDING_AI_RESOURCE_GROUP || 'default';
    this.client = null;
    this.initPromise = null;
  }

  async init() {
    if (!this.useAiCore || this.client) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const { AzureOpenAiEmbeddingClient } = require('@sap-ai-sdk/foundation-models');
        this.client = new AzureOpenAiEmbeddingClient({
          modelName: this.modelName,
          resourceGroup: this.resourceGroup
        });
      } catch (error) {
        this.useAiCore = false;
      }
    })();

    return this.initPromise;
  }

  async embed(text) {
    const cleanText = (text || '').trim();
    if (!cleanText) return deterministicEmbedding('');

    await this.init();
    if (!this.useAiCore || !this.client) {
      return deterministicEmbedding(cleanText);
    }

    try {
      const response = await this.client.run({ input: cleanText });
      const embedding = response.getEmbedding();
      if (!Array.isArray(embedding) || embedding.length === 0) {
        return deterministicEmbedding(cleanText);
      }
      return embedding;
    } catch (error) {
      return deterministicEmbedding(cleanText);
    }
  }
}

module.exports = { EmbeddingProvider };
