// ============ FULLSCREEN FOCUS MODE ============

let isFocusMode = false;

function toggleFocusMode() {
  isFocusMode = !isFocusMode;
  document.body.classList.toggle('focus-mode', isFocusMode);

  const btn = document.getElementById('focusModeBtn');
  if (btn) {
    btn.title = isFocusMode ? 'Exit focus mode' : 'Enter focus mode';
    btn.classList.toggle('active', isFocusMode);
  }

  // Auto-start timer when entering focus mode if not running
  if (isFocusMode && !isRunning) {
    toggleTimer();
  }
}

function exitFocusOnEscape(e) {
  if (e.key === 'Escape' && isFocusMode) {
    toggleFocusMode();
  }
}

document.addEventListener('keydown', exitFocusOnEscape);

// ============ MOTIVATIONAL QUOTES ============

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" }
];

let currentQuoteIndex = -1;

function getNextQuote() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * QUOTES.length);
  } while (newIndex === currentQuoteIndex && QUOTES.length > 1);
  currentQuoteIndex = newIndex;
  return QUOTES[currentQuoteIndex];
}

function renderQuote() {
  const el = document.getElementById('quoteDisplay');
  if (!el) return;

  const quote = getNextQuote();
  el.classList.remove('quote-visible');

  // Fade out then in
  setTimeout(() => {
    el.querySelector('.quote-text').textContent = `"${quote.text}"`;
    el.querySelector('.quote-author').textContent = `— ${quote.author}`;
    el.classList.add('quote-visible');
  }, 300);
}

// Show a new quote when a session switches
const _originalSwitchPhase = switchPhase;
switchPhase = function() {
  _originalSwitchPhase();
  renderQuote();
};

// Initial quote
document.addEventListener('DOMContentLoaded', () => {
  renderQuote();
});
