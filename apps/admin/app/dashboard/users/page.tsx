import { Users, UserCheck, UserX, Shield } from 'lucide-react';

export default function UsersPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-2 text-gray-600">Manage user accounts and permissions</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <Users className="h-8 w-8 text-[#7C4DFF]" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">1,156</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-3xl font-bold text-gray-900">78</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">↘ 5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-blue-600 mt-2">→ No change</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Users Management</h3>
          <p className="text-gray-600 mb-6">
            User management functionality is coming soon. This will include user profiles, 
            role management, and access control.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
              View User List
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-all duration-200">
              Manage Roles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
