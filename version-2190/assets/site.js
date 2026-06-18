(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  const carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-slide-dot]'));
    const next = carousel.querySelector('[data-carousel-next]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const cards = Array.from(filterRoot.querySelectorAll('[data-movie-card]'));
    const keyword = document.querySelector('[data-filter-keyword]');
    const type = document.querySelector('[data-filter-type]');
    const year = document.querySelector('[data-filter-year]');
    const region = document.querySelector('[data-filter-region]');
    const count = document.querySelector('[data-filter-count]');

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const applyFilters = function () {
      const q = normalize(keyword && keyword.value);
      const t = normalize(type && type.value);
      const y = normalize(year && year.value);
      const r = normalize(region && region.value);
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const okKeyword = !q || text.includes(q);
        const okType = !t || normalize(card.dataset.type).includes(t);
        const okYear = !y || normalize(card.dataset.year).includes(y);
        const okRegion = !r || normalize(card.dataset.region).includes(r);
        const visibleNow = okKeyword && okType && okYear && okRegion;

        card.classList.toggle('hidden-by-filter', !visibleNow);

        if (visibleNow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
      }
    };

    [keyword, type, year, region].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const searchResults = document.querySelector('[data-search-results]');

  if (searchResults && Array.isArray(window.SITE_MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-page-input]');

    if (input) {
      input.value = query;
    }

    const render = function (items) {
      if (!items.length) {
        searchResults.innerHTML = '<div class="search-results-empty">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      searchResults.innerHTML = items.map(function (movie) {
        return [
          '<article class="movie-card" data-movie-card>',
          '<a class="poster-link" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">',
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
          '<span class="play-badge">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '<p class="card-meta">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</p>',
          '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    };

    const runSearch = function (value) {
      const terms = String(value || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
      const items = window.SITE_MOVIES.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' ').toLowerCase();

        return !terms.length || terms.every(function (term) {
          return haystack.includes(term);
        });
      }).slice(0, 240);

      render(items);
    };

    const escapeHtml = function (value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    if (input) {
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }

    runSearch(query);
  }
})();
