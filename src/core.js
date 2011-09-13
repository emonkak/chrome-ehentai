var CODEGEN_URL, E_HENTAI_SERVER, THUMBNAIL_URL, eHentaiCodegen, eHentaiSearch, getQuery, handleEntryClick, handleSearch, parsePageUrl;
E_HENTAI_SERVER = 'exhentai.org';
THUMBNAIL_URL = 'http://gt.ehgt.org/';
CODEGEN_URL = "http://" + E_HENTAI_SERVER + "/codegen.php";
getQuery = function() {
  var query;
  query = {};
  $('#search-form').each(function(i, x) {
    return query[x.name] = x.value;
  });
  $('#search-box > label > input').each(function(i, x) {
    return query[x.name] = x.checked ? 1 : 0;
  });
  return query;
};
parsePageUrl = function(url) {
  var match;
  match = url.match(/^http:\/\/[^\/]+\/g\/([0-9]+)\/([0-9a-f]+)/);
  if (match != null) {
    return {
      gid: match[1],
      t: match[2]
    };
  }
};
eHentaiSearch = function(query, callback) {
  $.extend(query, {
    f_apply: 'Apply Filter',
    inline_set: 'dm_l'
  });
  return $.get("http://" + E_HENTAI_SERVER + "/", query, function(data) {
    return callback($(data).find('.gtr0, .gtr1').map(function() {
      return {
        title: $(this).find('.it3:last > a').text(),
        user: $(this).find('.itd:last > div > a').text(),
        data: $(this).find('.itd:first').text(),
        genre: $(this).find('.ic').attr('alt'),
        rating: parseInt($(this).find('.it4 > img').attr('src').match(/(\d+)\.gif$/)[1]),
        url: $(this).find('.it3 > a:last').attr('href'),
        torrent: $(this).find('.it3 > a:has(img)').attr('href') || null,
        thumbnail: $(this).find('.it2 > img').attr('src') || THUMBNAIL_URL + $(this).find('.it2').text().split('~')[1]
      };
    }));
  });
};
eHentaiCodegen = function(query, callback) {
  return $.get("" + CODEGEN_URL + "?gid=" + query.gid + "&t=" + query.t + "&type=html", {}, function(data) {
    return callback($(data).find('textarea').text());
  });
};
handleEntryClick = function(e) {
  var link, query, title;
  try {
    link = e.target.parentNode;
    title = link.parentNode.nextSibling;
    query = parsePageUrl(link.href);
    return eHentaiCodegen(query, function(data) {
      var index, tab;
      index = $('#tabs > ul > li').length;
      tab = $('<div>').addClass('page').attr('id', "tabs-" + index).append(data);
      return $('#tabs').append(tab).tabs('add', "#tabs-" + index, title.innerText);
    });
  } finally {
    e.preventDefault();
  }
};
handleSearch = function() {
  var query;
  query = getQuery();
  return eHentaiSearch(query, function(data) {
    var entry, image, index, item, link, tab, thumbnail, title, _i, _len;
    index = $('#tabs > ul > li').length;
    tab = $('<div>').addClass('search').attr('id', "tabs-" + index);
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      link = $('<a>').attr('href', item.url);
      image = $('<img>').attr('src', item.thumbnail);
      entry = $('<div>').addClass('entry');
      title = $('<div>').addClass('title').attr('title', item.title);
      thumbnail = $('<div>').addClass('thumbnail');
      title.append(link.clone().text(item.title));
      thumbnail.append(link.clone().append(image).click(handleEntryClick));
      tab.append(entry.append(thumbnail).append(title));
    }
    return $('#tabs').append(tab).tabs('add', "#tabs-" + index, query.f_search);
  });
};
chrome.cookies.set({
  url: "http://" + E_HENTAI_SERVER + "/",
  domain: E_HENTAI_SERVER,
  path: '/',
  name: 'ipb_member_id',
  value: '9999'
});
$(function() {
  var tabs;
  tabs = $('#tabs').tabs({
    add: function(e, ui) {
      return tabs.tabs('select', '#' + ui.panel.id);
    },
    tabTemplate: '<li>\n<a href="#{href}">#{label}</a>\n<span class="ui-icon ui-icon-close"></span>\n</li>'
  });
  $('.ui-icon-close').live('click', function() {
    var index;
    index = $('#tabs > ul > li').index(this.parentNode);
    return tabs.tabs('remove', index);
  });
  $('#search-button').click(handleSearch);
  return $('#search-form').keydown(function(e) {
    if (e.keyCode === 13) {
      return handleSearch();
    }
  });
});