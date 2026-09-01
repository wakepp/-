// Service Worker - 命令助手 PWA v2
const CACHE_NAME = 'cmd-helper-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/ctree.js',
  './js/app.js',
  './icon.png',
  './manifest.json'
];

// 安装：预缓存所有静态资源 + skipWaiting 立即激活
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存 + 立即接管
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 请求拦截：网络优先（支持在线更新），失败回退缓存
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((response) => {
      // 网络请求成功 → 更新缓存
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(() => {
      // 网络失败 → 返回缓存
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // 都没有 → 返回 index.html（用于 SPA 路由）
        return caches.match('./index.html');
      });
    })
  );
});

// 接收消息：立即激活新版本
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // 主线程触发更新检查（由主线程调 registration.update() 实现）
    // 这里可以做额外的处理
  }
});
