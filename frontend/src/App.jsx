import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { downloadDocument, listDocuments, uploadDocument } from './services/documentsApi';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (error) {
      setErrorMessage(error.message || 'Nao foi possivel carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = useCallback(
    async (file) => {
      setIsUploading(true);
      setErrorMessage('');

      try {
        await uploadDocument(file);
        await loadDocuments();
      } catch (error) {
        setErrorMessage(error.message || 'Falha ao enviar documento.');
      } finally {
        setIsUploading(false);
      }
    },
    [loadDocuments]
  );

  const handleDownload = useCallback(async (documentId) => {
    setErrorMessage('');

    try {
      const { blob, filename } = await downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error.message || 'Falha ao baixar documento.');
    }
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      {errorMessage && <p>{errorMessage}</p>}

      <UploadComponent onUpload={handleUpload} isUploading={isUploading} />

      {isLoading ? (
        <p>Carregando documentos...</p>
      ) : (
        <DocumentList documents={documents} onDownload={handleDownload} />
      )}
    </main>
  );
}
