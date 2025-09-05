'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Eye, Pin, Lock, Unlock, MoreVertical, Search, AlertTriangle } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'user' | 'moderator' | 'admin';
  };
  category: 'general' | 'mental_health' | 'nutrition' | 'fitness' | 'support' | 'announcements';
  status: 'active' | 'locked' | 'archived' | 'flagged';
  isPinned: boolean;
  replies: number;
  views: number;
  lastActivity: string;
  createdAt: string;
  tags: string[];
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Welcome to CareSpace Community Forum!',
    content: 'Welcome everyone to our new community forum. This is a safe space to share experiences, ask questions, and support each other on our health journeys.',
    author: {
      id: 'admin1',
      name: 'Dr. Sarah Chen',
      role: 'admin'
    },
    category: 'announcements',
    status: 'active',
    isPinned: true,
    replies: 24,
    views: 342,
    lastActivity: '2025-09-03T14:30:00Z',
    createdAt: '2025-09-01T09:00:00Z',
    tags: ['welcome', 'community', 'guidelines']
  },
  {
    id: '2',
    title: 'Tips for Managing Anxiety During Work Hours',
    content: 'I\'ve been struggling with anxiety at work lately. Does anyone have practical tips for managing it during busy periods?',
    author: {
      id: 'user1',
      name: 'Alex Martinez',
      role: 'user'
    },
    category: 'mental_health',
    status: 'active',
    isPinned: false,
    replies: 18,
    views: 156,
    lastActivity: '2025-09-03T16:45:00Z',
    createdAt: '2025-09-02T11:20:00Z',
    tags: ['anxiety', 'workplace', 'coping-strategies']
  },
  {
    id: '3',
    title: 'Healthy Meal Prep Ideas for Busy Professionals',
    content: 'Looking for quick and nutritious meal prep ideas that can be prepared on weekends for the entire week.',
    author: {
      id: 'user2',
      name: 'Jamie Thompson',
      role: 'user'
    },
    category: 'nutrition',
    status: 'active',
    isPinned: false,
    replies: 31,
    views: 289,
    lastActivity: '2025-09-03T13:22:00Z',
    createdAt: '2025-09-01T15:45:00Z',
    tags: ['meal-prep', 'nutrition', 'busy-lifestyle']
  },
  {
    id: '4',
    title: 'Inappropriate Content - Please Review',
    content: 'This post contains content that violates community guidelines and needs moderator attention.',
    author: {
      id: 'user3',
      name: 'Anonymous User',
      role: 'user'
    },
    category: 'general',
    status: 'flagged',
    isPinned: false,
    replies: 3,
    views: 45,
    lastActivity: '2025-09-03T10:15:00Z',
    createdAt: '2025-09-03T08:30:00Z',
    tags: ['flagged']
  }
];

export default function ForumsPage() {
  const [posts] = useState<ForumPost[]>(mockPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort posts - pinned first, then by last activity
  const sortedPosts = filteredPosts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcements': return 'bg-blue-100 text-blue-800';
      case 'mental_health': return 'bg-purple-100 text-purple-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'fitness': return 'bg-orange-100 text-orange-800';
      case 'support': return 'bg-pink-100 text-pink-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'locked': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
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
                  placeholder="Search posts, authors, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="announcements">Announcements</option>
                <option value="mental_health">Mental Health</option>
                <option value="nutrition">Nutrition</option>
                <option value="fitness">Fitness</option>
                <option value="support">Support</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="locked">Locked</option>
                <option value="archived">Archived</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {sortedPosts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#7C4DFF] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Pins */}
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <Pin className="h-4 w-4 text-[#7C4DFF]" />
                        )}
                        {post.status === 'locked' && (
                          <Lock className="h-4 w-4 text-yellow-600" />
                        )}
                        {post.status === 'flagged' && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#7C4DFF] cursor-pointer">
                          {post.title}
                        </h3>
                      </div>

                      {/* Tags and Category */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {post.category.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                          {post.author.role}
                        </span>
                        {post.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Author and Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>by <strong>{post.author.name}</strong></span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views} views</span>
                        </div>
                        <span>Last activity {formatTimeAgo(post.lastActivity)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 transform hover:scale-110">
                        {post.status === 'locked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                      <button className="p-2 text-gray-500 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110">
                        <Pin className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => console.log('Create first post modal')}
              className="inline-flex items-center px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
