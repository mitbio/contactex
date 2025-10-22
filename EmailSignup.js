// Email/password/confirm form. Calls onSubmit(email, password) when valid.
export default function renderEmailSignup({ onSubmit, onBack }) {
  const div = document.createElement('div');
  div.style.width = '100%';
  div.innerHTML = `
    <img src="https://img.icons8.com/ios/50/000000/add-user-group-man-man.png" class="logo" alt="Sign up"/>
    <div class="signup-title" style="margin-bottom:10px;">Sign up with Email</div>
    <div class="signup-desc" style="margin-bottom:28px;">Enter your email and create a password.</div>
    <form class="email-signup-form" autocomplete="off" novalidate>
      <div class="error-message"></div>
      <input type="email" name="email" placeholder="Email" autocomplete="email" required />
      <input type="password" name="password" placeholder="Password" autocomplete="new-password" required minlength="6"/>
      <input type="password" name="confirm" placeholder="Confirm Password" autocomplete="new-password" required minlength="6"/>
      <button type="submit">Continue</button>
    </form>
  `;
  const form = div.querySelector('form');
  const errorDiv = div.querySelector('.error-message');
  form.onsubmit = (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirm.value;
    if (!validateEmail(email)) {
      errorDiv.textContent = 'Enter a valid email address.';
      return;
    }
    if (password.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters.';
      return;
    }
    if (password !== confirm) {
      errorDiv.textContent = 'Passwords do not match.';
      return;
    }
    onSubmit(email, password);
  };
  return div;
}

function validateEmail(email) {
  // Simple email regex
  return /\S+@\S+\.\S+/.test(email);
}