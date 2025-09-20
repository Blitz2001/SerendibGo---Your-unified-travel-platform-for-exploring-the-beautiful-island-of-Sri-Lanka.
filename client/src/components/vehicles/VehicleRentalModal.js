import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/exportUtils';
import vehicleRentalService from '../../services/vehicleRentalService';

const VehicleRentalModal = ({ isOpen, onClose, vehicle, onConfirmRental }) => {
  const [rentalData, setRentalData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    rentalType: 'daily',
    duration: 1,
    pickupLocation: '',
    dropoffLocation: '',
    driverRequired: false,
    insurance: false,
    specialRequests: '',
    paymentMethod: 'credit_card'
  });

  const [calculating, setCalculating] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [breakdown, setBreakdown] = useState({});

  useEffect(() => {
    if (isOpen && vehicle) {
      // Reset form when modal opens
      setRentalData({
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        rentalType: 'daily',
        duration: 1,
        pickupLocation: vehicle.location?.address || '',
        dropoffLocation: vehicle.location?.address || '',
        driverRequired: false,
        insurance: false,
        specialRequests: '',
        paymentMethod: 'credit_card'
      });
    }
  }, [isOpen, vehicle]);

  useEffect(() => {
    calculateTotal();
  }, [rentalData, vehicle]);

  const calculateTotal = () => {
    if (!vehicle || !rentalData.startDate || !rentalData.endDate) {
      setTotalCost(0);
      return;
    }

    setCalculating(true);

    try {
      const startDate = new Date(rentalData.startDate);
      const endDate = new Date(rentalData.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      let basePrice = 0;

      switch (rentalData.rentalType) {
        case 'hourly':
          basePrice = vehicle.pricing?.hourly || 0;
          break;
        case 'daily':
          basePrice = vehicle.pricing?.daily || 0;
          break;
        case 'weekly':
          basePrice = vehicle.pricing?.weekly || 0;
          break;
        case 'monthly':
          basePrice = vehicle.pricing?.monthly || 0;
          break;
        default:
          basePrice = vehicle.pricing?.daily || 0;
      }

      const subtotal = basePrice * duration;
      const insuranceCost = rentalData.insurance ? subtotal * 0.1 : 0; // 10% insurance
      const driverCost = rentalData.driverRequired ? 5000 * duration : 0; // Driver fee
      const total = subtotal + insuranceCost + driverCost;

      setBreakdown({
        basePrice,
        duration,
        subtotal,
        insuranceCost,
        driverCost,
        total,
        currency: vehicle.pricing?.currency || 'LKR'
      });

      setTotalCost(total);
    } catch (error) {
      console.error('Error calculating total:', error);
      toast.error('Error calculating rental cost');
    } finally {
      setCalculating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRentalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRentalTypeChange = (type) => {
    setRentalData(prev => ({
      ...prev,
      rentalType: type,
      duration: type === 'hourly' ? 1 : prev.duration
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rentalData.startDate || !rentalData.endDate) {
      toast.error('Please select rental dates');
      return;
    }

    if (new Date(rentalData.endDate) <= new Date(rentalData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (totalCost <= 0) {
      toast.error('Invalid rental cost calculation');
      return;
    }

    try {
      const rentalInfo = {
        vehicleId: vehicle._id,
        rentalType: rentalData.rentalType,
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        startTime: rentalData.startTime,
        endTime: rentalData.endTime,
        duration: rentalData.duration,
        pickupLocation: rentalData.pickupLocation,
        dropoffLocation: rentalData.dropoffLocation,
        driverRequired: rentalData.driverRequired,
        insurance: rentalData.insurance,
        specialRequests: rentalData.specialRequests,
        paymentMethod: rentalData.paymentMethod
      };

      const response = await vehicleRentalService.createRental(rentalInfo);
      
      if (response.success) {
        toast.success('Vehicle rental booking created successfully!');
        onConfirmRental({
          ...response.data,
          vehicleId: vehicle._id,
          vehicle: vehicle
        });
      } else {
        toast.error(response.message || 'Failed to create rental booking');
      }
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error('Failed to create rental booking. Please try again.');
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Rent {vehicle.brand} {vehicle.model}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rental Type Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rental Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { key: 'hourly', label: 'Hourly', icon: '⏰' },
                  { key: 'daily', label: 'Daily', icon: '📅' },
                  { key: 'weekly', label: 'Weekly', icon: '📆' },
                  { key: 'monthly', label: 'Monthly', icon: '🗓️' }
                ].map(type => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => handleRentalTypeChange(type.key)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      rentalData.rentalType === type.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">
                      {vehicle.pricing?.[type.key] ? 
                        formatCurrency(vehicle.pricing[type.key], vehicle.pricing?.currency) : 
                        'N/A'
                      }
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={rentalData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={rentalData.endDate}
                onChange={handleInputChange}
                min={rentalData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Time Selection (for hourly rentals) */}
            {rentalData.rentalType === 'hourly' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={rentalData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={rentalData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration ({rentalData.rentalType === 'hourly' ? 'Hours' : 'Days'})
              </label>
              <input
                type="number"
                name="duration"
                value={rentalData.duration}
                onChange={handleInputChange}
                min="1"
                max={rentalData.rentalType === 'hourly' ? 24 : 365}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={rentalData.pickupLocation}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Dropoff Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dropoff Location
              </label>
              <input
                type="text"
                name="dropoffLocation"
                value={rentalData.dropoffLocation}
                onChange={handleInputChange}
                placeholder="Enter dropoff location (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Options */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="driverRequired"
                    checked={rentalData.driverRequired}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Include Driver (+{formatCurrency(5000, 'LKR')}/day)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="insurance"
                    checked={rentalData.insurance}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Additional Insurance (+10%)</span>
                </label>
              </div>
            </div>

            {/* Special Requests */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                value={rentalData.specialRequests}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requirements or requests..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          {totalCost > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price ({breakdown.duration} {rentalData.rentalType === 'hourly' ? 'hours' : 'days'})</span>
                  <span>{formatCurrency(breakdown.subtotal, breakdown.currency)}</span>
                </div>
                {breakdown.driverCost > 0 && (
                  <div className="flex justify-between">
                    <span>Driver Fee</span>
                    <span>{formatCurrency(breakdown.driverCost, breakdown.currency)}</span>
                  </div>
                )}
                {breakdown.insuranceCost > 0 && (
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>{formatCurrency(breakdown.insuranceCost, breakdown.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(breakdown.total, breakdown.currency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={calculating || totalCost <= 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? 'Calculating...' : `Rent Now - ${formatCurrency(totalCost, breakdown.currency)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRentalModal;
