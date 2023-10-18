declare namespace Yapi {
  namespace Api {
    namespace AllApi {
      interface Res {
        /** api id */
        _id: number,
        /** api所在项目id */
        project_id: number,
        /** 分类id */
        catid: number,
        /** api名称 */
        title: string,
        /** api路径 */
        path: string,
        /** 请求方法 */
        method: string,
        /** 创建者uid */
        uid: number,
        /** 创建时间 */
        add_time: number,
        /** 更新时间 */
        up_time: number,
        /** api完成状态 */
        status: 'done' | 'undone',
        /** 编辑者uid */
        edit_uid: number
      }
    }
  }
}
