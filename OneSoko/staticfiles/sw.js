// OneSoko Service Worker
const CACHE_NAME = 'onesoko-v1.0.0';
const API_CACHE_NAME = 'onesoko-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products/',
  '/api/categories/',
  '/api/shops/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      cacheFirstStrategy(request)
    );
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstNavigation(request)
    );
    return;
  }

  // Default strategy: network-first
  event.respondWith(
    networkFirstStrategy(request)
  );
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        offline: true,
        message: 'You appear to be offline. Please check your connection.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch asset', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Network-first strategy for navigation
async function networkFirstNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, serving offline page');
    
    // Try to serve cached page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>OneSoko - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .logo { color: #6366f1; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .offline-icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            .retry-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
            }
            .retry-btn:hover { background: #5855eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">OneSoko</div>
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}

// Background sync for queued actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlistData());
  }
});

async function syncCartData() {
  try {
    // Get queued cart actions from IndexedDB
    const queuedActions = await getQueuedActions('cart');
    
    for (const action of queuedActions) {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      });
      
      if (response.ok) {
        // Remove from queue after successful sync
        await removeQueuedAction('cart', action.id);
      }
    }
  } catch (error) {
    console.error('Service Worker: Cart sync failed', error);
  }
}

async function syncWishlistData() {
  try {
    const queuedActions = await getQueuedActions('wishlist');
    
    for (const action of queuedActions) {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      });
      
      if (response.ok) {
        await removeQueuedAction('wishlist', action.id);
      }
    }
  } catch (error) {
    console.error('Service Worker: Wishlist sync failed', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notification = {
    title: 'OneSoko',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: []
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      notification = { ...notification, ...payload };
    } catch (error) {
      console.error('Service Worker: Invalid push payload', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Helper functions for IndexedDB operations
async function getQueuedActions(type) {
  // Implement IndexedDB operations to get queued actions
  return [];
}

async function removeQueuedAction(type, id) {
  // Implement IndexedDB operations to remove action from queue
  return true;
}

// Share target handling (for PWA sharing)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    console.log('Service Worker: Share target received', event.data);
    
    // Handle shared content
    event.waitUntil(
      clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then((clients) => {
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'SHARED_CONTENT',
              data: event.data.data
            });
            return clients[0].focus();
          }
          
          return self.clients.openWindow('/share');
        })
    );
  }
});

console.log('Service Worker: Loaded successfully');
