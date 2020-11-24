console.log("Lets see something");



const cacheName = 'file-v1';
const dataCacheName = 'data-v1';

const filesToCache = [
    "/",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

self.addEventListener('install', (event) => {
    console.log('hit install');

    event.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
            .catch(error => console.log(error))
    );


    self.skipWaiting();
});

// self.addEventListener('activate', (event) => {
//     console.log('hit activate');
//     event.waitUntil(
//         caches
//             .keys()
//             .then(keyList => {
//                 return Promise.all(
//                     keyList.map(key => {
//                         if (key !== cacheName && key !== dataCacheName) {
//                             console.log('deleting cache');
//                             return caches.delete(key);
//                         }
//                     })
//                 )
//             })
//             .catch(error => console.log(error))
//     );

//     self.clients.claim();
// });

self.addEventListener('fetch', (event) => {
    console.log('hit fetch');
    console.log(event.request.url);

    // handle api caching
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


    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                // console.log('cache match response: ', response);
                if (response) {
                    // console.log('response returned');
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