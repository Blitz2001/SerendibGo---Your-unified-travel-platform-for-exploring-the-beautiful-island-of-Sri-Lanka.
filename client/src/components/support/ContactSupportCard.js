import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactSupportCard = ({ tourTitle, bookingId, bookingType, tourId }) => {
  const navigate = useNavigate();

  const handleContactSupport = () => {
    // Navigate to contact support page with related data
    navigate('/support/contact', {
      state: {
        tourTitle,
        bookingId,
        bookingType,
        tourId
      }
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 mb-4">
          Have questions about this tour? Our travel experts are here to help!
        </p>
        <button
          onClick={handleContactSupport}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default ContactSupportCard;
