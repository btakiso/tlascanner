import { useState, useEffect } from 'react';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Try to get API key from localStorage
    const storedApiKey = localStorage.getItem('tlaApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    setIsLoading(false);
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('tlaApiKey', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('tlaApiKey');
    setApiKey('');
  };

  return { apiKey, isLoading, saveApiKey, clearApiKey };
}
