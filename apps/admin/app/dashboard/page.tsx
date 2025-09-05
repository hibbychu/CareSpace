'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Calendar, 
  MessageSquare, 
  Users,
  ThumbsUp
} from 'lucide-react';

interface Post {
  id: string;
  title?: string;
  body?: string;
  type?: 'public' | 'anonymous';
  owner?: string;
  likes?: number;
  createdAt?: Timestamp | Date;
}

interface Event {
  id: string;
  eventName?: string;
  dateTime?: Timestamp | Date;
  createdAt?: Timestamp | Date;
}

interface User {
  id: string;
  displayName?: string;
  createdAt?: Timestamp | Date;
  role?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalPosts: number;
  publicPosts: number;
  anonymousReports: number;
  totalLikes: number;
  totalComments: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'event' | 'user';
  message: string;
  timestamp: Date;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalPosts: 0,
    publicPosts: 0,
    anonymousReports: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔥 Fetching dashboard stats...');

      // Fetch Users Stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      // Fetch Events Stats
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        if (!event.dateTime) return false;
        let eventDate: Date;
        if (event.dateTime instanceof Date) {
          eventDate = event.dateTime;
        } else if ((event.dateTime as Timestamp).toDate) {
          eventDate = (event.dateTime as Timestamp).toDate();
        } else {
          return false;
        }
        return eventDate > now;
      }).length;

      // Fetch Posts Stats
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      const publicPosts = posts.filter(post => post.type === 'public').length;
      const anonymousReports = posts.filter(post => post.type === 'anonymous').length;
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);

      // Count total comments across all posts
      let totalComments = 0;
      for (const post of posts) {
        const commentsSnapshot = await getDocs(collection(db, 'posts', post.id, 'comments'));
        totalComments += commentsSnapshot.size;
      }

      // Get real user count from Firebase
      const totalUsers = usersSnapshot.size;

      setStats({
        totalUsers,
        totalEvents: eventsSnapshot.size,
        upcomingEvents,
        totalPosts: postsSnapshot.size,
        publicPosts,
        anonymousReports,
        totalLikes,
        totalComments
      });

      // Generate recent activity from recent posts and events
      const recentActivities: RecentActivity[] = [];
      
      // Recent posts
      const recentPosts = posts
        .filter(post => post.createdAt)
        .sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as Timestamp).toDate();
          const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as Timestamp).toDate();
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 3);

      recentPosts.forEach(post => {
        if (post.createdAt) {
          const timestamp = post.createdAt instanceof Date ? post.createdAt : (post.createdAt as Timestamp).toDate();
          recentActivities.push({
            id: post.id,
            type: 'post',
            message: `New ${post.type} post: "${post.title || 'Untitled'}"`,
            timestamp,
            color: post.type === 'anonymous' ? 'yellow' : 'blue'
          });
        }
      });

      // Recent events
      const recentEvents = events
        .filter(event => event.createdAt)
        .sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as Timestamp).toDate();
          const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as Timestamp).toDate();
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 2);

      recentEvents.forEach(event => {
        if (event.createdAt) {
          const timestamp = event.createdAt instanceof Date ? event.createdAt : (event.createdAt as Timestamp).toDate();
          recentActivities.push({
            id: Math.random().toString(),
            type: 'event',
            message: `Event created: "${event.eventName || 'Untitled Event'}"`,
            timestamp,
            color: 'green'
          });
        }
      });

      // Recent users
      const recentUsers = users
        .filter(user => user.createdAt)
        .sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as Timestamp).toDate();
          const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as Timestamp).toDate();
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 2);

      recentUsers.forEach(user => {
        if (user.createdAt) {
          const timestamp = user.createdAt instanceof Date ? user.createdAt : (user.createdAt as Timestamp).toDate();
          recentActivities.push({
            id: Math.random().toString(),
            type: 'user',
            message: `New user joined: "${user.displayName || 'Anonymous User'}"`,
            timestamp,
            color: 'blue'
          });
        }
      });

      // Sort all activities by timestamp
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(recentActivities.slice(0, 5));

      console.log('✅ Dashboard stats fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
        
        {/* Quick Stats Summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Status</h3>
              <p className="text-sm text-gray-600">
                Managing {loading ? '...' : stats.totalUsers} users, {loading ? '...' : stats.totalEvents} events, and {loading ? '...' : stats.totalPosts} forum discussions
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/dashboard/users')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.totalUsers}
              </p>
            </div>
            <Users className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="text-sm text-blue-600 mt-2">→ Manage users</p>
        </div>

        <div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/dashboard/events')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.totalEvents}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {loading ? '...' : stats.upcomingEvents} upcoming
          </p>
        </div>

        <div 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
          onClick={() => router.push('/dashboard/forums')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forum Posts</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.totalPosts}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {loading ? '...' : `${stats.publicPosts} public, ${stats.anonymousReports} reports`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats.totalLikes}
              </p>
            </div>
            <ThumbsUp className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <p className="text-sm text-green-600 mt-2">
            {loading ? '...' : `${stats.totalComments} comments`}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${getColorClasses(activity.color)}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent activity found. Create some posts or events to see activity here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
