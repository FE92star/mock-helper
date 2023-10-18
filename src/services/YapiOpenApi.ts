export const YAPI_OEPNAPI_BASEURL = '/api'
export const YAPI_LIMIT_DATA = 999999

export const YAPI_OEPNAPI_LIST_MAP = {
  apiList: {
    url: '/interface/list',
    method: 'GET',
    params: ['token', 'project_id', 'page', 'limit'],
    description: '获取接口列表数据',
  },
  catMenu: {
    url: '/interface/getCatMenu',
    method: 'GET',
    params: ['token', 'project_id'],
    description: '获取菜单列表',
  },
  listMenu: {
    url: '/interface/list_menu',
    method: 'GET',
    params: ['token', 'project_id'],
    description: '获取接口菜单列表',
  },
  listCat: {
    url: '/interface/list_cat',
    method: 'GET',
    params: ['token', 'catid', 'page', 'limit'],
    description: '获取某个分类下接口列表',
  },
  apiGet: {
    url: '/interface/get',
    method: 'GET',
    params: ['token', 'id'],
    description: '获取接口数据',
  },
  project: {
    url: '/project/get',
    method: 'GET',
    params: ['token'],
    description: '获取项目基本信息',
  },
}
