import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const Notification = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  const bgColor = notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 ${bgColor}`}>
      {notification.message}
    </div>
  );
};

export default Notification;
