/**
 * Alex Craft - Full-Stack & AI Engineer Portfolio
 * Lógica: Fondo de Cables de Red, Filtros, Alternador de Tema y Audio Sintético
 */

document.addEventListener('DOMContentLoaded', () => {
  initNetworkBackground();
  initThemeToggle();
  initProjectFilters();
  initScrollTop();
});

/* ==========================================================================
   1. FONDO CON MOVIMIENTO: RED DE CABLES Y PAQUETES DE DATOS
   ========================================================================== */
function initNetworkBackground() {
  const canvas = document.getElementById('network-canvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let nodes = [];
  let packets = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createGrid();
  }

  // Crea una cuadrícula lógica tipo circuito / cableado de red
  function createGrid() {
    nodes = [];
    const spacing = 120;
    const cols = Math.floor(width / spacing) + 1;
    const rows = Math.floor(height / spacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Añadir una ligera variación pixelada ortogonal
        nodes.push({
          x: i * spacing,
          y: j * spacing,
          connections: []
        });
      }
    }

    // Vincular nodos ortogonalmente (horizontal y vertical como cables de servidores)
    nodes.forEach((node, idx) => {
      const right = nodes[idx + rows];
      const down = nodes[idx + 1];

      if (right && Math.random() > 0.3) {
        node.connections.push(right);
      }
      if (down && (idx + 1) % rows !== 0 && Math.random() > 0.3) {
        node.connections.push(down);
      }
    });

    // Iniciar paquetes de datos
    packets = [];
    for (let p = 0; p < 25; p++) {
      spawnPacket();
    }
  }

  function spawnPacket() {
    if (nodes.length === 0) return;
    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (startNode.connections.length > 0) {
      const targetNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
      packets.push({
        x: startNode.x,
        y: startNode.y,
        startX: startNode.x,
        startY: startNode.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        progress: 0,
        speed: 0.008 + Math.random() * 0.015,
        targetNode: targetNode
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Obtener variables de color según el tema actual
    const style = getComputedStyle(document.body);
    const cableColor = style.getPropertyValue('--cable-color').trim() || 'rgba(0,255,200,0.2)';
    const packetColor = style.getPropertyValue('--packet-color').trim() || '#00ffcc';

    // 1. Dibujar Cables de Red
    ctx.lineWidth = 2;
    ctx.strokeStyle = cableColor;
    ctx.beginPath();
    nodes.forEach(node => {
      node.connections.forEach(target => {
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
      });
    });
    ctx.stroke();

    // 2. Dibujar y Actualizar Paquetes de Datos viajando
    ctx.fillStyle = packetColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = packetColor;

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed;

      p.x = p.startX + (p.targetX - p.startX) * p.progress;
      p.y = p.startY + (p.targetY - p.startY) * p.progress;

      // Dibujar paquete con forma de byte/bloque pixelado
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);

      if (p.progress >= 1) {
        // El paquete llegó a su destino, buscar nueva conexión
        const currentNode = p.targetNode;
        if (currentNode.connections.length > 0 && Math.random() > 0.2) {
          const nextTarget = currentNode.connections[Math.floor(Math.random() * currentNode.connections.length)];
          p.startX = currentNode.x;
          p.startY = currentNode.y;
          p.targetX = nextTarget.x;
          p.targetY = nextTarget.y;
          p.targetNode = nextTarget;
          p.progress = 0;
        } else {
          packets.splice(i, 1);
          spawnPacket();
        }
      }
    }

    ctx.shadowBlur = 0; // Reset para optimizar
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ==========================================================================
   2. ALTERNADOR DE MODO OSCURO / MODO CLARO (BOTÓN BLOQUE MINECRAFT)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlTag = document.documentElement;

  // Cargar preferencia guardada o respetar la del sistema
  const savedTheme = localStorage.getItem('mc_theme') || 'dark';
  htmlTag.setAttribute('data-theme', savedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlTag.setAttribute('data-theme', newTheme);
    localStorage.setItem('mc_theme', newTheme);

    // Efecto de sonido sintético tipo Minecraft "Wood/Stone Click" con Web Audio
    playMinecraftClickSound();
  });
}

// Generador de sonido retro sin dependencias externas
function playMinecraftClickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Si el navegador bloquea audio sin interacción previa
  }
}

/* ==========================================================================
   3. FILTROS INTERACTIVOS DE PROYECTOS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('#project-filters .mc-btn-filter');
  const projects = document.querySelectorAll('.project-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projects.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('d-none');
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.classList.add('d-none');
        }
      });
      playMinecraftClickSound();
    });
  });
}

/* ==========================================================================
   4. BOTÓN VOLVER ARRIBA
   ========================================================================== */
function initScrollTop() {
  const btnTop = document.getElementById('btn-back-to-top');

  btnTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    playMinecraftClickSound();
  });
}