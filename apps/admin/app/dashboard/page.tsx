import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Users
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#7C4DFF]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <Users className="h-8 w-8 text-[#7C4DFF]" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#7C4DFF]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-3xl font-bold text-gray-900">23</p>
            </div>
            <Calendar className="h-8 w-8 text-[#7C4DFF]" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#7C4DFF]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forum Posts</p>
              <p className="text-3xl font-bold text-gray-900">456</p>
            </div>
            <MessageSquare className="h-8 w-8 text-[#7C4DFF]" />
          </div>
          <p className="text-sm text-blue-600 mt-2">→ 2% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#7C4DFF]/30 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-3xl font-bold text-gray-900">78%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-[#7C4DFF]" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 5% from last month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New user registered: Sarah Johnson</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Event &quot;Mental Health Workshop&quot; was published</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Forum post flagged for review</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
