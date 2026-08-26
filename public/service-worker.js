self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Notification", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: "/badge-72.png", // small monochrome icon shown in the status bar — Android uses this for banner display
    vibrate: [200, 100, 200],
    requireInteraction: true, // stays on screen instead of auto-dismissing
    tag: "ims-notification",
    renotify: true, // re-alerts (vibrate/sound again) even if reusing the same tag
    silent: false, // explicitly opt into sound/vibration, don't leave it to default
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
