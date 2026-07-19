/* アンカツ＋ プッシュ通知用 Service Worker
   このファイルはサイトのルート（index.htmlと同じ階層）に置いてください。
   ファイル名・設置場所は変更しないでください（Firebaseの仕様で固定パスが必要です）。 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyC4HUWd4c5_fdgA-k34i1uthozfqYcRn9A",
  authDomain:        "ankatsu-d4816.firebaseapp.com",
  projectId:         "ankatsu-d4816",
  storageBucket:     "ankatsu-d4816.firebasestorage.app",
  messagingSenderId: "1005813876395",
  appId:             "1:1005813876395:web:29153748d2a99c6584d9ee"
});

const messaging = firebase.messaging();

/* インストール後すぐ有効化し、既存タブもすぐ制御下に置く
   （これが無いと、次回リロードまで待たないと push を受け取れないことがある） */
self.addEventListener('install', function(event){
  self.skipWaiting();
});
self.addEventListener('activate', function(event){
  event.waitUntil(clients.claim());
});

/* タブが閉じている・バックグラウンドの時に届く通知 */
messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || 'アンカツ＋';
  var body  = (payload.notification && payload.notification.body)  || '';
  var url   = (payload.fcmOptions && payload.fcmOptions.link) || (payload.data && payload.data.url) || '/';

  self.registration.showNotification(title, {
    body: body,
    icon: 'web-app-manifest-512x512.png',
    badge: 'web-app-manifest-512x512.png',
    data: { url: url }
  });
});

/* 通知をタップした時にサイトを開く */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf(self.location.origin) === 0 && 'focus' in clientList[i]) {
          clientList[i].navigate(url);
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
