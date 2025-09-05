'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { collection, getDocs, query, orderBy, deleteDoc, doc, Timestamp, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Search } from 'lucide-react';

interface Event {
  eventID: string;
  eventName: string;
  dateTime: Timestamp | Date | null;
  organiser: string;
  address: string;
  description: string;
  imageUrl?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    description: '',
    organiser: '',
    address: '',
    imageUrl: '',
    date: '',
    time: ''
  });

  // Edit Event Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState({
    eventName: '',
    description: '',
    organiser: '',
    address: '',
    imageUrl: '',
    date: '',
    time: ''
  });

  // View Details Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  // Handle ESC key to close modals
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
          imageUrl: data.imageUrl || '',
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

  const createEvent = async () => {
    if (!newEvent.eventName.trim() || !newEvent.description.trim() || !newEvent.organiser.trim() || !newEvent.address.trim() || !newEvent.date || !newEvent.time) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      console.log('🔥 Creating new event...');
      
      // Combine date and time into a proper Timestamp
      const dateTimeString = `${newEvent.date}T${newEvent.time}`;
      const dateTime = new Date(dateTimeString);
      
      const eventData = {
        eventName: newEvent.eventName.trim(),
        description: newEvent.description.trim(),
        organiser: newEvent.organiser.trim(),
        address: newEvent.address.trim(),
        imageUrl: newEvent.imageUrl.trim(),
        dateTime: dateTime,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'events'), eventData);
      
      // Reset form and close modal
      setNewEvent({
        eventName: '',
        description: '',
        organiser: '',
        address: '',
        imageUrl: '',
        date: '',
        time: ''
      });
      setShowCreateModal(false);
      
      // Refresh events
      await fetchEvents();
      
      console.log('✅ Event created successfully!');
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    
    // Convert dateTime to date and time strings for the form
    let dateStr = '';
    let timeStr = '';
    
    if (event.dateTime) {
      let date: Date;
      if (event.dateTime instanceof Date) {
        date = event.dateTime;
      } else if ((event.dateTime as Timestamp).toDate) {
        date = (event.dateTime as Timestamp).toDate();
      } else {
        date = new Date();
      }
      
      dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      timeStr = date.toTimeString().substring(0, 5); // HH:MM
    }
    
    setEditEvent({
      eventName: event.eventName || '',
      description: event.description || '',
      organiser: event.organiser || '',
      address: event.address || '',
      imageUrl: event.imageUrl || '',
      date: dateStr,
      time: timeStr
    });
    
    setShowEditModal(true);
  };

  const updateEvent = async () => {
    if (!editingEvent || !editEvent.eventName.trim() || !editEvent.description.trim() || !editEvent.organiser.trim() || !editEvent.address.trim() || !editEvent.date || !editEvent.time) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setEditing(true);
      console.log('🔥 Updating event...', editingEvent.eventID);
      
      // Combine date and time into a proper Timestamp
      const dateTimeString = `${editEvent.date}T${editEvent.time}`;
      const dateTime = new Date(dateTimeString);
      
      const eventData = {
        eventName: editEvent.eventName.trim(),
        description: editEvent.description.trim(),
        organiser: editEvent.organiser.trim(),
        address: editEvent.address.trim(),
        imageUrl: editEvent.imageUrl.trim(),
        dateTime: dateTime,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'events', editingEvent.eventID), eventData);
      
      // Close modal and reset
      setShowEditModal(false);
      setEditingEvent(null);
      setEditEvent({
        eventName: '',
        description: '',
        organiser: '',
        address: '',
        imageUrl: '',
        date: '',
        time: ''
      });
      
      // Refresh events
      await fetchEvents();
      
      console.log('✅ Event updated successfully!');
    } catch (error) {
      console.error('❌ Error updating event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setEditing(false);
    }
  };

  const openViewModal = (event: Event) => {
    setViewingEvent(event);
    setShowViewModal(true);
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
            <p className="mt-2 text-gray-600">Create and manage events, workshops, and seminars</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div 
              key={event.eventID} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={() => openViewModal(event)}
            >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(event);
                      }}
                      className="p-2 text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.eventID);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Event Image */}
                {event.imageUrl && (
                  <div className="mb-4 relative h-40 rounded-lg overflow-hidden">
                    <Image 
                      src={event.imageUrl} 
                      alt={event.eventName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

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
                  <button 
                    onClick={() => openViewModal(event)}
                    className="flex-1 px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium"
                  >
                    View Details
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
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create {events.length === 0 ? 'First' : ''} Event
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
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
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={newEvent.eventName}
                    onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                    placeholder="Enter event name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Organiser */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organiser
                  </label>
                  <input
                    type="text"
                    value={newEvent.organiser}
                    onChange={(e) => setNewEvent({ ...newEvent, organiser: e.target.value })}
                    placeholder="Who is organizing this event..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newEvent.address}
                    onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                    placeholder="Event location address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={newEvent.imageUrl}
                    onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe the event..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none text-black placeholder:text-gray-500"
                  />
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
                  onClick={createEvent}
                  disabled={creating || !newEvent.eventName.trim() || !newEvent.description.trim() || !newEvent.organiser.trim() || !newEvent.address.trim() || !newEvent.date || !newEvent.time}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Event</h2>
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
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={editEvent.eventName}
                    onChange={(e) => setEditEvent({ ...editEvent, eventName: e.target.value })}
                    placeholder="Enter event name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Organiser */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organiser
                  </label>
                  <input
                    type="text"
                    value={editEvent.organiser}
                    onChange={(e) => setEditEvent({ ...editEvent, organiser: e.target.value })}
                    placeholder="Who is organizing this event..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={editEvent.time}
                      onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editEvent.address}
                    onChange={(e) => setEditEvent({ ...editEvent, address: e.target.value })}
                    placeholder="Event location address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editEvent.imageUrl}
                    onChange={(e) => setEditEvent({ ...editEvent, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black placeholder:text-gray-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    placeholder="Describe the event..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none text-black placeholder:text-gray-500"
                  />
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
                  onClick={updateEvent}
                  disabled={editing || !editEvent.eventName.trim() || !editEvent.description.trim() || !editEvent.organiser.trim() || !editEvent.address.trim() || !editEvent.date || !editEvent.time}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editing ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingEvent && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{viewingEvent.eventName}</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Event Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getEventStatus(viewingEvent.dateTime))}`}>
                  {getEventStatus(viewingEvent.dateTime).toUpperCase()}
                </span>
              </div>

              {/* Event Image */}
              {viewingEvent.imageUrl && (
                <div className="mb-6">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    <Image 
                      src={viewingEvent.imageUrl} 
                      alt={viewingEvent.eventName}
                      fill
                      sizes="(max-width: 768px) 100vw, 80vw"
                      priority
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Date & Time</h3>
                    <p className="text-gray-600">{formatDateTime(viewingEvent.dateTime)}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">{viewingEvent.address}</p>
                  </div>
                </div>

                {/* Organiser */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Organiser</h3>
                    <p className="text-gray-600">{viewingEvent.organiser}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Description</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{viewingEvent.description}</p>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(viewingEvent);
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--text2)] transition-colors"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
