export default async function handler(event) {
  const { request } = event;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 首页直接放行根目录 index.html
  if (pathname === '/' || pathname === '/index.html') {
    return event.next();
  }

  // 和你原来完全一致的路由规则
  const routes = [
    { pattern: /^\/article\/([^/]+)\/?$/, target: '/article/index.html', header: 'X-Article-ID' },
    { pattern: /^\/a\/([^/]+)\/?$/, target: '/article/index.html', header: 'X-Article-ID' },
    { pattern: /^\/paste\/([^/]+)\/?$/, target: '/paste/index.html', header: 'X-Paste-ID' },
    { pattern: /^\/p\/([^/]+)\/?$/, target: '/paste/index.html', header: 'X-Paste-ID' }
  ];

  for (const { pattern, target, header } of routes) {
    const match = pathname.match(pattern);
    if (match) {
      const id = match[1];
      const newUrl = new URL(url);
      newUrl.pathname = target;
      newUrl.searchParams.set('id', id);

      const headers = new Headers(request.headers);
      headers.set(header, id);

      const newReq = new Request(newUrl, {
        method: request.method,
        headers,
        body: request.body,
        redirect: request.redirect
      });
      // 直接请求根目录下的静态页面
      return fetch(newReq);
    }
  }

  // 其他所有静态资源（css/svg/html等）正常放行
  return event.next();
}
