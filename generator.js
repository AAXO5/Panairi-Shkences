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
