// ============ ANIMATED PARTICLES + GRADIENT ============

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame = null;
let gradientAngle = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.3 + 0.05;
    this.fadeDir = Math.random() > 0.5 ? 1 : -1;
    this.fadeSpeed = Math.random() * 0.003 + 0.001;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity += this.fadeDir * this.fadeSpeed;

    if (this.opacity <= 0.02) { this.fadeDir = 1; this.opacity = 0.02; }
    if (this.opacity >= 0.35) { this.fadeDir = -1; this.opacity = 0.35; }

    if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) {
      this.reset();
    }
  }

  draw() {
    const { r, g, b } = getParticleColor();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
    ctx.fill();
  }
}

let particleColor = { r: 124, g: 106, b: 239 };

function updateParticleColors() {
  const hex = currentAccent || '#7c6aef';
  particleColor = hexToRgb(hex);
}

function getParticleColor() {
  return particleColor;
}

function initParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function drawGradient() {
  gradientAngle += 0.002;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const x1 = cx + Math.cos(gradientAngle) * cx;
  const y1 = cy + Math.sin(gradientAngle) * cy;
  const x2 = cx + Math.cos(gradientAngle + Math.PI) * cx;
  const y2 = cy + Math.sin(gradientAngle + Math.PI) * cy;

  const { r, g, b } = particleColor;
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.03)`);
  grad.addColorStop(0.5, 'transparent');
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.02)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGradient();
  particles.forEach(p => { p.update(); p.draw(); });
  animFrame = requestAnimationFrame(animate);
}

function startParticles() {
  if (animFrame) return;
  initParticles(60);
  animate();
}

function stopParticles() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Start automatically
startParticles();
