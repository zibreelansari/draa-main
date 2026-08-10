
import { useState, useEffect } from'react';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to hide the preloader after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Clean up the timer when the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="preloader">
      <div className="book-style">
        <div className="inner">
          <div className="left"></div>
          <div className="middle"></div>
          <div className="right"></div>
        </div>
        <ul>
          {Array(18).fill(null).map((_, index) => (
            <li key={index}>
               
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
