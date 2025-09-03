import React, { createContext, useContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  let timeoutId = null; // To store the timeout ID

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // Clear any existing timeout to prevent multiple notifications overlapping
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({ message, type });

    timeoutId = setTimeout(() => {
      setNotification(null);
      timeoutId = null; // Clear the stored ID after timeout
    }, duration);
  }, []);

  const value = {
    notification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
