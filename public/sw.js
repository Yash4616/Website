// Service Worker for Yash Gurjar's portfolio
const CACHE_NAME = 'yash-portfolio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/globals.css',
  '/myimage.jpg',
  '/Resume.pdf',
  // Add SVG files
  '/cpp.svg',
  '/css.svg',
  '/cuda.svg',
  '/docker.svg',
  '/figma.svg',
  '/flutter.svg',
  '/github.svg',
  '/googleCloud.svg',
  '/js.svg',
  '/Matplotlib.svg',
  '/mysql.svg',
  '/nextjs.svg',
  '/problemSolving.svg',
  '/project.svg',
  '/python.svg',
  '/pytorch.svg',
  '/react.svg',
  '/research.svg',
  '/scikitLearn.svg',
  '/team.svg',
  '/techWrite.svg',
  '/tensorflow.svg',
  '/typescript.svg'
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch and cache the response
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (e.g., offline), show a fallback page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});