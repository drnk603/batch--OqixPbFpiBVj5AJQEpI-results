window.__app = window.__app || {};
(function () {
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  function throttle(fn, limit) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function initAOS() {
    if (__app.aosInit) return;
    __app.aosInit = true;
    if (!window.AOS) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-aos]').forEach(function (el) {
        el.removeAttribute('data-aos');
      });
      return;
    }
    document.querySelectorAll('[data-aos][data-avoid-layout="true"]').forEach(function (el) {
      el.removeAttribute('data-aos');
    });
    AOS.init({
      once: false,
      duration: 600,
      easing: 'ease-out',
      offset: 120,
      mirror: false,
      disable: function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });
    __app.refreshAOS = function () {
      try { AOS.refresh(); } catch (e) {}
    };
  }

  function initNav() {
    if (__app.navInit) return;
    __app.navInit = true;
    var toggle = document.querySelector('.c-nav__toggle');
    var nav = document.querySelector('.c-nav#main-nav');
    if (!toggle || !nav) return;
    var list = nav.querySelector('.c-nav__list');
    var focusableSelectors = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

    function getFocusable() {
      return list ? Array.prototype.slice.call(list.querySelectorAll(focusableSelectors)) : [];
    }

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
      var items = getFocusable();
      if (items.length) items[0].focus();
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function () {
      isOpen() ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
        return;
      }
      if (e.key === 'Tab' && isOpen()) {
        var items = getFocusable();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    nav.querySelectorAll('.c-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768) {
          closeMenu();
        }
      });
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    }, 150));
  }

  function initAnchors() {
    if (__app.anchorsInit) return;
    __app.anchorsInit = true;
    var isHome = location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '';

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === '#' || href === '#!') return;
      a.addEventListener('click', function (e) {
        var targetId = href.substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          var header = document.querySelector('.l-header');
          var offset = header ? header.offsetHeight : 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    if (!isHome) {
      document.querySelectorAll('a[href^="/#"]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        a.addEventListener('click', function (e) {
          var hash = href.substring(1);
          var targetId = hash.substring(1);
          var target = document.getElementById(targetId);
          if (target) {
            e.preventDefault();
            var header = document.querySelector('.l-header');
            var offset = header ? header.offsetHeight : 80;
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        });
      });
    }
  }

  function initActiveNav() {
    if (__app.activeNavInit) return;
    __app.activeNavInit = true;
    var path = location.pathname;
    var hash = location.hash;
    var isHomePath = path === '/' || path === '/index.html' || path === '';

    document.querySelectorAll('.c-nav__link').forEach(function (link) {
      link.removeAttribute('aria-current');
      link.classList.remove('is-active');
      var href = link.getAttribute('href');
      if (!href) return;
      var hashIndex = href.indexOf('#');
      var linkPath = hashIndex > -1 ? href.substring(0, hashIndex) : href;
      var linkHash = hashIndex > -1 ? href.substring(hashIndex) : '';
      var isHomeLink = linkPath === '' || linkPath === '/' || linkPath === '/index.html';

      if (isHomePath && isHomeLink) {
        if (!linkHash || hash === linkHash || linkHash === '#hero') {
          link.setAttribute('aria-current', 'page');
          link.classList.add('is-active');
        }
      } else if (!isHomePath && linkPath && path.endsWith(linkPath)) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      }
    });
  }

  function initImages() {
    if (__app.imagesInit) return;
    __app.imagesInit = true;

    document.querySelectorAll('img').forEach(function (img) {
      var isCritical = img.classList.contains('c-logo__img') || img.hasAttribute('data-critical');
      if (!isCritical && !img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }
      img.addEventListener('error', function () {
        if (img._fallbackApplied) return;
        img._fallbackApplied = true;
        var w = img.getAttribute('width') || 200;
        var h = img.getAttribute('height') || 150;
        var encodedText = 'Bild nicht verf%C3%BCgbar';
        var svg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><rect width="100%25" height="100%25" fill="%23e2e6ef"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%236b7590" text-anchor="middle" dominant-baseline="middle">' + encodedText + '</text></svg>';
        img.src = svg;
        img.style.objectFit = 'contain';
        var isLogoImg = img.classList.contains('c-logo__img') || !!img.closest('.c-logo');
        if (isLogoImg) {
          img.style.maxHeight = '40px';
        }
      });
    });
  }

  function initForms() {
    if (__app.formsInit) return;
    __app.formsInit = true;

    var toastContainer = document.querySelector('.c-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'c-toast-container';
      document.body.appendChild(toastContainer);
    }

    __app.notify = function (message, type) {
      var toast = document.createElement('div');
      toast.className = 'c-toast c-toast--' + (type || 'success');
      toast.textContent = message;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toastContainer.appendChild(toast);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toast.classList.add('is-visible');
        });
      });
      setTimeout(function () {
        toast.classList.remove('is-visible');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 5000);
    };

    document.querySelectorAll('form.needs-validation').forEach(function (form) {
      if (form.dataset.initialized) return;
      form.dataset.initialized = 'true';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
          var firstInvalid = form.querySelector(':invalid');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var btn = form.querySelector('button[type="submit"]');
        var originalHTML = '';
        if (btn) {
          btn.disabled = true;
          originalHTML = btn.innerHTML;
          btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        var action = form.getAttribute('action') || 'thank_you.html';
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function (v, k) { data[k] = v; });

        fetch('process.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function () {
          window.location.href = action;
        }).catch(function () {
          window.location.href = action;
        });
      });
    });
  }

  function initAnime() {
    if (__app.animeInit) return;
    __app.animeInit = true;
    if (!window.anime) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var cardSelectors = '.card, .feature-card, .animal-card';
    document.querySelectorAll(cardSelectors).forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        anime({ targets: card, translateY: -4, duration: 200, easing: 'easeOutQuad' });
      });
      card.addEventListener('mouseleave', function () {
        anime({ targets: card, translateY: 0, duration: 200, easing: 'easeOutQuad' });
      });
    });

    var btnSelectors = '.btn-primary, .btn-success';
    document.querySelectorAll(btnSelectors).forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        anime({ targets: btn, scale: 1.03, duration: 150, easing: 'easeOutQuad' });
      });
      btn.addEventListener('mouseleave', function () {
        anime({ targets: btn, scale: 1, duration: 150, easing: 'easeOutQuad' });
      });
    });
  }

  function initMobileFlexGaps() {
    if (__app.flexGapInit) return;
    __app.flexGapInit = true;

    function applyGaps() {
      var isMobile = window.innerWidth < 576;
      document.querySelectorAll('.d-flex').forEach(function (el) {
        var children = el.children;
        if (children.length <= 1) return;
        var classes = Array.prototype.slice.call(el.classList);
        var hasGap = classes.some(function (c) {
          return c.startsWith('gap-') || c.startsWith('g-');
        });
        if (isMobile && !hasGap) {
          el.classList.add('gap-3');
          el.dataset.gapAdded = 'true';
        } else if (!isMobile && el.dataset.gapAdded) {
          el.classList.remove('gap-3');
          delete el.dataset.gapAdded;
        }
      });
    }

    applyGaps();
    window.addEventListener('resize', debounce(applyGaps, 150), { passive: true });
  }

  function initFooterYear() {
    if (__app.footerYearInit) return;
    __app.footerYearInit = true;
    var el = document.getElementById('footer-year');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  __app.init = function () {
    if (__app.initialized) return;
    __app.initialized = true;
    initAOS();
    initNav();
    initAnchors();
    initActiveNav();
    initImages();
    initForms();
    initAnime();
    initMobileFlexGaps();
    initFooterYear();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }
})();