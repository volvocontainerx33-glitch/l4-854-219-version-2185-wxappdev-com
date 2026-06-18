(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    if (slides.length > 1) {
      schedule();
    }
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var section = scope.closest('section') || document;
    var input = scope.querySelector('[data-filter-search]');
    var year = scope.querySelector('[data-filter-year]');
    var genre = scope.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
    var empty = section.querySelector('[data-empty-state]');

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var genreValue = genre ? genre.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardTags = card.getAttribute('data-tags') || '';
        var okTerm = !term || text.indexOf(term) >= 0;
        var okYear = !yearValue || cardYear === yearValue;
        var okGenre = !genreValue || cardGenre.indexOf(genreValue) >= 0 || cardTags.indexOf(genreValue) >= 0;
        var ok = okTerm && okYear && okGenre;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, genre].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  });
})();
