import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Heart, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Lightbulb, 
  ArrowRight,
  Send,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const POST_TYPES = [
  { id: 'all', label: 'All Discussions' },
  { id: 'need', label: '📢 Local Needs' },
  { id: 'offer', label: '🎁 Senior Offers' },
  { id: 'collaboration', label: '🤝 Collaborations' },
  { id: 'event', label: '📅 Workshops & Events' }
];

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCity, selectedLocality } = useLocation();

  const [posts, setPosts] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Comments state — keyed by postId to avoid cross-post leaking
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Create Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'need',
    tags: [],
    locality: selectedLocality !== 'All Areas' ? selectedLocality : 'Adyar',
    city: selectedCity?.name || 'Chennai'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { city: selectedCity?.name || 'Chennai' };
      if (selectedType !== 'all') params.type = selectedType;

      const postsData = await api.get('/community/posts', { params });
      setPosts(postsData || []);

      if (user?.role === 'senior') {
        const collabData = await api.get('/community/collaborations');
        setCollabs(collabData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load community feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedCity?.name, user?.sub]);

  useEffect(() => {
    if (selectedCity?.name) {
      setPostForm(prev => ({
        ...prev,
        city: selectedCity.name,
        locality: selectedLocality && selectedLocality !== 'All Areas' 
          ? selectedLocality 
          : (selectedCity.localities && selectedCity.localities.length > 0 ? selectedCity.localities[0] : 'Central Area')
      }));
    }
  }, [selectedCity?.name, selectedLocality]);

  const handleOpenComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    setNewCommentText('');
    // Only fetch if not already cached
    if (!commentsMap[postId]) {
      setLoadingComments(true);
      try {
        const data = await api.get(`/community/posts/${postId}/comments`);
        setCommentsMap(prev => ({ ...prev, [postId]: data || [] }));
      } catch (err) {
        console.error('Fetch comments error:', err);
        setCommentsMap(prev => ({ ...prev, [postId]: [] }));
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newCommentText.trim() || !isAuthenticated) return;
    try {
      const res = await api.post(`/community/posts/${postId}/comments`, {
        content: newCommentText
      });
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res]
      }));
      setNewCommentText('');
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const handleConnectCollab = async (collab) => {
    try {
      await api.post('/community/collaborations/connect', {
        target_senior_id: collab.senior_b_id,
        venture_title: collab.venture_title
      });
      setToastMsg(`Collaboration request sent to ${collab.senior_b_name}!`);
      setTimeout(() => setToastMsg(''), 3500);
      setCollabs(prev => prev.map(c => c.id === collab.id ? { ...c, status: 'connected' } : c));
    } catch (err) {
      console.error('Connect collab error:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/community/posts', postForm);
      setShowCreateModal(false);
      setToastMsg(postForm.type === 'need' ? 'Need posted & local demand signal generated!' : 'Post published to community!');
      setTimeout(() => setToastMsg(''), 3500);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white font-bold text-xs shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-sm font-bold text-white uppercase">Regional Economy</span>
            <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-secondary" /> {selectedCity.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1">
            Community & Skill Collaborations
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70">
            Local needs generate live demand for seniors. Seniors discover complementary partners to launch local ventures.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-1 shadow-sm text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Community Post
        </button>
      </div>

      {/* Senior-to-Senior Complementary Skill Match Section (For Seniors) */}
      {user?.role === 'senior' && collabs.length > 0 && (
        <div className="card bg-gradient-to-r from-primary/10 via-base-100 to-secondary/15 border-2 border-primary/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                🤝
              </span>
              <div>
                <h3 className="font-extrabold text-base text-base-content">
                  AI Senior-to-Senior Skill Complement Matches
                </h3>
                <p className="text-[11px] text-base-content/70">
                  We identified complementary skill synergy in your locality to help you co-launch micro-businesses!
                </p>
              </div>
            </div>

            <span className="badge badge-primary badge-sm font-bold text-white">
              {collabs.length} Synergy Opportunity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {collabs.map((collab) => (
              <div 
                key={collab.id}
                className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{collab.venture_title}</span>
                    <span className="text-[10px] text-base-content/60">{collab.locality}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-base-200/60 p-2.5 rounded-xl">
                    <div>
                      <strong className="text-base-content block">{collab.senior_a_name}</strong>
                      <span className="text-[10px] text-base-content/60">{collab.senior_a_skills.slice(0, 2).join(', ')}</span>
                    </div>
                    <div>
                      <strong className="text-base-content block">{collab.senior_b_name}</strong>
                      <span className="text-[10px] text-base-content/60">{collab.senior_b_skills.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-base-content/75 leading-tight">
                    💡 <em>"{collab.ai_synergy_reason}"</em>
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  {collab.status === 'connected' ? (
                    <span className="badge badge-success badge-sm text-white font-bold gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Discussing
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectCollab(collab)}
                      className="btn btn-primary btn-xs rounded-lg text-white font-bold gap-1"
                    >
                      🤝 Propose Venture Collaboration
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {POST_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedType === type.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-base-100 border border-base-300 text-base-content/70 hover:bg-base-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <ErrorAlert message={error} onRetry={fetchData} />

      {/* Posts Feed */}
      {loading ? (
        <LoadingSpinner message="Fetching regional community feed..." />
      ) : posts.length === 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="text-lg font-bold text-base-content">No posts found in {selectedCity.name}</h3>
          <p className="text-xs text-base-content/60">Be the first to post a local need or community workshop!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="card bg-base-100 border border-base-300 rounded-3xl p-6 shadow-xs space-y-3"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-base-content">{post.author_name}</span>
                    <span className="badge badge-ghost badge-xs uppercase font-semibold text-[9px]">
                      {post.author_role}
                    </span>
                    {post.is_age_verified && (
                      <span className="badge badge-success badge-xs text-white font-bold gap-1 text-[9px]">
                        <ShieldCheck className="w-2.5 h-2.5" /> Age Verified
                      </span>
                    )}
                    <span className="text-[11px] text-base-content/50">
                      • {post.locality}, {post.city}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-base-content mt-1 leading-snug">
                    {post.title}
                  </h3>
                </div>

                <span className={`badge badge-sm font-bold uppercase text-[10px] ${
                  post.type === 'need' 
                    ? 'badge-warning text-warning-content' 
                    : post.type === 'collaboration'
                    ? 'badge-secondary text-white'
                    : post.type === 'event'
                    ? 'badge-accent text-white'
                    : 'badge-neutral'
                }`}>
                  {post.type}
                </span>
              </div>

              {/* Post Content */}
              <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed">
                {post.content}
              </p>

              {/* Demand Signal Badge if generated */}
              {post.demand_signal_generated && post.matched_skills.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-xs text-primary flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Live Demand Signal: Matching {post.matched_skills.join(', ')}
                  </span>
                  <Link to="/services" className="text-[11px] font-extrabold hover:underline">
                    Offer Service →
                  </Link>
                </div>
              )}

              {/* Tags & Action Bar */}
              <div className="pt-2 border-t border-base-200 flex items-center justify-between text-xs sm:text-sm text-base-content/70">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="badge badge-ghost badge-sm text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleOpenComments(post.id)}
                    className="btn btn-ghost min-h-[40px] px-3 rounded-xl flex items-center gap-1.5 hover:text-primary font-bold text-xs sm:text-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-primary" /> {post.comments_count || 0} Comments
                  </button>
                </div>
              </div>

              {/* Expandable Comments Drawer */}
              {activeCommentsPostId === post.id && (
                <div className="pt-3 border-t border-base-200 space-y-3">
                  {loadingComments ? (
                    <div className="py-2 text-center">
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {(commentsMap[post.id] || []).length === 0 ? (
                        <p className="text-xs text-base-content/60 italic py-1">No comments yet. Be the first to share your thoughts!</p>
                      ) : (
                        (commentsMap[post.id] || []).map((c) => (
                          <div key={c.id} className="bg-base-200/80 p-3 rounded-2xl text-xs sm:text-sm space-y-1 border border-base-300/60">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-base-content text-xs sm:text-sm">
                                {c.author_name} <span className="text-base-content/60 font-normal text-[11px]">({c.author_role})</span>
                              </span>
                            </div>
                            <p className="text-base-content/90 text-xs sm:text-sm leading-relaxed">{c.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Add comment form */}
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="text" 
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment(post.id))}
                      placeholder="Write a helpful response, query, or offer..."
                      className="input input-bordered min-h-[44px] w-full text-xs sm:text-sm rounded-2xl bg-base-100"
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newCommentText.trim()}
                      className="btn btn-primary min-h-[44px] px-5 text-white rounded-2xl font-bold text-xs sm:text-sm shrink-0 shadow-xs"
                    >
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* CREATE COMMUNITY POST MODAL */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 border border-base-300 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <h3 className="text-lg font-bold text-base-content">Create a Community Post</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              <div className="form-control">
                <label className="label text-[11px] font-semibold">Post Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'need', label: '📢 Need / Request' },
                    { id: 'offer', label: '🎁 Offer' },
                    { id: 'collaboration', label: '🤝 Collab' },
                    { id: 'event', label: '📅 Workshop' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostForm(prev => ({ ...prev, type: t.id }))}
                      className={`p-2 rounded-xl border text-center font-bold text-[10px] ${
                        postForm.type === t.id ? 'bg-primary text-white border-primary' : 'bg-base-200 border-base-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label text-[11px] font-semibold">Post Title</label>
                <input 
                  type="text" 
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Looking for spoken Tamil tutor in Adyar"
                  className="input input-bordered input-sm w-full rounded-xl"
                />
              </div>

              <div className="form-control">
                <label className="label text-[11px] font-semibold">Details & Requirements</label>
                <textarea 
                  rows={3}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your requirement, schedule, or offer..."
                  className="textarea textarea-bordered w-full text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">City</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={postForm.city}
                    className="input input-bordered input-sm w-full rounded-xl bg-base-200"
                  />
                </div>
                <div className="form-control">
                  <label className="label text-[11px] font-semibold">Locality</label>
                  <select 
                    value={postForm.locality}
                    onChange={(e) => setPostForm(prev => ({ ...prev, locality: e.target.value }))}
                    className="select select-bordered select-sm w-full rounded-xl text-xs"
                  >
                    {(selectedCity?.localities || []).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-action pt-2 flex items-center justify-between">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm rounded-xl">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="btn btn-primary btn-sm rounded-xl text-white font-bold"
                >
                  {creating ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
