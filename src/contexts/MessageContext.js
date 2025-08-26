import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MessageContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </MessageContext.Provider>
  );
};







