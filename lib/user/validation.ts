const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validation(
  type: string,
  value: string,
  opt: { min?: number; max?: number; email?: boolean; textAndSpaces?: boolean },
) {
  if (opt.min !== undefined && value.length < opt.min) {
    throw new Error(`${type} must be at least ${opt.min} characters`);
  }
  if (opt.max !== undefined && value.length > opt.max) {
    throw new Error(`${type} must be less than ${opt.max} characters`);
  }
  if (opt.email !== undefined && !regexEmail.test(value)) {
    throw new Error(`Invalid ${type}`);
  }
  if (opt.textAndSpaces !== undefined && !/^[a-zA-Z\s]+$/.test(value)) {
    throw new Error(`${type} must only contain letters and spaces`);
  }
}
