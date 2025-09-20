import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import bookingService from '../../services/bookingService';

const BookingForm = ({ hotel, room, onBookingSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: {
      adults: 1,
      children: 0,
      infants: 0
    },
    specialRequests: '',
    paymentMethod: 'credit_card'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount when dates or guests change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && room) {
      const total = bookingService.calculateTotalAmount(
        room.price,
        formData.checkIn,
        formData.checkOut,
        formData.guests
      );
      setTotalAmount(total);
    }
  }, [formData.checkIn, formData.checkOut, formData.guests, room]);

  const checkRoomAvailability = useCallback(async () => {
    try {
      const response = await bookingService.checkAvailability({
        hotelId: hotel._id,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests.adults + formData.guests.children + formData.guests.infants
      });

      if (response.success) {
        setAvailability(response.data);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  }, [formData.checkIn, formData.checkOut, hotel, room, formData.guests]);

  // Check availability when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && hotel && room) {
      checkRoomAvailability();
    }
  }, [formData.checkIn, formData.checkOut, hotel, room, checkRoomAvailability]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError(name);
  };

  const handleGuestChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: newValue
      }
    }));
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (formData.guests.adults < 1) newErrors.adults = 'At least 1 adult is required';

    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const now = new Date();

      if (checkIn <= now) {
        newErrors.checkIn = 'Check-in date must be in the future';
      }

      if (checkOut <= checkIn) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    if (formData.guests.adults + formData.guests.children + formData.guests.infants > room.capacity) {
      newErrors.guests = `Maximum ${room.capacity} guests allowed for this room`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make a booking');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (availability && !availability.isAvailable) {
      toast.error('Room is not available for the selected dates');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        hotelId: hotel._id,
        roomId: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success) {
        toast.success('Booking created successfully!');
        if (onBookingSuccess) {
          onBookingSuccess(response.data.booking);
        }
        // Reset form
        setFormData({
          checkIn: '',
          checkOut: '',
          guests: { adults: 1, children: 0, infants: 0 },
          specialRequests: '',
          paymentMethod: 'credit_card'
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getMinCheckOutDate = () => {
    if (!formData.checkIn) return '';
    const checkIn = new Date(formData.checkIn);
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const getMinCheckInDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!room) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Please select a room to make a booking</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Room</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{room.name}</h4>
          <p className="text-sm text-gray-600 mb-2">
            Capacity: {room.capacity} guests • {room.type} room
          </p>
          <p className="text-lg font-semibold text-blue-600">
            {room.currency} {room.price.toLocaleString()} per night
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              id="checkIn"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleInputChange}
              min={getMinCheckInDate()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.checkIn ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              id="checkOut"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleInputChange}
              min={getMinCheckOutDate()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.checkOut ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="adults" className="block text-xs text-gray-600 mb-1">Adults</label>
              <select
                id="adults"
                value={formData.guests.adults}
                onChange={(e) => handleGuestChange('adults', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="children" className="block text-xs text-gray-600 mb-1">Children</label>
              <select
                id="children"
                value={formData.guests.children}
                onChange={(e) => handleGuestChange('children', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="infants" className="block text-xs text-gray-600 mb-1">Infants</label>
              <select
                id="infants"
                value={formData.guests.infants}
                onChange={(e) => handleGuestChange('infants', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={3}
            placeholder="Any special requests or requirements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {/* Availability Status */}
        {availability && (
          <div className={`p-3 rounded-md ${
            availability.isAvailable 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              availability.isAvailable ? 'text-green-800' : 'text-red-800'
            }`}>
              {availability.isAvailable 
                ? `✅ Available for ${availability.nights} nights` 
                : '❌ Not available for selected dates'
              }
            </p>
          </div>
        )}

        {/* Total Amount */}
        {totalAmount > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                {room.currency} {totalAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formData.checkIn && formData.checkOut && (
                `${availability?.nights || 0} nights × ${room.currency} ${room.price.toLocaleString()}`
              )}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !availability?.isAvailable}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            loading || !availability?.isAvailable
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Creating Booking...' : 'Book Now'}
        </button>

        {!isAuthenticated && (
          <p className="text-sm text-gray-600 text-center">
            Please <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline"
            >
              log in
            </button> to make a booking
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
