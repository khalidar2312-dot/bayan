// Firebase Messaging Service Worker
// هذا الملف لازم يكون في نفس مجلد index.html

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

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
        icon: '/bayan/icon.png',
        badge: '/bayan/icon.png',
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
