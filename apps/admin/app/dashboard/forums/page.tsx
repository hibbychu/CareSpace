'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, MessageSquare, Search, AlertTriangle, Trash2, ThumbsUp, MessageCircle, Send, Edit, ChevronLeft, ChevronRight, Bold, Underline } from 'lucide-react';

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
  // Add CSS for contentEditable placeholders and rich text formatting
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [contenteditable]:empty:before {
        content: attr(data-placeholder);
        color: #9CA3AF;
        pointer-events: none;
        font-style: italic;
      }
      [contenteditable]:focus:before {
        content: '';
      }
      .rich-text-editor {
        min-height: 120px;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #D1D5DB;
        border-radius: 0.5rem;
        padding: 12px;
        background: white;
        line-height: 1.5;
        color: #1F2937;
      }
      .rich-text-editor:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
      }
      .rich-text-editor b, .rich-text-editor strong {
        font-weight: bold;
        color: #1F2937;
      }
      .rich-text-editor u {
        text-decoration: underline;
        color: #1F2937;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // View Post Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  // Current admin UID (in a real app, this would come from auth)
  const currentAdminUid = 'admin-uid';

  // Helper function to insert HTML tags in contentEditable div (WYSIWYG style)
  const insertHtmlTagRichText = (contentEditableId: string, tag: string) => {
    const contentEditable = document.getElementById(contentEditableId) as HTMLDivElement;
    if (!contentEditable) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      // Create the HTML element
      const element = document.createElement(tag);
      element.textContent = selectedText;
      
      // Replace the selection with our formatted element
      range.deleteContents();
      range.insertNode(element);
      
      // Clear selection and set cursor after the inserted element
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(element);
      newRange.setEndAfter(element);
      selection.addRange(newRange);
    } else {
      // If no text is selected, just place cursor and add the tag for future typing
      const element = document.createElement(tag);
      element.textContent = '\u00A0'; // Non-breaking space to make the element visible
      range.insertNode(element);
      
      // Place cursor inside the new element
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(element, 0);
      newRange.setEnd(element, 1);
      selection.addRange(newRange);
    }
    
    // Update the state with the new HTML content
    const setValue = contentEditableId === 'create-content' 
      ? (value: string) => setNewPost(prev => ({ ...prev, body: value }))
      : (value: string) => setEditPost(prev => ({ ...prev, body: value }));
    
    setValue(contentEditable.innerHTML);
  };

  // Helper function to handle content changes in rich text editor (WYSIWYG)
  const handleRichTextChange = (contentEditableId: string, setValue: (value: string) => void) => {
    const contentEditable = document.getElementById(contentEditableId) as HTMLDivElement;
    if (contentEditable) {
      // Always save the HTML content to maintain formatting
      setValue(contentEditable.innerHTML);
    }
  };

  // Sync contentEditable content with state (WYSIWYG)
  useEffect(() => {
    const createContentDiv = document.getElementById('create-content') as HTMLDivElement;
    if (createContentDiv && showCreateModal) {
      if (newPost.body !== createContentDiv.innerHTML) {
        createContentDiv.innerHTML = newPost.body;
      }
    }
  }, [newPost.body, showCreateModal]);

  useEffect(() => {
    const editContentDiv = document.getElementById('edit-content') as HTMLDivElement;
    if (editContentDiv && showEditModal) {
      if (editPost.body !== editContentDiv.innerHTML) {
        editContentDiv.innerHTML = editPost.body;
      }
    }
  }, [editPost.body, showEditModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showEditModal) setShowEditModal(false);
        if (showViewModal) setShowViewModal(false);
      }
    };

    if (showCreateModal || showEditModal || showViewModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showEditModal, showViewModal]);

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

  // Preload comments for the first few posts
  const preloadComments = async (posts: Post[]) => {
    const firstFewPosts = posts.slice(0, 3); // Preload comments for first 3 posts
    
    const commentPromises = firstFewPosts.map(async (post) => {
      try {
        const commentsQuery = query(
          collection(db, 'posts', post.id, 'comments'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(commentsQuery);
        const comments: Comment[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Comment));

        return { postId: post.id, comments };
      } catch (error) {
        console.error('❌ Error preloading comments for post:', post.id, error);
        return { postId: post.id, comments: [] };
      }
    });

    const commentResults = await Promise.all(commentPromises);
    
    // Update posts with preloaded comments
    setPosts(prevPosts => 
      prevPosts.map(post => {
        const result = commentResults.find(r => r.postId === post.id);
        return result ? { ...post, comments: result.comments } : post;
      })
    );
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
      
      // Preload comments for the first few posts to improve UX
      await preloadComments(postsWithCommentCounts);
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

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (post.body || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (post.owner || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [posts, searchTerm]);

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
    // Filter out empty strings and check if we have valid images
    const validImages = images?.filter(img => img && img.trim() !== '') || [];
    if (validImages.length === 0) return null;
    
    const currentIndex = currentImageIndex[postId] || 0;
    const safeIndex = currentIndex < validImages.length ? currentIndex : 0;
    
    return (
      <div className="relative mb-4">
        <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={validImages[safeIndex]} 
            alt={`Post image ${safeIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-sm">Image failed to load</span></div>';
            }}
          />
          
          {validImages.length > 1 && (
            <>
              {/* Previous button */}
              <button
                onClick={() => prevImage(postId, validImages.length)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Next button */}
              <button
                onClick={() => nextImage(postId, validImages.length)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(prev => ({ ...prev, [postId]: index }))}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === safeIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {safeIndex + 1} / {validImages.length}
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

  const openViewModal = async (post: Post) => {
    setViewingPost(post);
    setShowViewModal(true);
    // Only load comments if they haven't been loaded yet
    if (!post.comments || post.comments.length === 0) {
      await fetchComments(post.id);
    } else {
      // Update the viewing post with the latest comment data
      const updatedPost = posts.find(p => p.id === post.id);
      if (updatedPost && updatedPost.comments) {
        setViewingPost(updatedPost);
      }
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
              <div 
                key={post.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openViewModal(post)}
              >
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
                        <div 
                          className="text-gray-600 text-sm mb-3 line-clamp-3 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-medium [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-2 [&>li]:mb-1 [&>blockquote]:border-l-2 [&>blockquote]:border-gray-300 [&>blockquote]:pl-2 [&>blockquote]:italic [&>blockquote]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>a]:text-blue-600 [&>a]:underline [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded [&>code]:text-xs"
                          dangerouslySetInnerHTML={{ __html: post.body || '' }}
                        />

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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComments(post.id);
                            }}
                            className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentsCount || 0} comments</span>
                            {post.comments && post.comments.length > 0 && (
                              <span className="text-xs text-green-600">●</span>
                            )}
                          </button>
                          <span>Posted {formatTimeAgo(post.createdAt || null)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {canEditPost(post) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(post);
                            }}
                            className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Edit post"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
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
                  
                  {/* HTML Formatting Toolbar */}
                  <div className="flex gap-2 mb-2 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
                    <button
                      type="button"
                      onClick={() => insertHtmlTagRichText('create-content', 'b')}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-black"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4 text-black" />
                      <span className="text-black">Bold</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTagRichText('create-content', 'u')}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-black"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4 text-black" />
                      <span className="text-black">Underline</span>
                    </button>
                  </div>
                  
                  <div
                    id="create-content"
                    contentEditable
                    onInput={() => handleRichTextChange('create-content', (value: string) => setNewPost({ ...newPost, body: value }))}
                    onBlur={() => handleRichTextChange('create-content', (value: string) => setNewPost({ ...newPost, body: value }))}
                    className="rich-text-editor border-t-0 rounded-t-none"
                    data-placeholder="Write your post content... (Use the buttons above for formatting)"
                    suppressContentEditableWarning={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the buttons above for formatting. Text will appear with real formatting (bold, underline) as you type - no HTML tags!
                  </p>
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
                  
                  {/* HTML Formatting Toolbar */}
                  <div className="flex gap-2 mb-2 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
                    <button
                      type="button"
                      onClick={() => insertHtmlTagRichText('edit-content', 'b')}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-black"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4 text-black" />
                      <span className="text-black">Bold</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlTagRichText('edit-content', 'u')}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-black"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4 text-black" />
                      <span className="text-black">Underline</span>
                    </button>
                  </div>
                  
                  <div
                    id="edit-content"
                    contentEditable
                    onInput={() => handleRichTextChange('edit-content', (value: string) => setEditPost({ ...editPost, body: value }))}
                    onBlur={() => handleRichTextChange('edit-content', (value: string) => setEditPost({ ...editPost, body: value }))}
                    className="rich-text-editor border-t-0 rounded-t-none"
                    data-placeholder="Write your post content... (Use the buttons above for formatting)"
                    suppressContentEditableWarning={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the buttons above for formatting. Text will appear with real formatting (bold, underline) as you type - no HTML tags!
                  </p>
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

      {/* View Post Modal */}
      {showViewModal && viewingPost && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex">
              {/* Left side - Post content */}
              <div className="flex-1 p-6 border-r border-gray-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {viewingPost.postType === 'report' 
                        ? 'AN' 
                        : (viewingPost.owner || 'AN').substring(0, 2).toUpperCase()
                      }
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {viewingPost.postType !== 'report' ? viewingPost.owner || 'Anonymous' : 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-500">{formatTimeAgo(viewingPost.createdAt || null)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(viewingPost.postType || 'post')}`}>
                    {(viewingPost.postType === 'report' ? 'REPORT' : 'POST')}
                  </span>
                </div>

                {/* Post Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{viewingPost.title}</h1>

                {/* Post Images */}
                <ImageSlider images={viewingPost.images || []} postId={viewingPost.id} />

                {/* Post Content */}
                <div 
                  className="text-gray-700 leading-relaxed mb-6 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-3 [&>strong]:font-semibold [&>em]:italic [&>a]:text-blue-600 [&>a]:underline [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:rounded"
                  dangerouslySetInnerHTML={{ __html: viewingPost.body || '' }}
                />

                {/* Post Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      likePost(viewingPost.id);
                    }}
                    className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{viewingPost.likes || 0} likes</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>{viewingPost.commentsCount || 0} comments</span>
                  </div>
                </div>
              </div>

              {/* Right side - Comments */}
              <div className="w-96 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                
                {/* Add Comment Form */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">AD</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText[viewingPost.id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [viewingPost.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm text-gray-800 placeholder:text-gray-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addComment(viewingPost.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => addComment(viewingPost.id)}
                          disabled={!commentText[viewingPost.id]?.trim()}
                          className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loadingComments[viewingPost.id] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                    </div>
                  ) : viewingPost.comments && viewingPost.comments.length > 0 ? (
                    viewingPost.comments.map((comment) => (
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
                              onClick={() => deleteComment(viewingPost.id, comment.id)}
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
                                likeComment(viewingPost.id, comment.id);
                              }}
                              className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{comment.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
