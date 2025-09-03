import React from 'react';
import { FiMail } from 'react-icons/fi';

const EmailSelectionModal = ({ isOpen, onClose, recipientEmail, subject, body }) => {
  if (!isOpen) return null;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodedSubject}&body=${encodedBody}`;
  const outlookUrl = `https://outlook.live.com/owa/?rfr=0&amp;url=https%3A%2F%2Foutlook.live.com%2Fowa%2F%3Fpath%3D%2Fmail%2Faction%2Fcompose&to=${recipientEmail}&subject=${encodedSubject}&body=${encodedBody}`;
  const yahooUrl = `https://mail.yahoo.com/d/compose?to=${recipientEmail}&subject=${encodedSubject}&body=${encodedBody}`;
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-surface dark:bg-dark_surface p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-dark_text-light">Choose your Email Provider</h2>
        <div className="space-y-4">
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block w-full bg-red-500 text-white py-3 rounded-lg text-center font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_32dp.png" alt="Gmail Logo" className="h-6" />
            <span>Open with Gmail</span>
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block w-full bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
          >
            Open with Outlook
          </a>
          <a
            href={yahooUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block w-full bg-purple-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-colors"
          >
            Open with Yahoo Mail
          </a>
          <a
            href={mailtoUrl}
            onClick={onClose}
            className="block w-full bg-gray-500 py-3 rounded-lg text-center font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-primary dark:text-dark_primary"
          >
            <FiMail size={24} />
            <span>Use Default Email Client</span>
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-gray-300 text-gray-800 py-3 rounded-lg text-center font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EmailSelectionModal;
