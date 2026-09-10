import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, LostFoundItem, UserProfile } from '../types';
import { INITIAL_LOST_FOUND } from '../data/mockData';
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
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface LostFoundScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function LostFoundScreen({ onNavigate, currentUser }: LostFoundScreenProps) {
  const [items, setItems] = useState<LostFoundItem[]>(INITIAL_LOST_FOUND);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactItem, setContactItem] = useState<LostFoundItem | null>(null);
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  // Simulate network fetch latency on initial load & category change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [filterType]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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

    const newItem: LostFoundItem = {
      id: `lf-${Date.now()}`,
      type: newType,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      location: newLocation || 'Metro Central Station',
      date: newType === 'lost' ? 'Lost Today' : 'Found Today',
      contactName: 'Alex Morgan',
      contactPhone: newContactPhone,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      status: 'Open',
    };

    setItems([newItem, ...items]);
    setNewTitle('');
    setNewDescription('');
    setNewLocation('');
    setIsAddModalOpen(false);
  };

  return (
    <div id="screen-lost-found" className="flex-1 flex flex-col bg-slate-50 min-h-[780px] relative">
      <TopAppBar
        currentScreen="lost-found"
        title="Lost & Found Hub"
        subtitle="Report or Locate Belongings & Pets"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Search & Category Filter Section */}
      <div className="p-4 bg-white border-b border-slate-200/80 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-lost-found"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys, wallets, dogs, electronics..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Filter Chips: All, Lost, Found & Refresh */}
        <div className="flex items-center gap-2">
          <button
            id="filter-all-items"
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            id="filter-lost-items"
            onClick={() => setFilterType('lost')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
              filterType === 'lost'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Lost
          </button>
          <button
            id="filter-found-items"
            onClick={() => setFilterType('found')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
              filterType === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Found
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh lost and found items"
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
            title="Refresh Registry"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Items List or Skeleton State */}
      {isLoading ? (
        <LostFoundSkeleton count={4} />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white m-4 rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No matching items found</p>
          <p className="text-[11px] text-slate-500 mt-1">Try clearing your search query or change category filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-3 px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3.5 pb-20">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              id={`lost-found-item-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 flex-shrink-0 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs ${
                        item.type === 'lost'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-teal-600" />
                        {item.category}
                      </span>
                      {item.reward && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {item.reward}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug mt-0.5 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-slate-50/80 px-3 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-600">
                  Contact: <strong className="text-slate-800">{item.contactName}</strong>
                </div>
                <button
                  onClick={() => {
                    setContactStatus(null);
                    setContactItem(item);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="btn-fab-add-lost-found"
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add Lost or Found Item"
        className="fixed bottom-20 right-6 z-40 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl p-3.5 shadow-xl shadow-teal-900/30 flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs font-bold pr-1">Report Item</span>
      </button>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Report Lost or Found Item</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('lost')}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      newType === 'lost'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('found')}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      newType === 'found'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Item Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Leather wallet, Cat, Umbrella"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Personal Item">Personal Item</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Keys">Keys</option>
                  <option value="Pets">Pets</option>
                  <option value="Documents / ID">Documents / ID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Location Last Seen / Found
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Central Library Bench, Bus 104"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe color, identifying marks, brands..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Finder / Owner Modal */}
      {contactItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Contact {contactItem.type === 'lost' ? 'Owner' : 'Finder'}
                </h3>
              </div>
              <button
                onClick={() => setContactItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  contactItem.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {contactItem.type.toUpperCase()} ITEM
                </span>
                <span className="text-xs text-slate-500">{contactItem.category}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{contactItem.title}</h4>
              <p className="text-xs text-slate-600">Reported by: <strong>{contactItem.contactName}</strong></p>
              <p className="text-xs font-mono font-bold text-teal-800 pt-1">{contactItem.contactPhone}</p>
            </div>

            {contactStatus ? (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-950">
                {contactStatus}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setContactStatus(`Calling ${contactItem.contactPhone}...`);
                    setTimeout(() => {
                      setContactStatus(null);
                      setContactItem(null);
                    }, 2000);
                  }}
                  className="py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Directly</span>
                </button>

                <button
                  onClick={() => {
                    setContactStatus(`Secure Municipal SMS sent to ${contactItem.contactName}`);
                    setTimeout(() => {
                      setContactStatus(null);
                      setContactItem(null);
                    }, 2000);
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setContactItem(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
