(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-nav');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || 'search.html';
        window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    var stage = document.querySelector('.hero-stage');
    if (stage) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', start);
    }

    activate(0);
    start();
  }

  function setupImageFallback() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.display = 'none';
      });
    });
  }

  function setupFilters() {
    var panel = document.querySelector('.filter-panel');
    var list = document.querySelector('.movie-list');
    if (!panel || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .ranking-table-row'));
    var search = document.getElementById('filter-search');
    var region = document.getElementById('filter-region');
    var type = document.getElementById('filter-type');
    var year = document.getElementById('filter-year');
    var countNode = document.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && search) {
      search.value = initialQuery;
    }

    function yearMatches(value, filterValue) {
      if (!filterValue) {
        return true;
      }
      var matchedYear = String(value || '').match(/\d{4}/);
      var numericYear = matchedYear ? Number(matchedYear[0]) : 0;
      if (filterValue === '2020') {
        return numericYear >= 2020;
      }
      if (filterValue === '2010') {
        return numericYear >= 2010 && numericYear <= 2019;
      }
      if (filterValue === '2000') {
        return numericYear >= 2000 && numericYear <= 2009;
      }
      if (filterValue === '1990') {
        return numericYear > 0 && numericYear < 1990;
      }
      return true;
    }

    function applyFilters() {
      var query = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1 && haystack.indexOf(regionValue) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1 && haystack.indexOf(typeValue) === -1) {
          ok = false;
        }
        if (!yearMatches(card.dataset.year, yearValue)) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  ready(function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupImageFallback();
    setupFilters();
  });
})();
