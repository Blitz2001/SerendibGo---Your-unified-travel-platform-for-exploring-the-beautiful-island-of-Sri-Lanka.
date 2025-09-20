import React, { useState } from 'react';
import { Star, Send, Image, Smile, Meh, Frown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ booking, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const reviewCategories = [
    { id: 'service', label: 'Service Quality', icon: '😊' },
    { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { id: 'value', label: 'Value for Money', icon: '💰' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'staff', label: 'Staff Friendliness', icon: '👥' },
    { id: 'facilities', label: 'Facilities', icon: '🏗️' }
  ];

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4) return { text: 'Excellent', icon: <Smile className="w-5 h-5 text-green-600" /> };
    if (rating >= 3) return { text: 'Good', icon: <Smile className="w-5 h-5 text-yellow-600" /> };
    if (rating >= 2) return { text: 'Fair', icon: <Meh className="w-5 h-5 text-orange-600" /> };
    return { text: 'Poor', icon: <Frown className="w-5 h-5 text-red-600" /> };
  };

  const validateForm = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return false;
    }
    if (!review.trim()) {
      toast.error('Please write a review');
      return false;
    }
    if (review.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        bookingId: booking.id,
        rating,
        review: review.trim(),
        categories: selectedCategories,
        images: selectedImages,
        createdAt: new Date().toISOString()
      };

      await onSubmit(reviewData);
      toast.success('Review submitted successfully!');
      
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
        <p className="text-gray-600">
          Help other travelers by sharing your experience with {booking.title}
        </p>
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Overall Rating *
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {rating > 0 && (
              <>
                {getRatingLabel(rating).icon}
                <span className="text-lg font-medium text-gray-900">
                  {getRatingLabel(rating).text}
                </span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {rating > 0 ? `You rated this ${rating} out of 5 stars` : 'Click on a star to rate'}
        </p>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What aspects would you like to highlight?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewCategories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedCategories.includes(category.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Write Your Review *
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience, what you liked, what could be improved, and any tips for other travelers..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Minimum 10 characters required
          </p>
          <p className={`text-sm ${
            review.length < 10 ? 'text-red-500' : 'text-green-500'
          }`}>
            {review.length}/500
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Add Photos (Optional)
        </label>
        <div className="space-y-4">
          {/* Upload Button */}
          {selectedImages.length < 5 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB (max 5 images)
                </p>
              </label>
            </div>
          )}

          {/* Preview Images */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Guidelines */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Review Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be honest and specific about your experience</li>
          <li>• Include both positive aspects and areas for improvement</li>
          <li>• Avoid personal attacks or inappropriate language</li>
          <li>• Photos should be relevant and high quality</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || review.trim().length < 10}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
