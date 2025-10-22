// OTP block: 7 input boxes, submit button, calls onSubmit(otp) (as string) on complete
export default function renderOtpVerification({ onSubmit, email }) {
  const div = document.createElement('div');
  div.className = 'otp-block';
  div.innerHTML = `
    <div class="signup-title" style="margin-bottom:14px;">Verify your Email</div>
    <div class="signup-desc" style="margin-bottom:24px;">
      We sent a 7-digit code to <b>${escapeHtml(email)}</b><br>
      Please enter it below:
    </div>
    <form autocomplete="off" novalidate>
      <div class="otp-inputs">
        ${Array(7).fill().map((_,i) => `<input type="text" inputmode="numeric" maxlength="1" required />`).join('')}
      </div>
      <button type="submit" style="margin-top:6px;">Verify</button>
    </form>
    <div class="error-message"></div>
  `;
  const form = div.querySelector('form');
  const inputs = Array.from(div.querySelectorAll('.otp-inputs input'));
  const errorDiv = div.querySelector('.error-message');
  // Move focus on input
  inputs.forEach((input, idx) => {
    input.addEventListener('input', e => {
      const val = e.target.value.replace(/\D/g,'');
      e.target.value = val;
      if (val && idx < inputs.length - 1) {
        inputs[idx+1].focus();
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx-1].focus();
      }
    });
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const code = inputs.map(i => i.value).join('');
    if (code.length !== 7) {
      errorDiv.textContent = 'Enter all 7 digits!';
      return;
    }
    // Here you'd call your backend to verify OTP
    onSubmit(code);
  };
  return div;
}

function escapeHtml(str) {
  return (str+'').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s]);
}