(function () {
  const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@latest";
  let hlsLoadingPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const header = document.querySelector(".site-header");
    if (!toggle || !header) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
  }

  function initCatalogFilters() {
    const catalog = document.querySelector("[data-catalog]");
    if (!catalog) {
      return;
    }

    const searchInput = catalog.querySelector("[data-filter-search]");
    const regionSelect = catalog.querySelector("[data-filter-region]");
    const typeSelect = catalog.querySelector("[data-filter-type]");
    const yearSelect = catalog.querySelector("[data-filter-year]");
    const genreSelect = catalog.querySelector("[data-filter-genre]");
    const countNode = catalog.querySelector("[data-filter-count]");
    const cards = Array.from(catalog.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (searchInput && query) {
      searchInput.value = query;
    }

    function matchesSelect(card, attr, select) {
      if (!select || !select.value) {
        return true;
      }
      return normalize(card.dataset[attr]).includes(normalize(select.value));
    }

    function applyFilters() {
      const q = normalize(searchInput ? searchInput.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const keywords = normalize(card.dataset.keywords + " " + card.textContent);
        const passSearch = !q || keywords.includes(q);
        const passRegion = matchesSelect(card, "region", regionSelect);
        const passType = matchesSelect(card, "type", typeSelect);
        const passYear = matchesSelect(card, "year", yearSelect);
        const passGenre = matchesSelect(card, "genre", genreSelect);
        const show = passSearch && passRegion && passType && passYear && passGenre;

        card.classList.toggle("hidden-by-filter", !show);
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = "当前显示 " + visible + " 部作品";
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }
    hlsLoadingPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("hls.js 加载失败"));
      };
      document.head.appendChild(script);
    });
    return hlsLoadingPromise;
  }

  function initPlayer(shell) {
    const video = shell.querySelector("video");
    const startButton = shell.querySelector(".player-start");
    const status = shell.querySelector("[data-player-status]");
    const source = shell.dataset.src;
    let hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function attachNative() {
      video.src = source;
      setStatus("");
    }

    function attachHls(Hls) {
      if (!Hls || !Hls.isSupported()) {
        attachNative();
        return;
      }
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("");
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus("视频加载失败，请稍后重试");
        }
      });
    }

    function setupSource() {
      setStatus("视频准备中");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative();
        return;
      }
      loadHls()
        .then(attachHls)
        .catch(function () {
          attachNative();
          setStatus("");
        });
    }

    function updateState() {
      shell.classList.toggle("is-playing", !video.paused && !video.ended);
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        const result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setStatus("点击视频画面即可继续播放");
          });
        }
      } else {
        video.pause();
      }
    }

    setupSource();

    if (startButton) {
      startButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        togglePlay();
      });
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);
    video.addEventListener("ended", updateState);
    video.addEventListener("loadedmetadata", function () {
      setStatus("");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  }

  ready(function () {
    initMenu();
    initCatalogFilters();
    initPlayers();
  });
})();
