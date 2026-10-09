import { useState, useEffect, useRef, FormEvent, TouchEvent, PointerEvent } from 'react';
import { ScreenId, CommunityPost, UserProfile } from '../types';
import {
  getCommunityPosts,
  createCommunityPost,
  togglePostLike,
  addPostComment,
  subscribeToCollection,
  COLLECTIONS,
} from '../services/dbService';
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
  ArrowDown,
  CheckCircle2,
  Send,
  BellRing,
} from 'lucide-react';

interface CommunityFeedScreenProps {
  onNavigate: (screen: ScreenId) => void;
  currentUser?: UserProfile | null;
}

interface PostComment {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  text: string;
}

export function CommunityFeedScreen({ onNavigate, currentUser }: CommunityFeedScreenProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(() => getCommunityPosts());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('10:45 AM');
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // Subscribe to live posts collection
  useEffect(() => {
    setPosts(getCommunityPosts());
    const unsub = subscribeToCollection(COLLECTIONS.POSTS, () => {
      setPosts(getCommunityPosts());
    });
    return () => unsub();
  }, []);

  // Interactive Comments & Share state
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({
    'post-1': [
      {
        id: 'c-1',
        author: 'Marcus Vance',
        role: 'Commuter (Ward 14)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        time: '1 hour ago',
        text: 'Will the new underground stations connect directly to the Grand Central bus concourse?',
      },
      {
        id: 'c-2',
        author: 'Dept of Urban Transit',
        role: 'Verified Civic Authority',
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
        time: '35 mins ago',
        text: 'Yes Marcus! An underground pedestrian tunnel will link 5th Ave Metro with Bus Bay 4.',
      },
    ],
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const PULL_THRESHOLD = 58;

  // Helper to check if scroll position is at the very top
  const isScrolledToTop = (): boolean => {
    if (scrollContainerRef.current) {
      if (scrollContainerRef.current.scrollTop > 3) return false;
    }
    // Check parent elements if viewport scrolling
    let el: HTMLElement | null = scrollContainerRef.current;
    while (el) {
      if (el.scrollTop > 4) return false;
      el = el.parentElement;
    }
    return window.scrollY <= 4;
  };

  // Simulate network fetch latency on initial load & category change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Main manual feed update / refresh action
  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(56);

    setTimeout(() => {
      // Simulate live incoming community broadcast or engagement bump
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(timeString);

      setPosts((currentPosts) => {
        // If not already injected, add an updated fresh civic bulletin
        const hasLiveBulletin = currentPosts.some((p) => p.id === 'post-live-bulletin');
        if (!hasLiveBulletin) {
          const freshNotice: CommunityPost = {
            id: 'post-live-bulletin',
            author: 'Ward 14 Municipal Dispatch',
            authorRole: 'Live Civic Alert',
            avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
            title: 'Ward 14 Transit & Sanitation Update',
            description: 'Morning maintenance on 5th Avenue completed 15 mins ahead of schedule. Regular bus schedules and street sweeping fully operational.',
            category: 'Civic Notice',
            date: 'Just now',
            likes: 14,
            comments: 2,
          };
          return [freshNotice, ...currentPosts];
        } else {
          // Increment engagements slightly to show active live updates
          return currentPosts.map((p, idx) => (idx === 0 ? { ...p, likes: p.likes + 1 } : p));
        }
      });

      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);

      // Show brief confirmation badge
      setRefreshToast('Feed refreshed • Civic notices up to date');
      setTimeout(() => setRefreshToast(null), 2500);
    }, 850);
  };

  // Touch gesture handlers for mobile pull-to-refresh
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    if (isScrolledToTop()) {
      touchStartYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartYRef.current;

    if (diffY > 0 && isScrolledToTop()) {
      // Damped resistance curve
      const calculatedDistance = Math.min(85, Math.pow(diffY, 0.82));
      setPullDistance(calculatedDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartYRef.current === null) return;
    touchStartYRef.current = null;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Pointer/Mouse drag handlers for desktop / emulator pull-to-refresh
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    if (e.button === 0 && isScrolledToTop()) {
      touchStartYRef.current = e.clientY;
      isPointerDownRef.current = true;
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || touchStartYRef.current === null || isRefreshing) return;
    const diffY = e.clientY - touchStartYRef.current;

    if (diffY > 0 && isScrolledToTop()) {
      setIsPulling(true);
      const calculatedDistance = Math.min(85, Math.pow(diffY, 0.82));
      setPullDistance(calculatedDistance);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    touchStartYRef.current = null;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'Civic Notice' | 'Neighborhood' | 'Cultural' | 'Environment'>('Neighborhood');

  const categories = ['All', 'Civic Notice', 'Neighborhood', 'Cultural', 'Environment'];

  const handleToggleLike = (id: string) => {
    const userUid = currentUser?.uid || 'usr-1';
    togglePostLike(id, userUid);
    setLikedPosts((prev) => {
      const isLiked = !prev[id];
      return { ...prev, [id]: isLiked };
    });
    setPosts(getCommunityPosts());
  };

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    createCommunityPost({
      author: currentUser?.name || 'Alex Morgan',
      authorRole: currentUser?.ward || 'Resident (Ward 14)',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: newTitle,
      description: newDescription,
      category: newCategory,
      imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    });

    setPosts(getCommunityPosts());
    setNewTitle('');
    setNewDescription('');
    setIsModalOpen(false);

    setRefreshToast('Your announcement has been published to the neighborhood board');
    setTimeout(() => setRefreshToast(null), 3000);
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !commentInput.trim()) return;

    const authorName = currentUser?.name || 'Alex Morgan';
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    addPostComment(activeCommentPost.id, {
      author: authorName,
      avatar: authorAvatar,
      text: commentInput.trim(),
    });

    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      author: authorName,
      role: currentUser?.ward || 'Resident (Ward 14)',
      avatar: authorAvatar,
      time: 'Just now',
      text: commentInput.trim(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [activeCommentPost.id]: [...(prev[activeCommentPost.id] || []), newComment],
    }));

    setCommentInput('');
    setPosts(getCommunityPosts());
  };


  const handleShare = (post: CommunityPost) => {
    setRefreshToast(`Civic share link copied for "${post.title.slice(0, 32)}..."`);
    setTimeout(() => setRefreshToast(null), 2500);
  };

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div
      id="screen-community-feed"
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-[780px] relative select-none sm:select-auto transition-colors"
    >
      {/* Top App Bar */}
      <TopAppBar
        currentScreen="community"
        title="Community Feed"
        subtitle="Civic Announcements & Neighborhood Board"
        showBack
        onNavigate={onNavigate}
        currentUser={currentUser}
        rightAction={
          <button
            id="btn-header-new-post"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        }
      />

      {/* Category Filter Pills & Refresh Bar */}
      <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs z-20 transition-colors">
        <div className="overflow-x-auto flex items-center gap-1.5 scrollbar-none flex-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          id="btn-manual-refresh-feed"
          onClick={triggerRefresh}
          disabled={isRefreshing}
          aria-label="Refresh community feed"
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 flex items-center gap-1"
          title="Refresh Civic Feed"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline-block">
            {lastUpdated}
          </span>
        </button>
      </div>

      {/* Pull-To-Refresh Visual Indicator Drawer */}
      <div
        id="pull-to-refresh-indicator"
        style={{
          height: isRefreshing ? 56 : pullDistance,
          transition: isPulling ? 'none' : 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="overflow-hidden bg-gradient-to-b from-teal-50/90 to-slate-50 dark:from-teal-950/40 dark:to-slate-900 border-b border-teal-100/70 dark:border-teal-900/50 flex items-center justify-center transition-opacity"
      >
        <div className="flex items-center gap-3 py-2 px-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-all ${
              pullDistance >= PULL_THRESHOLD || isRefreshing
                ? 'bg-teal-700 text-white'
                : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
            }`}
            style={{
              transform: isRefreshing
                ? 'none'
                : `rotate(${Math.min(360, (pullDistance / PULL_THRESHOLD) * 270)}deg)`,
            }}
          >
            {isRefreshing ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : pullDistance >= PULL_THRESHOLD ? (
              <ArrowDown className="w-4 h-4 rotate-180 transition-transform duration-150" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {isRefreshing
                ? 'Updating neighborhood announcements...'
                : pullDistance >= PULL_THRESHOLD
                ? 'Release to refresh feed'
                : 'Pull down to refresh feed'}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {isRefreshing
                ? 'Connecting to municipal community server'
                : `Last updated: ${lastUpdated} • Drag down from top`}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Refresh Confirmation Toast */}
      {refreshToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xs px-3.5 py-2 rounded-2xl bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-medium shadow-xl backdrop-blur-xs flex items-center gap-2 border border-slate-700/60">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{refreshToast}</span>
        </div>
      )}

      {/* Hint Pill for Gesture Discovery */}
      {!isRefreshing && pullDistance === 0 && !isLoading && (
        <div className="pt-2 px-4 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
            <BellRing className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            Live Civic Board
          </span>
          <button
            type="button"
            onClick={triggerRefresh}
            className="hover:text-teal-700 dark:hover:text-teal-400 hover:underline flex items-center gap-1"
          >
            <ArrowDown className="w-2.5 h-2.5" />
            <span>Pull down or tap to refresh</span>
          </button>
        </div>
      )}

      {/* Citizen Post Composer Prompt Card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="mx-4 mt-3 mb-1 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-teal-500/60 dark:hover:border-teal-600 transition-colors"
      >
        <img
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
          alt="Citizen Avatar"
          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
        />
        <div className="flex-1 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 py-2 px-3 rounded-xl">
          Share an update, query or civic alert...
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-2xs shrink-0 transition-colors"
          title="Create New Post"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Posts List or Skeleton Loading State */}
      {isLoading ? (
        <CommunityFeedSkeleton count={3} />
      ) : filteredPosts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 m-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No announcements in this category yet</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Be the first citizen to publish an update!</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-3 px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
          >
            View All Posts
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-24">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              id={`post-card-${post.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              {/* Post Header */}
              <div className="p-3.5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {post.author}
                    </h4>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
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
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1.5">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {post.description}
                </p>

                {/* Engagement Bar */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    id={`btn-like-${post.id}`}
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                      likedPosts[post.id]
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts[post.id] ? 'fill-teal-700 dark:fill-teal-400' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    id={`btn-comments-${post.id}`}
                    onClick={() => setActiveCommentPost(post)}
                    className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>
                      {(commentsMap[post.id]?.length || post.comments)} Comments
                    </span>
                  </button>

                  <button
                    id={`btn-share-${post.id}`}
                    onClick={() => handleShare(post)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    title="Share Civic Post"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Interactive Comments Dialog Modal */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 pr-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Comments: {activeCommentPost.title}
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {commentsMap[activeCommentPost.id]?.length || activeCommentPost.comments} public comments
                </span>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comment Thread List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-64">
              {(commentsMap[activeCommentPost.id] || []).length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 space-y-1">
                  <MessageCircle className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">No comments yet</p>
                  <p className="text-[10px]">Start the civic conversation below</p>
                </div>
              ) : (
                (commentsMap[activeCommentPost.id] || []).map((comm) => (
                  <div key={comm.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <img src={comm.avatar} alt={comm.author} className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">{comm.author}</span>
                        <span className="text-[9px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded-full font-medium">
                          {comm.role}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{comm.time}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs pl-6">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input Form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a constructive civic comment..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl transition-colors"
                title="Send comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Community Announcement</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Neighborhood">Neighborhood</option>
                  <option value="Civic Notice">Civic Notice</option>
                  <option value="Environment">Environment</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Block cleanup this weekend"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Share details, timing, or meeting location..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800 flex items-center gap-2 text-[11px] text-teal-800 dark:text-teal-300">
                <ImageIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span>Demo city photo will be automatically attached.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
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
