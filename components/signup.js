// Main orchestrator for the signup flow
import renderSignupMain from './components/SignupMain.js';
import renderEmailSignup from './components/EmailSignup.js';
import renderOtpVerification from './components/OtpVerification.js';

// Tracks current block DOM for GSAP transitions
let currentBlock = null;

function slideOutLeft(node, cb) {
  gsap.to(node, {
    x: -420,
    opacity: 0,
    duration: 0.6,
    ease: "power3.in",
    onComplete: cb
  });
}

function slideInFromRight(node) {
  gsap.fromTo(node,
    { x: 420, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
  );
}

// Switches component with GSAP animations
function switchBlock(newBlock) {
  const root = document.getElementById('signup-root');
  if (currentBlock) {
    slideOutLeft(currentBlock, () => {
      root.removeChild(currentBlock);
      root.appendChild(newBlock);
      slideInFromRight(newBlock);
      currentBlock = newBlock;
    });
  } else {
    root.appendChild(newBlock);
    slideInFromRight(newBlock);
    currentBlock = newBlock;
  }
}

function gotoOtp(email) {
  const otpBlock = renderOtpVerification({
    onSubmit: (otp) => {
      // Here, you'd call your backend to verify OTP, then redirect
      switchBlock(successBlock());
    },
    email
  });
  switchBlock(otpBlock);
}

function gotoEmailSignup() {
  const emailBlock = renderEmailSignup({
    onSubmit: (email, password) => {
      // Here, you'd create user in Firebase (to be implemented)
      gotoOtp(email);
    },
    onBack: () => {
      // Not used, but could allow going back
      window.location.reload();
    }
  });
  switchBlock(emailBlock);
}

function successBlock() {
  const div = document.createElement('div');
  div.className = 'otp-block';
  div.innerHTML = `
    <div class="signup-title" style="margin-bottom:14px;">Success!</div>
    <div class="signup-desc" style="margin-bottom:24px;">Your account has been created and verified.</div>
    <a class="dummy-link" href="/dashboard">Go to Dashboard</a>
  `;
  return div;
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  const mainBlock = renderSignupMain({
    onEmailClick: gotoEmailSignup,
    onGoogleClick: () => {
      // Placeholder: Firebase Google Auth code goes here!
      alert('Google signup: Insert Firebase Auth logic here.');
    }
  });
  switchBlock(mainBlock);
});