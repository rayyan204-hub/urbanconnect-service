import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, LostFoundItem, UserProfile } from '../types';
import {
  getLostFoundItems,
  createLostFoundItem,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
import { TopAppBar } from '../components/common/TopAppBar';
import { LostFoundSkeleton } from '../components/common/SkeletonStates';
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Phone,
  Tag,
  X,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface LostFoundScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function LostFoundScreen({ onNavigate, currentUser }: LostFoundScreenProps) {
  const [items, setItems] = useState<LostFoundItem[]>(() => getLostFoundItems());
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactItem, setContactItem] = useState<LostFoundItem | null>(null);

  useEffect(() => {
    setItems(getLostFoundItems());
    const unsub = subscribeToCollection(COLLECTIONS.LOST_FOUND, () => {
      setItems(getLostFoundItems());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType]);

  const handleRefresh = () => {
    setIsLoading(true);
    setItems(getLostFoundItems());
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'lost' | 'found'>('lost');
  const [newCategory, setNewCategory] = useState('Personal Item');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContactPhone, setNewContactPhone] = useState(currentUser?.phone || '+1 (555) 438-9120');

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createLostFoundItem({
      type: newType,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      location: newLocation || currentUser?.ward || 'Central Railway Station',
      contactName: currentUser?.name || 'Alex Morgan',
      contactPhone: newContactPhone,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    });

    setItems(getLostFoundItems());
    setNewTitle('');
    setNewDescription('');
    setNewLocation('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="screen-lost-found" className="flex-1 flex flex-col bg-[#F5F5F7] dark:bg-[#000000] min-h-[780px] font-sans pb-16 transition-colors">
      <TopAppBar
        currentScreen="lost-found"
        title="Lost & Found"
        subtitle="Citizen registry for misplaced valuables and belongings"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
        rightAction={
          <button
            id="btn-header-report-item"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        }
      />

      {/* Search & Segmented Filter Control */}
      <div className="px-5 sm:px-8 py-3.5 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#2C2C2E] space-y-3 sticky top-0 z-20">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-lost-found"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys, wallets, electronics, bags..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px] text-[14px] font-medium text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25 transition-all"
          />
        </div>

        {/* Filter Pills: All, Lost, Found */}
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] p-1 rounded-full flex items-center text-[12px] font-medium">
            <button
              id="filter-all-items"
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 rounded-full transition-all text-center ${
                filterType === 'all'
                  ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              id="filter-lost-items"
              onClick={() => setFilterType('lost')}
              className={`flex-1 py-1 rounded-full transition-all text-center ${
                filterType === 'lost'
                  ? 'bg-[#FF3B30] text-white font-semibold shadow-xs'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Lost
            </button>
            <button
              id="filter-found-items"
              onClick={() => setFilterType('found')}
              className={`flex-1 py-1 rounded-full transition-all text-center ${
                filterType === 'found'
                  ? 'bg-[#34C759] text-white font-semibold shadow-xs'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              Found
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-[#6E6E73] dark:text-[#86868B] hover:text-[#007AFF] transition-colors rounded-full"
            title="Refresh Registry"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#007AFF]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="px-5 sm:px-8 py-4 space-y-4 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <LostFoundSkeleton count={4} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.04] dark:border-white/[0.06] p-6 shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#86868B] mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">No matching items found</p>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-1">Try clearing your search query or change category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-3.5 px-4 py-2 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold hover:bg-[#0062CC] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              id={`lost-found-item-${item.id}`}
              className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-black/[0.04] dark:border-white/[0.06] shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col sm:flex-row"
            >
              {/* Thumbnail */}
              <div className="w-full sm:w-36 h-36 bg-[#F5F5F7] dark:bg-[#2C2C2E] shrink-0 relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                      item.type === 'lost'
                        ? 'bg-[#FF3B30] text-white'
                        : 'bg-[#34C759] text-white'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Info Content */}
              <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#007AFF]" />
                      {item.category}
                    </span>
                    {item.reward && (
                      <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">
                        {item.reward}
                      </span>
                    )}
                  </div>
                  <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-white leading-snug truncate">
                    {item.title}
                  </h4>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[12px] text-[#86868B] mt-3">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                    {item.location}
                  </span>
                  <button
                    onClick={() => setContactItem(item)}
                    className="px-3.5 py-1.5 rounded-full bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] font-semibold transition-colors"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">
                Report Belonging
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#86868B] hover:text-[#1D1D1F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[14px]">
                <button
                  type="button"
                  onClick={() => setNewType('lost')}
                  className={`py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                    newType === 'lost' ? 'bg-[#FF3B30] text-white shadow-xs' : 'text-[#6E6E73]'
                  }`}
                >
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('found')}
                  className={`py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                    newType === 'found' ? 'bg-[#34C759] text-white shadow-xs' : 'text-[#6E6E73]'
                  }`}
                >
                  I Found Something
                </button>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Blue leather wallet, House keys..."
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                >
                  <option value="Personal Item">Personal Item (Wallet, Keys)</option>
                  <option value="Electronics">Electronics (Phone, AirPods)</option>
                  <option value="Bags & Documents">Bags & Documents</option>
                  <option value="Pets & Animals">Pets & Animals</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Location Last Seen / Found
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Platform 4, Teen Hath Naka"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key features, colors, markings..."
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[12px] text-[14px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[14px] font-medium text-[#6E6E73] dark:text-[#86868B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#007AFF] text-white text-[14px] font-semibold"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Sheet */}
      {contactItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[26px] p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-4">
            <h3 className="text-[17px] font-bold text-[#1D1D1F] dark:text-white">
              Contact Citizen
            </h3>
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              Regarding "{contactItem.title}"
            </p>

            <div className="p-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-[16px] text-left space-y-1">
              <div className="text-[12px] text-[#86868B]">Posted by</div>
              <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-white">{contactItem.contactName}</div>
              <div className="text-[13px] text-[#007AFF] font-medium">{contactItem.contactPhone}</div>
            </div>

            <a
              href={`tel:${contactItem.contactPhone}`}
              className="w-full py-3 rounded-full bg-[#34C759] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Owner</span>
            </a>

            <button
              onClick={() => setContactItem(null)}
              className="w-full py-2.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[13px] font-medium text-[#6E6E73] dark:text-[#86868B]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
