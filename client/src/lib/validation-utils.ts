export function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  return phoneRegex.test(phone);
}

export function getEmailError(email: string): string | null {
  if (!email) return null;
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

export function getPhoneError(phone: string): string | null {
  if (!phone) return null;
  if (!isValidPhone(phone)) {
    return "Please enter a valid phone number";
  }
  return null;
}
