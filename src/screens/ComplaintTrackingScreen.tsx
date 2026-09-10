import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, Complaint, ComplaintStatus, UserProfile } from '../types';
import { INITIAL_COMPLAINTS } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { ComplaintTrackingSkeleton } from '../components/common/SkeletonStates';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Filter,
  X,
  Send,
  Building,
  RotateCcw,
} from 'lucide-react';

interface ComplaintTrackingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function ComplaintTrackingScreen({ onNavigate, currentUser }: ComplaintTrackingScreenProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network fetch latency on mount & filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [statusFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const filteredComplaints =
    statusFilter === 'All'
      ? complaints
      : complaints.filter((c) => c.status === statusFilter);

  const handleSubmitComplaint = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    const newTicket: Complaint = {
      id: `comp-${Date.now()}`,
      ticketId: `UC-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category,
      department: 'Civic Works & Maintenance',
      location,
      dateFiled: 'Today at 09:41 AM',
      status: 'Pending',
      description,
      lastUpdate: 'Ticket logged into city municipal grievance dispatch queue.',
    };

    setComplaints([newTicket, ...complaints]);
    setTitle('');
    setLocation('');
    setDescription('');
    setIsSubmitModalOpen(false);
  };

  return (
    <div id="screen-complaint-tracking" className="flex-1 flex flex-col bg-slate-50 min-h-[780px] relative">
      <TopAppBar
        currentScreen="complaints"
        title="Civic Grievance Desk"
        subtitle="Municipal Issue Reporting & Tracking"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Header with "Submit Complaint" Button */}
      <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Your Civic Tickets</h3>
          <p className="text-[11px] text-slate-500">Track resolution with city departments</p>
        </div>
        <button
          id="btn-submit-complaint"
          onClick={() => setIsSubmitModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Complaint</span>
        </button>
      </div>

      {/* Status Filter Chips: All, Pending, In Progress, Resolved & Refresh */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh complaint tickets"
          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200/70 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
          title="Refresh Civic Tickets"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </div>

      {/* Complaint Cards or Skeleton State */}
      {isLoading ? (
        <ComplaintTrackingSkeleton count={3} />
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-10 bg-white m-4 rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No complaints in this category</p>
          <p className="text-[11px] text-slate-500 mt-1">All civic systems in this status category are clear.</p>
          <button
            onClick={() => setStatusFilter('All')}
            className="mt-3 px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
          >
            Show All Tickets
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3.5 pb-8">
          {filteredComplaints.map((item) => {
            let statusBadge = (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-amber-600" />
                Pending
              </span>
            );

            if (item.status === 'In Progress') {
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3 text-cyan-600" />
                  In Progress
                </span>
              );
            } else if (item.status === 'Resolved') {
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Resolved
                </span>
              );
            }

            return (
              <div
                key={item.id}
                id={`complaint-card-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all space-y-2.5"
              >
                {/* Header: Ticket ID & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                      {item.ticketId}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.dateFiled}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                {/* Complaint Title & Description */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Location & Department */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Building className="w-3 h-3 text-teal-600 flex-shrink-0" />
                    {item.department}
                  </span>
                </div>

                {/* Last Update Banner */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 flex-shrink-0">Update:</span>
                  <span>{item.lastUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Complaint Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Submit Municipal Complaint</h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight, Pothole, Water leakage"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Street Lighting & Power">Street Lighting & Power</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Water & Utilities">Water & Utilities</option>
                  <option value="Parks & Public Recreation">Parks & Public Recreation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Exact Location / Address
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Corner of Elm & 7th Avenue, Ward 14"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any safety concerns or duration of the issue..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>File Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
