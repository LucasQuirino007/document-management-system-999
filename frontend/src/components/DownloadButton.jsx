import { useState } from 'react';

export default function DownloadButton({ documentId, onDownload }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleClick() {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      await onDownload(documentId);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Download'}
    </button>
  );
}
