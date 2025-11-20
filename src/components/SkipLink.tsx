import { useSkipLink } from '../hooks/useKeyboardNavigation';

/**
 * Skip Link component for keyboard navigation
 * Allows users to skip to main content
 */
export default function SkipLink() {
  const { skipToContent } = useSkipLink();

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}
      className="skip-link"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        background: '#000',
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        zIndex: 100,
        transition: 'top 0.3s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      Saltar al contenido principal
    </a>
  );
}
