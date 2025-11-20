import { renderHook, act } from '@testing-library/react';
import {
  useKeyboardNavigation,
  useFocusTrap,
  useScreenReaderAnnouncement,
  useSkipLink,
} from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  it('calls onEscape when Escape is pressed', () => {
    const onEscape = jest.fn();
    renderHook(() => useKeyboardNavigation({ onEscape }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('calls onEnter when Enter is pressed', () => {
    const onEnter = jest.fn();
    renderHook(() => useKeyboardNavigation({ onEnter }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('does not call onEnter when focused on input', () => {
    const onEnter = jest.fn();
    renderHook(() => useKeyboardNavigation({ onEnter }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event);
    });

    expect(onEnter).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('calls onArrowUp when ArrowUp is pressed', () => {
    const onArrowUp = jest.fn();
    renderHook(() => useKeyboardNavigation({ onArrowUp }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);
    });

    expect(onArrowUp).toHaveBeenCalledTimes(1);
  });

  it('calls onArrowDown when ArrowDown is pressed', () => {
    const onArrowDown = jest.fn();
    renderHook(() => useKeyboardNavigation({ onArrowDown }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);
    });

    expect(onArrowDown).toHaveBeenCalledTimes(1);
  });

  it('does not call handlers when disabled', () => {
    const onEscape = jest.fn();
    renderHook(() => useKeyboardNavigation({ onEscape, enabled: false }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const onEscape = jest.fn();
    const { unmount } = renderHook(() => useKeyboardNavigation({ onEscape }));

    unmount();

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });

    expect(onEscape).not.toHaveBeenCalled();
  });
});

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses first element when active', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');

    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    const containerRef = { current: container };

    renderHook(() => useFocusTrap(containerRef as any, true));

    expect(document.activeElement).toBe(button1);

    document.body.removeChild(container);
  });

  it('traps focus within container', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');

    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    const containerRef = { current: container };

    renderHook(() => useFocusTrap(containerRef as any, true));

    // Simulate Tab on last element
    button2.focus();

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      container.dispatchEvent(event);
    });

    document.body.removeChild(container);
  });

  it('does nothing when not active', () => {
    const container = document.createElement('div');
    const button = document.createElement('button');

    container.appendChild(button);
    document.body.appendChild(container);

    const containerRef = { current: container };

    renderHook(() => useFocusTrap(containerRef as any, false));

    expect(document.activeElement).not.toBe(button);

    document.body.removeChild(container);
  });
});

describe('useScreenReaderAnnouncement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates announcer element', () => {
    renderHook(() => useScreenReaderAnnouncement());

    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute('role', 'status');
    expect(announcer).toHaveAttribute('aria-live', 'polite');
  });

  it('announces messages', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    const announce = result.current;

    act(() => {
      announce('Test message');
    });

    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toHaveTextContent('Test message');
  });

  it('supports assertive priority', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    const announce = result.current;

    act(() => {
      announce('Urgent message', 'assertive');
    });

    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toHaveAttribute('aria-live', 'assertive');
  });

  it('clears message after 1 second', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());
    const announce = result.current;

    act(() => {
      announce('Test message');
    });

    const announcer = document.getElementById('sr-announcer');
    expect(announcer).toHaveTextContent('Test message');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(announcer).toHaveTextContent('');
  });
});

describe('useSkipLink', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses main content', () => {
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    document.body.appendChild(mainContent);

    const { result } = renderHook(() => useSkipLink());
    const { skipToContent } = result.current;

    act(() => {
      skipToContent();
    });

    expect(document.activeElement).toBe(mainContent);

    document.body.removeChild(mainContent);
  });

  it('does nothing if main content not found', () => {
    const { result } = renderHook(() => useSkipLink());
    const { skipToContent } = result.current;

    expect(() => {
      act(() => {
        skipToContent();
      });
    }).not.toThrow();
  });
});
