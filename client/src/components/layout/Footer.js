import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">🏝️ SerendibGo</h3>
            <p className="text-gray-300">
              Your unified travel platform for exploring the beautiful island of Sri Lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/tours" className="text-gray-300 hover:text-white">Tours</a></li>
              <li><a href="/hotels" className="text-gray-300 hover:text-white">Hotels</a></li>
              <li><a href="/guides" className="text-gray-300 hover:text-white">Guides</a></li>
              <li><a href="/vehicles" className="text-gray-300 hover:text-white">Vehicles</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact Us</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <p className="text-gray-300">
              📧 info@serendibgo.com<br/>
              📱 +94 11 234 5678<br/>
              🏢 Colombo, Sri Lanka
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 SerendibGo. All rights reserved. | Built with ❤️ for Sri Lanka Tourism
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
