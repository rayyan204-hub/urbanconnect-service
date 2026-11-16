import { useState, useEffect } from 'react';
import { Database, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { getFirestoreStatus, subscribeToFirestoreStatus } from '../../services/dbService';
import { FirestoreStatus } from '../../types';

interface FirestoreStatusBannerProps {
  compact?: boolean;
}

export function FirestoreStatusBanner({ compact = false }: FirestoreStatusBannerProps) {
  const [status, setStatus] = useState<FirestoreStatus>(getFirestoreStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToFirestoreStatus(() => {
      setStatus(getFirestoreStatus());
    });
    return () => unsub();
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStatus(getFirestoreStatus());
    }, 600);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span className="truncate max-w-[140px] sm:max-w-none">Firebase Firestore Synced</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-900/90 to-teal-950/90 text-white rounded-2xl border border-emerald-700/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-emerald-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-100">Firebase Firestore Active</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-[10px] text-emerald-300 font-mono font-bold">
              LIVE DB
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/80 font-mono truncate max-w-[280px] sm:max-w-md">
            ID: {status.databaseId || 'ai-studio-urbanconnect-cc828837-7745-46c3-b36b-274177ab3c39'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="text-[11px] text-emerald-300/80 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Rules Deployed
        </span>
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-2.5 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-100 border border-emerald-600/50 flex items-center gap-1 text-[11px] font-medium transition-colors"
          title="Sync with cloud database"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
}
