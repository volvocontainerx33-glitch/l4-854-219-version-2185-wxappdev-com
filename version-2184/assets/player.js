(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupPlayer(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-trigger');
    var status = frame.querySelector('.player-status');
    var source = frame.getAttribute('data-source');
    var hlsInstance = null;
    var started = false;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('播放已载入，请再次点击视频播放按钮。');
        });
      }
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      frame.classList.add('is-playing');
      setStatus('正在载入高清播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪。');
          playVideo();
        }, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪。');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源暂时无法载入，请稍后重试。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
        return;
      }

      video.src = source;
      setStatus('已尝试使用浏览器原生能力播放。');
      playVideo();
    }

    button.addEventListener('click', start);
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
