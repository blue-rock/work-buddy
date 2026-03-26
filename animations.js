// ============ CRAZY ANIMATIONS ============

// ---- 1. MOUSE SPARKLE TRAIL ----
const sparkleCanvas = document.createElement('canvas');
sparkleCanvas.id = 'sparkleCanvas';
sparkleCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
document.body.appendChild(sparkleCanvas);
const sparkleCtx = sparkleCanvas.getContext('2d');

function resizeSparkleCanvas() {
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}
resizeSparkleCanvas();
window.addEventListener('resize', resizeSparkleCanvas);

let sparkles = [];
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  for (let i = 0; i < 3; i++) {
    sparkles.push({
      x: mouseX + (Math.random() - 0.5) * 20,
      y: mouseY + (Math.random() - 0.5) * 20,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 3,
      speedY: (Math.random() - 0.5) * 3 - 1,
      life: 1,
      decay: Math.random() * 0.03 + 0.015,
      hue: Math.random() * 60 - 30, // offset from accent
      type: Math.random() > 0.5 ? 'star' : 'circle'
    });
  }
});

function drawStar(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Date.now() * 0.003);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function animateSparkles() {
  sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  sparkles = sparkles.filter(s => s.life > 0);

  sparkles.forEach(s => {
    s.x += s.speedX;
    s.y += s.speedY;
    s.speedY += 0.05; // gravity
    s.life -= s.decay;

    const { r, g, b } = hexToRgb(currentAccent || '#7c6aef');
    const color = `rgba(${Math.min(255, r + s.hue)}, ${Math.min(255, g + s.hue)}, ${Math.min(255, b + s.hue)}, ${s.life})`;

    if (s.type === 'star') {
      drawStar(sparkleCtx, s.x, s.y, s.size, color);
    } else {
      sparkleCtx.beginPath();
      sparkleCtx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      sparkleCtx.fillStyle = color;
      sparkleCtx.fill();
    }
  });

  requestAnimationFrame(animateSparkles);
}
animateSparkles();


// ---- 2. CLICK RIPPLE SHOCKWAVE ----
document.addEventListener('click', (e) => {
  const ripple = document.createElement('div');
  ripple.className = 'click-ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  document.body.appendChild(ripple);

  // Spawn ring burst
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'click-burst-particle';
    particle.style.left = e.clientX + 'px';
    particle.style.top = e.clientY + 'px';
    particle.style.setProperty('--angle', `${i * 45}deg`);
    particle.style.setProperty('--distance', `${40 + Math.random() * 30}px`);
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }

  ripple.addEventListener('animationend', () => ripple.remove());
});


// ---- 3. CONFETTI ON TASK COMPLETE ----
const _origToggleTodo = toggleTodo;
toggleTodo = function(id) {
  const todo = todos.find(t => t.id === id);
  const wasCompleted = todo ? todo.completed : false;
  _origToggleTodo(id);
  if (todo && !wasCompleted && todo.completed) {
    // Find the checkbox position
    launchConfetti();
  }
};

function launchConfetti() {
  const colors = ['#7c6aef', '#e8558a', '#4ade80', '#facc15', '#60a5fa', '#fb923c', '#22d3ee', '#d46ae8'];
  const confettiCount = 80;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const shape = Math.random() > 0.5 ? 'confetti-rect' : 'confetti-circle';

    confetti.classList.add(shape);
    confetti.style.setProperty('--color', color);
    confetti.style.left = startX + 'px';
    confetti.style.top = '-10px';
    confetti.style.setProperty('--end-x', `${(Math.random() - 0.5) * 400}px`);
    confetti.style.setProperty('--end-y', `${window.innerHeight + 50}px`);
    confetti.style.setProperty('--rotation', `${Math.random() * 1080}deg`);
    confetti.style.setProperty('--delay', `${Math.random() * 0.3}s`);
    confetti.style.setProperty('--duration', `${1.5 + Math.random() * 1.5}s`);

    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}


// ---- 4. 3D CARD TILT ON HOVER ----
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    card.style.transition = 'transform 0.1s ease';

    // Glare effect
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.04), var(--surface))`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    card.style.transition = 'transform 0.5s ease';
    card.style.background = 'var(--surface)';
  });
});


// ---- 5. GLITCH TEXT EFFECT ON TITLE ----
const title = document.querySelector('.header h1');
if (title) {
  const originalText = title.textContent;
  title.setAttribute('data-text', originalText);
  title.classList.add('glitch-text');

  // Random glitch trigger
  setInterval(() => {
    if (Math.random() > 0.85) {
      title.classList.add('glitching');
      setTimeout(() => title.classList.remove('glitching'), 200);
    }
  }, 2000);
}


// ---- 6. MORPHING BLOB BEHIND TIMER ----
function createMorphBlob() {
  const ringContainer = document.querySelector('.progress-ring-container');
  if (!ringContainer) return;

  const blob = document.createElement('div');
  blob.className = 'morph-blob';
  ringContainer.style.position = 'relative';
  ringContainer.insertBefore(blob, ringContainer.firstChild);
}
createMorphBlob();


// ---- 7. BUTTON MAGNETIC PULL ----
document.querySelectorAll('.btn, .btn-add, .focus-btn, .settings-toggle, .suggestion-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform 0.1s ease';
  });
});


// ---- 8. TYPING TEXT EFFECT IN HEADER SUBTITLE ----
const subtitle = document.querySelector('.header p');
if (subtitle) {
  const phrases = [
    'Stay focused, get things done',
    'One task at a time',
    'Deep work starts here',
    'You got this today',
    'Build momentum, ship it'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeEffect() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      subtitle.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      subtitle.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    subtitle.classList.add('typing-cursor');

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 3000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500;
    }

    setTimeout(typeEffect, typingSpeed);
  }

  // Start after a delay
  setTimeout(typeEffect, 2000);
}


// ---- 9. PHASE TRANSITION EFFECTS ----
const _origSwitchPhase2 = switchPhase;
switchPhase = function() {
  const wasBreak = isBreak;
  _origSwitchPhase2();
  // After switchPhase, isBreak has flipped
  if (isBreak) {
    transitionToBreak();
  } else {
    transitionToWork();
  }
  // Smoothly shift particle colors
  if (typeof updateParticleColors === 'function') {
    if (isBreak) {
      particleColor = { r: 74, g: 222, b: 128 }; // green for break
    } else {
      updateParticleColors(); // back to accent
    }
  }
};

function transitionToBreak() {
  // Full-screen calming breath pulse
  const overlay = document.createElement('div');
  overlay.className = 'phase-transition break-transition';
  document.body.appendChild(overlay);
  overlay.addEventListener('animationend', () => overlay.remove());

  // Gentle floating particles (leaves/sparkles)
  for (let i = 0; i < 20; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'break-leaf';
    leaf.style.left = `${Math.random() * 100}vw`;
    leaf.style.setProperty('--sway', `${(Math.random() - 0.5) * 80}px`);
    leaf.style.setProperty('--delay', `${Math.random() * 1}s`);
    leaf.style.setProperty('--duration', `${3 + Math.random() * 3}s`);
    leaf.style.setProperty('--size', `${4 + Math.random() * 6}px`);
    document.body.appendChild(leaf);
    leaf.addEventListener('animationend', () => leaf.remove());
  }
}

function transitionToWork() {
  // Energizing flash + rising sparks
  const overlay = document.createElement('div');
  overlay.className = 'phase-transition work-transition';
  document.body.appendChild(overlay);
  overlay.addEventListener('animationend', () => overlay.remove());

  // Rising energy sparks
  for (let i = 0; i < 15; i++) {
    const spark = document.createElement('div');
    spark.className = 'work-spark';
    spark.style.left = `${10 + Math.random() * 80}vw`;
    spark.style.setProperty('--delay', `${Math.random() * 0.4}s`);
    spark.style.setProperty('--duration', `${1 + Math.random() * 1.5}s`);
    spark.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
}


// ---- 10. (removed - electric focus effect) ----
