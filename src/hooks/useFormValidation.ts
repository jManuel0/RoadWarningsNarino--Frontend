import { useState, useCallback } from "react";

type ValidationResult = boolean | { valid: boolean; error?: string };

type ValidationRule<TValue> = {
  validate: (value: TValue) => ValidationResult;
  message?: string;
};

type FieldValidation<TValues extends Record<string, unknown>> = Partial<{
  [K in keyof TValues]: ValidationRule<TValues[K]>[];
}>;

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: FieldValidation<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules[name];

      if (!rules) return undefined;

      for (const rule of rules) {
        const result = rule.validate(value);

        if (typeof result === "boolean") {
          if (!result) {
            return rule.message || "Invalid value";
          }
        } else {
          if (!result.valid) {
            return result.error || rule.message || "Invalid value";
          }
        }
      }

      return undefined;
    },
    [validationRules]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [values, validateField]
  );

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      );
      setTouched(allTouched);

      const isValid = validateAll();

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validationRules, validateAll]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
  };
}
