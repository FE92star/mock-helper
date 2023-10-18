export const YAPI_OEPNAPI_BASEURL = '/api'

export const YAPI_OEPNAPI_LIST = [
  {
    url: '/project/get',
    method: 'GET',
    params: ['token'],
    description: '获取项目基本信息',
  },
  {
    url: '/interface/list_menu',
    method: 'GET',
    params: ['token', 'project_id'],
    description: '获取接口菜单列表',
  },
  {
    url: '/interface/list',
    method: 'GET',
    params: ['token', 'project_id', 'page', 'limit'],
    description: '获取接口列表数据',
  },
  {
    url: '/interface/list_cat',
    method: 'GET',
    params: ['token', 'catid', 'page', 'limit'],
    description: '获取某个分类下接口列表',
  },
  {
    url: '/interface/get',
    method: 'GET',
    params: ['token', 'id'],
    description: '获取接口数据',
  },
]
