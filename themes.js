// ============ THEMES & APPEARANCE ============

const THEMES = {
  midnight: {
    name: 'Midnight',
    bg: '#0f0f14',
    surface: '#1a1a24',
    surfaceHover: '#22222e',
    border: '#2a2a3a',
    text: '#e8e6f0',
    textMuted: '#8888a0',
    isDark: true
  },
  charcoal: {
    name: 'Charcoal',
    bg: '#141418',
    surface: '#1e1e26',
    surfaceHover: '#282832',
    border: '#333340',
    text: '#e0dfe8',
    textMuted: '#7e7e96',
    isDark: true
  },
  ocean: {
    name: 'Ocean',
    bg: '#0b1628',
    surface: '#111d33',
    surfaceHover: '#182640',
    border: '#1f3352',
    text: '#d8e4f0',
    textMuted: '#6889a8',
    isDark: true
  },
  forest: {
    name: 'Forest',
    bg: '#0c1410',
    surface: '#131f18',
    surfaceHover: '#1a2b22',
    border: '#243830',
    text: '#d8ece2',
    textMuted: '#6a9880',
    isDark: true
  },
  light: {
    name: 'Light',
    bg: '#f5f5f7',
    surface: '#ffffff',
    surfaceHover: '#f0f0f2',
    border: '#e0e0e6',
    text: '#1a1a2e',
    textMuted: '#6e6e82',
    isDark: false
  },
  cream: {
    name: 'Cream',
    bg: '#faf8f4',
    surface: '#ffffff',
    surfaceHover: '#f5f3ef',
    border: '#e8e4dc',
    text: '#2c2820',
    textMuted: '#8a8478',
    isDark: false
  }
};

const ACCENT_COLORS = [
  { name: 'Violet',  hex: '#7c6aef' },
  { name: 'Rose',    hex: '#e8558a' },
  { name: 'Coral',   hex: '#ef6a5a' },
  { name: 'Amber',   hex: '#e8a030' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Cyan',    hex: '#22d3ee' },
  { name: 'Blue',    hex: '#5b8def' },
  { name: 'Pink',    hex: '#d46ae8' }
];

let currentTheme = 'midnight';
let currentAccent = '#7c6aef';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  currentTheme = themeId;

  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-hover', theme.surfaceHover);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);

  // Adjust card hover for light themes
  document.body.classList.toggle('light-theme', !theme.isDark);

  // Adjust date picker icon and select for light themes
  const calIcon = !theme.isDark ? 'invert(0.3)' : 'invert(0.7)';
  root.style.setProperty('--calendar-icon-filter', calIcon);

  saveAppearance();
  renderThemeSwitcher();
  updateParticleColors();
}

function applyAccent(hex) {
  currentAccent = hex;
  const root = document.documentElement;
  const { r, g, b } = hexToRgb(hex);

  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.1)`);

  saveAppearance();
  renderThemeSwitcher();
  updateTimerDisplay();
}

function saveAppearance() {
  localStorage.setItem('appearance', JSON.stringify({
    theme: currentTheme,
    accent: currentAccent
  }));
}

function loadAppearance() {
  const saved = localStorage.getItem('appearance');
  if (saved) {
    const { theme, accent } = JSON.parse(saved);
    if (theme) applyTheme(theme);
    if (accent) applyAccent(accent);
  }
}

function renderThemeSwitcher() {
  const container = document.getElementById('themeSwitcher');
  if (!container) return;

  const themeButtons = Object.entries(THEMES).map(([id, t]) =>
    `<button class="theme-swatch ${currentTheme === id ? 'active' : ''}"
       onclick="applyTheme('${id}')"
       title="${t.name}"
       style="background: ${t.bg}; border-color: ${currentTheme === id ? 'var(--accent)' : t.border};">
       <span class="theme-swatch-inner" style="background: ${t.surface};"></span>
    </button>`
  ).join('');

  const accentButtons = ACCENT_COLORS.map(c =>
    `<button class="accent-swatch ${currentAccent === c.hex ? 'active' : ''}"
       onclick="applyAccent('${c.hex}')"
       title="${c.name}"
       style="background: ${c.hex};">
    </button>`
  ).join('');

  container.innerHTML = `
    <div class="switcher-row">
      <span class="switcher-label">Theme</span>
      <div class="swatch-group">${themeButtons}</div>
    </div>
    <div class="switcher-row">
      <span class="switcher-label">Accent</span>
      <div class="swatch-group">${accentButtons}</div>
    </div>
  `;
}
