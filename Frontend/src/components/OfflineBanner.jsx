import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MdWifiOff, MdCloudUpload, MdSync, MdCheckCircle } from 'react-icons/md';
import { getQueuedReports, syncQueuedReports } from '../utils/offlineQueue';
import { createFloodReport } from '../api/victimApi';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const reports = await getQueuedReports();
      setQueuedCount(reports.length);
    } catch {
      setQueuedCount(0);
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    toast.loading('Synchronizing offline disaster reports with rescue command...', { id: 'offline-sync' });
    try {
      const { synced, remaining } = await syncQueuedReports(createFloodReport);
      await refreshCount();
      if (synced > 0) {
        toast.success(`Dispatched ${synced} offline flood report(s) successfully!`, { id: 'offline-sync' });
      } else if (remaining > 0) {
        toast('Rate limit active or pending. Will retry shortly.', { icon: '⏳', id: 'offline-sync' });
      } else {
        toast.dismiss('offline-sync');
      }
    } catch (err) {
      console.error('Error during offline sync:', err);
      toast.error('Sync failed. Will retry automatically when signal stabilizes.', { id: 'offline-sync' });
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshCount]);

  useEffect(() => {
    refreshCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection Restored! Checking for queued disaster reports...', {
        icon: '🟢',
        duration: 4000
      });
      // Auto-trigger sync on reconnect
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('Disaster Offline Mode Active: Flood reports will be saved locally with GPS stamp.', {
        icon: '📡',
        duration: 5000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #f59e0b'
        }
      });
    };

    const handleQueueChange = () => {
      refreshCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resqflow:offline-queue-changed', handleQueueChange);
    window.addEventListener('resqflow:offline-synced', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resqflow:offline-queue-changed', handleQueueChange);
      window.removeEventListener('resqflow:offline-synced', handleQueueChange);
    };
  }, [handleSync, refreshCount]);

  // If online and no queued reports, don't show banner
  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: !isOnline ? '#9a3412' : '#0f172a',
        borderBottom: !isOnline ? '1px solid #7c2d12' : '1px solid #1e293b',
        color: '#ffffff',
        padding: '0.625rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 1050,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!isOnline ? (
          <>
            <MdWifiOff style={{ fontSize: '1.25rem', color: '#fed7aa' }} />
            <span>
              <strong>Offline Disaster Mode:</strong> Network disconnected. Incident reports will be cached locally with verified GPS.
            </span>
          </>
        ) : (
          <>
            <MdCloudUpload style={{ fontSize: '1.25rem', color: '#93c5fd' }} />
            <span>
              <strong>Ready to Dispatch:</strong> {queuedCount} emergency report{queuedCount > 1 ? 's' : ''} stored locally during network outage.
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {queuedCount > 0 && (
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.025em'
            }}
          >
            {queuedCount} Queued
          </span>
        )}

        {isOnline && queuedCount > 0 && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: '#ffffff',
              color: '#1d4ed8',
              border: 'none',
              borderRadius: '6px',
              padding: '0.3rem 0.75rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            <MdSync style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
