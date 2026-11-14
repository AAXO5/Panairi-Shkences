// This standalone demonstrator never copies its value into the signup form.
(() => {
  const demo = document.querySelector('.password-demo');
  const input = document.getElementById('demo-password');
  const meter = document.getElementById('demo-meter');
  const status = document.getElementById('demo-strength-text');
  const segments = [...meter.children];
  const checks = {
    length: value => [...value].length >= 15,
    upper: value => /\p{Lu}/u.test(value),
    lower: value => /\p{Ll}/u.test(value),
    number: value => /\p{Nd}/u.test(value),
    symbol: value => /[^\p{L}\p{N}\s]/u.test(value),
  };

  function updateDemo() {
    const value = input.value;
    let score = 0;

    for (const [rule, check] of Object.entries(checks)) {
      const passed = check(value);
      const item = demo.querySelector(`[data-demo-rule="${rule}"]`);
      score += Number(passed);
      item.classList.toggle('is-met', passed);
      item.querySelector('.demo-rule-icon').textContent = passed ? '✓' : '×';
      item.querySelector('.sr-only').textContent = passed ? 'Plotësuar: ' : 'Pa plotësuar: ';
    }

    const strength = value === '' ? 'empty' : score === 5 ? 'strong' : score >= 3 ? 'medium' : 'weak';
    const labels = {
      empty: 'Type a demo password',
      weak: 'Weak Password',
      medium: 'Medium Password',
      strong: 'Strong Password',
    };

    demo.dataset.strength = strength;
    status.textContent = labels[strength];
    meter.setAttribute('aria-valuenow', String(score));
    meter.setAttribute('aria-valuetext', `${score} of 5 criteria met`);
    segments.forEach((segment, index) => segment.classList.toggle('is-active', index < score));
  }

  input.addEventListener('input', updateDemo);
  updateDemo();
})();
