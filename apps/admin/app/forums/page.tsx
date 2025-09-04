'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, ThumbsUp, Calendar, User, Trash2, Eye } from 'lucide-react';

interface Post {
  id: string;
  userid: string;
  postid: string;
  likes: number;
  'date posted': Timestamp | Date | null;
  title: string;
  body: string;
  'post-type': 'post' | 'report';
}

export default function ForumsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'post' | 'report'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔥 Fetching posts from Firestore...');
      
      const baseQuery = collection(db, 'posts');
      console.log('🔥 Created collection reference');
      
      // Build query with filters and sorting
      const queryConstraints = [];
      
      if (filter !== 'all') {
        queryConstraints.push(where('post-type', '==', filter));
      }
      
      if (sortBy === 'date') {
        queryConstraints.push(orderBy('date posted', 'desc'));
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
  }, [filter, sortBy]);

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

  const formatDate = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return 'Unknown date';
    
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if ((timestamp as Timestamp).toDate) {
      date = (timestamp as Timestamp).toDate();
    } else {
      // Fallback for other timestamp formats
      date = new Date();
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getPostTypeColor = (type: string) => {
    return type === 'report' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forums Management</h1>
          <p className="text-gray-600">Manage community posts and reports</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'post' | 'report')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="post">Posts Only</option>
            <option value="report">Reports Only</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'likes')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="likes">Sort by Likes</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p['post-type'] === 'post').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p['post-type'] === 'report').length}
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

      {/* Posts List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'All Posts' : filter === 'post' ? 'Community Posts' : 'Reports'}
            <span className="ml-2 text-sm text-gray-500">({posts.length} items)</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post['post-type'])}`}>
                        {post['post-type'].toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Post ID: {post.postid}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {post.title}
                    </h4>
                    
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {post.body}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>User: {post.userid}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post['date posted'])}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}