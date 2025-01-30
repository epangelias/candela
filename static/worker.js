const CACHE_NAME = 'homepage-cache-v1';
const OFFLINE_CACHE = 'offline-cache';
const HOMEPAGE_URL = '/'; // Replace with your homepage URL if different

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(HOMEPAGE_URL)),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Serve the homepage from cache first, then update in the background
  if (url.pathname === HOMEPAGE_URL) {
    event.respondWith(
      caches.match(HOMEPAGE_URL).then((cachedResponse) => {
        // Fetch the latest version in the background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update the cache with the new response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(HOMEPAGE_URL, networkResponse.clone());
          });
          return networkResponse;
        });

        // Return the cached response immediately, if available
        return cachedResponse || fetchPromise;
      }),
    );
  } else if (url.pathname.startsWith('/api')) {
    // Skip caching for API requests
    return;
  } else {
    // Fallback to offline cache for other requests
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline')),
    );
  }
});

self.addEventListener('push', function (event) {
  const text = event.data.text();
  const data = !text.startsWith('{') ? { title: text } : event.data.json();
  console.log('Received push', data);
  event.waitUntil(
    self.registration.showNotification(data.title, data),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(self.origin),
  );
});
