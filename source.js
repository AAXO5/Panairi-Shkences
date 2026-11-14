// Signup feedback stays separate from the standalone password demonstrator.
const rules = {
  minlen: password => [...password].length >= 8,
  maxlen: password => [...password].length <= 64,
  lower: password => /\p{Ll}/u.test(password),
  upper: password => /\p{Lu}/u.test(password),
  num: password => /\p{Nd}/u.test(password),
  sym: password => /[^\p{L}\p{N}\s]/u.test(password),
};

const reasons = {
  minlen: {
    reason: 'Passwordi është tepër i shkurtë!',
    description: 'Fjalëkalimi është i dobët dhe mund të zbulohet lehtësisht. Përdor të paktën 8 karaktere.',
  },
  maxlen: {
    reason: 'Passwordi është tepër i gjatë!',
    description: 'Për këtë formular përdor deri në 64 karaktere.',
  },
  lower: {
    reason: 'Passwordi nuk ka shkronja të vogla!',
    description: 'Shto shkronja të vogla për më shumë larmi në fjalëkalim.',
  },
  upper: {
    reason: 'Passwordi nuk ka shkronja të mëdha!',
    description: 'Shto shkronja të mëdha për më shumë larmi në fjalëkalim.',
  },
  num: {
    reason: 'Passwordi nuk ka numra!',
    description: 'Përfshi edhe numra në fjalëkalimin tënd.',
  },
  sym: {
    reason: 'Passwordi nuk ka simbole speciale!',
    description: 'Përfshi një simbol special, si !, @ ose #.',
  },
};

const passwordInput = document.getElementById('password');
const signupContent = document.querySelector('.lab-content');
const feedback = document.getElementById('signup-feedback');

// Build the warning and simulation cards here, without inserting password text.
feedback.innerHTML = `
  <section id="issuebox" lang="sq" aria-labelledby="issue-reason">
    <h3 id="issue-reason"></h3>
    <p id="issue-description"></p>
  </section>
  <section class="cracking-card" id="cracking-card" data-risk="high" aria-labelledby="cracking-title">
    <h3 id="cracking-title">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="14" r="8"/>
        <path d="M12 10v4M9 2h6M12 2v4M18 7l2-2"/>
      </svg>
      Password Cracking Simulation
    </h3>
    <p class="cracking-label">Estimated cracking time</p>
    <output class="cracking-time" id="cracking-time" lang="sq">—</output>
    <dl class="cracking-details">
      <div><dt>Attack method</dt><dd>Brute Force</dd></div>
      <div><dt>Risk level</dt><dd id="cracking-risk">HIGH</dd></div>
    </dl>
    <p class="cracking-note" lang="sq">Simulim ilustrues: 1 milion kombinime/sekondë, mesatarisht.</p>
  </section>
`;

const issueBox = document.getElementById('issuebox');
const issueReason = document.getElementById('issue-reason');
const issueDescription = document.getElementById('issue-description');
const strengthContainer = document.getElementById('password-strength');
const strengthText = document.getElementById('strength-text');
const strengthFill = document.getElementById('strength-fill');
const crackingCard = document.getElementById('cracking-card');
const crackingTime = document.getElementById('cracking-time');
const crackingRisk = document.getElementById('cracking-risk');
const ruleCount = Object.keys(rules).length;

function estimateCrackingTime(password) {
  // Uniform brute-force model: half the possible combinations / 1,000,000 per second.
  // Logs keep very long inputs finite. This is an illustration, not a real attack.
  let alphabet = 0;
  if (/\p{Ll}/u.test(password)) alphabet += 26;
  if (/\p{Lu}/u.test(password)) alphabet += 26;
  if (/\p{Nd}/u.test(password)) alphabet += 10;
  if (/[^\p{L}\p{N}\s]/u.test(password)) alphabet += 32;
  if (/\s/u.test(password)) alphabet += 1;
  if (alphabet === 0) alphabet = 1;
  const logSeconds = [...password].length * Math.log10(alphabet) - Math.log10(2 * 1_000_000);
  const risk = logSeconds < Math.log10(3600) ? 'high' : logSeconds < Math.log10(31_557_600) ? 'medium' : 'low';
  if (logSeconds > Math.log10(31_557_600) + 12) {
    return {time: '> 1 trilion vjet', risk};
  }
  const seconds = 10 ** logSeconds;
  if (seconds < 0.1) return {time: '< 0.1 sekonda', risk};
  const units = [
    [31_557_600, 'vjet'],
    [86_400, 'ditë'],
    [3600, 'orë'],
    [60, 'minuta'],
    [1, 'sekonda'],
  ];
  const [divisor, unit] = units.find(([size]) => seconds >= size) || units[units.length - 1];
  const amount = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(seconds / divisor);
  return {time: `${amount} ${unit}`, risk};
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const signupCard = document.querySelector('.signup-container');
const signupForm = signupCard.querySelector('form');
const signupEmail = document.getElementById('signup-email');
const challenge = signupCard.querySelector('.cyber-challenge');
const challengePanel = challenge.querySelector('.challenge-panel');
const challengeTitle = document.getElementById('challenge-title');
const challengeQuestion = challenge.querySelector('.challenge-question');
const challengeDescription = challenge.querySelector('.challenge-description');
let challengeAnimation;
const textTransitions = new Map();
const motionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
let feedbackVisible = false;
let visibilityAnimation;
let layoutAnimation;

function stopTextTransition(element) {
  const state = textTransitions.get(element);
  if (!state) return;
  textTransitions.delete(element);
  state.animation?.cancel();
  element.textContent = state.value;
}

function updateText(element, value, animate) {
  const running = textTransitions.get(element);
  if (reducedMotion.matches || !animate) {
    stopTextTransition(element);
    element.textContent = value;
    return;
  }
  if (running) {
    // Keep the fade in progress and coalesce rapid typing into the latest result.
    running.value = value;
    return;
  }
  if (element.textContent === value) return;

  const state = {value, animation: null};
  textTransitions.set(element, state);
  (async () => {
    try {
      while (textTransitions.get(element) === state && element.textContent !== state.value) {
        state.animation = element.animate([
          {opacity: 1, transform: 'translateY(0)'},
          {opacity: 0, transform: 'translateY(-3px)'},
        ], {duration: 180, easing: 'ease-in', fill: 'forwards'});
        await state.animation.finished;
        if (textTransitions.get(element) !== state) return;
        element.textContent = state.value;
        state.animation.cancel();
        state.animation = element.animate([
          {opacity: 0, transform: 'translateY(3px)'},
          {opacity: 1, transform: 'translateY(0)'},
        ], {duration: 420, easing: motionEasing, fill: 'forwards'});
        await state.animation.finished;
        state.animation.cancel();
      }
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      if (textTransitions.get(element) === state) textTransitions.delete(element);
    }
  })();
}

function animateSignupLayout(before) {
  layoutAnimation?.cancel();
  if (reducedMotion.matches) return;
  const after = signupCard.getBoundingClientRect();
  if (!after.width || !after.height) return;
  // Ease the form into its new position as the feedback column opens or closes.
  layoutAnimation = signupCard.animate([
    {
      transformOrigin: 'top left',
      transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
    },
    {transformOrigin: 'top left', transform: 'none'},
  ], {duration: 650, easing: motionEasing});
}

function finishHidingFeedback() {
  if (feedbackVisible) return;
  const before = signupCard.getBoundingClientRect();
  feedback.hidden = true;
  signupContent.classList.remove('has-feedback');
  issueBox.classList.remove('show');
  for (const element of textTransitions.keys()) {
    if (feedback.contains(element)) stopTextTransition(element);
  }
  animateSignupLayout(before);
}

function setFeedbackVisible(visible) {
  if (visible === feedbackVisible) return;
  const wasHidden = feedback.hidden;
  const current = getComputedStyle(feedback);
  const opacity = wasHidden ? 0 : Number(current.opacity);
  const transform = wasHidden ? 'translateY(12px)' : current.transform;
  const before = signupCard.getBoundingClientRect();
  visibilityAnimation?.cancel();
  feedbackVisible = visible;
  feedback.inert = !visible;

  if (visible) {
    feedback.hidden = false;
    feedback.removeAttribute('aria-hidden');
    signupContent.classList.add('has-feedback');
    issueBox.classList.add('show');
    animateSignupLayout(before);
    if (!reducedMotion.matches) {
      visibilityAnimation = feedback.animate([
        {opacity, transform},
        {opacity: 1, transform: 'translateY(0)'},
      ], {duration: 650, easing: motionEasing});
    }
  } else {
    feedback.setAttribute('aria-hidden', 'true');
    if (reducedMotion.matches) {
      finishHidingFeedback();
      return;
    }
    visibilityAnimation = feedback.animate([
      {opacity, transform},
      {opacity: 0, transform: 'translateY(8px)'},
    ], {duration: 420, easing: 'ease-in-out', fill: 'forwards'});
    visibilityAnimation.finished.then(() => {
      finishHidingFeedback();
      visibilityAnimation.cancel();
    }).catch(error => {
      if (error.name !== 'AbortError') throw error;
    });
  }
}

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  challengeAnimation?.cancel();
  visibilityAnimation?.cancel();
  layoutAnimation?.cancel();
  for (const element of textTransitions.keys()) stopTextTransition(element);
  if (!feedbackVisible) finishHidingFeedback();
});

function updateSignupFeedback() {
  passwordInput.setCustomValidity('');
  const password = passwordInput.value;
  const animateChanges = feedbackVisible && !feedback.hidden;
  if (password === '') {
    setFeedbackVisible(false);
    strengthContainer.style.display = 'none';
    strengthFill.style.width = '0%';
    passwordInput.removeAttribute('aria-invalid');
    return;
  }

  const failures = Object.keys(rules).filter(rule => !rules[rule](password));
  const met = ruleCount - failures.length;
  const passes = failures.length === 0;
  const color = passes ? '#4ade80' : !rules.minlen(password) || !rules.maxlen(password) || met <= 3 ? '#f87171' : '#fbbf24';
  strengthContainer.style.display = 'flex';
  strengthText.style.color = color;
  strengthFill.style.backgroundColor = color;
  strengthFill.style.width = `${25 + Math.max(0, (met - 2) / (ruleCount - 2)) * 75}%`;
  updateText(strengthText, passes ? 'Password strong enough' : 'Password too weak!', animateChanges);
  passwordInput.setAttribute('aria-invalid', String(!passes));

  if (!passes) {
    const info = reasons[failures[0]];
    updateText(issueReason, info.reason, animateChanges);
    updateText(issueDescription, info.description, animateChanges);
    const estimate = estimateCrackingTime(password);
    updateText(crackingTime, estimate.time, animateChanges);
    updateText(crackingRisk, estimate.risk.toUpperCase(), animateChanges);
    crackingCard.dataset.risk = estimate.risk;
  }
  setFeedbackVisible(!passes);
}

function setChallengeCompleted(completed) {
  if (challenge.classList.contains('is-complete') === completed) return;
  const before = signupCard.getBoundingClientRect();
  challenge.classList.toggle('is-complete', completed);
  challengeTitle.textContent = completed ? 'CHALLENGE COMPLETED!' : 'CYBER CHALLENGE';
  challengeQuestion.textContent = completed ? 'You Passed the Cybersecurity Challenge!' : 'Can You Beat the Hacker?';
  challengeDescription.textContent = completed ? 'Think smart. Stay secure.' : 'Create a strong password to complete the challenge.';
  challengeAnimation?.cancel();
  animateSignupLayout(before);
  if (!reducedMotion.matches) {
    challengeAnimation = challengePanel.animate([
      {opacity: 0.2, transform: 'translateY(6px)'},
      {opacity: 1, transform: 'translateY(0)'},
    ], {duration: 650, easing: motionEasing});
  }
}

passwordInput.addEventListener('input', () => {
  setChallengeCompleted(false);
  updateSignupFeedback();
});
signupEmail.addEventListener('input', () => setChallengeCompleted(false));
signupForm.addEventListener('submit', event => {
  event.preventDefault();
  updateSignupFeedback();
  if (!Object.values(rules).every(check => check(passwordInput.value))) {
    passwordInput.setCustomValidity('Use 8–64 characters with uppercase and lowercase letters, a number, and a special symbol.');
  }
  if (!signupForm.reportValidity()) return;
  setChallengeCompleted(true);
});
updateSignupFeedback();

// Password strength demonstrator.
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

// Secure password generator and clipboard controls.
(() => {
  const output = document.getElementById('generated-password');
  const generateButton = document.getElementById('generate-password');
  const copyButton = document.getElementById('copy-password');
  const status = document.getElementById('generator-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const groups = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    '!@#$%^&*()-_=+[]{};:,.<>/?|~',
  ];
  const alphabet = groups.join('');
  const length = 20;
  const random = new Uint32Array(1);
  // Reject the remainder rather than biasing some characters with a plain modulo.
  const limit = Math.floor(0x1_0000_0000 / alphabet.length) * alphabet.length;
  let copyReset;
  let outputAnimation;
  let refreshAnimation;
  let copyVersion = 0;

  function randomCharacter() {
    do {
      crypto.getRandomValues(random);
    } while (random[0] >= limit);
    return alphabet[random[0] % alphabet.length];
  }

  function resetCopyState() {
    clearTimeout(copyReset);
    delete copyButton.dataset.copied;
    copyButton.setAttribute('aria-label', 'Copy generated password');
    copyButton.title = 'Copy password';
  }

  function generate(announce = true) {
    let password;
    // Rejection sampling ensures every result has all four character types.
    do {
      password = Array.from({length}, randomCharacter).join('');
    } while (!groups.every(group => [...password].some(character => group.includes(character))));

    output.value = password;
    copyVersion++;
    resetCopyState();
    status.textContent = announce ? 'New secure password generated.' : '';
    outputAnimation?.cancel();
    refreshAnimation?.cancel();
    if (announce && !reduceMotion.matches) {
      outputAnimation = output.animate([
        {opacity: 0.3, transform: 'translateY(3px)'},
        {opacity: 1, transform: 'translateY(0)'},
      ], {duration: 500, easing: 'ease-in-out'});
      refreshAnimation = generateButton.querySelector('svg').animate([
        {transform: 'rotate(0deg)'},
        {transform: 'rotate(360deg)'},
      ], {duration: 650, easing: 'ease-in-out'});
    }
  }

  function legacyCopy() {
    const previousFocus = document.activeElement;
    output.focus({preventScroll: true});
    output.select();
    output.setSelectionRange(0, output.value.length);
    const copied = document.execCommand('copy');
    if (copied) previousFocus?.focus({preventScroll: true});
    return copied;
  }

  copyButton.addEventListener('click', async () => {
    const password = output.value;
    const version = ++copyVersion;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(password);
        copied = true;
      }
    } catch {
      // Local file previews and some browser settings need the selection fallback.
    }
    if (version !== copyVersion) return;
    if (!copied) {
      try { copied = legacyCopy(); } catch { copied = false; }
    }
    if (copied) {
      copyButton.dataset.copied = 'true';
      copyButton.setAttribute('aria-label', 'Password copied');
      copyButton.title = 'Copied!';
      status.textContent = 'Password copied to clipboard.';
      clearTimeout(copyReset);
      copyReset = setTimeout(resetCopyState, 2000);
    } else {
      output.focus({preventScroll: true});
      output.select();
      status.textContent = 'Select the password and copy it manually.';
    }
  });

  generateButton.addEventListener('click', () => generate());
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      outputAnimation?.cancel();
      refreshAnimation?.cancel();
    }
  });
  generate(false);
})();
