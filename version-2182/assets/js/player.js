function createMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var playButton = document.getElementById(options.playId);
  var muteButton = document.getElementById(options.muteId);
  var fullButton = document.getElementById(options.fullId);
  var source = options.source;
  var loaded = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else {
      video.src = source;
    }
  }

  function play() {
    loadSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function togglePlay() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  function updatePlayButton() {
    if (playButton) {
      playButton.textContent = video.paused ? "▶" : "Ⅱ";
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  if (playButton) {
    playButton.addEventListener("click", togglePlay);
  }

  video.addEventListener("click", togglePlay);
  video.addEventListener("play", updatePlayButton);
  video.addEventListener("pause", updatePlayButton);

  if (muteButton) {
    muteButton.addEventListener("click", function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? "静" : "音";
    });
  }

  if (fullButton) {
    fullButton.addEventListener("click", function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
