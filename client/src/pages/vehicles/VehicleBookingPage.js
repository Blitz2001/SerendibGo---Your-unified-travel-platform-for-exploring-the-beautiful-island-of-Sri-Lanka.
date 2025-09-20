import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import vehicleService from '../../services/vehicleService';
import vehicleBookingService from '../../services/vehicleBookingService';
import { useAuth } from '../../contexts/AuthContext';

const VehicleBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'credit_card'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicleById(id);
        
        if (response.success) {
          setVehicle(response.vehicle);
          // Pre-fill dates if they were passed from the previous page
          if (location.state?.checkIn) {
            setBookingData(prev => ({ ...prev, checkIn: location.state.checkIn }));
          }
          if (location.state?.checkOut) {
            setBookingData(prev => ({ ...prev, checkOut: location.state.checkOut }));
          }
        } else {
          setError(response.message || 'Failed to load vehicle details');
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    if (!vehicle || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return days * (vehicle.pricing?.daily || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to book a vehicle');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const now = new Date();

    if (checkIn <= now) {
      toast.error('Check-in date must be in the future');
      return;
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);

    try {
      // Create the actual vehicle booking
      const bookingResponse = await vehicleBookingService.createVehicleBooking({
        vehicleId: id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod
      });

      if (bookingResponse.success) {
        toast.success('Vehicle booking created successfully!');
        navigate('/bookings');
      } else {
        toast.error(bookingResponse.message || 'Failed to create vehicle booking');
      }
    } catch (err) {
      console.error('Error booking vehicle:', err);
      toast.error('Failed to book vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price, currency = 'LKR') => {
    if (!price) return `${currency} 0`;
    return `${currency} ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The vehicle you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/vehicles')} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const days = totalPrice > 0 ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/vehicles/${id}`)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicle Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book This Vehicle</h1>
          <p className="text-gray-600 mt-2">Complete your vehicle rental booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {vehicle.images && vehicle.images[0] && (
                <img
                  src={vehicle.images[0].url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="text-gray-600 mb-4">
                  <p className="mb-1">{vehicle.year} • {vehicle.capacity} passengers</p>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {vehicle.location?.city || 'Location not specified'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}
                    </span>
                  </div>
                  {vehicle.pricing?.weekly && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly</span>
                      <span className="font-semibold">{formatPrice(vehicle.pricing.weekly, vehicle.pricing.currency)}</span>
                    </div>
                  )}
                  {vehicle.pricing?.monthly && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly</span>
                      <span className="font-semibold">{formatPrice(vehicle.pricing.monthly, vehicle.pricing.currency)}</span>
                    </div>
                  )}
                </div>

                {vehicle.insurance?.hasInsurance && (
                  <div className="mt-4 flex items-center text-green-600 text-sm">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Fully Insured</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={bookingData.checkIn}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={bookingData.checkOut}
                      onChange={handleInputChange}
                      min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Passengers
                  </label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(vehicle.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'passenger' : 'passengers'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special requests or requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
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

                {/* Price Summary */}
                {totalPrice > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Daily Rate</span>
                        <span>{formatPrice(vehicle.pricing?.daily, vehicle.pricing?.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>{days} day{days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-blue-600">{formatPrice(totalPrice, vehicle.pricing?.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !bookingData.checkIn || !bookingData.checkOut}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    submitting || !bookingData.checkIn || !bookingData.checkOut
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Book Now'}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-600">
                    Please <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: location } })}
                      className="text-blue-600 hover:underline"
                    >
                      log in
                    </button> to make a booking
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleBookingPage;
