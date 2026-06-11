/* ============================================
   SWEET CRUMBS BAKERY – JavaScript
   ============================================ */

'use strict';

/* ---- NAVBAR ---- */
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - var_navH() - 60;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}
function var_navH() { return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 74; }
window.addEventListener('scroll', updateActiveLink, { passive: true });


/* ---- SCROLL ANIMATIONS ---- */
const animatedEls = document.querySelectorAll('[data-animate]');
const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('in-view'), delay);
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOpts);

animatedEls.forEach(el => scrollObserver.observe(el));


/* ---- GALLERY LIGHTBOX ---- */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxCap   = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');

const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
let currentGalIdx   = 0;

function openLightbox(idx) {
  currentGalIdx = idx;
  const item    = galleryItems[idx];
  const img     = item.querySelector('.gallery-img');
  const cap     = item.querySelector('.gallery-caption');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = cap ? cap.textContent.trim() : '';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function shiftLightbox(dir) {
  currentGalIdx = (currentGalIdx + dir + galleryItems.length) % galleryItems.length;
  openLightbox(currentGalIdx);
}

galleryItems.forEach((item, idx) => item.addEventListener('click', () => openLightbox(idx)));
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => shiftLightbox(-1));
lightboxNext.addEventListener('click', () => shiftLightbox(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   shiftLightbox(-1);
  if (e.key === 'ArrowRight')  shiftLightbox(1);
});


/* ---- TESTIMONIALS SLIDER ---- */
const track     = document.getElementById('testi-track');
const dotsWrap  = document.getElementById('testi-dots');
const prevBtn   = document.getElementById('testi-prev');
const nextBtn   = document.getElementById('testi-next');
const cards     = Array.from(track.querySelectorAll('.testi-card'));

let currentSlide = 0;
let autoSlide;
let startX = 0;

function getSlidesVisible() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function getTotalSlides() {
  return Math.ceil(cards.length / getSlidesVisible());
}

function buildDots() {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < getTotalSlides(); i++) {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === currentSlide ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
}

function goToSlide(idx) {
  const total = getTotalSlides();
  currentSlide = ((idx % total) + total) % total;
  const cardW  = cards[0].offsetWidth + 24; // gap
  track.style.transform = `translateX(-${currentSlide * getSlidesVisible() * cardW}px)`;
  dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) =>
    d.classList.toggle('active', i === currentSlide));
  resetAutoSlide();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function resetAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(nextSlide, 5000);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Touch/swipe
track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40) dx < 0 ? nextSlide() : prevSlide();
});

window.addEventListener('resize', () => { buildDots(); goToSlide(0); });

buildDots();
resetAutoSlide();


/* ---- ORDER FORM ---- */
const orderForm   = document.getElementById('orderForm');
const formSuccess = document.getElementById('formSuccess');

if (orderForm) {
  // Set min date for delivery
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    dateInput.min = today.toISOString().split('T')[0];
  }

  orderForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }
    const btn = document.getElementById('form-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';

    setTimeout(() => {
      orderForm.hidden = true;
      formSuccess.hidden = false;
      orderForm.reset();
    }, 1400);
  });
}


/* ---- CONTACT FORM ---- */
const contactForm    = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    const btn = document.getElementById('contact-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';

    setTimeout(() => {
      contactForm.hidden = true;
      contactSuccess.hidden = false;
      contactForm.reset();
    }, 1400);
  });
}


/* ---- NEWSLETTER FORM ---- */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn   = document.getElementById('newsletter-btn');
    const input = document.getElementById('newsletter-email');
    if (!input.value || !input.checkValidity()) return;
    btn.textContent = '✓';
    btn.style.background = 'linear-gradient(135deg, #25d366, #128c7e)';
    input.value = '';
    input.placeholder = 'You\'re subscribed! 🎉';
    setTimeout(() => {
      btn.textContent = '→';
      btn.style.background = '';
      input.placeholder = 'Your email address';
    }, 3500);
  });
}


/* ---- BACK TO TOP ---- */
const backToTop = document.getElementById('back-to-top');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


/* ---- SMOOTH ANCHOR SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = var_navH() + 12;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ---- HERO PARALLAX ---- */
const heroBg = document.querySelector('.hero-bg-img');
window.addEventListener('scroll', () => {
  if (!heroBg) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.25}px)`;
  }
}, { passive: true });


/* ---- PRODUCT CARD TILT ---- */
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const x     = (e.clientX - rect.left) / rect.width  - 0.5;
    const y     = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all 0.5s ease';
    setTimeout(() => card.style.transition = '', 500);
  });
});


/* ---- WHY-CARD COUNT-UP ---- */
function animateCountUp(el, end, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = Math.ceil(end / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, end);
    el.textContent = start + suffix;
    if (start >= end) clearInterval(timer);
  }, 16);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const nums = entry.target.querySelectorAll('.stat-num');
    nums.forEach(num => {
      const raw = num.textContent.trim();
      const digits = parseInt(raw.replace(/\D/g, ''));
      const suffix = raw.replace(/[0-9]/g, '');
      if (!isNaN(digits)) animateCountUp(num, digits, suffix);
    });
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);


/* ---- ANNOUNCEMENT BAR PAUSE ON HOVER ---- */
const annoTrack = document.querySelector('.announcement-track');
if (annoTrack) {
  annoTrack.addEventListener('mouseenter', () => annoTrack.style.animationPlayState = 'paused');
  annoTrack.addEventListener('mouseleave', () => annoTrack.style.animationPlayState = 'running');
}


/* ---- LAZY IMAGE FALLBACK ---- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
  });
});


/* ---- INIT ---- */
window.dispatchEvent(new Event('scroll'));
console.log('%c🥐 Sweet Crumbs Bakery', 'color:#c9a227;font-size:20px;font-weight:bold;font-family:Georgia,serif;');
console.log('%cHandcrafted with love. Est. 2012.', 'color:#a67c52;font-size:13px;font-style:italic;');
