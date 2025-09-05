import { Settings, Database, Shield, Bell, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Configure your CareSpace admin dashboard</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 text-[var(--primary)] mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">General</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Basic configuration and platform settings
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
            Configure
          </button>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Database</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Database connection and backup settings
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-200">
            Manage
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Authentication and access control settings
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-200">
            Configure
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Email and push notification preferences
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-200">
            Setup
          </button>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Theme, layout, and UI customization
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-200">
            Customize
          </button>
        </div>

        {/* Localization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Localization</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Language and regional settings
          </p>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-200">
            Configure
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-lg font-semibold text-gray-900">v1.0.0-dev</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Environment</p>
              <p className="text-lg font-semibold text-gray-900">Development</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
