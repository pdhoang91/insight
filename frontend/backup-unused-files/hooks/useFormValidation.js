// hooks/useFormValidation.js
import { useState, useCallback } from 'react';

// Validation rules
const validationRules = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },
  
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  },
  
  name: (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return null;
  },
  
  title: (value) => {
    if (!value) return 'Title is required';
    if (value.length < 5) return 'Title must be at least 5 characters';
    if (value.length > 200) return 'Title must be less than 200 characters';
    return null;
  },
  
  content: (value) => {
    if (!value) return 'Content is required';
    if (value.length < 50) return 'Content must be at least 50 characters';
    return null;
  },
  
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be less than ${max} characters`;
    }
    return null;
  }
};

// Form schemas
export const formSchemas = {
  login: {
    email: ['required', 'email'],
    password: ['required']
  },
  
  register: {
    name: ['required', 'name'],
    email: ['required', 'email'],
    password: ['required', 'password']
  },
  
  post: {
    title: ['required', 'title'],
    content: ['required', 'content'],
    category: ['required']
  },
  
  newsletter: {
    email: ['required', 'email']
  },
  
  comment: {
    content: ['required', (value) => {
      if (value && value.length < 3) return 'Comment must be at least 3 characters';
      return null;
    }]
  }
};

export const useFormValidation = (schema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const fieldRules = schema[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      let validator;
      
      if (typeof rule === 'string') {
        validator = validationRules[rule];
      } else if (typeof rule === 'function') {
        validator = rule;
      }
      
      if (validator) {
        const error = validator(value);
        if (error) return error;
      }
    }
    
    return null;
  }, [schema]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [schema, values, validateField]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(schema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, schema, validateForm]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
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
    setFieldError,
    validateForm,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};

export default useFormValidation; 