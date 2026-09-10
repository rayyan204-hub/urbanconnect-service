import { useState, useEffect, FormEvent } from 'react';
import { ScreenId, CommunityPost, UserProfile } from '../types';
import { INITIAL_POSTS } from '../data/mockData';
import { TopAppBar } from '../components/common/TopAppBar';
import { CommunityFeedSkeleton } from '../components/common/SkeletonStates';
import {
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Pin,
  Calendar,
  Image as ImageIcon,
  X,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CommunityFeedScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

export function CommunityFeedScreen({ onNavigate, currentUser }: CommunityFeedScreenProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network fetch latency on initial load & category change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'Civic Notice' | 'Neighborhood' | 'Cultural' | 'Environment'>('Neighborhood');

  const categories = ['All', 'Civic Notice', 'Neighborhood', 'Cultural', 'Environment'];

  const handleToggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[id];
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === id
            ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
            : post
        )
      );
      return { ...prev, [id]: isLiked };
    });
  };

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newPostItem: CommunityPost = {
      id: `post-${Date.now()}`,
      author: currentUser?.name || 'Alex Morgan',
      authorRole: currentUser?.ward || 'Resident (Ward 14)',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: newTitle,
      description: newDescription,
      category: newCategory,
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
      date: 'Just now',
      likes: 1,
      comments: 0,
    };

    setPosts([newPostItem, ...posts]);
    setNewTitle('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div id="screen-community-feed" className="flex-1 flex flex-col bg-slate-50 min-h-[780px] relative">
      {/* Top App Bar */}
      <TopAppBar
        currentScreen="community"
        title="Community Feed"
        subtitle="Civic Announcements & Neighborhood Board"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Category Filter Pills & Refresh */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="overflow-x-auto flex items-center gap-1.5 scrollbar-none flex-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh community feed"
          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
          title="Refresh Civic Feed"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </div>

      {/* Posts List or Skeleton Loading State */}
      {isLoading ? (
        <CommunityFeedSkeleton count={3} />
      ) : filteredPosts.length === 0 ? (
        <div className="p-8 text-center bg-white m-4 rounded-3xl border border-slate-200 shadow-2xs">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800">No announcements in this category yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Be the first citizen to publish an update!</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-3 px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
          >
            View All Posts
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-20">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              id={`post-card-${post.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
            {/* Post Header */}
            <div className="p-3.5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {post.author}
                  </h4>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>{post.authorRole}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {post.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="w-full h-44 bg-slate-100 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Content */}
            <div className="p-3.5">
              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1.5">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {post.description}
              </p>

              {/* Engagement Bar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
                <button
                  id={`btn-like-${post.id}`}
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                    likedPosts[post.id]
                      ? 'text-teal-700 bg-teal-50 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts[post.id] ? 'fill-teal-700' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => alert(`Viewing comments for "${post.title}"`)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{post.comments} Comments</span>
                </button>

                <button
                  onClick={() => alert(`Share link copied for: ${post.title}`)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
        </div>
      )}

      {/* Floating Action Button (FAB) for "New Post" */}
      <button
        id="btn-fab-new-post"
        onClick={() => setIsModalOpen(true)}
        aria-label="Create New Post"
        className="fixed bottom-20 right-6 z-40 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl p-3.5 shadow-xl shadow-teal-900/30 flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs font-bold pr-1">New Post</span>
      </button>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create Community Announcement</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Neighborhood">Neighborhood</option>
                  <option value="Civic Notice">Civic Notice</option>
                  <option value="Environment">Environment</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Block cleanup this weekend"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Share details, timing, or meeting location..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 flex items-center gap-2 text-[11px] text-teal-800">
                <ImageIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Demo city photo will be automatically attached.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
