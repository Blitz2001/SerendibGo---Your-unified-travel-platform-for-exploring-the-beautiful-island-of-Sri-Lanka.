import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Calendar, ToggleRight } from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';

const SetAvailability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({
    isAvailable: true,
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timezone: 'Asia/Colombo',
    breaks: [],
    blockedDates: []
  });

  const [newBreak, setNewBreak] = useState({
    start: '',
    end: '',
    description: ''
  });

  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: ''
  });

  const dayOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const response = await guideService.getMyProfile();
      if (response.success && response.data.availability) {
        setAvailability({
          isAvailable: response.data.availability.isAvailable || true,
          workingHours: response.data.availability.workingHours || { start: '08:00', end: '18:00' },
          workingDays: response.data.availability.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          timezone: response.data.availability.timezone || 'Asia/Colombo',
          breaks: response.data.availability.breaks || [],
          blockedDates: response.data.availability.blockedDates || []
        });
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability settings');
    }
  };

  const handleWorkingDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const addBreak = () => {
    if (newBreak.start && newBreak.end && newBreak.description.trim()) {
      setAvailability(prev => ({
        ...prev,
        breaks: [...prev.breaks, { ...newBreak }]
      }));
      setNewBreak({ start: '', end: '', description: '' });
    }
  };

  const removeBreak = (index) => {
    setAvailability(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }));
  };

  const addBlockedDate = () => {
    if (newBlockedDate.date && newBlockedDate.reason.trim()) {
      setAvailability(prev => ({
        ...prev,
        blockedDates: [...prev.blockedDates, { ...newBlockedDate }]
      }));
      setNewBlockedDate({ date: '', reason: '' });
    }
  };

  const removeBlockedDate = (index) => {
    setAvailability(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await guideService.updateAvailability(availability);
      if (response.success) {
        toast.success('Availability updated successfully!');
        navigate('/guide/dashboard');
      } else {
        toast.error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/guide/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Set Availability</h1>
          <p className="text-gray-600 mt-2">Manage your working schedule and availability</p>
        </div>

        <div className="space-y-8">
          {/* Availability Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ToggleRight className="w-5 h-5 mr-2" />
                Availability Status
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Currently Available</h3>
                  <p className="text-sm text-gray-600">Toggle your availability for new bookings</p>
                </div>
                <button
                  onClick={() => setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    availability.isAvailable ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      availability.isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${availability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {availability.isAvailable ? 'Available for bookings' : 'Not accepting bookings'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Working Hours
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <select
                    value={availability.workingHours.start || '08:00'}
                    onChange={(e) => setAvailability(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <select
                    value={availability.workingHours.end || '18:00'}
                    onChange={(e) => setAvailability(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Working Hours:</strong> {availability.workingHours.start} - {availability.workingHours.end}
                </p>
              </div>
            </div>
          </div>

          {/* Working Days */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Working Days
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dayOptions.map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(availability.workingDays || []).includes(day)}
                      onChange={() => handleWorkingDayToggle(day)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Selected Days:</strong> {(availability.workingDays || []).join(', ') || 'None selected'}
                </p>
              </div>
            </div>
          </div>

          {/* Breaks */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Daily Breaks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(availability.breaks || []).map((breakItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{breakItem.start} - {breakItem.end}</p>
                      <p className="text-sm text-gray-600">{breakItem.description}</p>
                    </div>
                    <button
                      onClick={() => removeBreak(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Break</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <select
                      value={newBreak.start || ''}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <select
                      value={newBreak.end || ''}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={newBreak.description || ''}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Lunch break"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addBreak}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Break
                </button>
              </div>
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Blocked Dates</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(availability.blockedDates || []).map((blockedDate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                    <div>
                      <p className="font-medium text-red-900">{new Date(blockedDate.date).toLocaleDateString()}</p>
                      <p className="text-sm text-red-700">{blockedDate.reason}</p>
                    </div>
                    <button
                      onClick={() => removeBlockedDate(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Block Date</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newBlockedDate.date || ''}
                      onChange={(e) => setNewBlockedDate(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <input
                      type="text"
                      value={newBlockedDate.reason || ''}
                      onChange={(e) => setNewBlockedDate(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g., Personal holiday"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addBlockedDate}
                  className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Block Date
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/guide/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetAvailability;
