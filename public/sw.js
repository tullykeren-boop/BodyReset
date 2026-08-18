/* LetReSet service worker.
 *
 * Deliberately minimal: it exists to receive push nudges and to route a tap
 * into the right screen. There is no offline caching layer yet -- the app is
 * server-rendered and a stale cached shell would be worse than a network error.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Time to move",
    body: "A short reset now beats stiffness later.",
    url: "/now",
  };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // A malformed payload should still produce a usable notification.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "letreset-nudge",
      renotify: true,
      data: { url: payload.url },
      actions: [
        { action: "open", title: "Start now" },
        { action: "snooze", title: "Later" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "snooze") {
    event.waitUntil(fetch("/api/reminders/snooze", { method: "POST" }).catch(() => {}));
    return;
  }

  const url = (event.notification.data && event.notification.data.url) || "/now";

  // Focus an existing tab if one is already open rather than piling up windows.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
