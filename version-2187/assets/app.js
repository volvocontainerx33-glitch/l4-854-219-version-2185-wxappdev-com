(function () {
  var navButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var parent = list.parentElement || document;
    var input = parent.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(parent.querySelectorAll('[data-card-filter]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var currentFilter = 'all';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = currentFilter === 'all' || text.indexOf(currentFilter) !== -1;
        card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentFilter = chip.getAttribute('data-card-filter') || 'all';
        chips.forEach(function (other) {
          other.classList.toggle('active', other === chip);
        });
        applyFilter();
      });
    });
  });

  document.querySelectorAll('[data-video-src]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-trigger');
    var src = box.getAttribute('data-video-src');
    var hlsInstance = null;

    function bindSource() {
      if (!video || !src || video.getAttribute('data-bound') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }

      video.setAttribute('data-bound', 'true');
    }

    function playVideo() {
      if (!video) {
        return;
      }
      bindSource();
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.then(function () {
          box.classList.add('is-playing');
        }).catch(function () {
          box.classList.remove('is-playing');
        });
      } else {
        box.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
