'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, MessageSquare, Eye, MoreVertical, Search, AlertTriangle, Trash2, ThumbsUp, MessageCircle, Send, User } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorUid: string;
  likes: number;
  createdAt: Timestamp | Date | null;
}

interface Post {
  id: string;
  title?: string;
  body?: string;
  images?: string[];
  type?: 'public' | 'anonymous';
  owner?: string;
  createdAt?: Timestamp | Date | null;
  likes?: number;
  comments?: Comment[];
  showComments?: boolean;
}

export default function ForumsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'anonymous'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [commentText, setCommentText] = useState<{[postId: string]: string}>({});
  const [loadingComments, setLoadingComments] = useState<{[postId: string]: boolean}>({});

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      console.log('🔥 Fetching comments for post:', postId);
      
      const commentsQuery = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      console.log('🔥 Comments fetched:', querySnapshot.size);
      
      const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));

      // Update the specific post with comments
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments, showComments: true }
            : post
        )
      );
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.showComments) {
      // Hide comments
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, showComments: false, comments: [] }
            : p
        )
      );
    } else {
      // Fetch and show comments
      await fetchComments(postId);
    }
  };

  const addComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      console.log('🔥 Adding comment to post:', postId);
      
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: text,
        authorName: 'Admin User', // In a real app, this would come from auth
        authorUid: 'admin-uid', // In a real app, this would come from auth
        likes: 0,
        createdAt: serverTimestamp(),
      });

      // Clear the comment text
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      // Refresh comments for this post
      await fetchComments(postId);
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
        // Refresh comments for this post
        await fetchComments(postId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔥 Fetching posts from Firestore...');
      
      const baseQuery = collection(db, 'posts');
      console.log('🔥 Created collection reference');
      
      // Build query with filters and sorting
      const queryConstraints = [];
      
      if (typeFilter !== 'all') {
        queryConstraints.push(where('type', '==', typeFilter));
      }
      
      if (sortBy === 'date') {
        queryConstraints.push(orderBy('createdAt', 'desc'));
      } else {
        queryConstraints.push(orderBy('likes', 'desc'));
      }
      
      const finalQuery = queryConstraints.length > 0 
        ? query(baseQuery, ...queryConstraints)
        : baseQuery;

      console.log('🔥 About to execute query...');
      const querySnapshot = await getDocs(finalQuery);
      console.log('🔥 Query executed! Document count:', querySnapshot.size);
      
      const postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Document:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as Post[];

      console.log('🔥 Final posts array:', postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.body || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.owner || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatTimeAgo = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if ((timestamp as Timestamp).toDate) {
      date = (timestamp as Timestamp).toDate();
    } else {
      date = new Date();
    }

    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeColor = (type: string) => {
    return type === 'anonymous' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forums Management</h1>
            <p className="mt-2 text-gray-600">Moderate community discussions and manage forum content</p>
          </div>
          <button
            onClick={() => console.log('Create post modal')}
            className="inline-flex items-center px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </button>
        </div>
      </div>

      {/* Debug Info - Remove this later */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm text-black">
        <p><strong>Debug Info:</strong></p>
        <p>Posts fetched: {posts.length}</p>
        <p>Loading state: {loading ? 'Yes' : 'No'}</p>
        <p>Filter: {typeFilter} | Sort: {sortBy}</p>
        {posts.length > 0 && (
          <p>Sample post: {posts[0]?.title || 'No title'} (Type: {posts[0]?.type || 'Unknown'})</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Public Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.type === 'public').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Anonymous Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.type === 'anonymous').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ThumbsUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + (post.likes || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, users, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'public' | 'anonymous')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="public">Public Posts</option>
                <option value="anonymous">Anonymous Reports</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'likes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="likes">Sort by Likes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C4DFF]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              {posts.length === 0 ? 'No posts in the database yet.' : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#7C4DFF] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(post.owner || 'AN').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#7C4DFF] cursor-pointer">
                            {post.title}
                          </h3>
                        </div>

                        {/* Tags and Type */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type || 'public')}`}>
                            {(post.type || 'public').toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            ID: {post.id}
                          </span>
                        </div>

                        {/* Content Preview */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {(post.body || '').replace(/<[^>]*>/g, '')} {/* Strip HTML tags for preview */}
                        </p>

                        {/* Author and Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Owner: <strong>{post.owner || 'Anonymous'}</strong></span>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes || 0} likes</span>
                          </div>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1 hover:text-[#7C4DFF] transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments?.length || 0} comments</span>
                          </button>
                          <span>Posted {formatTimeAgo(post.createdAt || null)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => console.log('View post:', post.id)}
                          className="p-2 text-gray-500 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {post.showComments && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {/* Add Comment Form */}
                        <div className="mb-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-[#7C4DFF] rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addComment(post.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => addComment(post.id)}
                                  disabled={!commentText[post.id]?.trim()}
                                  className="px-3 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comments List */}
                        {loadingComments[post.id] ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C4DFF]"></div>
                          </div>
                        ) : post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {(comment.authorName || 'A').substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {comment.authorName || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => deleteComment(post.id, comment.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-[#7C4DFF] transition-colors">
                                      <ThumbsUp className="h-3 w-3" />
                                      <span>{comment.likes || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
