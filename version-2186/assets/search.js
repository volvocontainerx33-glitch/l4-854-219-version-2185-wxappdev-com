(function () {
  var formInput = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (formInput) {
    formInput.value = query;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (item) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[item];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="movie-cover" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="play-chip">播放</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<a class="movie-title" href="' + movie.href + '">' + escapeHtml(movie.title) + '</a>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  if (!results || !query.trim() || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  var normalized = query.trim().toLowerCase();
  var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
    return movie.search.indexOf(normalized) >= 0;
  }).slice(0, 240);

  if (title) {
    title.textContent = matched.length ? '搜索结果：' + query : '没有找到匹配内容';
  }

  results.innerHTML = matched.length ? matched.map(card).join('') : '';
})();
