import { ElementType } from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  Camera,
  ThumbsUp,
  Award,
  FileText,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { COMPLAINT_STAGES, computeSlaStatus } from '../../services/dbService';

interface LifecycleTimelineProps {
  complaint: Complaint;
}

const STAGE_META: Record<
  ComplaintStatus,
  { label: string; icon: ElementType; desc: string }
> = {
  Reported: {
    label: '1. Reported',
    icon: FileText,
    desc: 'Citizen submitted grievance with geo-tagged coordinates and issue photo.',
  },
  'Under Review': {
    label: '2. Under Review',
    icon: Clock,
    desc: 'Central grievance dispatch reviewed classification and ward jurisdiction.',
  },
  Verified: {
    label: '3. Verified',
    icon: AlertCircle,
    desc: 'Junior engineer verified severity and confirmed on-ground municipal jurisdiction.',
  },
  Assigned: {
    label: '4. Assigned',
    icon: UserCheck,
    desc: 'Allocated to specialized field maintenance team and work order issued.',
  },
  'Work Started': {
    label: '5. Work Started',
    icon: Wrench,
    desc: 'Civil repair crew on-site with machinery, materials, and safety cordon.',
  },
  'Resolution Evidence Added': {
    label: '6. Resolution Evidence Added',
    icon: Camera,
    desc: 'Post-completion inspection photograph and lab/compaction report uploaded.',
  },
  'Awaiting Citizen Confirmation': {
    label: '7. Awaiting Citizen Confirmation',
    icon: ThumbsUp,
    desc: 'Complainant citizen notified to review repair quality and give digital sign-off.',
  },
  Resolved: {
    label: '8. Resolved & Closed',
    icon: Award,
    desc: 'Verified by complainant. Case archived and +50 Civic Points credited.',
  },
  Reopened: {
    label: 'Case Reopened by Citizen',
    icon: AlertTriangle,
    desc: 'Citizen marked issue as still unresolved on-ground. Prioritized for field re-inspection.',
  },
  // Fallbacks
  Pending: {
    label: '1. Reported',
    icon: FileText,
    desc: 'Initial grievance submission.',
  },
  'In Progress': {
    label: '5. Work Started',
    icon: Wrench,
    desc: 'Active on-ground repair work.',
  },
};

export function LifecycleTimeline({ complaint }: LifecycleTimelineProps) {
  const slaInfo = computeSlaStatus(complaint);
  const currentStageIndex = complaint.status === 'Reopened'
    ? 4 // Treat as in-progress repair
    : COMPLAINT_STAGES.indexOf(
        complaint.status === 'Pending'
          ? 'Reported'
          : complaint.status === 'In Progress'
          ? 'Work Started'
          : complaint.status
      );

  return (
    <div
      id="complaint-lifecycle-timeline"
      className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>8-Stage Municipal Lifecycle</span>
            {complaint.reopened && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                REOPENED (x{complaint.reopenCount || 1})
              </span>
            )}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time stage progression with engineer audit timestamps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${slaInfo.badgeColor}`}>
            {slaInfo.label}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Stage {Math.max(1, currentStageIndex + 1)} of 8
          </span>
        </div>
      </div>

      {/* Reopened Alert banner if applicable */}
      {complaint.reopened && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200 mb-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Citizen Disputed Resolution</span>
          </div>
          <p className="text-rose-800 dark:text-rose-300 text-[11px]">
            {complaint.reopenReason
              ? `Reason: "${complaint.reopenReason}"`
              : 'Citizen indicated that the ground condition remains unresolved. Re-assigned with urgent SLA priority.'}
          </p>
        </div>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {COMPLAINT_STAGES.map((stage, idx) => {
          const isDone = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const meta = STAGE_META[stage] || STAGE_META.Reported;
          const IconComponent = meta.icon;

          // Find specific timestamp from complaint.timeline if available
          const timelineEntry = complaint.timeline?.find((t) => t.stage === stage);
          const timestamp = timelineEntry?.timestamp || (idx === 0 ? complaint.dateFiled : '');
          const customNote = timelineEntry?.note || meta.desc;
          const officer = timelineEntry?.officerName;

          return (
            <div key={stage} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-teal-600 border-white text-white shadow-md ring-4 ring-teal-100 dark:ring-teal-900/40 animate-pulse'
                    : isDone
                    ? 'bg-emerald-500 border-white text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Stage Content */}
              <div
                className={`p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800 shadow-xs'
                    : isDone
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    : 'bg-transparent border-transparent opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className={`w-4 h-4 ${
                        isCurrent
                          ? 'text-teal-700 dark:text-teal-300'
                          : isDone
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-teal-950 dark:text-teal-200'
                          : isDone
                          ? 'text-slate-900 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {meta.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-teal-600 text-white rounded-md">
                        Current Stage
                      </span>
                    )}
                  </div>

                  {timestamp && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {timestamp}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {customNote}
                </p>

                {officer && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-900/40 px-2 py-0.5 rounded-md">
                    <span>Handled by: {officer}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
