// Purpose: Shared JavaScript for ZeroFlowTech — menu, scroll animations, GSAP, typing effect, counters

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // ACTIVE NAV LINK — highlight current page
  // ============================================
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-page');
    }
  });

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const toggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // ============================================
  // SCROLL FADE ANIMATIONS (IntersectionObserver)
  // ============================================
  const fadeElements = document.querySelectorAll('.section-fade, .fade-up');

  // Safety: immediately show elements already in viewport on page load
  fadeElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  fadeElements.forEach(el => {
    if (!el.classList.contains('visible')) {
      fadeObserver.observe(el);
    }
  });

  // ============================================
  // FAQ ACCORDION
  // ============================================
  document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');
      // Close all other FAQ items in the same container
      const container = item.parentElement;
      if (container) {
        container.querySelectorAll('.faq-item.open').forEach(openItem => {
          if (openItem !== item) openItem.classList.remove('open');
        });
      }
      item.classList.toggle('open', !isOpen);
    });
  });

  // ============================================
  // ANNOUNCEMENT BAR CLOSE
  // ============================================
  const announcementClose = document.getElementById('announcement-close');
  const announcementBar = document.getElementById('announcement-bar');
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.style.transform = 'translateY(-100%)';
      announcementBar.style.opacity = '0';
      setTimeout(() => announcementBar.remove(), 300);
    });
  }

  // ============================================
  // MOBILE STICKY CTA BAR (show after scrolling past hero)
  // ============================================
  const mobileCta = document.getElementById('mobile-cta-bar');
  const heroSection = document.querySelector('.gradient-hero');
  if (mobileCta && heroSection) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          mobileCta.classList.add('visible');
        } else {
          mobileCta.classList.remove('visible');
        }
      });
    }, { threshold: 0 });
    ctaObserver.observe(heroSection);
  }

  // ============================================
  // TYPING EFFECT (Hero headline rotation)
  // ============================================
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const phrases = JSON.parse(typingEl.dataset.phrases || '[]');
    if (phrases.length > 0) {
      let phraseIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let currentText = '';
      const typeSpeed = 50;
      const deleteSpeed = 30;
      const pauseAfterType = 2000;
      const pauseAfterDelete = 400;

      function type() {
        const currentPhrase = phrases[phraseIndex];

        if (!isDeleting) {
          currentText = currentPhrase.substring(0, charIndex + 1);
          charIndex++;
        } else {
          currentText = currentPhrase.substring(0, charIndex - 1);
          charIndex--;
        }

        typingEl.textContent = currentText;

        if (!isDeleting && charIndex === currentPhrase.length) {
          setTimeout(() => { isDeleting = true; type(); }, pauseAfterType);
          return;
        }

        if (isDeleting && charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, pauseAfterDelete);
          return;
        }

        setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
      }

      // Start typing after a short delay
      setTimeout(type, 800);
    }
  }

  // ============================================
  // GSAP ANIMATIONS (if GSAP is loaded)
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Counter animation for stat numbers
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = prefix + Math.round(obj.val) + suffix;
            }
          });
        }
      });
    });

    // Staggered card reveals — use ScrollTrigger batch to avoid
    // gsap.from() hiding elements before they scroll into view
    document.querySelectorAll('.gsap-stagger-group').forEach(group => {
      const cards = group.querySelectorAll('.gsap-stagger-item');
      if (cards.length === 0) return;

      // Set initial hidden state via CSS class, not GSAP
      cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
      });

      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'transform'
          });
        }
      });
    });

    // Workflow steps stagger
    const workflowSteps = document.querySelectorAll('.workflow-step');
    if (workflowSteps.length > 0) {
      workflowSteps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
      });

      ScrollTrigger.create({
        trigger: workflowSteps[0].parentElement,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(workflowSteps, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out',
            clearProps: 'transform'
          });
        }
      });
    }

    // Before/After slide in
    const beforeCol = document.querySelector('.before-col');
    const afterCol = document.querySelector('.after-col');
    if (beforeCol && afterCol) {
      gsap.set(beforeCol, { opacity: 0, x: -40 });
      gsap.set(afterCol, { opacity: 0, x: 40 });

      ScrollTrigger.create({
        trigger: beforeCol.parentElement,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(beforeCol, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' });
          gsap.to(afterCol, { opacity: 1, x: 0, duration: 0.7, delay: 0.2, ease: 'power2.out' });
        }
      });
    }

    // Pricing cards pop
    const pricingCards = document.querySelectorAll('.pricing-card');
    if (pricingCards.length > 0) {
      pricingCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.95)';
      });

      ScrollTrigger.create({
        trigger: pricingCards[0].parentElement,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(pricingCards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'back.out(1.2)',
            clearProps: 'transform'
          });
        }
      });
    }

    // Browser mockup — don't animate if already in viewport (hero mockup)
    document.querySelectorAll('.browser-frame').forEach((frame, i) => {
      const rect = frame.getBoundingClientRect();
      if (rect.top < window.innerHeight) return; // skip if already visible (hero)

      gsap.set(frame, { opacity: 0, y: 60 });
      ScrollTrigger.create({
        trigger: frame,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(frame, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        }
      });
    });
  }

  // ============================================
  // SWIPER INIT (if Swiper is loaded)
  // ============================================
  if (typeof Swiper !== 'undefined') {
    // Screenshot carousel
    const screenshotSwiper = document.querySelector('.screenshot-swiper');
    if (screenshotSwiper) {
      new Swiper(screenshotSwiper, {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: true },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: {
          768: { slidesPerView: 1.5 },
          1024: { slidesPerView: 2 }
        }
      });
    }

    // Feature cards mobile swiper
    const featureSwiper = document.querySelector('.feature-swiper');
    if (featureSwiper) {
      new Swiper(featureSwiper, {
        slidesPerView: 1.15,
        spaceBetween: 16,
        pagination: { el: '.feature-pagination', clickable: true },
        breakpoints: {
          640: { slidesPerView: 2.2 },
          1024: { enabled: false, slidesPerView: 3 }
        }
      });
    }

    // Testimonials Swiper
    const testimonialEl = document.querySelector('.testimonials-swiper');
    if (testimonialEl) {
      new Swiper(testimonialEl, {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.testimonials-swiper .swiper-pagination', clickable: true },
        breakpoints: {
          640: { slidesPerView: 1.5 },
          1024: { slidesPerView: 2.5 }
        }
      });
    }
  }

});

// ============================================
// SCROLL PROGRESS BAR
// ============================================
const scrollBar = document.getElementById('scroll-progress-bar');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = Math.min(scrolled, 100) + '%';
  }, { passive: true });
}

// ============================================
// PRODUCT DEMO TABS
// ============================================
document.querySelectorAll('.demo-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    const container = btn.closest('section') || document;
    container.querySelectorAll('.demo-tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.demo-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + tab);
    if (panel) panel.classList.add('active');
  });
});

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ============================================
// INTEGRATION LOGOS SCROLL REVEAL (stagger)
// ============================================
const integrationLogos = document.querySelectorAll('.integration-logo');
if (integrationLogos.length > 0) {
  const logoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const logos = entry.target.querySelectorAll('.integration-logo');
        logos.forEach((logo, i) => {
          setTimeout(() => {
            logo.style.opacity = '1';
            logo.style.transform = 'translateY(0)';
          }, i * 80);
        });
        logoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const logoContainers = document.querySelectorAll('.integration-logos-wrap');
  if (logoContainers.length > 0) {
    integrationLogos.forEach(logo => {
      logo.style.opacity = '0';
      logo.style.transform = 'translateY(20px)';
      logo.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    logoContainers.forEach(container => logoObserver.observe(container));
  }
}

// ============================================
// GSAP: Hero floating cards entrance
// ============================================
if (typeof gsap !== 'undefined') {
  const floatCards = document.querySelectorAll('.hero-float-card');
  if (floatCards.length > 0) {
    gsap.from(floatCards, {
      opacity: 0,
      scale: 0.8,
      y: 20,
      stagger: 0.3,
      delay: 1.2,
      duration: 0.6,
      ease: 'back.out(1.5)'
    });
  }
}

// ============================================
// CUSTOM CURSOR — Glowing orb with ring lag
// ============================================
(function () {
  const glow = document.getElementById('cursor-glow');
  const ring = document.getElementById('cursor-ring');
  if (!glow || !ring) return;

  let mx = -200, my = -200, rx = -200, ry = -200, hasMoved = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    glow.style.left = mx + 'px';
    glow.style.top = my + 'px';
    if (!hasMoved) {
      hasMoved = true;
      glow.style.opacity = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  (function tickRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(tickRing);
  })();

  document.querySelectorAll('a, button, .tilt-card, .demo-tab-btn, .faq-toggle, label').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
})();

// ============================================
// HERO CANVAS — Constellation particle system
// ============================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  let W = 0, H = 0, particles = [];

  function initParticles() {
    particles = [];
    const count = W < 480 ? 45 : 90;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        o: Math.random() * 0.5 + 0.2
      });
    }
  }

  function resize() {
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: 600 };
    const newW = Math.floor(rect.width) || window.innerWidth;
    const newH = Math.floor(rect.height) || 600;
    if (newW !== W || newH !== H) {
      W = canvas.width = newW;
      H = canvas.height = newH;
      initParticles();
    }
  }

  // Initial sizing — try immediately, then verify after paint
  resize();
  requestAnimationFrame(resize);
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    if (!W || !H) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.strokeStyle = `rgba(129,140,248,${0.14 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148,163,184,${a.o})`;
      ctx.fill();
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================
// 3D CARD TILT — perspective hover, no-flicker
// ============================================
// Skip on touch devices entirely
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    const shine = card.querySelector('.tilt-shine');
    let leaveTimer = null;
    let isHovering = false;

    card.addEventListener('mousemove', (e) => {
      clearTimeout(leaveTimer);
      isHovering = true;
      const rect = card.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / rect.width;
      const rawY = (e.clientY - rect.top) / rect.height;
      // Clamp to inner 85% so edge positions don't overshoot
      const x = Math.min(Math.max(rawX, 0.08), 0.92);
      const y = Math.min(Math.max(rawY, 0.08), 0.92);
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (shine) {
        shine.style.setProperty('--mx', `${rawX * 100}%`);
        shine.style.setProperty('--my', `${rawY * 100}%`);
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      leaveTimer = setTimeout(() => {
        if (!isHovering) {
          card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
          card.style.transform = '';
          if (shine) shine.style.opacity = '0';
        }
      }, 90);
    });

    card.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      isHovering = true;
      card.style.transition = 'transform 0.18s ease';
      if (shine) shine.style.opacity = '1';
    });
  });
}

// ============================================
// GSAP WORD REVEAL — split section headings
// ============================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  document.querySelectorAll('.split-reveal').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w =>
      `<span class="word"><span class="word-inner">${w}</span></span>`
    ).join(' ');
    const wordInners = el.querySelectorAll('.word-inner');
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.92;
    if (alreadyInView) {
      // Above-fold: visible immediately, animate words from clipped state
      gsap.from(wordInners, {
        y: '100%', duration: 0.65, ease: 'power3.out', stagger: 0.055, delay: 0.3
      });
    } else {
      // Below-fold: hide entire heading so no blank gap while section-fade reveals parent
      gsap.set(el, { opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          // Reveal heading and animate words simultaneously
          gsap.to(el, { opacity: 1, duration: 0.1 });
          gsap.from(wordInners, { y: '110%', duration: 0.65, ease: 'power3.out', stagger: 0.055 });
        }
      });
    }
  });
}

// ============================================
// PARALLAX — hero travel floats follow mouse
// ============================================
(function () {
  const hero = document.querySelector('.gradient-hero');
  const floats = document.querySelectorAll('.gradient-hero .travel-float');
  const pins = document.querySelectorAll('.gradient-hero .dest-pin');
  if (!hero || (!floats.length && !pins.length)) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    floats.forEach((el, i) => {
      const d = (i % 3 + 1) * 10;
      el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
    });
    pins.forEach((el, i) => {
      const d = (i + 1) * 6;
      el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    floats.forEach(el => { el.style.transform = ''; });
    pins.forEach(el => { el.style.transform = ''; });
  });
})();

// ============================================
// BOARDING PASS BARCODE — procedural bars
// ============================================
(function () {
  const bc = document.getElementById('bp-barcode');
  if (!bc) return;
  const widths = [2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2,1,3,1,4,2,1,3,1,2,1,4,1,3,2,1,3,1,2,4,1,2,1];
  widths.forEach(w => {
    const bar = document.createElement('span');
    bar.style.width = w + 'px';
    bc.appendChild(bar);
  });
})();

// ============================================
// STAT-NUMBER COUNTER (case-studies.html pattern)
// ============================================
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
        });
      }
    });
  });
})();


// ============================================
// BACK TO TOP BUTTON
// ============================================
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
