/* global self, caches */

// 옛 주소(single-mahjong.github.io)의 «서비스 워커 걷기» 스크립트 — 2026-09-17 요구 27.
//
// 옛 앱은 `/service-worker.js`를 등록하고 앱 셸·번들을 Cache Storage에 프리캐시했다. 이 주소엔 이제 앱이 없으므로,
// 브라우저가 등록된 워커를 갱신하러 이 파일을 받는 순간 **캐시를 비우고 스스로 등록을 푼다.**
// 안 걷으면 네트워크가 실패할 때 옛 앱 셸이 계속 뜬다.
//
// ⚠ Cache Storage만 지운다 — 세이브·스킨이 사는 IndexedDB·localStorage에는 닿지 않는다(닿으면 내보낼 기록이 사라진다).
// ⚠ fetch 핸들러를 두지 않는다 — 모든 요청이 그냥 네트워크로 간다.
// ⚠ 열린 탭을 강제로 새로고침하지 않는다 — 내보내기 중인 사람을 끊지 않게. 새 페이지는 어차피 네트워크에서 온다.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});
