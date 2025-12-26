// Service Worker for Yash Gurjar's portfolio
// Security hardened version with explicit caching rules
const CACHE_VERSION = 'v2';
const CACHE_NAME = `yash-portfolio-cache-${CACHE_VERSION}`;

// Only cache static assets - no dynamic or sensitive content
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/globals.css',
  '/myimage.jpg',
  '/Resume.pdf',
  // SVG icons
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

// File extensions that are safe to cache
const CACHEABLE_EXTENSIONS = ['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2'];

// Check if a request should be cached
function shouldCache(url) {
  const urlPath = new URL(url).pathname;
  return CACHEABLE_EXTENSIONS.some(ext => urlPath.endsWith(ext)) || urlPath === '/';
}

// Install the service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Serve cached content when offline with security checks
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for allowed domains
  const requestUrl = new URL(event.request.url);
  const isAllowedOrigin = requestUrl.origin === self.location.origin ||
    requestUrl.hostname === 'images.pexels.com';
  
  if (!isAllowedOrigin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch and selectively cache the response
        return fetch(event.request)
          .then(response => {
            // Only cache valid responses for cacheable resources
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache static assets based on extension
            if (!shouldCache(event.request.url)) {
              return response;
            }

            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          })
          .catch(() => {
            // If fetch fails (e.g., offline), show fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return null;
          });
      })
  );
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('yash-portfolio-cache-') && cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});