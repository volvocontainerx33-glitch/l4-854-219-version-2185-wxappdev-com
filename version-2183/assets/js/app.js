(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var hero = qs('[data-hero-slider]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
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
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-grid]');
    if (!panel || !grid) {
      return;
    }

    var queryInput = qs('[data-filter-query]', panel);
    var regionSelect = qs('[data-filter-region]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var countText = qs('[data-filter-count]', panel);
    var cards = qsa('[data-card]', grid);

    var empty = document.createElement('div');
    empty.className = 'empty-message';
    empty.textContent = '没有找到匹配的影片，请尝试更换关键词或筛选条件。';
    grid.insertAdjacentElement('afterend', empty);

    function applyFilters() {
      var query = (queryInput && queryInput.value || '').trim().toLowerCase();
      var region = regionSelect && regionSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var year = yearSelect && yearSelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchType = !type || card.getAttribute('data-type') === type;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var show = matchQuery && matchRegion && matchType && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (countText) {
        countText.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }
      empty.classList.toggle('show', visible === 0);
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function initHeroSearch() {
    var form = qs('[data-hero-search]');
    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input', form);
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-url') || 'search.html';
      if (query) {
        window.location.href = target + '?q=' + encodeURIComponent(query);
      } else {
        window.location.href = target;
      }
    });
  }

  function applySearchQueryFromUrl() {
    var input = qs('[data-filter-query]');
    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function initPlayer() {
    var video = qs('[data-hls-player]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var playButton = qs('[data-player-play]');
    var muteButton = qs('[data-player-mute]');
    var fullscreenButton = qs('[data-player-fullscreen]');
    var status = qs('[data-player-status]');
    var hls = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource() {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络异常，正在重试...');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体异常，正在恢复...');
              hls.recoverMediaError();
            } else {
              setStatus('播放源加载失败');
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
        }, { once: true });
      } else {
        setStatus('当前浏览器需要启用 HLS 支持后播放');
      }
    }

    function playOrPause() {
      loadSource();
      if (video.paused) {
        video.play().catch(function () {
          setStatus('请再次点击播放按钮开始播放');
        });
      } else {
        video.pause();
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playOrPause);
    }

    video.addEventListener('click', playOrPause);
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.textContent = '暂停';
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      if (playButton) {
        playButton.textContent = '播放';
      }
      setStatus('已暂停');
    });
    video.addEventListener('waiting', function () {
      setStatus('正在缓冲...');
    });
    video.addEventListener('error', function () {
      setStatus('播放遇到错误，请刷新页面或稍后再试');
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          video.requestFullscreen().catch(function () {});
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initHeroSearch();
    initFilters();
    applySearchQueryFromUrl();
    initPlayer();
  });
})();
