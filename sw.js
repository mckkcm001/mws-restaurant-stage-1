/** This code is from the Udacity course
 *  Offline Web Applications
 *
 */

var staticCacheName = 'rest-static-v1';
var contentImgsCache = 'rest-content-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        'js/main.js',
        'js/restaurant_info.js',
        'js/dbhelper.js',
        'css/styles.css',
        'css/restaurant-styles.css',
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.respondWith(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('rest-') && !allCaches.includes(cacheName);
        }).map(cacheName => {
          return cache.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin){
    if(requestUrl.pathname === '/') {
      event.respondWith(caches.match('/'));
      return;
    }
    if(requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(response => {
        if(response.status === 404) {
          return new Response('404 error');
        }
        return response;
      }).catch(() => {
        return new Response('unable to connect');
      });
    })
  );
});

servePhoto = request => {
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(request.url).then(function(response) {
      if (response) return response;
      return fetch(request).then(function(networkResponse) {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
