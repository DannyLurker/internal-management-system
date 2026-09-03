self.addEventListener("push", (event) => {
  let data = { title: "Notification", body: "", url: "/" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Test Notification", body: event.data.text(), url: "/" };
    }
  }

  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: "ims-notification",
    renotify: true,
    silent: false,
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing tab if already open, otherwise open a new one
        for (const client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
