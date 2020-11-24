// Creating files and data to be cached - storing in variables to use later
const cacheName = 'file-v1';
const dataCacheName = 'data-v1';

// Declaring which files we want to cache
const filesToCache = [
    "/",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// Creating event listener to wait until caches are found
self.addEventListener('install', (event) => {
    console.log('hit install');
    // Once caches are found, open the files and return all files
    event.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
            .catch(error => console.log(error))
    );
    // Tells the service worker to skip waiting and immediately activate
    self.skipWaiting();
});

// Creating event listener to wait until service worker is activated
self.addEventListener('activate', (event) => {
    console.log('hit activate');
    // Waits until caches are found by keys then retuns all caches
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    // Mapping over each key and if it's equal to a cache file and cache data, then deletes the cache by key
                    keyList.map(key => {
                        if (key !== cacheName && key !== dataCacheName) {
                            console.log('deleting cache');
                            return caches.delete(key);
                        }
                    })
                )
            })
            .catch(error => console.log(error))
    );
    // Allows active service worker to control all clients within it's scope
    self.clients.claim();
});

// Creating event listener to fetch all caches
self.addEventListener('fetch', (event) => {
    console.log('hit fetch');

    // handles api caching
    if (event.request.url.includes('/api')) {
        return event.respondWith(
            caches
                .open(dataCacheName)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            console.log(response);
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            console.log(err);
                            // Network request failed, try to get it from the cache.
                            return cache.match(event.request);
                        });
                })
        )
    }
    // If caches are found and match with the request they are returned
    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (!response || !response.basic || !response.status !== 200) {
                            console.log('fetch response: ', response);
                            return response;
                        }
                        // response is a stream, reading will consume the response
                        const responseToCache = response.clone();

                        caches
                            .open(cacheName)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => console.log(error));

                        return response;
                    });
            })
            .catch(error => console.log('error', error))
    )
});