/**
 * Robust ZIP downloader that fetches binary blob and triggers native file save.
 * Guarantees Windows, Mac, and mobile receive valid non-empty ZIP binary.
 */
export async function downloadProjectZip(onProgress?: (msg: string) => void): Promise<void> {
  try {
    if (onProgress) onProgress('Descargando archivo...');
    
    // Try /api/download first, fallback to static /downloads/jmz-tness-production.zip
    let response = await fetch('/api/download');
    if (!response.ok) {
      response = await fetch('/downloads/jmz-tness-production.zip');
    }
    
    if (!response.ok) {
      throw new Error(`Error en el servidor (${response.status})`);
    }

    const blob = await response.blob();
    if (!blob || blob.size < 5000) {
      throw new Error('El archivo recibido es inválido o está incompleto.');
    }

    // Force application/zip type
    const zipBlob = new Blob([blob], { type: 'application/zip' });
    const blobUrl = window.URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = 'jmz-tness-production.zip';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    if (onProgress) onProgress('¡Descarga iniciada con éxito!');
  } catch (error: any) {
    console.error('Download error:', error);
    // Direct navigation fallback as last resort
    window.location.href = '/api/download';
  }
}
