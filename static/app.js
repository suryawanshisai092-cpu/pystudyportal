// service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/static/service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}


// LOGIN FUNCTION
