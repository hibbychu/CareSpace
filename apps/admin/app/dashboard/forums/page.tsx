'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc, Timestamp, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, MessageSquare, Eye, MoreVertical, Search, AlertTriangle, Trash2, ThumbsUp, MessageCircle, Send, User, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

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
  postType?: 'post' | 'report';
  owner?: string;
  ownerUid?: string;
  createdAt?: Timestamp | Date | null;
  likes?: number;
  comments?: Comment[];
  showComments?: boolean;
  commentsCount?: number;
}

export default function ForumsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'post' | 'report'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [commentText, setCommentText] = useState<{[postId: string]: string}>({});
  const [loadingComments, setLoadingComments] = useState<{[postId: string]: boolean}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{[postId: string]: number}>({});
  
  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    postType: 'post' as 'post' | 'report',
    images: ['']
  });

  // Edit Post Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPost, setEditPost] = useState({
    title: '',
    body: '',
    postType: 'post' as 'post' | 'report',
    images: ['']
  });

  // Current admin UID (in a real app, this would come from auth)
  const currentAdminUid = 'admin-uid';

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showEditModal) setShowEditModal(false);
      }
    };

    if (showCreateModal || showEditModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showEditModal]);

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
      
      // Update comment count and refresh comments for this post
      const newCommentCount = await fetchCommentCount(postId);
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, commentsCount: newCommentCount }
            : p
        )
      );
      
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
        
        // Update comment count and refresh comments for this post
        const newCommentCount = await fetchCommentCount(postId);
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, commentsCount: newCommentCount }
              : p
          )
        );
        
        // Refresh comments for this post
        await fetchComments(postId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setCreating(true);
      console.log('🔥 Creating new post...');
      
      const postData = {
        title: newPost.title.trim(),
        body: newPost.body.trim(),
        postType: newPost.postType,
        owner: 'Admin User', // In a real app, this would come from auth
        ownerUid: currentAdminUid, // Add the UID for authorization
        likes: 0,
        createdAt: serverTimestamp(),
        images: newPost.images.filter(img => img.trim() !== '') // Filter out empty URLs
      };

      await addDoc(collection(db, 'posts'), postData);
      
      // Reset form and close modal
      setNewPost({ title: '', body: '', postType: 'post', images: [''] });
      setShowCreateModal(false);
      
      // Refresh posts
      await fetchPosts();
      
      console.log('✅ Post created successfully!');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setEditPost({
      title: post.title || '',
      body: post.body || '',
      postType: post.postType || 'post',
      images: post.images && post.images.length > 0 ? [...post.images] : ['']
    });
    setShowEditModal(true);
  };

  const updatePost = async () => {
    if (!editingPost || !editPost.title.trim() || !editPost.body.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setEditing(true);
      console.log('🔥 Updating post...', editingPost.id);
      
      const postData = {
        title: editPost.title.trim(),
        body: editPost.body.trim(),
        postType: editPost.postType,
        updatedAt: serverTimestamp(),
        images: editPost.images.filter(img => img.trim() !== '') // Filter out empty URLs
      };

      await updateDoc(doc(db, 'posts', editingPost.id), postData);
      
      // Close modal and reset
      setShowEditModal(false);
      setEditingPost(null);
      setEditPost({ title: '', body: '', postType: 'post', images: [''] });
      
      // Refresh posts
      await fetchPosts();
      
      console.log('✅ Post updated successfully!');
    } catch (error) {
      console.error('❌ Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setEditing(false);
    }
  };

  const canEditPost = (post: Post) => {
    // For debugging - log the comparison
    console.log('🔍 Checking edit permission:', {
      postId: post.id,
      postOwnerUid: post.ownerUid,
      currentAdminUid: currentAdminUid,
      canEdit: post.ownerUid === currentAdminUid
    });
    
    // Allow editing if the post belongs to current admin, or if post doesn't have ownerUid (legacy posts)
    return post.ownerUid === currentAdminUid || !post.ownerUid;
  };

  const fetchCommentCount = async (postId: string): Promise<number> => {
    try {
      const commentsQuery = collection(db, 'posts', postId, 'comments');
      const querySnapshot = await getDocs(commentsQuery);
      return querySnapshot.size;
    } catch (error) {
      console.error('❌ Error fetching comment count for post:', postId, error);
      return 0;
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
      
      // If we're filtering by type, we can't also order by a different field without a composite index
      // So we'll fetch all posts and sort client-side when filtering
      if (typeFilter === 'all') {
        // Only add ordering when not filtering by type
        if (sortBy === 'date') {
          queryConstraints.push(orderBy('createdAt', 'desc'));
        } else {
          queryConstraints.push(orderBy('likes', 'desc'));
        }
      }
      
      const finalQuery = queryConstraints.length > 0 
        ? query(baseQuery, ...queryConstraints)
        : baseQuery;

      console.log('🔥 About to execute query...');
      const querySnapshot = await getDocs(finalQuery);
      console.log('🔥 Query executed! Document count:', querySnapshot.size);
      
      let postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Document:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as Post[];

      // Apply client-side filtering and sorting when needed
      if (typeFilter !== 'all') {
        postsData = postsData.filter(post => post.postType === typeFilter);
      }
      
      // Apply client-side sorting when we couldn't do it in the query
      if (typeFilter !== 'all' || queryConstraints.length === 0) {
        if (sortBy === 'date') {
          postsData.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime(); // Descending order
          });
        } else {
          postsData.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // Descending order
        }
      }

      // Fetch comment counts for all posts
      console.log('🔥 Fetching comment counts...');
      const postsWithCommentCounts = await Promise.all(
        postsData.map(async (post) => {
          const commentsCount = await fetchCommentCount(post.id);
          return {
            ...post,
            commentsCount
          };
        })
      );

      console.log('🔥 Final posts array:', postsWithCommentCounts);
      setPosts(postsWithCommentCounts);
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

  const getPostTypeColor = (postType: string) => {
    return postType === 'report' ? 'bg-red-100 text-[var(--report-red)]' : 'bg-purple-100 text-[var(--primary)]';
  };

  const nextImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const ImageSlider = ({ images, postId }: { images: string[], postId: string }) => {
    if (!images || images.length === 0) return null;
    
    const currentIndex = currentImageIndex[postId] || 0;
    
    return (
      <div className="relative mb-4">
        <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={images[currentIndex]} 
            alt={`Post image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png'; // Fallback image
            }}
          />
          
          {images.length > 1 && (
            <>
              {/* Previous button */}
              <button
                onClick={() => prevImage(postId, images.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Next button */}
              <button
                onClick={() => nextImage(postId, images.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(prev => ({ ...prev, [postId]: index }))}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const addImageField = () => {
    setNewPost(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  // Edit modal image functions
  const addEditImageField = () => {
    setEditPost(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeEditImageField = (index: number) => {
    setEditPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateEditImageField = (index: number, value: string) => {
    setEditPost(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const likePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newLikes = (post.likes || 0) + 1;

      // Optimistic update - update UI immediately
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: newLikes }
            : p
        )
      );

      // Update in Firestore
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: newLikes
      });
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  const likeComment = async (postId: string, commentId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      const comment = post?.comments?.find(c => c.id === commentId);
      if (!comment) return;

      const newLikes = (comment.likes || 0) + 1;

      // Optimistic update - update UI immediately
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                comments: p.comments?.map(c => 
                  c.id === commentId 
                    ? { ...c, likes: newLikes }
                    : c
                ) || []
              }
            : p
        )
      );

      // Update in Firestore
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: newLikes
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update on error by refreshing comments
      await fetchComments(postId);
    }
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
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
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
          <p>Sample post: {posts[0]?.title || 'No title'} (Type: {posts[0]?.postType || 'Unknown'})</p>
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
                {posts.filter(p => p.postType === 'post').length}
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
                {posts.filter(p => p.postType === 'report').length}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search posts, users, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'post' | 'report')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
              >
                <option value="all">All Types</option>
                <option value="post">Public Posts</option>
                <option value="report">Anonymous Reports</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'likes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
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
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {post.postType === 'report' 
                          ? 'AN' 
                          : (post.owner || 'AN').substring(0, 2).toUpperCase()
                        }
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-[var(--primary)] cursor-pointer">
                            {post.title}
                          </h3>
                        </div>

                        {/* Tags and Type */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType || 'post')}`}>
                            {(post.postType === 'report' ? 'REPORT' : 'POST')}
                          </span>
                        </div>

                        {/* Images */}
                        <ImageSlider images={post.images || []} postId={post.id} />

                        {/* Content Preview */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {(post.body || '').replace(/<[^>]*>/g, '')} {/* Strip HTML tags for preview */}
                        </p>

                        {/* Author and Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {post.postType !== 'report' && (
                            <span>By <strong>{post.owner || 'Anonymous'}</strong></span>
                          )}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              likePost(post.id);
                            }}
                            className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes || 0} likes</span>
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentsCount || 0} comments</span>
                          </button>
                          <span>Posted {formatTimeAgo(post.createdAt || null)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {canEditPost(post) && (
                          <button 
                            onClick={() => openEditModal(post)}
                            className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Edit post"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => console.log('View post:', post.id)}
                          className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
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
                              <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
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
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm text-gray-800 placeholder:text-gray-500"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addComment(post.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => addComment(post.id)}
                                  disabled={!commentText[post.id]?.trim()}
                                  className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
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
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        likeComment(post.id, comment.id);
                                      }}
                                      className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                                    >
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

      {/* Create Post Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type
                  </label>
                  <select
                    value={newPost.postType}
                    onChange={(e) => setNewPost({ ...newPost, postType: e.target.value as 'post' | 'report' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                  >
                    <option value="post">Public Post</option>
                    <option value="report">Anonymous Report</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newPost.body}
                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    placeholder="Write your post content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Image URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs (optional)
                  </label>
                  <div className="space-y-2">
                    {newPost.images.map((imageUrl, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                        />
                        {newPost.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {newPost.images.length < 5 && (
                      <button
                        type="button"
                        onClick={addImageField}
                        className="text-sm text-[var(--primary)] hover:text-[var(--text2)] transition-colors"
                      >
                        + Add another image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={creating || !newPost.title.trim() || !newPost.body.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type
                  </label>
                  <select
                    value={editPost.postType}
                    onChange={(e) => setEditPost({ ...editPost, postType: e.target.value as 'post' | 'report' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                  >
                    <option value="post">Public Post</option>
                    <option value="report">Anonymous Report</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editPost.title}
                    onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editPost.body}
                    onChange={(e) => setEditPost({ ...editPost, body: e.target.value })}
                    placeholder="Write your post content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Image URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs (optional)
                  </label>
                  <div className="space-y-2">
                    {editPost.images.map((imageUrl, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => updateEditImageField(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                        />
                        {editPost.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditImageField(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {editPost.images.length < 5 && (
                      <button
                        type="button"
                        onClick={addEditImageField}
                        className="text-sm text-[var(--primary)] hover:text-[var(--text2)] transition-colors"
                      >
                        + Add another image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePost}
                  disabled={editing || !editPost.title.trim() || !editPost.body.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editing ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
