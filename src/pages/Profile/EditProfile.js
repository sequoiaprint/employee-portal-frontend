import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ProfileImageUpload, ProfileAvatar } from '../../component/Profile';

const EditProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const getInitialData = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@sequoia.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      location: 'San Francisco, CA',
      joinDate: 'January 15, 2022',
      bio: 'Passionate software developer with 5+ years of experience in full-stack development. Love creating efficient and scalable solutions.',
      profileImage: null
    };
  };

  const [formData, setFormData] = useState(getInitialData());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const initialData = getInitialData();

  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(
      key => formData[key] !== initialData[key]
    );
    setHasChanges(hasFormChanges);
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (image) => {
    setFormData(prev => ({
      ...prev,
      profileImage: image
    }));
    setHasChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      //localStorage.setItem('userProfile', JSON.stringify(formData));
      setIsLoading(false);
      setShowSuccessMessage(true);
      setHasChanges(false);

      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/profile', {
          state: {
            message: 'Profile updated successfully!',
            updatedData: formData
          }
        });
      }, 2000);
    }, 1000);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white shadow-xl rounded-lg p-4 border-l-4 border-[#EA7125] flex items-center space-x-3 animate-fade-in-up">
            <div className="bg-[#EA7125] bg-opacity-10 p-2 rounded-full">
              <svg className="w-6 h-6 text-[#EA7125]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800">Profile updated!</p>
              <p className="text-sm text-gray-500">Your changes have been saved</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-8">
        <h1 className="text-3xl font-extrabold text-[#EA7125] mb-8 text-center">Edit Profile</h1>
        <form onSubmit={handleSave} className="space-y-10">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left - Avatar and Upload */}
            <div className="flex flex-col items-center md:w-1/3 space-y-6">
              <ProfileAvatar
                image={formData.profileImage}
                name={formData.name}
                size="xlarge"
                showInitials={false}
                className="rounded-full border-4 border-[#EA7125] shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  // Clear the profile image
                  handleImageUpload(null);
                }}
                className="px-6 py-2 bg-[#EA7125] text-white rounded-lg hover:bg-[#F58E3F] transition-colors"
              >
                Remove Image
              </button>
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleImageUpload(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="profile-image-upload"
              />
              <label
                htmlFor="profile-image-upload"
                className="cursor-pointer px-6 py-2 border border-[#EA7125] rounded-lg text-[#EA7125] hover:bg-[#F58E3F] hover:text-white transition-colors"
              >
                Choose Image
              </label>
              <p className="text-sm text-gray-600 text-center">JPG, GIF or PNG. Max size 2MB</p>
            </div>

            {/* Right - Form Fields */}
            <div className="md:w-2/3 space-y-8">
              {/* Personal Information */}
              <section className="bg-[#FFF4E6] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-[#EA7125] mb-6 border-l-4 border-[#EA7125] pl-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name*</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone*</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location*</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>
              </section>

              {/* Work Information */}
              <section className="bg-[#FFF4E6] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-[#EA7125] mb-6 border-l-4 border-[#EA7125] pl-4">Work Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position*</label>
                    <input
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all ${
                        errors.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <input
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
                      disabled
                    />
                  </div>
                </div>
              </section>

              {/* About Me */}
              <section className="bg-[#FFF4E6] rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-semibold text-[#EA7125] mb-6 border-l-4 border-[#EA7125] pl-4">About Me</h2>
                <textarea
                  name="bio"
                  rows={5}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                  <span className={`text-xs ml-auto ${
                    formData.bio?.length > 500 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {formData.bio?.length || 0}/500
                  </span>
                </div>
              </section>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges || isLoading}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg text-white transition-colors ${
                    hasChanges && !isLoading
                      ? 'bg-[#EA7125] hover:bg-[#F58E3F]'
                      : 'bg-[#EA7125] bg-opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditProfile;
