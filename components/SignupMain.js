// Renders the initial signup block with "Sign up with Email" and Google button
export default function renderSignupMain({ onEmailClick, onGoogleClick }) {
  const div = document.createElement('div');
  div.style.width = '100%';
  div.innerHTML = `
    <img src="https://img.icons8.com/ios/50/000000/add-user-group-man-man.png" class="logo" alt="Sign up"/>
    <div class="signup-title">Create your account</div>
    <div class="signup-desc">Sign up to bring your words, data,<br> and teams together at no cost.</div>
    <button class="email-signup-btn" type="button">Sign up with Email</button>
    <button class="google-btn" type="button" aria-label="Sign up with Google">
      <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google icon" />
      Sign up with Google
    </button>
    <div class="divider">Or use your email</div>
  `;
  div.querySelector('.email-signup-btn').onclick = onEmailClick;
  div.querySelector('.google-btn').onclick = onGoogleClick;
  return div;
}