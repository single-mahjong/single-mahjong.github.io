/* global self, caches, fetch, URL, Response */

// CACHE_NAME 끝의 빌드 해시와 BUILD_ASSETS는 빌드 시 vite-plugin-sw-precache가 주입한다.
// 개발 중(주입 전)에는 앱 셸만 캐시한다.
const CACHE_NAME = "ippatsu-shell-mqqzk6cv";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];
const BUILD_ASSETS = ["/assets/BitmapFont-EzIGRaKz.js","/assets/CanvasRenderer-CgW1pkN4.js","/assets/Filter-DQz9m0nP.js","/assets/GpuStencilModesToPixi-Bm3g9Emr.js","/assets/RenderTargetSystem-DN9PdtV3.js","/assets/WebGLRenderer-DAPTXoKv.js","/assets/WebGPURenderer-BXjNItH3.js","/assets/browserAll-C-S-32vI.js","/assets/index-CkCDcYmW.js","/assets/index-DI3EX_4c.css","/assets/webworkerAll--V_cNaRK.js"];

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
  const url = new URL(request.url);
  // index.html(=앱 셸)은 매 배포마다 새 해시 번들을 참조하므로 '네트워크 우선'으로 받아야
  // 배포 직후에도 최신 앱이 뜬다(cache-first면 옛 index.html이 옛 번들을 물고 와 화면이 안 바뀜).
  // 해시된 에셋(/assets/*)은 내용 불변이라 '캐시 우선'으로 빠르게 + 오프라인 지원.
  const isShell = request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith("/index.html");
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      if (isShell) {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) void cache.put("/index.html", fresh.clone());
          return fresh;
        } catch {
          // 오프라인: 캐시된 앱 셸로 폴백.
          return (await cache.match("/index.html", { ignoreVary: true }))
            ?? (await cache.match(request, { ignoreVary: true }))
            ?? Response.error();
        }
      }
      // ignoreVary: 모듈 스크립트(CORS, Origin 헤더)가 프리캐시 엔트리(Vary)와 어긋나 미스나지 않게.
      const cached = await cache.match(request, { ignoreVary: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) void cache.put(request, response.clone());
        return response;
      } catch {
        return Response.error();
      }
    })(),
  );
});
