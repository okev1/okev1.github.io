
(() => {
  const welcome = document.getElementById('welcome-screen');
  const desktop = document.getElementById('desktop');
  const consoleDiv = document.getElementById('console');
  const consoleInput = document.getElementById('console-input');
  const themeToggle = document.getElementById('theme-toggle');
  const files = [
    { name: 'about.txt', win: 'about-window' },
    { name: 'projects.txt', win: 'projects-window' },
    { name: 'resume.txt', win: 'resume-window' },
    { name: 'contact.txt', win: 'contact-window' }
  ];
  // Helper to show desktop
  function enterSite() {
    welcome.hidden = true;
    desktop.hidden = false;
    consoleDiv.hidden = false;
  }
  // Welcome screen interactions
  document.addEventListener('click', enterSite, { once: true });
  document.addEventListener('keydown', enterSite, { once: true });

  // DOS prompt behaviour
  consoleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = consoleInput.value.trim().toLowerCase();
      consoleInput.value = '';
      if (cmd === 'dir') {
        listFiles();
      } else if (files.some(f => f.name === cmd)) {
        openWindow(cmd);
      } else {
        // Unknown command - just ignore
      }
    }
  });

  function listFiles() {
    // Output the list visually by adding a temporary line above input
    let list = document.createElement('div');
    list.textContent = files.map(f => f.name).join('    ');
    list.style.whiteSpace = 'pre';
    consoleDiv.insertBefore(list, consoleInput.parentNode);
    // auto remove after 5s
    setTimeout(() => list.remove(), 5000);
  }

  function openWindow(fname) {
    const match = files.find(f => f.name === fname);
    if (!match) return;
    const win = document.getElementById(match.win);
    if (win) {
      win.hidden = false;
      win.style.zIndex = Date.now(); // bring to front
    }
  }

  // Draggable windows
  const draggable = document.querySelectorAll('.draggable');
  draggable.forEach(win => {
    const bar = win.querySelector('.title-bar');
    let offsetX = 0, offsetY = 0;
    bar.addEventListener('pointerdown', (e) => {
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.setPointerCapture(e.pointerId);
      win.style.zIndex = Date.now();
      function move(ev) {
        win.style.left = (ev.clientX - offsetX) + 'px';
        win.style.top = (ev.clientY - offsetY) + 'px';
      }
      function up(ev) {
        win.removeEventListener('pointermove', move);
        win.removeEventListener('pointerup', up);
      }
      win.addEventListener('pointermove', move);
      win.addEventListener('pointerup', up);
    });
  });

  // Theme handling
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

  // PWA install banner
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    const banner = document.createElement('div');
    banner.className = 'window';
    banner.style.width = '250px';
    banner.style.bottom = '16px';
    banner.style.left = '16px';
    banner.style.position = 'fixed';
    banner.innerHTML = '<div class="title-bar">Install?</div><div class="window-body"><p>Install this site as an app for offline access.</p><button id="install-btn">Install</button></div>';
    document.body.appendChild(banner);
    banner.querySelector('#install-btn').addEventListener('click', async () => {
      banner.remove();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA install', outcome);
      deferredPrompt = null;
    });
  }

  // Service worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  }
})();
