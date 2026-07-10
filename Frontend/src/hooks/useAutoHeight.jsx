import { useEffect } from 'react';

export default function useAutoHeight(ref, value) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Reset height
    element.style.height = 'auto';

    // Calculate scroll height
    const scrollHeight = element.scrollHeight;
    
    // Limit max height to 200px
    element.style.height = `${Math.min(scrollHeight, 200)}px`;
  }, [ref, value]);
}
