
(() => {
  const qs = sel => document.querySelector(sel);
  const welcome = qs('#welcome-screen');
  const desktop = qs('#desktop');
  const consoleDiv = qs('#console');
  const consoleInput = qs('#console-input');
  const themeToggle = qs('#theme-toggle');

  const files = [
    { name: 'about.txt', win: 'about-window' },
    { name: 'projects.txt', win: 'projects-window' },
    { name: 'resume.txt', win: 'resume-window' },
    { name: 'contact.txt', win: 'contact-window' }
  ];

  /* ---------- bootstrap ---------- */
  function enterSite() {
    welcome.hidden = true;
    desktop.hidden = false;
    consoleDiv.hidden = false;
    consoleInput.focus();
    printToConsole('Type "help" and press Enter for commands.');
  }
  document.addEventListener('click', enterSite, { once: true });
  document.addEventListener('keydown', enterSite, { once: true });

  /* ---------- console ---------- */
  consoleInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = consoleInput.value.trim().toLowerCase();
    consoleInput.value = '';
    if (!cmd) return;
    if (cmd === 'dir') {
      listFiles();
    } else if (cmd === 'help') {
      showHelp();
    } else if (files.some(f => f.name === cmd)) {
      openWindow(cmd);
    } else {
      printToConsole('Unrecognized command. Type "help" for list.');
    }
  });

  function printToConsole(text) {
    const line = document.createElement('div');
    line.textContent = text;
    consoleDiv.insertBefore(line, consoleInput.parentNode);
    // keep last 6 lines
    [...consoleDiv.querySelectorAll('div')].slice(0,-6).forEach(n=>n.remove());
  }

  function listFiles() {
    printToConsole(files.map(f => f.name).join('    '));
  }

  function showHelp() {
    printToConsole('Available commands:');
    printToConsole('dir               list files');
    printToConsole('<filename>        open file window');
    printToConsole('help              show this message');
  }

  function openWindow(fname) {
    const match = files.find(f => f.name === fname);
    if (!match) return;
    const win = document.getElementById(match.win);
    if (win) {
      win.hidden = false;
      bringToFront(win);
    }
  }

  /* ---------- draggable windows (delegated) ---------- */
  let dragTarget = null, offsetX=0, offsetY=0;

  function bringToFront(win) {
    win.style.zIndex = Date.now();
  }

  document.addEventListener('pointerdown', (e) => {
    const bar = e.target.closest('.title-bar');
    if (!bar) return;
    const win = bar.closest('.window');
    dragTarget = win;
    bringToFront(win);
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.setPointerCapture(e.pointerId);
  });

  document.addEventListener('pointermove', (e) => {
    if (!dragTarget) return;
    dragTarget.style.left = (e.clientX - offsetX) + 'px';
    dragTarget.style.top  = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('pointerup', () => { dragTarget = null; });

  /* ---------- theme ---------- */
  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = localStorage.getItem('theme') || (prefersDark ? 'win98' : 'win95');
  setTheme(initialTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'win95' ? 'win98' : 'win95');
  });

  /* ---------- PWA install ---------- */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    const banner = document.createElement('div');
    banner.className = 'window draggable';
    banner.style.width = '260px';
    banner.style.position = 'fixed';
    banner.style.bottom = '16px';
    banner.style.left = '16px';
    banner.innerHTML = '<div class="title-bar">Install?</div><div class="window-body"><p>Install this site as an app for offline access.</p><button id="install-btn">Install</button></div>';
    document.body.appendChild(banner);

    banner.querySelector('#install-btn').addEventListener('click', async () => {
      banner.remove();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
  }

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }
})();
