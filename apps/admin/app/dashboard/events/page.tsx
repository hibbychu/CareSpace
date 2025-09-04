'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Search } from 'lucide-react';

interface Event {
  eventID: string;
  eventName: string;
  dateTime: Timestamp | Date | null;
  organiser: string;
  address: string;
  description: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔥 Fetching events from Firestore...');
      
      const q = query(collection(db, "events"), orderBy("dateTime", "asc"));
      const querySnapshot = await getDocs(q);
      console.log('🔥 Query executed! Document count:', querySnapshot.size);
      
      const eventsData: Event[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('🔥 Event document:', doc.id, data);
        return {
          eventID: doc.id,
          eventName: data.eventName || 'Untitled Event',
          dateTime: data.dateTime || null,
          organiser: data.organiser || 'Unknown Organizer',
          address: data.address || 'No address provided',
          description: data.description || 'No description available',
        };
      });

      console.log('🔥 Final events array:', eventsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        setEvents(events.filter(event => event.eventID !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.organiser || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDateTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return 'Date TBD';
    
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if ((timestamp as Timestamp).toDate) {
      date = (timestamp as Timestamp).toDate();
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getEventStatus = (dateTime: Timestamp | Date | null) => {
    if (!dateTime) return 'scheduled';
    
    let date: Date;
    if (dateTime instanceof Date) {
      date = dateTime;
    } else if ((dateTime as Timestamp).toDate) {
      date = (dateTime as Timestamp).toDate();
    } else {
      return 'scheduled';
    }

    const now = new Date();
    if (date > now) return 'upcoming';
    
    // Check if event is within the last 4 hours (assuming event duration)
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    if (date > fourHoursAgo) return 'ongoing';
    
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          🔥 Events fetched: {events.length} | Loading: {loading ? 'Yes' : 'No'}
        </p>
      </div>

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
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C4DFF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.eventID} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.eventName}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEventStatus(event.dateTime))}`}>
                        {getEventStatus(event.dateTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => console.log('Edit event', event.eventID)}
                      className="p-2 text-gray-500 hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.eventID)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
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
                    {formatDateTime(event.dateTime)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {event.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    Organized by {event.organiser}
                  </div>
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
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {events.length === 0 
              ? "No events in the database yet. Create your first event to get started!" 
              : "Try adjusting your search criteria"}
          </p>
          <button
            onClick={() => console.log('Create first event modal')}
            className="inline-flex items-center px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6C3CE7] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create {events.length === 0 ? 'First' : ''} Event
          </button>
        </div>
      )}
    </div>
  );
}
