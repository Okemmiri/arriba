/* ============================================================
   The Arriba Entertainment Centre — main.js
   Navigation, scroll effects, gallery lightbox, form handling
   ============================================================ */

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var preloader = document.getElementById('preloader');
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var yearEl = document.getElementById('year');

  /* ---------- Preloader ---------- */
  function hidePreloader() {
    if (!preloader) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('done');
        document.body.classList.remove('locked');
      }, 400);
    });
    setTimeout(function () {
      preloader.classList.add('done');
      document.body.classList.remove('locked');
    }, 1600);
  }

  /* ---------- Header on scroll ---------- */
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    setActiveLink();
  }

  /* ---------- Mobile nav ---------- */
  function toggleNav(force) {
    var open = typeof force === 'boolean' ? force : !mainNav.classList.contains('open');
    mainNav.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('locked', open);
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () { toggleNav(); });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { toggleNav(false); });
  });

  /* ---------- Active link highlighting ---------- */
  function setActiveLink() {
    var pos = window.scrollY + 120;
    var currentIndex = 0;

    document.querySelectorAll('section[id]').forEach(function (section, index) {
      if (section.offsetTop <= pos) currentIndex = index;
    });

    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    var id = sections[currentIndex] ? sections[currentIndex].id : '';

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxClose = document.getElementById('lightbox-close');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));

    if (!lightbox) return;

    function open(src, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = caption || 'Gallery image';
      lightboxCaption.textContent = caption || '';
      lightbox.hidden = false;
      document.body.classList.add('locked');
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('locked');
    }

    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        open(item.href, item.getAttribute('data-caption'));
      });
    });

    lightboxClose.addEventListener('click', close);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.hidden && e.key === 'Escape') close();
    });
  }

  /* ---------- Reservation form ---------- */
  function initForm() {
    var form = document.getElementById('reservation-form');
    if (!form) return;

    var note = document.getElementById('form-note');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var fields = Array.prototype.slice.call(form.querySelectorAll('[required], select'));
      fields.forEach(function (field) {
        var bad = !field.value || field.value.trim() === '' ||
          (field.tagName === 'SELECT' && field.value === '');
        field.classList.toggle('error-box', bad);
        if (bad) valid = false;
      });

      var date = form.querySelector('#date');
      if (date && date.value) {
        var chosen = new Date(date.value + 'T00:00:00').getTime();
        if (chosen < Date.now() - 86400000) {
          date.classList.add('error-box');
          valid = false;
        }
      }
      if (!form.querySelector('#guests') || !form.querySelector('#guests').value) {
        valid = false;
      }

      if (!valid) {
        note.textContent = 'Oops — please fill in the highlighted fields and try again.';
        note.className = 'form-note error';
        return;
      }

      note.textContent = 'Thank you! Your request has been received. We will confirm within 24 hours. Arriba!';
      note.className = 'form-note success';
      form.reset();
      fields.forEach(function (f) { f.classList.remove('error-box'); });
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.classList.remove('error-box');
      });
    });
  }

  /* ---------- Current year ---------- */
  function initYear() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('locked');
    hidePreloader();
    initReveal();
    initLightbox();
    initForm();
    initYear();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Clean up stale body lock after nav closes */
    var removeLock = function () { setTimeout(function () { document.body.classList.remove('locked'); }, 600); };
    window.addEventListener('load', removeLock);
  });
})();