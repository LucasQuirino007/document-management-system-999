import { useState } from 'react';

export default function UploadComponent({ onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const canSubmit = Boolean(selectedFile) && !isUploading;

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile || isUploading) {
      return;
    }

    await onUpload(selectedFile);
    setSelectedFile(null);
    event.currentTarget.reset();
  }

  return (
    <section>
      <h2>Upload de documento</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} disabled={isUploading} />
        <button type="submit" disabled={!canSubmit}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </section>
  );
}
