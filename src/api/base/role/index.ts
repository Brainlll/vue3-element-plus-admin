/*
 * @Description: 角色
 * @Author: gumingchen
 * @Email: 1240235512@qq.com
 * @Date: 2020-12-28 16:25:18
 * @LastEditors: gumingchen
 * @LastEditTime: 2021-04-30 13:26:48
 */
import service from '@/utils/request'
import { PageData, PageParams, ResponseData } from 'axios'
import { Role } from 'Type/role'

interface pageParams extends PageParams {
  name: string
}

/**
 * @description: 分页列表
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function getPage(params: pageParams): Promise<ResponseData<PageData<Role.Base>>> {
  return service({
    url: '/base/role/page',
    method: 'get',
    params: params
  })
}

/**
 * @description: 信息
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function getInfo(params: number): Promise<ResponseData<Role.Dto>> {
  return service({
    url: `/base/role/info/${ params }`,
    method: 'get'
  })
}

/**
 * @description: 新增
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function add(params: Role.Dto): Promise<ResponseData<null>> {
  return service({
    url: '/base/role/create',
    method: 'post',
    data: params
  })
}

/**
 * @description: 编辑
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function edit(params: Role.Dto): Promise<ResponseData<null>> {
  return service({
    url: '/base/role/update',
    method: 'post',
    data: params
  })
}

/**
 * @description: 删除
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function del(params: number[]): Promise<ResponseData<null>> {
  return service({
    url: '/base/role/delete',
    method: 'post',
    data: params
  })
}

/**
 * @description: 下拉列表
 * @param {*}
 * @return {*}
 * @author: gumingchen
 */
export function getSelect(): Promise<ResponseData<Role.Simple[]>> {
  return service({
    url: '/base/role/select',
    method: 'get'
  })
}
