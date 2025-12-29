import React, { createContext, useState, useEffect, useContext } from 'react';

export const ComparisonContext = createContext();

export const useComparison = () => {
  return useContext(ComparisonContext);
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState(() => {
    try {
      const localData = localStorage.getItem('comparisonList');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Could not parse comparison list from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToCompare = (productId) => {
    setComparisonList((prevList) => {
      if (prevList.includes(productId)) {
        return prevList; // Already in the list
      }
      if (prevList.length >= 4) {
        alert('You can only compare up to 4 products at a time.');
        return prevList;
      }
      return [...prevList, productId];
    });
  };

  const removeFromCompare = (productId) => {
    setComparisonList((prevList) => prevList.filter((id) => id !== productId));
  };

  const clearCompareList = () => {
    setComparisonList([]);
  };

  const isProductInCompare = (productId) => {
    return comparisonList.includes(productId);
  };

  const value = {
    comparisonList,
    addToCompare,
    removeFromCompare,
    clearCompareList,
    isProductInCompare,
    comparisonCount: comparisonList.length,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
