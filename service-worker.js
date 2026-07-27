/* global self, caches, fetch, URL, Response */

// CACHE_NAME 끝의 빌드 해시와 BUILD_ASSETS는 빌드 시 vite-plugin-sw-precache가 주입한다.
// 개발 중(주입 전)에는 앱 셸만 캐시한다.
const CACHE_NAME = "ippatsu-shell-ms3jaahc";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg"];
const BUILD_ASSETS = ["/assets/SharedSystems-mzn4R18e.js","/assets/WebGLRenderer-DbTPnht7.js","/assets/WebGPURenderer-Yriguhai.js","/assets/browserAll-C5OOALP8.js","/assets/colorToUniform-SMZYehvr.js","/assets/discard-recommend-D6a_JLOi.js","/assets/main-C95A7yTq.js","/assets/main-D3lt8ChG.css","/assets/rules-PBJxhysE.js","/assets/simulator-_43V3D9K.js","/assets/webworkerAll-BVNpur94.js"];

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

// 요청 분류(순수 함수 — apps/web/tests/sw-classify.test.ts가 이 함수를 꺼내 실행한다).
//  shell : 앱 셸. 오직 루트 두 경로뿐이다.
//  doc   : 정적 문서(/rules.html, /ko/learn/ 등). 네트워크 우선 + 자기 키로 캐시.
//  asset : 해시된 번들·이미지 등. 캐시 우선.
// 종전 판정은 "/index.html로 끝나지 않는 .html"을 문서로 봤는데, 그러면 /ko/learn/(과
// /ko/learn/index.html)이 shell로 분류돼 cache.put("/index.html", 문서본문)으로 앱 셸을
// 오염시켰다 — 오프라인에서 게임 자리에 문서가 뜬다. 앱 셸을 화이트리스트로 못박아 막는다.
function classifyRequest(pathname, mode) {
  if (pathname === "/" || pathname === "/index.html") return "shell";
  if (pathname.endsWith(".html") || mode === "navigate") return "doc";
  return "asset";
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  // index.html(=앱 셸)은 매 배포마다 새 해시 번들을 참조하므로 '네트워크 우선'으로 받아야
  // 배포 직후에도 최신 앱이 뜬다(cache-first면 옛 index.html이 옛 번들을 물고 와 화면이 안 바뀜).
  // 해시된 에셋(/assets/*)은 내용 불변이라 '캐시 우선'으로 빠르게 + 오프라인 지원.
  // 정적 문서(예: /rules.html)는 앱 셸이 아니다 — 셸로 취급하면 아래 cache.put("/index.html", …)이
  // 문서 본문으로 앱 셸 캐시를 오염시켜, 오프라인 폴백이 게임 대신 그 문서를 띄운다.
  const kind = classifyRequest(url.pathname, request.mode);
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // 정적 문서는 해시가 없어 배포로 내용이 바뀔 수 있다 → 네트워크 우선 + 자체 키로 캐시(오프라인 폴백).
      if (kind === "doc") {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) void cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(request, { ignoreVary: true })) ?? Response.error();
        }
      }
      if (kind === "shell") {
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
