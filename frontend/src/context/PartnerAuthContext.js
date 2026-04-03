import { createContext, useContext, useState, useEffect } from 'react';

const PartnerAuthContext = createContext(null);

export const PartnerAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('partnerToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('partnerToken');
    const storedPartner = localStorage.getItem('partnerData');
    
    if (storedToken && storedPartner) {
      setToken(storedToken);
      setPartner(JSON.parse(storedPartner));
    }
    setLoading(false);
  }, []);

  const login = (tokenValue, partnerData) => {
    localStorage.setItem('partnerToken', tokenValue);
    localStorage.setItem('partnerData', JSON.stringify(partnerData));
    setToken(tokenValue);
    setPartner(partnerData);
  };

  const logout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerData');
    setToken(null);
    setPartner(null);
  };

  return (
    <PartnerAuthContext.Provider value={{ partner, token, login, logout, loading }}>
      {children}
    </PartnerAuthContext.Provider>
  );
};

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }
  return context;
};
