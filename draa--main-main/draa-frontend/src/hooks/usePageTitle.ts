import { useEffect } from'react';

const usePageTitle = (title: string) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | Draa`;
    
    // Optional: Reset title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default usePageTitle;
