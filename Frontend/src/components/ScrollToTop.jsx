import { useEffect, useState } from 'react';
import { MdKeyboardArrowUp } from 'react-icons/md';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      className="scroll-to-top-btn"
      title="Back to top"
      aria-label="Scroll to top"
    >
      <MdKeyboardArrowUp size={22} />
    </button>
  );
};

export default ScrollToTop;
