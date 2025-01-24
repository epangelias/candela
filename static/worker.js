self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => cache.addAll(['/offline'])),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAPI = url.pathname.startsWith('/api');
  if (isAPI) return;
  event.respondWith(
    fetch(event.request).catch((e) => isAPI ? e : caches.match('/offline')),
  );
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
