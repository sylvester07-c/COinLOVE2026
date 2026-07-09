/* Oluwabukunmi & Chinonso — Wedding Website JavaScript */

/* ── Countdown Timer ─────────────────────── */
const WEDDING = new Date('2026-09-19T07:30:00');

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const diff = WEDDING - Date.now();
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="font-family:var(--serif);font-size:1.8rem;color:var(--rose-light);letter-spacing:.1em">Today is the Day! 🎉</p>';
    return;
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById('days').textContent    = pad(d);
  document.getElementById('hours').textContent   = pad(h);
  document.getElementById('minutes').textContent = pad(m);
  document.getElementById('seconds').textContent = pad(s);
}
tick();
setInterval(tick, 1000);

/* ── Navbar ──────────────────────────────── */
const navbar = document.getElementById('navbar');
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile Menu ─────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

// Overlay for closing menu by clicking outside
const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

function openMenu() {
  hamburger.classList.add('active');
  navLinks.classList.add('open');
  overlay.classList.add('show');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  overlay.classList.remove('show');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('active') ? closeMenu() : openMenu();
});
overlay.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
});

/* ── Scroll Animations ───────────────────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling elements slightly
      const siblings = entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)');
      let delay = 0;
      siblings.forEach(sib => {
        if (sib === entry.target || entry.target.contains(sib)) return;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ── FAQ Accordion ───────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Open clicked if it was closed
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ── Gallery Lightbox ────────────────────── */
const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');
const lightboxCount = document.getElementById('lightboxCounter');

const imageSrcs = galleryItems.map(item => item.querySelector('img').src);
let currentIdx  = 0;

function showLightbox(idx) {
  currentIdx = idx;
  lightboxImg.src = imageSrcs[currentIdx];
  lightboxImg.alt = galleryItems[currentIdx].querySelector('img').alt;
  lightbox.style.display = 'flex';
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateCounter();
  lightboxClose.focus();
}
function hideLightbox() {
  lightbox.classList.remove('active');
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
  galleryItems[currentIdx].focus();
}
function prevImg() {
  currentIdx = (currentIdx - 1 + imageSrcs.length) % imageSrcs.length;
  lightboxImg.src = imageSrcs[currentIdx];
  updateCounter();
}
function nextImg() {
  currentIdx = (currentIdx + 1) % imageSrcs.length;
  lightboxImg.src = imageSrcs[currentIdx];
  updateCounter();
}
function updateCounter() {
  lightboxCount.textContent = `${currentIdx + 1} / ${imageSrcs.length}`;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => showLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLightbox(i); }
  });
});

lightboxClose.addEventListener('click', hideLightbox);
lightboxPrev.addEventListener('click', prevImg);
lightboxNext.addEventListener('click', nextImg);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) hideLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      hideLightbox();
  if (e.key === 'ArrowLeft')   prevImg();
  if (e.key === 'ArrowRight')  nextImg();
});

// Touch/swipe support for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? nextImg() : prevImg();
});

/* ── RSVP Form ───────────────────────────── */
const rsvpForm    = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');
const formError   = document.getElementById('formError');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async e => {
    e.preventDefault();
    formError.textContent = '';

    // Basic validation — ensure at least one event is checked
    const checked = rsvpForm.querySelectorAll('input[name="events[]"]:checked');
    if (checked.length === 0) {
      formError.textContent = 'Please select at least one event you will attend.';
      return;
    }

    const submitBtn = rsvpForm.querySelector('.rsvp-submit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    const action = rsvpForm.getAttribute('action');
    const formData = new FormData(rsvpForm);

    // --- Demo mode: Formspree not yet configured ---
    if (action.includes('YOUR_FORM_ID')) {
      const entry = Object.fromEntries(formData);
      entry['events[]'] = Array.from(checked).map(c => c.value).join(', ');
      entry.timestamp = new Date().toISOString();
      const saved = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
      saved.push(entry);
      localStorage.setItem('weddingRSVPs', JSON.stringify(saved));
      setTimeout(() => {
        rsvpForm.style.display  = 'none';
        rsvpSuccess.style.display = 'block';
      }, 700);
      return;
    }

    // --- Live mode: send to Formspree ---
    try {
      const res = await fetch(action, {
        method:  'POST',
        body:    formData,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        rsvpForm.style.display    = 'none';
        rsvpSuccess.style.display = 'block';
      } else {
        const data = await res.json().catch(() => ({}));
        formError.textContent = data.error
          || 'Something went wrong. Please try again or contact us directly.';
        submitBtn.textContent = 'Send My RSVP 💌';
        submitBtn.disabled = false;
      }
    } catch {
      formError.textContent = 'Connection error. Please check your internet and try again.';
      submitBtn.textContent = 'Send My RSVP 💌';
      submitBtn.disabled = false;
    }
  });
}

/* ── Active nav link on scroll ───────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Gallery: Staggered Scroll Reveal ────── */
const galleryRevealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const item = entry.target;
    const idx  = galleryItems.indexOf(item);
    // Each item waits an extra 90ms per position
    item.style.transitionDelay = `${idx * 0.09}s`;
    item.classList.add('revealed');
    galleryRevealObs.unobserve(item);
    // Clear the delay once done so hover transitions aren't delayed
    item.addEventListener('transitionend', () => {
      item.style.transitionDelay = '';
    }, { once: true });
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

galleryItems.forEach(item => galleryRevealObs.observe(item));

/* ── Gallery: 3D Tilt on Hover (desktop) ── */
// Skip on touch devices — tilt is distracting without a mouse
const isTouchDevice = window.matchMedia('(hover: none)').matches;

if (!isTouchDevice) {
  galleryItems.forEach(item => {
    let rafId = null;

    item.addEventListener('mousemove', e => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = item.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        // Map cursor position → rotation (-8° to +8°)
        const rx   = ((e.clientY - cy) / (rect.height / 2)) * -7;
        const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  7;
        item.style.transition = 'box-shadow 0.4s ease';
        item.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      });
    });

    item.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      // Smooth spring-back
      item.style.transition = 'transform 0.55s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.4s ease';
      item.style.transform  = '';
      // Re-allow the entrance transition after spring-back completes
      setTimeout(() => { item.style.transition = ''; }, 580);
    });
  });
}
