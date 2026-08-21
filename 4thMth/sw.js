const CACHE_NAME = "us-app-cache-v2";
const APP_SHELL = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

/* ---- Push notifications (background) ----
   PASTE THE SAME firebaseConfig OBJECT YOU USED IN index.html BELOW.
   If you're not setting up push notifications yet, you can leave this
   as-is — it just won't do anything until real values are filled in. */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://me-and-karis-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

try {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || "Us";
    const body = (payload.notification && payload.notification.body) || "";
    self.registration.showNotification(title, {
      body,
      icon: "icon-192.png",
      badge: "icon-192.png",
    });
  });
} catch (e) {
  // messaging not configured yet, that's fine
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for everything: live app data (Firebase, weather, maps links)
// always needs the real network. We only fall back to cache for the app shell
// itself when there's no connection at all.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isAppShell = APP_SHELL.some((path) => url.pathname.endsWith(path.replace("./", "")));

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
  // everything else (Firebase, fonts, weather API) just goes to network normally
});
