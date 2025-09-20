import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  MapPin, 
  Globe, 
  Award, 
  GraduationCap,
  Plus,
  X,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import guideService from '../../services/guideService';
import { toast } from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { validateForm, profileValidationSchema } from '../../utils/validation';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({
    // User basic info
    user: {
      name: '',
      email: '',
      profile: {
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Sri Lanka'
        }
      }
    },
    // Guide profile info
    profile: {
      bio: '',
      experience: 0,
      specializations: [],
      languages: [],
      certifications: [],
      education: [],
      profileImage: {
        url: '',
        caption: ''
      },
      gallery: []
    },
    // Location
    location: '',
    // Services
    services: {
      tourTypes: [],
      locations: [],
      groupSize: { min: 1, max: 20 },
      duration: { min: 1, max: 14 }
    }
  });

  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'conversational' });
  const [newCertification, setNewCertification] = useState({ 
    name: '', 
    issuer: '', 
    date: '', 
    expiryDate: '',
    credentialId: '' 
  });
  const [newEducation, setNewEducation] = useState({ 
    degree: '', 
    institution: '', 
    year: '', 
    field: '' 
  });
  const [newLocation, setNewLocation] = useState({ 
    city: '', 
    region: '', 
    country: 'Sri Lanka' 
  });

  const specializationOptions = [
    'cultural', 'historical', 'wildlife', 'adventure', 'culinary', 
    'photography', 'nature', 'religious', 'archaeological', 'eco-tourism', 'medical', 'language'
  ];

  const tourTypeOptions = [
    'private', 'group', 'custom', 'day-trip', 'multi-day', 
    'luxury', 'budget', 'family', 'couple', 'solo'
  ];

  const proficiencyOptions = ['basic', 'conversational', 'fluent', 'native'];
  const genderOptions = ['male', 'female', 'other', 'prefer-not-to-say'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await guideService.getMyProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSpecializationToggle = (specialization) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        specializations: prev.profile.specializations.includes(specialization)
          ? prev.profile.specializations.filter(s => s !== specialization)
          : [...prev.profile.specializations, specialization]
      }
    }));
  };

  const handleTourTypeToggle = (tourType) => {
    setProfile(prev => ({
      ...prev,
      services: {
        ...prev.services,
        tourTypes: prev.services.tourTypes.includes(tourType)
          ? prev.services.tourTypes.filter(t => t !== tourType)
          : [...prev.services.tourTypes, tourType]
      }
    }));
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          languages: [...prev.profile.languages, { ...newLanguage }]
        }
      }));
      setNewLanguage({ language: '', proficiency: 'conversational' });
    }
  };

  const removeLanguage = (index) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        languages: prev.profile.languages.filter((_, i) => i !== index)
      }
    }));
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          certifications: [...prev.profile.certifications, { ...newCertification }]
        }
      }));
      setNewCertification({ name: '', issuer: '', date: '', expiryDate: '', credentialId: '' });
    }
  };

  const removeCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        certifications: prev.profile.certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const addEducation = () => {
    if (newEducation.degree.trim()) {
      setProfile(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          education: [...prev.profile.education, { ...newEducation }]
        }
      }));
      setNewEducation({ degree: '', institution: '', year: '', field: '' });
    }
  };

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        education: prev.profile.education.filter((_, i) => i !== index)
      }
    }));
  };

  const addLocation = () => {
    if (newLocation.city.trim()) {
      setProfile(prev => ({
        ...prev,
        services: {
          ...prev.services,
          locations: [...prev.services.locations, { ...newLocation }]
        }
      }));
      setNewLocation({ city: '', region: '', country: 'Sri Lanka' });
    }
  };

  const removeLocation = (index) => {
    setProfile(prev => ({
      ...prev,
      services: {
        ...prev.services,
        locations: prev.services.locations.filter((_, i) => i !== index)
      }
    }));
  };

  const handleImageUpload = async (imageFile) => {
    if (!imageFile) {
      setProfile(prev => ({
        ...prev,
        profileImage: null
      }));
      return;
    }

    try {
      setUploadingImage(true);
      const response = await guideService.uploadProfileImage(imageFile);
      
      if (response.success) {
        setProfile(prev => ({
          ...prev,
          profileImage: response.data.imageUrl
        }));
        toast.success('Profile image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors({});

      // Validate form data
      const validationData = {
        name: profile.user?.name || '',
        email: profile.user?.email || '',
        phone: profile.user?.profile?.phone || '',
        bio: profile.bio || '',
        experience: profile.experience || 0,
        location: profile.location || ''
      };

      const validation = validateForm(validationData, profileValidationSchema);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('Please fix the validation errors');
        return;
      }

      await guideService.updateProfile(profile);
      toast.success('Profile updated successfully!');
      navigate('/guide/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/guide/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your guide profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>
          
          {/* Profile Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <ImageUpload
              onImageSelect={handleImageUpload}
              currentImage={profile.profileImage}
              className="w-full"
            />
            {uploadingImage && (
              <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.user?.name || ''}
                onChange={(e) => handleInputChange('user', 'name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.user?.email || ''}
                onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.user?.profile?.phone || ''}
                onChange={(e) => handleNestedInputChange('user', 'profile', 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={profile.user?.profile?.dateOfBirth || ''}
                onChange={(e) => handleNestedInputChange('user', 'profile', 'dateOfBirth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={profile.user?.profile?.gender || ''}
                onChange={(e) => handleNestedInputChange('user', 'profile', 'gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', '', e.target.value)}
                placeholder="e.g., Colombo, Sri Lanka"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Professional Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profile.profile?.bio || ''}
                onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself and your guiding experience..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={profile.profile?.experience || 0}
                onChange={(e) => handleInputChange('profile', 'experience', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
              <div className="grid grid-cols-2 gap-2">
                {specializationOptions.map(spec => (
                  <label key={spec} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(profile.profile?.specializations || []).includes(spec)}
                      onChange={() => handleSpecializationToggle(spec)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Languages
          </h2>
          
          <div className="space-y-4">
            {(profile.profile?.languages || []).map((lang, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{lang.language}</span>
                <span className="text-sm text-gray-600">({lang.proficiency})</span>
                <button
                  onClick={() => removeLanguage(index)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Language"
                value={newLanguage.language}
                onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {proficiencyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                onClick={addLanguage}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications
          </h2>
          
          <div className="space-y-4">
            {(profile.profile?.certifications || []).map((cert, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Certification Name"
                value={newCertification.name}
                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={newCertification.issuer}
                onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Issue Date"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <input
                type="text"
                placeholder="Credential ID (Optional)"
                value={newCertification.credentialId}
                onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addCertification}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Services
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tour Types</label>
              <div className="grid grid-cols-2 gap-2">
                {tourTypeOptions.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(profile.services?.tourTypes || []).includes(type)}
                      onChange={() => handleTourTypeToggle(type)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={profile.services?.groupSize?.min || 1}
                    onChange={(e) => handleNestedInputChange('services', 'groupSize', 'min', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="1"
                    value={profile.services?.groupSize?.max || 20}
                    onChange={(e) => handleNestedInputChange('services', 'groupSize', 'max', parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={profile.services?.duration?.min || 1}
                    onChange={(e) => handleNestedInputChange('services', 'duration', 'min', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="1"
                    value={profile.services?.duration?.max || 14}
                    onChange={(e) => handleNestedInputChange('services', 'duration', 'max', parseInt(e.target.value) || 14)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Locations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Locations
          </h2>
          
          <div className="space-y-4">
            {(profile.services?.locations || []).map((location, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{location.city}</span>
                {location.region && <span className="text-sm text-gray-600">({location.region})</span>}
                <span className="text-sm text-gray-500">{location.country}</span>
                <button
                  onClick={() => removeLocation(index)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="City"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Region/State"
                value={newLocation.region}
                onChange={(e) => setNewLocation({ ...newLocation, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addLocation}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;