export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password: string) =>
  password.length >= 4;

export const isNonEmpty = (value: string) =>
  value.trim().length > 0;
