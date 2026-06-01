#!/usr/bin/env bash
set -euo pipefail

SERVICE_INSTANCE="${1:-sappsbr_dms_integration}"
SERVICE_KEY="${2:-dms-integration-key}"
REPOSITORY_ID="${3:-}"
TARGET_ENV="${4:-.env}"

if ! command -v cf >/dev/null 2>&1; then
  echo "Erro: cf CLI não encontrado." >&2
  exit 1
fi

RAW="$(cf service-key "$SERVICE_INSTANCE" "$SERVICE_KEY")"

extract_json_value() {
  local key="$1"
  local mode="${2:-first}"
  local values
  values="$(echo "$RAW" | sed -n "s/^[[:space:]]*\"$key\": \"\([^\"]*\)\".*/\1/p")"
  if [ "$mode" = "last" ]; then
    echo "$values" | tail -n1
  else
    echo "$values" | head -n1
  fi
}

URI="$(extract_json_value uri last)"
UAA_URL="$(echo "$RAW" | sed -n 's/^[[:space:]]*"url": "\([^"]*authentication[^"]*\)".*/\1/p' | head -n1)"
CLIENT_ID="$(extract_json_value clientid first)"
CLIENT_SECRET="$(extract_json_value clientsecret first)"

if [ -z "$URI" ] || [ -z "$UAA_URL" ] || [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "Erro: não foi possível extrair credenciais da service key $SERVICE_KEY." >&2
  exit 1
fi

TOKEN="$(curl -s -u "$CLIENT_ID:$CLIENT_SECRET" -d 'grant_type=client_credentials' "$UAA_URL/oauth/token" | jq -r '.access_token')"
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Erro: falha ao gerar token OAuth." >&2
  exit 1
fi

if [ -z "$REPOSITORY_ID" ]; then
  echo "Repositórios disponíveis:"
  curl -s -H "Authorization: Bearer $TOKEN" "${URI}browser" | jq -r 'to_entries[] | "- \(.key) | \(.value.repositoryName // "(sem nome)")"'
  echo
  echo "Informe o repositoryId como 3º argumento para gravar no .env."
  echo "Exemplo: ./scripts/bootstrap-dms-env.sh $SERVICE_INSTANCE $SERVICE_KEY TIA_REPOSITORY_INTEGRATION_OPTION"
  exit 2
fi

cat > "$TARGET_ENV" <<ENV
# Gerado automaticamente por scripts/bootstrap-dms-env.sh
DMS_BASE_URL=${URI%/}
DMS_REPOSITORY_ID=$REPOSITORY_ID

# Opção 1 (não usada aqui)
DMS_BEARER_TOKEN=

# Opção 2 (OAuth2 client credentials)
DMS_CLIENT_ID=$CLIENT_ID
DMS_CLIENT_SECRET=$CLIENT_SECRET
DMS_TOKEN_URL=${UAA_URL%/}/oauth/token

# Grounding / embeddings
GROUNDING_USE_AICORE=false
GROUNDING_EMBEDDING_MODEL=text-embedding-3-small
GROUNDING_AI_RESOURCE_GROUP=default
GROUNDING_MAX_TEXT_LENGTH=20000
ENV

chmod 600 "$TARGET_ENV"

echo "Arquivo $TARGET_ENV criado com sucesso."
echo "DMS_BASE_URL=${URI%/}"
echo "DMS_REPOSITORY_ID=$REPOSITORY_ID"
