var APP_PREFIX = "Wopri",
  VERSION = "version_01",
  CACHE_NAME = APP_PREFIX + VERSION,
  URLS = [
    "/wopri/",
    "/wopri/index.html",
    "/wopri/res/css/style.min.css",
    "/wopri/res/img/icon-192.png",
    "/wopri/res/img/icon-512.png",
    "/wopri/res/js/production.js",
  ];
self.addEventListener("fetch", function (e) {
  console.log("fetch request : " + e.request.url),
    e.respondWith(
      caches.match(e.request).then(function (n) {
        return n
          ? (console.log("responding with cache : " + e.request.url), n)
          : (console.log("file is not cached, fetching : " + e.request.url),
            fetch(e.request));
      })
    );
}),
  self.addEventListener("install", function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (e) {
        return console.log("installing cache : " + CACHE_NAME), e.addAll(URLS);
      })
    );
  }),
  self.addEventListener("activate", function (e) {
    e.waitUntil(
      caches.keys().then(function (e) {
        var n = e.filter(function (e) {
          return e.indexOf(APP_PREFIX);
        });
        return (
          n.push(CACHE_NAME),
          Promise.all(
            e.map(function (t, i) {
              if (-1 === n.indexOf(t))
                return (
                  console.log("deleting cache : " + e[i]), caches.delete(e[i])
                );
            })
          )
        );
      })
    );
  });
