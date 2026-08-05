const CACHE_NAME = "bata-gsm-v1";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.png",
    "https://cdn.tailwindcss.com",
    "https://unpkg.com/lucide@latest",
    "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700;800&display=swap"
];

// 1. INSTALL: Kwashe ginin App a boye (Caching Shell)
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Kar a jira, a fara aiki nan take
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Ana ajiye ginin App a waya...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. FETCH: Dabarar Jumia (Offline First)
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Idan an samu a aljihu (ko babu Data), a bada shi!
            if (cachedResponse) {
                return cachedResponse;
            }
            // Idan babu, a gwada dauko shi a Intanet
            return fetch(event.request).catch(() => {
                // Idan Intanet ta ki, kuma babu a cache, to shikenan
                // (Amma tunda mun ajiye index.html, shi zai fito dole)
            });
        })
    );
});

// 3. ACTIVATE: Goge tsofaffin files idan an yi update
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Karbe iko nan take
});