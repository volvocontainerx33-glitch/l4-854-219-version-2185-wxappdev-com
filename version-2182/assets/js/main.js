(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.getElementById("siteSearch");
    var searchResults = document.getElementById("searchResults");
    var searchFilter = "";
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-search-filter]"));

    function renderSearch() {
      if (!searchInput || !searchResults || !window.SITE_CATALOG) {
        return;
      }
      var query = searchInput.value.trim().toLowerCase();
      var filter = searchFilter.toLowerCase();
      var matches = window.SITE_CATALOG.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.genre,
          String(item.year),
          item.tags.join(" ")
        ].join(" ").toLowerCase();
        return (!query || haystack.indexOf(query) !== -1) && (!filter || haystack.indexOf(filter) !== -1);
      }).slice(0, 12);

      searchResults.innerHTML = matches.map(function (item) {
        return [
          '<a class="search-result-item" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</small></span>',
          '</a>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    if (searchInput) {
      searchInput.addEventListener("input", renderSearch);
    }

    filterButtons.forEach(function (button, index) {
      if (index === 0) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        searchFilter = button.getAttribute("data-search-filter") || "";
        renderSearch();
      });
    });

    renderSearch();

    var pageCatalog = document.querySelector("[data-page-catalog]");
    var pageSearch = document.querySelector(".page-search");
    var pageRegion = document.querySelector(".page-region-filter");
    var pageYear = document.querySelector(".page-year-filter");
    var emptyState = document.querySelector("[data-empty-state]");

    function filterPageCards() {
      if (!pageCatalog) {
        return;
      }
      var cards = Array.prototype.slice.call(pageCatalog.querySelectorAll("[data-card]"));
      var query = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
      var region = pageRegion ? pageRegion.value : "";
      var year = pageYear ? pageYear.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passRegion = !region || (card.getAttribute("data-region") || "").indexOf(region) !== -1;
        var passYear = !year || (card.getAttribute("data-year") || "") === year;
        var show = passQuery && passRegion && passYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [pageSearch, pageRegion, pageYear].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterPageCards);
        control.addEventListener("change", filterPageCards);
      }
    });

    filterPageCards();
  });
})();
