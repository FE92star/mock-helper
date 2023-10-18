import type { IncomingHttpHeaders } from 'node:http'

export type RequestMethod = 'GET' | 'POST'
export default class ApiItem implements Yapi.Api.AllApi.Res {
  constructor(
    public _id: number,
    public project_id: number,
    public catid: number,
    public title: string,
    public path: string,
    public method: string,
    public uid: number,
    public add_time: number,
    public up_time: number,
    public status: 'done' | 'undone',
    public edit_uid: number,
    public json: Record<string, any>,
    public qs?: Record<string, any>,
    public data?: Record<string, any>,
    public headers?: IncomingHttpHeaders,
  ) { }

  clone = (obj: Partial<ApiItem> = {}) => {
    const params = [
      obj._id || this._id,
      obj.project_id || this.project_id,
      obj.catid || this.catid,
      obj.title || this.title,
      obj.path || this.path,
      obj.method || this.method,
      obj.uid || this.uid,
      obj.add_time || this.add_time,
      obj.up_time || this.up_time,
      obj.status || this.status,
      obj.edit_uid || this.edit_uid,
      obj.qs || this.qs,
      obj.data || this.data,
      obj.headers || this.headers,
      obj.json || this.json,
    ] as any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return new ApiItem(...params)
  }
}
