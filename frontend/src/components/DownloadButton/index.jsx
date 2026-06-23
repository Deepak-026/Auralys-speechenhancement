import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function DownloadButton({ jobId, filename, className = '' }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!jobId || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/enhancement/output/${jobId}?download=true`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `enhanced_${jobId}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!jobId || downloading}
      className={`btn-primary flex items-center gap-2 ${className}`}
    >
      {downloading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
      {downloading ? 'Downloading…' : 'Download Enhanced Audio'}
    </button>
  );
}
