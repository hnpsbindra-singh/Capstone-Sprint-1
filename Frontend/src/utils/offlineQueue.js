/**
 * ResQFlow Offline Disaster Mode & Queue Manager
 * Uses browser IndexedDB to safely persist offline flood reports with photos & GPS.
 * Automatically synchronizes with backend when network connectivity is restored.
 */

const DB_NAME = 'ResQFlow_Offline_Store';
const DB_VERSION = 1;
const STORE_NAME = 'offline_reports';

// Open / initialize IndexedDB
const getDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Converts a File or Blob to a base64 Data URL so it can be reliably stored in IndexedDB.
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Reconstructs a standard File object from a base64 Data URL.
 */
export const dataUrlToFile = (dataUrl, filename = 'offline_flood_capture.jpg') => {
  if (!dataUrl) return null;
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * Enqueues a flood incident report when offline.
 */
export const enqueueOfflineReport = async (payload, file, metadata = {}) => {
  try {
    const db = await getDB();
    const dataUrl = file ? await fileToDataUrl(file) : null;
    const reportItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      payload: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      fileDataUrl: dataUrl,
      fileName: file?.name || `offline_capture_${Date.now()}.jpg`,
      fileType: file?.type || 'image/jpeg',
      addressLabel: metadata.addressLabel || 'Current GPS Location',
      coords: {
        lat: payload.latitude,
        lng: payload.longitude
      },
      status: 'QUEUED_OFFLINE'
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(reportItem);

      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent('resqflow:offline-queue-changed'));
        resolve(reportItem);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to enqueue offline report:', err);
    throw err;
  }
};

/**
 * Retrieves all currently queued offline reports.
 */
export const getQueuedReports = async () => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get queued reports:', err);
    return [];
  }
};

/**
 * Deletes a queued report after successful dispatch.
 */
export const removeQueuedReport = async (id) => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent('resqflow:offline-queue-changed'));
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to remove queued report:', err);
  }
};

/**
 * Dispatches all queued offline reports to the live backend.
 */
export const syncQueuedReports = async (createFloodReportFn) => {
  if (!navigator.onLine) {
    return { synced: 0, remaining: (await getQueuedReports()).length };
  }

  const queued = await getQueuedReports();
  if (!queued.length) {
    return { synced: 0, remaining: 0 };
  }

  let synced = 0;
  for (const item of queued) {
    try {
      let fileObj = null;
      if (item.fileDataUrl) {
        fileObj = dataUrlToFile(item.fileDataUrl, item.fileName);
      }
      await createFloodReportFn(item.payload, fileObj);
      await removeQueuedReport(item.id);
      synced++;
    } catch (err) {
      console.warn(`Sync failed for offline report ${item.id}:`, err);
      // Stop sync if rate limit 429 encountered
      if (err.response?.status === 429) {
        break;
      }
    }
  }

  window.dispatchEvent(new CustomEvent('resqflow:offline-synced', { detail: { synced } }));
  return { synced, remaining: (await getQueuedReports()).length };
};
