import React, { createContext, useContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, key: new Date().getTime() }); // Add a key to show same message again
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = {
    notification,
    showNotification,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
