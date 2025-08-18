/**
 * Utility functions for browser password management and autocomplete
 */

/**
 * Triggers browser password save prompt when called after successful login/registration
 * @param formElement - The form element containing login/registration fields
 */
export const triggerPasswordSave = (formElement: HTMLFormElement) => {
  try {
    // Create a temporary form submission to trigger browser password save
    const formData = new FormData(formElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (email && password) {
      // Modern browsers will detect this pattern and offer to save credentials
      console.log('Credentials available for browser password manager');
      
      // Some browsers need a slight delay before the navigation to detect the successful login
      setTimeout(() => {
        // Dispatch a custom event that can be used to trigger password save
        const event = new CustomEvent('credentials-ready', {
          detail: { email, hasPassword: true }
        });
        window.dispatchEvent(event);
      }, 100);
    }
  } catch (error) {
    console.warn('Password save trigger failed:', error);
  }
};

/**
 * Enhances form elements with proper autocomplete attributes for password managers
 * @param formElement - The form element to enhance
 */
export const enhanceFormForPasswordManager = (formElement: HTMLFormElement) => {
  try {
    // Ensure form has proper autocomplete attribute
    if (!formElement.hasAttribute('autocomplete')) {
      formElement.setAttribute('autocomplete', 'on');
    }
    
    // Find and enhance username/email fields
    const emailField = formElement.querySelector('input[type="email"], input[name="email"]') as HTMLInputElement;
    if (emailField && !emailField.hasAttribute('autocomplete')) {
      emailField.setAttribute('autocomplete', 'username email');
    }
    
    // Find and enhance password fields
    const passwordFields = formElement.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;
    passwordFields.forEach((field, index) => {
      if (!field.hasAttribute('autocomplete')) {
        // First password field is usually the main password
        // Subsequent fields are usually confirm password
        const autocompleteValue = index === 0 ? 'current-password' : 'new-password';
        
        // For registration forms, use new-password
        if (formElement.querySelector('input[name*="confirm"], input[name*="Confirm"]')) {
          field.setAttribute('autocomplete', 'new-password');
        } else {
          field.setAttribute('autocomplete', autocompleteValue);
        }
      }
    });
    
    // Find and enhance name fields
    const firstNameField = formElement.querySelector('input[name*="first"], input[name*="First"]') as HTMLInputElement;
    if (firstNameField && !firstNameField.hasAttribute('autocomplete')) {
      firstNameField.setAttribute('autocomplete', 'given-name');
    }
    
    const lastNameField = formElement.querySelector('input[name*="last"], input[name*="Last"]') as HTMLInputElement;
    if (lastNameField && !lastNameField.hasAttribute('autocomplete')) {
      lastNameField.setAttribute('autocomplete', 'family-name');
    }
    
    // Find and enhance phone fields
    const phoneFields = formElement.querySelectorAll('input[type="tel"], input[name*="phone"], input[name*="Phone"]') as NodeListOf<HTMLInputElement>;
    phoneFields.forEach(field => {
      if (!field.hasAttribute('autocomplete')) {
        field.setAttribute('autocomplete', 'tel');
      }
    });
    
    console.log('Form enhanced for password manager compatibility');
  } catch (error) {
    console.warn('Form enhancement failed:', error);
  }
};

/**
 * Sets up password save functionality for a form
 * @param formElement - The form element
 * @param onSuccess - Callback to call after successful form submission
 */
export const setupPasswordSave = (
  formElement: HTMLFormElement, 
  onSuccess?: () => void
) => {
  // Enhance the form
  enhanceFormForPasswordManager(formElement);
  
  // Add submit handler to trigger password save
  const handleSubmit = (_event: Event) => {
    // Don't prevent default - let the form submit normally
    // The browser will detect the successful submission and offer to save
    setTimeout(() => {
      triggerPasswordSave(formElement);
      onSuccess?.();
    }, 100);
  };
  
  formElement.addEventListener('submit', handleSubmit);
  
  // Return cleanup function
  return () => {
    formElement.removeEventListener('submit', handleSubmit);
  };
};

/**
 * Browser password manager detection and compatibility
 */
export const passwordManagerUtils = {
  /**
   * Check if browser supports credential management API
   */
  supportsCredentialManagement: () => {
    return 'credentials' in navigator && 'PasswordCredential' in window;
  },
  
  /**
   * Request credentials from browser password manager
   */
  requestStoredCredentials: async () => {
    if (!passwordManagerUtils.supportsCredentialManagement()) {
      return null;
    }
    
    try {
      // Note: This is experimental API and may not be available in all browsers
      const credential = await (navigator.credentials as any).get({
        password: true,
        mediation: 'optional'
      });
      
      return credential;
    } catch (error) {
      console.warn('Failed to request stored credentials:', error);
      return null;
    }
  },
  
  /**
   * Store credentials in browser password manager
   */
  storeCredentials: async (email: string, password: string) => {
    if (!passwordManagerUtils.supportsCredentialManagement()) {
      return false;
    }
    
    try {
      // Note: This is experimental API and may not be available in all browsers
      const credential = new (window as any).PasswordCredential({
        id: email,
        password: password,
        name: email
      });
      
      await navigator.credentials.store(credential);
      return true;
    } catch (error) {
      console.warn('Failed to store credentials:', error);
      return false;
    }
  }
};
