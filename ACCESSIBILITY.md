# Accessibility Guide

## Overview

This application is built with accessibility in mind, following WCAG 2.1 Level AA guidelines. This document outlines the accessibility features implemented and best practices for maintaining accessibility.

## Table of Contents

1. [Keyboard Navigation](#keyboard-navigation)
2. [Screen Reader Support](#screen-reader-support)
3. [Color Contrast](#color-contrast)
4. [Focus Management](#focus-management)
5. [ARIA Labels and Roles](#aria-labels-and-roles)
6. [Testing Accessibility](#testing-accessibility)
7. [Common Patterns](#common-patterns)

## Keyboard Navigation

### Implemented Features

- **Skip Link**: Press `Tab` on page load to reveal "Saltar al contenido principal" link
- **Modal Navigation**:
  - `Escape` to close modals
  - `Tab` to navigate between interactive elements
  - Focus trap keeps focus within modal
- **Form Navigation**: All form fields are keyboard accessible
- **Navigation Menu**: Full keyboard navigation with `aria-current` indicators

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move forward through interactive elements |
| `Shift + Tab` | Move backward through interactive elements |
| `Escape` | Close modals/dialogs |
| `Enter` | Activate buttons and links |
| `Space` | Toggle buttons (when focused) |
| `Arrow Keys` | Navigate within components (when applicable) |

## Screen Reader Support

### Implemented Features

- **ARIA Live Regions**: Dynamic content updates are announced
- **Semantic HTML**: Proper use of `<nav>`, `<main>`, `<button>`, etc.
- **Alternative Text**: All images have descriptive `alt` attributes
- **Form Labels**: All form inputs have associated labels
- **Status Messages**: Loading states and errors are announced

### Screen Reader Testing

Tested with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Color Contrast

### Contrast Ratios

All text meets WCAG AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Dark Mode

Full dark mode support with appropriate contrast in both themes:
- Light mode: Dark text on light backgrounds
- Dark mode: Light text on dark backgrounds

### Color-blind Friendly

Icons and status indicators don't rely solely on color:
- Critical alerts: Red background + warning icon
- Success messages: Green background + check icon
- Info messages: Blue background + info icon

## Focus Management

### Focus Indicators

- **Visible Focus**: All interactive elements have a 2px blue outline when focused
- **Focus-Visible**: Only shows outline for keyboard navigation (not mouse clicks)
- **Custom Focus Styles**: Enhanced focus indicators for better visibility

### Focus Trap

Implemented in:
- Modal dialogs (`QuickAlertModal`)
- Dropdown menus
- Side panels

### Focus Order

Logical tab order follows visual layout:
1. Skip link
2. Navigation menu
3. Main content
4. Interactive elements within content
5. Footer (if present)

## ARIA Labels and Roles

### Navigation

```tsx
<nav role="navigation" aria-label="Navegación principal">
  <Link to="/" aria-current={isActive ? "page" : undefined}>
    Home
  </Link>
</nav>
```

### Buttons

```tsx
<button
  aria-label="Cerrar modal"
  aria-pressed={isPressed ? "true" : "false"}
>
  <X aria-hidden="true" />
</button>
```

### Forms

```tsx
<label htmlFor="alert-description">
  Detalles
</label>
<textarea
  id="alert-description"
  aria-describedby="description-hint"
/>
<p id="description-hint" className="sr-only">
  Información adicional sobre la alerta
</p>
```

### Modals

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Reportar Alerta</h2>
</div>
```

## Testing Accessibility

### Automated Testing

Run accessibility checks with:

```bash
npm run test
```

Our tests include:
- ARIA attribute validation
- Color contrast checks
- Keyboard navigation tests
- Screen reader announcement tests

### Manual Testing Checklist

- [ ] Tab through entire page - logical order?
- [ ] All interactive elements keyboard accessible?
- [ ] Focus indicators visible?
- [ ] Screen reader announces all content correctly?
- [ ] Color contrast meets WCAG AA?
- [ ] Images have alt text?
- [ ] Forms have proper labels?
- [ ] Error messages are announced?
- [ ] Loading states are announced?

### Browser Extensions

Recommended tools:
- **axe DevTools**: Comprehensive accessibility testing
- **WAVE**: Visual feedback about accessibility
- **Lighthouse**: Built into Chrome DevTools
- **Color Contrast Analyzer**: Check color combinations

## Common Patterns

### Accessible Button

```tsx
<button
  type="button"
  onClick={handleClick}
  aria-label="Descriptive label"
  disabled={isDisabled}
>
  <Icon aria-hidden="true" />
  <span>Button Text</span>
</button>
```

### Accessible Form Input

```tsx
<div>
  <label htmlFor="input-id" className="font-semibold">
    Input Label
  </label>
  <input
    id="input-id"
    type="text"
    aria-required="true"
    aria-invalid={hasError ? "true" : "false"}
    aria-describedby="input-error"
  />
  {hasError && (
    <p id="input-error" role="alert">
      Error message
    </p>
  )}
</div>
```

### Accessible Modal

```tsx
function AccessibleModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useFocusTrap(modalRef, isOpen);
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: isOpen,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef}>
        <h2 id="modal-title">Modal Title</h2>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### Accessible Icon Button

```tsx
<button
  aria-label="Close"
  className="icon-button"
>
  <X size={24} aria-hidden="true" />
</button>
```

### Accessible Loading State

```tsx
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <>
      <Spinner aria-hidden="true" />
      <span className="sr-only">Cargando contenido...</span>
    </>
  ) : (
    content
  )}
</div>
```

### Screen Reader Only Content

```tsx
<p className="sr-only">
  This text is only visible to screen readers
</p>
```

## Hooks for Accessibility

### useKeyboardNavigation

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

function Component() {
  useKeyboardNavigation({
    onEscape: handleClose,
    onEnter: handleSubmit,
    onArrowUp: handlePrevious,
    onArrowDown: handleNext,
  });
}
```

### useFocusTrap

```tsx
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

function Modal({ isOpen }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, isOpen);

  return <div ref={modalRef}>...</div>;
}
```

### useScreenReaderAnnouncement

```tsx
import { useScreenReaderAnnouncement } from '@/hooks/useKeyboardNavigation';

function Component() {
  const announce = useScreenReaderAnnouncement();

  const handleAction = () => {
    // Perform action
    announce('Action completed successfully', 'polite');
  };
}
```

## Reducing Motion

The app respects the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users who have enabled "Reduce Motion" in their OS settings will see minimal animations.

## High Contrast Mode

The app supports high contrast mode:

```css
@media (prefers-contrast: high) {
  * {
    border-width: 2px;
  }
}
```

## Touch Target Size

All interactive elements meet the minimum 44x44px touch target size per WCAG guidelines.

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Reporting Accessibility Issues

If you encounter accessibility issues:
1. Open an issue on GitHub
2. Include:
   - Browser and version
   - Screen reader (if applicable) and version
   - Steps to reproduce
   - Expected vs. actual behavior

## Continuous Improvement

Accessibility is an ongoing effort. We regularly:
- Audit with automated tools
- Test with real assistive technologies
- Gather feedback from users with disabilities
- Update components based on latest WCAG guidelines
- Train team on accessibility best practices

---

**Last Updated**: November 2025
**WCAG Compliance Level**: AA
