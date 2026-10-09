import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
  Maximize2,
  ExternalLink,
  Camera,
} from 'lucide-react';
import { Complaint } from '../../types';

interface EvidenceComparisonProps {
  complaint: Complaint;
  onVerifyResolution?: (confirmed: boolean, feedback?: string) => void;
  canVerify?: boolean;
}

export function EvidenceComparison({
  complaint,
  onVerifyResolution,
  canVerify = false,
}: EvidenceComparisonProps) {
  const [activeTab, setActiveTab] = useState<'split' | 'before' | 'after'>('split');
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const beforePhoto = complaint.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
  const afterPhoto =
    complaint.resolutionEvidenceUrl ||
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80';

  const handleConfirm = () => {
    onVerifyResolution?.(true);
  };

  const handleReject = () => {
    if (!feedbackText.trim()) {
      setShowFeedbackModal(true);
      return;
    }
    onVerifyResolution?.(false, feedbackText);
    setShowFeedbackModal(false);
  };

  return (
    <div
      id={`evidence-comparison-${complaint.id}`}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Resolution Audit Proof
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Side-by-side photographic inspection before & after repair
            </p>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'split'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'before'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'after'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            After
          </button>
        </div>
      </div>

      {/* Comparison Visual Container */}
      <div className="p-4">
        {activeTab === 'split' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Before Card */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-900/50 bg-amber-500/5 group">
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                  <AlertTriangle className="w-3 h-3" /> Reported Issue (Before)
                </span>
              </div>
              <img
                src={beforePhoto}
                alt="Original issue evidence"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> {complaint.dateFiled}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    Logged by Citizen
                  </span>
                </div>
              </div>
            </div>

            {/* After Card */}
            <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800/60 bg-emerald-500/5 group">
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> Completed Repair (After)
                </span>
              </div>
              <img
                src={afterPhoto}
                alt="Resolution evidence photo"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" /> {complaint.resolvedAt || 'Recent'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> {complaint.assignedOfficer || 'Municipal Inspector'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'before' ? (
          <div className="relative rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-900">
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white">
              Before Repair ({complaint.dateFiled})
            </span>
            <img src={beforePhoto} alt="Before repair" className="w-full h-64 object-cover" />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-900">
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
              After Repair ({complaint.resolvedAt || 'Recent'})
            </span>
            <img src={afterPhoto} alt="After repair" className="w-full h-64 object-cover" />
          </div>
        )}

        {/* Engineer Notes */}
        {complaint.resolutionNotes && (
          <div className="mt-3 p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200 mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Inspection Certification Notes:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {complaint.resolutionNotes}
            </p>
          </div>
        )}

        {/* Citizen Verification Block */}
        {canVerify && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/90 border border-emerald-200 dark:border-emerald-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Citizen Verification Required
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Did the municipal crew resolve this issue satisfactorily? Earn <strong>+50 Civic Points</strong> by verifying!
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors"
                >
                  Still Unresolved
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Yes, Satisfied!
                </button>
              </div>
            </div>

            {/* Incomplete / Still Unresolved Feedback Modal */}
            {showFeedbackModal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-emerald-200 dark:border-slate-700"
              >
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Please tell the Ward Engineer what still requires attention:
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={2}
                  placeholder="E.g. Asphalt is uneven, rubble left on the pedestrian path..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white"
                  >
                    Send Back to Inspector
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {complaint.citizenConfirmed && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Citizen Confirmed:</strong> {complaint.citizenFeedback || 'Grievance inspected and verified on ground.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
