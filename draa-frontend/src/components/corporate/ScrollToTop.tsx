import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 500);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 50,
        width: 46, height: 46, display: 'grid', placeItems: 'center',
        border: '1px solid rgba(255,255,255,.14)', borderRadius: '50%',
        color: '#fff', background: '#191611', boxShadow: '0 12px 28px rgba(25,22,17,.22)',
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        cursor: visible ? 'pointer' : 'default', transition: 'opacity .25s ease, transform .25s ease',
      }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
