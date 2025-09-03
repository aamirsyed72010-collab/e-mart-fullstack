import React, { useState } from 'react';
import EmailSelectionModal from './EmailSelectionModal';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <footer className="bg-surface text-text-dark py-12 mt-16 border-t border-gray-200 shadow-inner shadow-blue-100
                   dark:bg-dark_surface dark:text-dark_text-dark dark:border-dark_surface/50 dark:shadow-dark_primary/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Section 1: About */}
          <div>
            <h3 className="text-xl font-bold text-text-light mb-4 dark:text-dark_text-light">Customize</h3>
            <p className="text-sm text-text-default dark:text-dark_text-default">
              Your ultimate destination for cutting-edge electronics and smart gadgets. Discover tomorrow's tech, today.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-text-light mb-4 dark:text-dark_text-light">Quick Links</h3>
            <ul className="space-y-2 text-sm text-text-default">
              <li><Link to="/" className="hover:text-primary transition-colors dark:hover:text-dark_primary">Home</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors dark:hover:text-dark_primary">Cart</Link></li>
              <li><Link to="/account" className="hover:text-primary transition-colors dark:hover:text-dark_primary">Account</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-primary transition-colors dark:hover:text-dark_primary">Seller Dashboard</Link></li> {/* Updated Link */}
            </ul>
          </div>

          {/* Section 3: Connect */}
          <div>
            <h3 className="text-xl font-bold text-text-light mb-4 dark:text-dark_text-light">Connect</h3>
            <div className="flex justify-center md:justify-start space-x-6 text-text-default">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors dark:hover:text-dark_primary">
                <FaGithub size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors dark:hover:text-dark_primary">
                <FaLinkedin size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors dark:hover:text-dark_primary">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com/aamirsyed72010" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors dark:hover:text-dark_primary">
                <FaInstagram size={24} />
              </a>
            </div>
            <p className="text-sm mt-4 text-text-default">
              Email: <button onClick={() => setIsModalOpen(true)} className="text-primary hover:underline focus:outline-none dark:text-dark_primary">aamirsyed72010@gmail.com</button>
            </p>
          </div>
        </div>

        <EmailSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipientEmail="aamirsyed72010@gmail.com"
          subject="Inquiry from E-Mart Website"
          body="Dear E-Mart Team,"
        />

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-text-default dark:border-dark_surface/50 dark:text-dark_text-default">
          <p>&copy; 2025 Customize. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
