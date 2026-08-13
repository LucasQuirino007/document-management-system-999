const API_PREFIX = '/api';

function getUserIdHeader() {
  const userId = localStorage.getItem('dms-user-id') || 'demo-user';
  return { 'X-User-Id': userId };
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (response.ok) {
    if (!isJson) {
      return null;
    }
    return response.json();
  }

  let message = 'Erro ao processar a solicitacao.';
  if (isJson) {
    const data = await response.json();
    message = data?.error?.message || message;
  }

  throw new Error(message);
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    headers: getUserIdHeader(),
    body: formData,
  });

  return parseJsonResponse(response);
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`, {
    headers: getUserIdHeader(),
  });

  const data = await parseJsonResponse(response);
  return data?.documents || [];
}

export async function downloadDocument(documentId) {
  const response = await fetch(`${API_PREFIX}/documents/${documentId}/download`, {
    headers: getUserIdHeader(),
  });

  if (!response.ok) {
    await parseJsonResponse(response);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const fallbackName = `document-${documentId}`;
  const filenameMatch = disposition.match(/filename="?([^\";]+)"?/i);
  const filename = filenameMatch?.[1] || fallbackName;

  return { blob, filename };
}
