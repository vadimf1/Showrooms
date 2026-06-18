export type FieldErrors = Partial<Record<'first_name' | 'last_name' | 'email' | 'phone' | 'password', string>>;

export function validateRegister(form: { first_name: string; last_name: string; email: string; phone: string; password: string }): FieldErrors {
  const errs: FieldErrors = {};
  if (!form.first_name.trim()) errs.first_name = 'Укажите имя';
  if (!form.email.trim()) {
    errs.email = 'Укажите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = 'Неверный формат email';
  }
  if (form.phone && form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Не менее 10 цифр';
  if (!form.password) {
    errs.password = 'Укажите пароль';
  } else if (form.password.length < 8) {
    errs.password = 'Минимум 8 символов';
  }
  return errs;
}

export function validateLogin(form: { email: string; password: string }): FieldErrors {
  const errs: FieldErrors = {};
  if (!form.email.trim()) errs.email = 'Укажите email';
  if (!form.password) errs.password = 'Укажите пароль';
  return errs;
}
