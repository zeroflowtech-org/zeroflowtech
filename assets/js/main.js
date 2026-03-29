// Purpose: Shared JavaScript for ZeroFlowTech — menu, scroll animations, GSAP, typing effect, counters

document.addEventListener('DOMContentLoaded', () => {

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
  }

});
