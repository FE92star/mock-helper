import type http from 'node:http'
import type httpProxy from 'http-proxy'

// 默http认代理配置
export const DEFAULT_PROXY_OPTION: httpProxy.ServerOptions = {
  changeOrigin: true,
}
// 请求头json设置
export const REQUEST_HEADER_OPTION: http.OutgoingHttpHeaders = {
  'Content-Type': 'application/json',
}

// 设置允许跨域
export function allowCorsOrigin(proxyRes: any, req: http.IncomingMessage) {
  const origin = req.headers.origin || req.headers.host
  proxyRes.headers['Access-Control-Allow-Credentials'] = true
  proxyRes.headers['Access-Control-Allow-Headers']
    = 'Content-Type, x-requested-with, Origin, X-Requested-With, Content-Type, Accept, Cookie, tku'
  proxyRes.headers['Access-Control-Allow-Methods']
    = 'POST, GET, PUT, OPTIONS, DELETE, PATCH'
  proxyRes.headers['Access-Control-Allow-Origin'] = origin || '*'
  proxyRes.headers['Access-Control-Max-Age'] = 3600
}
