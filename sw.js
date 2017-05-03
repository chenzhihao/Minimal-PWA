
console.log('Script loaded!')
var cacheStorageKey = 'minimal-pwa-4'

var cacheList = [
  '/',
  "index.html",
  "main.css",
  "e.png",
  "pwa-fonts.png",
  'data.json',
]

self.addEventListener('install', function (e) {
  console.log('Cache event!')

  e.waitUntil(
    caches.open(cacheStorageKey).then(function (cache) {
      console.log('Adding to Cache:', cacheList)
      return cache.addAll(cacheList)
    }).then(function () {
      console.log('Skip waiting!')
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', function (e) {
  console.log('Activate event')
  e.waitUntil(
    Promise.all(
      caches.keys().then(cacheNames => {
        return cacheNames.map(name => {
          if (name !== cacheStorageKey) {
            return caches.delete(name)
          }
        })
      })
    ).then(() => {
      console.log('Clients claims.')
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', function (e) {
  // console.log('Fetch event:', e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (response) {
      if (!response) {
        // No Cache found
        console.log('No Cache found fallback to fetch:', e.request.url)
        return fetch(e.request.url)
      }
      // Here we need to break the cache loop
      // Which means if the index page is cached, the sw.js will never get the chance to update,
      // and this make the index page use cached version again.
      if (response.url === 'http://localhost:8080/' && navigator.onLine) {
        console.log('Force to fetch index page:', e.request.url)
        return fetch(e.request.url)
      }

      if (response != null) {
        console.log('Using cache for:', e.request.url)
        return response
      }

    })
  )
})
