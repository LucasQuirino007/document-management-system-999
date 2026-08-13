import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return '-';
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function DocumentList({ documents, onDownload }) {
  return (
    <section>
      <h2>Documentos</h2>
      {documents.length === 0 ? (
        <p>Nenhum documento enviado ainda.</p>
      ) : (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <strong>{document.originalName}</strong> - {formatSize(document.sizeInBytes)}
              <DownloadButton documentId={document.id} onDownload={onDownload} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
