import { useCallback, useEffect, useState } from "react";

/**
 * Loads a JSON value from localStorage on mount and exposes a setter that
 * persists back to localStorage. `onParseError` is optional so callers can
 * match their previous error handling exactly (logged vs. silently ignored).
 */
export function useLocalStorage<T = any>(
  key: string,
  onParseError?: (error: unknown) => void
): [T | null, (value: T) => void] {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setValue(JSON.parse(saved));
      } catch (error) {
        onParseError?.(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    [key]
  );

  return [value, updateValue];
}
