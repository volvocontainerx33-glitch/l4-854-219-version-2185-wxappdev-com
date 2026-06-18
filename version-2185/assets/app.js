(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        showSlide(pos);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var redirectForms = document.querySelectorAll('[data-search-redirect]');

  redirectForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'catalog.html';
      }
    });
  });

  var panel = document.querySelector('[data-filter-panel]');

  if (panel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var textInput = panel.querySelector('[data-filter-text]');
    var yearInput = panel.querySelector('[data-filter-year]');
    var regionInput = panel.querySelector('[data-filter-region]');
    var typeInput = panel.querySelector('[data-filter-type]');
    var countBox = panel.querySelector('[data-filter-count]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    function lower(value) {
      return (value || '').toString().toLowerCase();
    }

    function cardText(card) {
      return lower([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
    }

    function updateFilter() {
      var q = lower(textInput && textInput.value).trim();
      var y = lower(yearInput && yearInput.value).trim();
      var r = lower(regionInput && regionInput.value).trim();
      var t = lower(typeInput && typeInput.value).trim();
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var match = true;

        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (y && lower(card.dataset.year) !== y) {
          match = false;
        }
        if (r && lower(card.dataset.region).indexOf(r) === -1) {
          match = false;
        }
        if (t && lower(card.dataset.type).indexOf(t) === -1) {
          match = false;
        }

        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = '当前显示 ' + visible + ' 部作品';
      }
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [textInput, yearInput, regionInput, typeInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', updateFilter);
        input.addEventListener('change', updateFilter);
      }
    });

    updateFilter();
  }

  var video = document.querySelector('[data-hls-player]');
  var overlay = document.querySelector('[data-player-overlay]');

  if (video) {
    var source = video.getAttribute('data-hls') || '';
    var loaded = false;
    var hlsPlayer = null;

    function attachSource() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(source);
        hlsPlayer.attachMedia(video);
        loaded = true;
      }
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  }
})();
