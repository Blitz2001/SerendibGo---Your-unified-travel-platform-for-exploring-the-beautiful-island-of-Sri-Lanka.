import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
  Phone,
  Mail,
  X
} from 'lucide-react';
import guideService from '../../services/guideService';
import messageService from '../../services/messageService';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const GuideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    contactMethod: 'email'
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadGuide = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await guideService.getGuideById(id);
      
      if (response.success) {
        setGuide(response.guide);
      } else {
        setError('Guide not found');
      }
    } catch (err) {
      console.error('Error loading guide:', err);
      setError('Failed to load guide details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  const formatPrice = (price, currency = 'LKR') => {
    return `${currency} ${price?.toLocaleString()}`;
  };

  const getSpecializationColor = (specialization) => {
    const colors = {
      cultural: 'bg-purple-100 text-purple-800',
      historical: 'bg-blue-100 text-blue-800',
      wildlife: 'bg-green-100 text-green-800',
      adventure: 'bg-orange-100 text-orange-800',
      culinary: 'bg-red-100 text-red-800',
      photography: 'bg-pink-100 text-pink-800',
      nature: 'bg-emerald-100 text-emerald-800',
      religious: 'bg-indigo-100 text-indigo-800',
      archaeological: 'bg-yellow-100 text-yellow-800',
      'eco-tourism': 'bg-teal-100 text-teal-800',
      medical: 'bg-cyan-100 text-cyan-800',
      language: 'bg-violet-100 text-violet-800'
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800';
  };

  const getLanguageProficiency = (proficiency) => {
    const levels = {
      basic: 'Basic',
      conversational: 'Conversational',
      fluent: 'Fluent',
      native: 'Native'
    };
    return levels[proficiency] || proficiency;
  };

  const handleSendMessage = () => {
    setShowMessageModal(true);
    // Pre-fill subject with guide's name
    setMessageData(prev => ({
      ...prev,
      subject: `Inquiry about ${guide?.user?.name || 'Guide'} services`
    }));
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    if (!messageData.subject.trim() || !messageData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await messageService.sendMessage({
        guideId: id,
        subject: messageData.subject,
        message: messageData.message,
        contactMethod: messageData.contactMethod
      });

      if (response.success) {
        toast.success('Message sent successfully! The guide will contact you soon.');
        setShowMessageModal(false);
        setMessageData({
          subject: '',
          message: '',
          contactMethod: 'email'
        });
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageInputChange = (e) => {
    const { name, value } = e.target;
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="card" count={3} />
          </div>
          <div>
            <LoadingSkeleton type="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-8">
            <button
              onClick={() => navigate('/guides')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guides
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide Not Found</h2>
            <p className="text-gray-600 mb-6">Failed to load guide details</p>
            <button
              onClick={() => navigate('/guides')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide Not Found</h2>
          <p className="text-gray-600 mb-6">The guide you're looking for doesn't exist</p>
          <button
            onClick={() => navigate('/guides')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/guides')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guides
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Guide Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-6">
              <img
                src={guide.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={guide.user?.name || 'Guide'}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {guide.user?.name || 'Guide'}
                  </h1>
                  {guide.isVerified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Pending Verification
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {guide.location || 'Location not specified'}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {guide.rating?.average || 'No rating'} ({guide.rating?.count || 0} reviews)
                  </div>
                </div>

                {guide.profile?.bio && (
                  <p className="text-gray-700 mb-4">{guide.profile.bio}</p>
                )}

                {/* Specializations */}
                {guide.profile?.specializations && guide.profile.specializations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.profile.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecializationColor(spec)}`}
                        >
                          {spec.charAt(0).toUpperCase() + spec.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {guide.profile?.languages && guide.profile.languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.profile.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {lang.language} ({getLanguageProficiency(lang.proficiency)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experience & Education */}
          {(guide.profile?.experience || guide.profile?.education) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Background</h2>
              
              {guide.profile?.experience && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-700">{guide.profile.experience} years of guiding experience</p>
                </div>
              )}

              {guide.profile?.education && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Education</h3>
                  <p className="text-gray-700">{guide.profile.education}</p>
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {guide.services && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tour Types */}
                {guide.services.tourTypes && guide.services.tourTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Tour Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.services.tourTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group Size */}
                {guide.services.groupSize && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Group Size</h3>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2" />
                      {guide.services.groupSize.min} - {guide.services.groupSize.max} people
                    </div>
                  </div>
                )}

                {/* Duration */}
                {guide.services.duration && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Duration</h3>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2" />
                      {guide.services.duration.min} - {guide.services.duration.max} days
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {guide.pricing && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              
              <div className="space-y-3">
                {guide.pricing.hourly > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hourly</span>
                    <span className="font-medium">{formatPrice(guide.pricing.hourly, guide.pricing.currency)}</span>
                  </div>
                )}
                {guide.pricing.daily > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily</span>
                    <span className="font-medium">{formatPrice(guide.pricing.daily, guide.pricing.currency)}</span>
                  </div>
                )}
                {guide.pricing.weekly > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly</span>
                    <span className="font-medium">{formatPrice(guide.pricing.weekly, guide.pricing.currency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            
            <div className="space-y-3">
              {guide.user?.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{guide.user.email}</span>
                </div>
              )}
              {guide.user?.profile?.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{guide.user.profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-3">
              <Link
                to={`/guides/${id}/book`}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block font-medium"
              >
                Book This Guide
              </Link>
              
              <button 
                onClick={handleSendMessage}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Message to {guide?.user?.name || 'Guide'}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMessageSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={messageData.subject}
                    onChange={handleMessageInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={messageData.contactMethod}
                    onChange={handleMessageInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={messageData.message}
                    onChange={handleMessageInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell the guide about your requirements, preferred dates, group size, etc."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDetailPage;
