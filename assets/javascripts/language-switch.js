(function () {
  var supportedLanguages = ["zh", "en"];

  function normalizedPath() {
    return window.location.pathname.replace(/\/index\.html$/, "/");
  }

  function targetPathFor(language) {
    var path = normalizedPath();
    var match = path.match(/^\/(zh|en)(\/.*)?$/);

    if (match) {
      return "/" + language + (match[2] || "/");
    }

    return "/" + language + "/";
  }

  function rewriteLanguageLinks() {
    document.querySelectorAll("a[hreflang]").forEach(function (link) {
      var language = link.getAttribute("hreflang");
      if (supportedLanguages.indexOf(language) === -1) {
        return;
      }

      link.setAttribute("href", targetPathFor(language));
    });

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (link) {
      var language = link.getAttribute("hreflang");
      if (supportedLanguages.indexOf(language) === -1) {
        return;
      }

      link.setAttribute("href", window.location.origin + targetPathFor(language));
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(rewriteLanguageLinks);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewriteLanguageLinks);
  } else {
    rewriteLanguageLinks();
  }
})();

