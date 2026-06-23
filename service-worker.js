/* global self, caches, fetch, URL, Response */

// CACHE_NAME 끝의 빌드 해시와 BUILD_ASSETS는 빌드 시 vite-plugin-sw-precache가 주입한다.
// 개발 중(주입 전)에는 앱 셸만 캐시한다.
const CACHE_NAME = "ippatsu-shell-mqqhp8iq";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];
const BUILD_ASSETS = ["/assets/BitmapFont-D-9op6S3.js","/assets/CanvasRenderer-CcAPaEWS.js","/assets/Filter-D9BOWmfl.js","/assets/GpuStencilModesToPixi-DdG3uBZF.js","/assets/RenderTargetSystem--64R-ksw.js","/assets/WebGLRenderer-DL4U5_XZ.js","/assets/WebGPURenderer-D7mZhBo1.js","/assets/browserAll-B3BmWmDK.js","/assets/index-BQGXAtZW.css","/assets/index-D5EQhVKu.js","/assets/webworkerAll-CirdeKX1.js"];

self.addEventListener("install", (event) => {
  // 해시된 JS/CSS 번들까지 프리캐시 → 온라인 방문 없이도 오프라인 콜드스타트가 동작한다.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...BUILD_ASSETS])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // ignoreVary: 모듈 스크립트(CORS, Origin 헤더)가 프리캐시 엔트리(Vary)와 어긋나 미스나지 않게.
      const cached = await cache.match(request, { ignoreVary: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) void cache.put(request, response.clone());
        return response;
      } catch {
        // 네비게이션만 앱 셸로 폴백. 에셋(JS/CSS)에 index.html을 주면 모듈 로드가 깨지므로 금지.
        if (request.mode === "navigate") {
          return (await cache.match("/index.html")) ?? Response.error();
        }
        return Response.error();
      }
    })(),
  );
});
