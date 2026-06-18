(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousels = document.querySelectorAll('[data-hero-carousel]');
  carousels.forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    show(0);
    start();
  });

  var scopes = document.querySelectorAll('[data-search-scope]');
  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var select = scope.querySelector('[data-year-select]');
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }
    function apply() {
      var query = normalize(input ? input.value : '');
      var year = select ? select.value : '';
      var activeFilter = '';
      filters.forEach(function (button) {
        if (button.classList.contains('is-active')) {
          activeFilter = button.getAttribute('data-filter-value') || '';
        }
      });
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        var shouldShow = matchQuery && matchYear && matchFilter;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        filters.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        apply();
      });
    });
    apply();
  });

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function (box) {
    var video = box.querySelector('video[data-stream]');
    var button = box.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;
    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function playVideo() {
      attachStream();
      box.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
    box.addEventListener('click', function (event) {
      if (event.target === video || button.contains(event.target)) {
        return;
      }
      playVideo();
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
