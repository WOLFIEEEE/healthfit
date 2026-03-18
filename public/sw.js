// Healthfit.ai Service Worker — Web Push Notifications

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Healthfit.ai";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/dashboard/overview" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/overview";
  event.waitUntil(clients.openWindow(url));
});
