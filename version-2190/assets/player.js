import { H as Hls } from './hls-vendor-dru42stk.js';

const video = document.querySelector('[data-player-video]');
const trigger = document.querySelector('[data-player-trigger]');
const configNode = document.getElementById('video-config');
let hls = null;
let started = false;

const config = configNode ? JSON.parse(configNode.textContent || '{}') : {};

function attachSource() {
  if (!video || !config.src) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = config.src;
    return;
  }

  if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(config.src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {});
    });
    return;
  }

  video.src = config.src;
}

function startPlayback() {
  if (!video) {
    return;
  }

  if (!started) {
    started = true;
    attachSource();
  }

  if (trigger) {
    trigger.hidden = true;
  }

  video.controls = true;
  video.play().catch(function () {});
}

if (trigger) {
  trigger.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startPlayback();
    }
  });
}

window.addEventListener('pagehide', function () {
  if (hls) {
    hls.destroy();
    hls = null;
  }
});
