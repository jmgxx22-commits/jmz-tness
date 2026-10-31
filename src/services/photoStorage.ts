/**
 * Photo Storage Service using browser IndexedDB.
 * Compatible with original J-MZ Tness database 'gymjournal' and store 'photos'.
 */

export interface StoredPhoto {
  id: string;
  sid: string; // Session ID
  ang: string; // Angle key: 'fr' | 'ff' | 'pi' | 'pd' | 'er' | 'ef' | 'pg' | 'dt'
  z?: string;  // Zone (e.g. Biceps)
  note?: string;
  dataUrl?: string; // Base64 or Blob URL
  blob?: Blob;
  createdAt?: string;
}

const DB_NAME = 'gymjournal';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const PhotoStorage = {
  async getAllPhotos(): Promise<StoredPhoto[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: StoredPhoto[] = req.result.map(item => {
            let dataUrl = item.dataUrl;
            if (item.blob && !dataUrl) {
              try {
                dataUrl = URL.createObjectURL(item.blob);
              } catch {
                // fall back
              }
            }
            return {
              ...item,
              dataUrl: dataUrl || item.dataUrl
            };
          });
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB not supported or failed:', e);
      return [];
    }
  },

  async savePhoto(photo: StoredPhoto): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async deletePhoto(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async deletePhotosForSession(sessionId: string): Promise<void> {
    const all = await this.getAllPhotos();
    const sessionPhotos = all.filter(p => p.sid === sessionId);
    for (const p of sessionPhotos) {
      await this.deletePhoto(p.id);
    }
  },

  // Helper to resize/compress images in client
  compressImage(file: File, maxDimension = 1600, quality = 0.88): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Image decode error'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  }
};
