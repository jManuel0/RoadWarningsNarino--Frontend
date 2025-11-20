import {
  sanitizeHTML,
  stripHTML,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeUserInput,
  validateAlertTitle,
  validateAlertDescription,
  validateCoordinates,
  validateImageFile,
  isValidURL,
  RateLimiter,
} from "./validation";

describe("validation utilities", () => {
  describe("sanitizeHTML", () => {
    it("escapes HTML special characters", () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeHTML(input);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).not.toContain("<script>");
    });

    it("escapes event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHTML(input);
      expect(result).toContain("&lt;");
      expect(result).not.toContain("<div");
    });
  });

  describe("stripHTML", () => {
    it("removes HTML tags", () => {
      const input = "<p>Safe <strong>content</strong></p>";
      const result = stripHTML(input);
      expect(result).toBe("Safe content");
    });

    it("removes script tags", () => {
      const input = "<script>alert(1)</script>Hello";
      const result = stripHTML(input);
      expect(result).toBe("Hello");
    });
  });

  describe("sanitizeUserInput", () => {
    it("removes script tags", () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("removes iframe tags", () => {
      const input = '<iframe src="evil.com"></iframe>Text';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain("<iframe");
      expect(result).toContain("Text");
    });

    it("removes javascript: URLs", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain("javascript:");
    });

    it("removes event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain("onclick=");
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.user@domain.co.uk")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user @domain.com")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("accepts valid passwords", () => {
      const result = isValidPassword("SecurePass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects short passwords", () => {
      const result = isValidPassword("Short1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "La contraseña debe tener al menos 8 caracteres"
      );
    });

    it("requires uppercase letter", () => {
      const result = isValidPassword("password123");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("mayúscula"))).toBe(true);
    });

    it("requires lowercase letter", () => {
      const result = isValidPassword("PASSWORD123");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("minúscula"))).toBe(true);
    });

    it("requires number", () => {
      const result = isValidPassword("PasswordAbc");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("número"))).toBe(true);
    });
  });

  describe("isValidUsername", () => {
    it("accepts valid usernames", () => {
      expect(isValidUsername("user123")).toBe(true);
      expect(isValidUsername("john_doe")).toBe(true);
    });

    it("rejects short usernames", () => {
      expect(isValidUsername("ab")).toBe(false);
    });

    it("rejects long usernames", () => {
      expect(isValidUsername("a".repeat(21))).toBe(false);
    });

    it("rejects invalid characters", () => {
      expect(isValidUsername("user-name")).toBe(false);
      expect(isValidUsername("user@123")).toBe(false);
    });
  });

  describe("validateAlertTitle", () => {
    it("accepts valid titles", () => {
      const result = validateAlertTitle("Accidente en Ruta 5");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("Accidente en Ruta 5");
    });

    it("rejects short titles", () => {
      const result = validateAlertTitle("Hi");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("5 caracteres");
    });

    it("rejects long titles", () => {
      const result = validateAlertTitle("a".repeat(201));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("200 caracteres");
    });

    it("sanitizes dangerous content in titles", () => {
      const result = validateAlertTitle(
        "<script>alert(1)</script>Accidente grave"
      );
      expect(result.sanitized).not.toContain("<script>");
    });

    it("rejects empty titles", () => {
      const result = validateAlertTitle("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("vacío");
    });
  });

  describe("validateAlertDescription", () => {
    it("accepts valid descriptions", () => {
      const result = validateAlertDescription(
        "Hay un accidente grave en la ruta"
      );
      expect(result.valid).toBe(true);
    });

    it("rejects short descriptions", () => {
      const result = validateAlertDescription("Short");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10 caracteres");
    });

    it("rejects long descriptions", () => {
      const result = validateAlertDescription("a".repeat(1001));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("1000 caracteres");
    });

    it("sanitizes dangerous content", () => {
      const result = validateAlertDescription(
        "<script>alert(1)</script>Descripción válida aquí"
      );
      expect(result.sanitized).not.toContain("<script>");
    });

    it("rejects empty descriptions", () => {
      const result = validateAlertDescription("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("vacía");
    });
  });

  describe("validateCoordinates", () => {
    it("accepts valid coordinates", () => {
      expect(validateCoordinates(40.7128, -74.006).valid).toBe(true);
      expect(validateCoordinates(-33.4489, -70.6693).valid).toBe(true);
      expect(validateCoordinates(0, 0).valid).toBe(true);
    });

    it("rejects invalid latitude", () => {
      expect(validateCoordinates(91, 0).valid).toBe(false);
      expect(validateCoordinates(-91, 0).valid).toBe(false);
    });

    it("rejects invalid longitude", () => {
      expect(validateCoordinates(0, 181).valid).toBe(false);
      expect(validateCoordinates(0, -181).valid).toBe(false);
    });

    it("rejects NaN values", () => {
      expect(validateCoordinates(NaN, 0).valid).toBe(false);
      expect(validateCoordinates(0, NaN).valid).toBe(false);
    });
  });

  describe("validateImageFile", () => {
    it("accepts valid image files", () => {
      const file = new File([""], "test.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it("rejects invalid file types", () => {
      const file = new File([""], "test.txt", { type: "text/plain" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("JPEG, PNG o WebP");
    });

    it("rejects files too large", () => {
      const largeContent = new Array(6 * 1024 * 1024).fill("a").join("");
      const file = new File([largeContent], "test.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("5MB");
    });
  });

  describe("isValidURL", () => {
    it("accepts valid URLs", () => {
      expect(isValidURL("https://example.com")).toBe(true);
      expect(isValidURL("http://localhost:3000")).toBe(true);
    });

    it("rejects invalid URLs", () => {
      expect(isValidURL("not-a-url")).toBe(false);
      expect(isValidURL("javascript:alert(1)")).toBe(false);
    });
  });

  describe("RateLimiter", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("allows requests under limit", () => {
      const limiter = new RateLimiter();

      expect(limiter.isAllowed("test", 3, 1000)).toBe(true);
      expect(limiter.isAllowed("test", 3, 1000)).toBe(true);
      expect(limiter.isAllowed("test", 3, 1000)).toBe(true);
    });

    it("blocks requests over limit", () => {
      const limiter = new RateLimiter();

      expect(limiter.isAllowed("test", 2, 1000)).toBe(true);
      expect(limiter.isAllowed("test", 2, 1000)).toBe(true);
      expect(limiter.isAllowed("test", 2, 1000)).toBe(false);
    });

    it("resets after window expires", () => {
      const limiter = new RateLimiter();

      expect(limiter.isAllowed("test", 1, 1000)).toBe(true);
      expect(limiter.isAllowed("test", 1, 1000)).toBe(false);

      jest.advanceTimersByTime(1001);

      expect(limiter.isAllowed("test", 1, 1000)).toBe(true);
    });

    it("can be reset manually", () => {
      const limiter = new RateLimiter();

      limiter.isAllowed("test", 1, 1000);
      expect(limiter.isAllowed("test", 1, 1000)).toBe(false);

      limiter.reset("test");
      expect(limiter.isAllowed("test", 1, 1000)).toBe(true);
    });

    it("can clear all limits", () => {
      const limiter = new RateLimiter();

      limiter.isAllowed("test1", 1, 1000);
      limiter.isAllowed("test2", 1, 1000);

      limiter.clearAll();

      expect(limiter.isAllowed("test1", 1, 1000)).toBe(true);
      expect(limiter.isAllowed("test2", 1, 1000)).toBe(true);
    });

    it("tracks different keys separately", () => {
      const limiter = new RateLimiter();

      expect(limiter.isAllowed("key1", 1, 1000)).toBe(true);
      expect(limiter.isAllowed("key2", 1, 1000)).toBe(true);

      expect(limiter.isAllowed("key1", 1, 1000)).toBe(false);
      expect(limiter.isAllowed("key2", 1, 1000)).toBe(false);
    });
  });
});
