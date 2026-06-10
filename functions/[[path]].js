export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. 首页直接返回
  if (pathname === '/' || pathname === '/index.html') {
    return env.ASSETS.fetch(request);
  }

  // 2. 动态路由配置（统一处理逻辑）
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
      newUrl.searchParams.set('id', id); // 保留查询参数传递

      const headers = new Headers(request.headers);
      headers.set(header, id); // 注入自定义头部

      return env.ASSETS.fetch(
        new Request(newUrl, { ...request, headers })
      );
    }
  }

  // 3. 其他路径交由静态资源处理
  return env.ASSETS.fetch(request);
}