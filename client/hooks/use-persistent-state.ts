import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Prevent SSR issues
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialState;
    } catch (error) {
      console.error(`Error reading localStorage key \u201c${key}\u201d:`, error);
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error writing to localStorage key \u201c${key}\u201d:`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}
