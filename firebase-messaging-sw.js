// Firebase Messaging Service Worker
// هذا الملف لازم يكون في نفس مجلد index.html

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const APP_CACHE = 'bayan-pwa-v6';
const APP_SHELL = ['index.html', 'content.html', 'admin.html', 'manifest.webmanifest', 'pwa.js', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(APP_CACHE)
            .then(function(cache) {
                const appFiles = APP_SHELL.map(function(file) {
                    return new URL(file, self.location.href).href;
                });
                return cache.addAll(appFiles);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(cacheNames
                    .filter(function(cacheName) {
                        return cacheName.startsWith('bayan-pwa-') && cacheName !== APP_CACHE;
                    })
                    .map(function(cacheName) {
                        return caches.delete(cacheName);
                    }));
            })
            .then(function() {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', function(event) {
    const request = event.request;
    const requestUrl = new URL(request.url);
    if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    if (response.ok) {
                        const responseCopy = response.clone();
                        caches.open(APP_CACHE).then(function(cache) {
                            cache.put(request, responseCopy);
                        });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(request).then(function(cachedPage) {
                        return cachedPage || caches.match(new URL('index.html', self.location.href).href);
                    });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(function(cachedResponse) {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then(function(response) {
                if (response.status === 200 && !request.headers.has('range')) {
                    const responseCopy = response.clone();
                    caches.open(APP_CACHE).then(function(cache) {
                        cache.put(request, responseCopy);
                    });
                }
                return response;
            });
        })
    );
});

firebase.initializeApp({
    apiKey: "AIzaSyBDQ0cP8C5Hv3xAun7iLSD2PSp0x7sP-08",
    authDomain: "bayan2312.firebaseapp.com",
    projectId: "bayan2312",
    storageBucket: "bayan2312.firebasestorage.app",
    messagingSenderId: "710544079379",
    appId: "1:710544079379:web:f9478de93d6005b37ddde6"
});

const messaging = firebase.messaging();

// استقبال الإشعارات لما المتصفح يكون في الـ background
messaging.onBackgroundMessage(function(payload) {
    console.log('إشعار وصل في الخلفية:', payload);

    const notificationTitle = payload.notification?.title || 'أكاديمية بيان';
    const notificationOptions = {
        body: payload.notification?.body || 'يوجد إشعار جديد',
        icon: new URL('icon-192.png', self.location.href).href,
        badge: new URL('icon-192.png', self.location.href).href,
        dir: 'rtl',
        lang: 'ar',
        tag: payload.data?.type || 'general',
        renotify: true,
        data: payload.data || {}
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// لما المستخدم يضغط على الإشعار
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const type = event.notification.data?.type;
    let url = 'https://khalidar2312-dot.github.io/bayan/admin';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let client of clientList) {
                if (client.url.includes('admin') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

