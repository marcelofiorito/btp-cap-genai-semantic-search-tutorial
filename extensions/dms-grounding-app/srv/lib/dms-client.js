const axios = require('axios');
const { extractTextFromPdfBuffer } = require('./pdf-extractor');

class DmsClient {
  constructor() {
    this.baseUrl = (process.env.DMS_BASE_URL || '').replace(/\/$/, '');
    this.repositoryId = process.env.DMS_REPOSITORY_ID || '';
    this.bearerToken = process.env.DMS_BEARER_TOKEN || '';
    this.clientId = process.env.DMS_CLIENT_ID || '';
    this.clientSecret = process.env.DMS_CLIENT_SECRET || '';
    this.tokenUrl = process.env.DMS_TOKEN_URL || '';

    this._cachedToken = null;
    this._cachedTokenExpiresAt = 0;
  }

  isMockMode() {
    return !this.baseUrl;
  }

  async listDocuments({ repositoryId, folderPath = '/', limit = 50 }) {
    const repoId = repositoryId || this.repositoryId;
    if (!repoId) throw new Error('repositoryId não informado e DMS_REPOSITORY_ID não configurado.');

    if (this.isMockMode()) {
      return this.getMockDocuments(repoId, folderPath, limit);
    }

    const safeFolderPath = this.normalizeFolderPath(folderPath);
    const url = `${this.baseUrl}/browser/${encodeURIComponent(repoId)}${safeFolderPath}`;
    const response = await axios.get(url, {
      params: {
        cmisselector: 'children',
        succinct: true,
        maxItems: Number.isInteger(limit) && limit > 0 ? limit : 50
      },
      headers: await this.getAuthHeaders(),
      timeout: 30000
    });

    const objects = this.extractChildrenObjects(response.data);
    return objects
      .map((obj) => this.mapCmisObjectToDocument(obj, repoId, safeFolderPath))
      .filter(Boolean);
  }

  async getDocumentText(documentInfo) {
    if (documentInfo.inlineText) return documentInfo.inlineText;

    if (!documentInfo.contentUrl) return '';

    const mimeType = (documentInfo.mimeType || '').toLowerCase();
    const headers = await this.getAuthHeaders();

    if (mimeType.startsWith('text/')) {
      const response = await axios.get(documentInfo.contentUrl, {
        headers,
        responseType: 'text',
        timeout: 30000
      });

      return typeof response.data === 'string' ? response.data : '';
    }

    if (mimeType === 'application/pdf') {
      const response = await axios.get(documentInfo.contentUrl, {
        headers,
        responseType: 'arraybuffer',
        timeout: 45000
      });

      return extractTextFromPdfBuffer(Buffer.from(response.data));
    }

    return '';
  }

  normalizeFolderPath(folderPath) {
    if (!folderPath || folderPath === '/') return '/root';
    const withLeadingSlash = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
    return withLeadingSlash.replace(/\/+$/, '');
  }

  extractChildrenObjects(payload) {
    if (!payload) return [];

    if (Array.isArray(payload.objects)) {
      return payload.objects;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (payload.objects && typeof payload.objects === 'object') {
      return Object.values(payload.objects);
    }

    return [];
  }

  mapCmisObjectToDocument(entry, repositoryId, folderPath) {
    const raw = entry?.object || entry;
    const props = raw?.succinctProperties || raw?.properties || {};

    const baseType = props['cmis:baseTypeId'];
    if (baseType && baseType !== 'cmis:document') return null;

    const objectId = props['cmis:objectId'] || raw?.objectId || raw?.id;
    const name = props['cmis:name'] || raw?.name || 'sem-nome';
    const mimeType = props['cmis:contentStreamMimeType'] || raw?.contentStreamMimeType || '';

    if (!objectId) return null;

    const contentUrl = raw?.contentUrl || this.buildDefaultContentUrl(repositoryId, objectId);

    return {
      repositoryId,
      sourceObjectId: String(objectId),
      name: String(name),
      folderPath,
      mimeType: String(mimeType),
      contentUrl,
      externalCreatedAt: props['cmis:creationDate'] || null,
      externalModifiedAt: props['cmis:lastModificationDate'] || null
    };
  }

  buildDefaultContentUrl(repositoryId, objectId) {
    if (!this.baseUrl) return '';
    const url = `${this.baseUrl}/browser/${encodeURIComponent(repositoryId)}/root`;
    return `${url}?objectId=${encodeURIComponent(objectId)}&cmisselector=content`;
  }

  async getAuthHeaders() {
    if (this.bearerToken) {
      return { Authorization: `Bearer ${this.bearerToken}` };
    }

    if (this.clientId && this.clientSecret && this.tokenUrl) {
      const token = await this.getClientCredentialsToken();
      return { Authorization: `Bearer ${token}` };
    }

    return {};
  }

  async getClientCredentialsToken() {
    const now = Date.now();
    if (this._cachedToken && now < this._cachedTokenExpiresAt) {
      return this._cachedToken;
    }

    const payload = new URLSearchParams({ grant_type: 'client_credentials' });
    const response = await axios.post(this.tokenUrl, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: this.clientId,
        password: this.clientSecret
      },
      timeout: 30000
    });

    const accessToken = response?.data?.access_token;
    const expiresIn = Number(response?.data?.expires_in || 1800);

    if (!accessToken) {
      throw new Error('Falha ao obter token OAuth para DMS.');
    }

    this._cachedToken = accessToken;
    this._cachedTokenExpiresAt = now + Math.max(60, expiresIn - 60) * 1000;
    return this._cachedToken;
  }

  getMockDocuments(repositoryId, folderPath, limit) {
    const docs = [
      {
        repositoryId,
        sourceObjectId: 'mock-doc-001',
        name: 'politica-seguranca-ai.txt',
        folderPath,
        mimeType: 'text/plain',
        contentUrl: '',
        inlineText: 'Política de segurança para uso de IA corporativa. Dados sensíveis devem ser mascarados antes do processamento.',
        externalCreatedAt: '2026-01-10T00:00:00Z',
        externalModifiedAt: '2026-01-10T00:00:00Z'
      },
      {
        repositoryId,
        sourceObjectId: 'mock-doc-002',
        name: 'manual-onboarding-dms.txt',
        folderPath,
        mimeType: 'text/plain',
        contentUrl: '',
        inlineText: 'O onboarding no DMS requer criação de service instance, service key e configuração de destination com o endpoint /browser.',
        externalCreatedAt: '2026-02-15T00:00:00Z',
        externalModifiedAt: '2026-02-16T00:00:00Z'
      }
    ];

    return docs.slice(0, Number.isInteger(limit) && limit > 0 ? limit : 50);
  }
}

module.exports = { DmsClient };
