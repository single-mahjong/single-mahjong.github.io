/* global self, caches, fetch, URL, Response */

// CACHE_NAME 끝의 빌드 해시와 BUILD_ASSETS는 빌드 시 vite-plugin-sw-precache가 주입한다.
// 개발 중(주입 전)에는 앱 셸만 캐시한다.
const CACHE_NAME = "ippatsu-shell-mr8vc1x2";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];
const BUILD_ASSETS = ["/assets/SharedSystems-C3YHaqRT.js","/assets/WebGLRenderer-BAksp0Dz.js","/assets/WebGPURenderer-CiT0Esnm.js","/assets/browserAll-BejWZdX6.js","/assets/colorToUniform-DlHzMCRH.js","/assets/discard-recommend-BrSlwJwK.js","/assets/main-CVcyKAaE.js","/assets/main-Cyd8dHXh.css","/assets/rules-C0tUt1XZ.js","/assets/webworkerAll-r0eynhOJ.js"];

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
  // 정적 문서(예: /rules.html)는 앱 셸이 아니다 — 셸로 취급하면 아래 cache.put("/index.html", …)이
  // 문서 본문으로 앱 셸 캐시를 오염시켜, 오프라인 폴백이 게임 대신 그 문서를 띄운다.
  const isStaticDoc = url.pathname.endsWith(".html") && !url.pathname.endsWith("/index.html");
  const isShell = !isStaticDoc
    && (request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith("/index.html"));
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // 정적 문서는 해시가 없어 배포로 내용이 바뀔 수 있다 → 네트워크 우선 + 자체 키로 캐시(오프라인 폴백).
      if (isStaticDoc) {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) void cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(request, { ignoreVary: true })) ?? Response.error();
        }
      }
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
