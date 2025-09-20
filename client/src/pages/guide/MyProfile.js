import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Star, 
  Award, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import guideService from '../../services/guideService';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await guideService.getMyProfile();
      setProfile(response);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = () => {
    if (profile?.isVerified) {
      return {
        text: 'Verified Guide',
        color: 'text-green-600 bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />
      };
    } else {
      return {
        text: 'Pending Verification',
        color: 'text-yellow-600 bg-yellow-100',
        icon: <XCircle className="w-4 h-4" />
      };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
          <p className="text-gray-600 mb-4">You need to create a guide profile first.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and manage your guide profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.user?.name || 'Guide Name'}
                  </h2>
                  <p className="text-gray-600">{profile.user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color}`}>
                      {verificationStatus.icon}
                      {verificationStatus.text}
                    </span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Bio */}
              {profile.profile?.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
                  <p className="text-gray-700">{profile.profile.bio}</p>
                </div>
              )}

              {/* Experience */}
              {profile.profile?.experience && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-700">{profile.profile.experience} years of guiding experience</p>
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {profile.profile?.specializations && profile.profile.specializations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.profile?.languages && profile.profile.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages</h3>
                  <div className="space-y-2">
                    {profile.profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{lang.language}</span>
                        <span className="text-sm text-gray-500">({lang.proficiency})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.profile?.certifications && profile.profile.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h3>
                  <div className="space-y-2">
                    {profile.profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{cert.name}</span>
                        {cert.issuer && (
                          <span className="text-sm text-gray-500">- {cert.issuer}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating</h3>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold text-gray-900">
                {profile.rating?.average || 'No rating yet'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Based on {profile.rating?.count || 0} reviews
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{profile.user?.email}</span>
              </div>
              {profile.user?.profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.user.profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900">
                  {profile.user?.createdAt ? 
                    new Date(profile.user.createdAt).toLocaleDateString() : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total bookings</span>
                <span className="text-gray-900">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response rate</span>
                <span className="text-gray-900">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
