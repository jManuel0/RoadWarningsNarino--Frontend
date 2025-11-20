/**
 * Input validation and sanitization utilities
 * Helps prevent XSS attacks and ensures data integrity
 */

/**
 * Sanitizes HTML by escaping special characters
 */
export function sanitizeHTML(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Removes HTML tags from input
 */
export function stripHTML(input: string): string {
  const div = document.createElement("div");
  div.innerHTML = input;
  return div.textContent || div.innerText || "";
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates username format
 * Alphanumeric and underscores only, 3-20 characters
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Sanitizes user input for display
 */
export function sanitizeUserInput(input: string): string {
  // Remove script tags and other dangerous content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  sanitized = sanitized.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ""
  );
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  return sanitized.trim();
}

/**
 * Validates and sanitizes alert title
 */
export function validateAlertTitle(title: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeUserInput(title.trim());

  if (sanitized.length === 0) {
    return {
      valid: false,
      sanitized,
      error: "El título no puede estar vacío",
    };
  }

  if (sanitized.length < 5) {
    return {
      valid: false,
      sanitized,
      error: "El título debe tener al menos 5 caracteres",
    };
  }

  if (sanitized.length > 200) {
    return {
      valid: false,
      sanitized,
      error: "El título no puede tener más de 200 caracteres",
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validates and sanitizes alert description
 */
export function validateAlertDescription(description: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeUserInput(description.trim());

  if (sanitized.length === 0) {
    return {
      valid: false,
      sanitized,
      error: "La descripción no puede estar vacía",
    };
  }

  if (sanitized.length < 10) {
    return {
      valid: false,
      sanitized,
      error: "La descripción debe tener al menos 10 caracteres",
    };
  }

  if (sanitized.length > 1000) {
    return {
      valid: false,
      sanitized,
      error: "La descripción no puede tener más de 1000 caracteres",
    };
  }

  return {
    valid: true,
    sanitized,
  };
}

/**
 * Validates coordinates
 */
export function validateCoordinates(
  lat: number,
  lng: number
): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(lat) || isNaN(lng)) {
    return {
      valid: false,
      error: "Las coordenadas deben ser números válidos",
    };
  }

  if (lat < -90 || lat > 90) {
    return {
      valid: false,
      error: "La latitud debe estar entre -90 y 90",
    };
  }

  if (lng < -180 || lng > 180) {
    return {
      valid: false,
      error: "La longitud debe estar entre -180 y 180",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validates file upload
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten imágenes JPEG, PNG o WebP",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "La imagen no puede pesar más de 5MB",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validates URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if action is allowed within rate limit
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.attempts.clear();
  }
}

/**
 * Global rate limiter instance
 */
export const rateLimiter = new RateLimiter();
