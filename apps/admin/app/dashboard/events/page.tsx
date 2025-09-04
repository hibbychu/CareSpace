'use client';

import { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Search } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: 'workshop' | 'seminar' | 'consultation' | 'support_group' | 'other';
  createdAt: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Mental Health Awareness Workshop',
    description: 'A comprehensive workshop on recognizing and managing mental health issues in the workplace.',
    date: '2025-09-15',
    time: '14:00',
    location: 'Community Center A',
    capacity: 50,
    registered: 32,
    status: 'upcoming',
    category: 'workshop',
    createdAt: '2025-09-01'
  },
  {
    id: '2',
    title: 'Healthcare Technology Seminar',
    description: 'Latest trends and innovations in healthcare technology and digital health solutions.',
    date: '2025-09-20',
    time: '10:00',
    location: 'Online',
    capacity: 100,
    registered: 78,
    status: 'upcoming',
    category: 'seminar',
    createdAt: '2025-08-28'
  },
  {
    id: '3',
    title: 'Support Group Meeting',
    description: 'Weekly support group for individuals dealing with chronic health conditions.',
    date: '2025-09-10',
    time: '18:00',
    location: 'Room B-204',
    capacity: 20,
    registered: 15,
    status: 'completed',
    category: 'support_group',
    createdAt: '2025-08-25'
  }
];

export default function EventsPage() {
  const [events] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'seminar': return 'bg-indigo-100 text-indigo-800';
      case 'consultation': return 'bg-teal-100 text-teal-800';
      case 'support_group': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="mt-2 text-gray-600">Create and manage healthcare events, workshops, and seminars</p>
          </div>
          <button
            onClick={() => console.log('Create event modal')}
            className="inline-flex items-center px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
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
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="consultation">Consultation</option>
                <option value="support_group">Support Group</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => console.log('Edit event', event.id)}
                    className="p-2 text-gray-500 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  {event.registered}/{event.capacity} registered
                </div>
              </div>

              {/* Registration Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-[#7C4DFF] h-2 rounded-full transition-all"
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                ></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium">
                  View Details
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-all duration-200 text-sm font-medium">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => console.log('Create first event modal')}
            className="inline-flex items-center px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create First Event
          </button>
        </div>
      )}
    </div>
  );
}
