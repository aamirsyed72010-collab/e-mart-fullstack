import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timeoutId = useRef(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setNotification({ message, type });

    timeoutId.current = setTimeout(() => {
      setNotification(null);
      timeoutId.current = null;
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
