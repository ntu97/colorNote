/**
 * Service Worker
 * 用于缓存应用资源，实现离线功能
 */

// 缓存名称
const CACHE_NAME = 'note-app-cache-v1';

// 获取基础路径
const BASE_PATH = '/colorNote'; // GitHub Pages 子目录名称

// 需要缓存的资源列表 - 使用正确的子目录路径
const resourcesCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/css/style.css`,
  `${BASE_PATH}/js/app.js`,
  `${BASE_PATH}/js/database.js`,
  `${BASE_PATH}/js/notes.js`,
  `${BASE_PATH}/js/statistics.js`,
  `${BASE_PATH}/img/icon-192.png`,
  `${BASE_PATH}/img/icon-512.png`
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存资源中...');
        return cache.addAll(resourcesCache);
      })
      .then(() => {
        // 立即激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧版本缓存
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim();
    })
  );
});

// 资源请求拦截
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  // 获取请求URL
  const url = new URL(event.request.url);
  
  // 检查是否为同源请求
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // 如果缓存中有命中的资源，则直接返回
          if (response) {
            return response;
          }

          // 克隆请求，因为请求只能使用一次
          const fetchRequest = event.request.clone();

          // 尝试从网络获取资源
          return fetch(fetchRequest).then(response => {
            // 检查是否为有效的响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应也只能使用一次
            const responseToCache = response.clone();

            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
        .catch(() => {
          // 如果网络请求失败，且没有缓存，则返回一个离线页面或者其他适当的响应
          return new Response('离线状态，无法访问网络资源', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  } else {
    // 非同源请求使用网络优先策略
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// 推送通知支持
self.addEventListener('push', event => {
  const title = '笔记应用';
  const options = {
    body: event.data ? event.data.text() : '有新的更新',
    icon: `${BASE_PATH}/img/icon-192.png`,
    badge: `${BASE_PATH}/img/icon-192.png`
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 点击通知事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(`${BASE_PATH}/`)
  );
});