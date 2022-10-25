import { loginCheck, getSessionStorage, fetchRouteParamsLocation, httpErrorHandle, fetchRouteParams, fetchRouteQuery, setLocalStorage } from '@/utils'
import { ResultEnum } from '@/enums/httpEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { ChartEditStorage } from '@/store/modules/chartEditStore/chartEditStore.d'
import { BackEndFactory } from '@/backend/ibackend'


export interface ChartEditStorageType extends ChartEditStorage {
  id: string
}

// 根据路由 id 获取存储数据的信息
export const getSessionStorageInfo = async () => {
  let id:string = fetchRouteParamsLocation()
  if(id.indexOf("?") > 0){
    id = id.substring(0, id.indexOf("?"))
  }

  const storageList: ChartEditStorageType[] = getSessionStorage(
    StorageEnum.GO_CHART_STORAGE_LIST
  )
  
  // 是否本地预览
  if (!storageList || storageList.findIndex(e => e.id === id.toString()) === -1) {
    // 处理 Token 注入
    const q = fetchRouteQuery();
    if(q && q.token && !loginCheck()){
      // Token 注入
      const rt = await BackEndFactory.checkToken({ token: q.token }) as any
      if (rt.code === ResultEnum.SUCCESS && rt.data) {
        // 记录登陆信息
        setLocalStorage( StorageEnum.GO_LOGIN_INFO_STORE, rt.data)
      }else{
        httpErrorHandle()
        return {}
      }
    }
    
    // 接口调用
    const res = await BackEndFactory.fetchProject({ projectId: id }) as any
    if (res.code === ResultEnum.SUCCESS && res.data) {
      const { content, state } = res.data
      if (state === -1) {
        // 跳转未发布页
        return { isRelease: false }
      }
      return { ...JSON.parse(content), id }
    } else {
      httpErrorHandle()
      // 错误处理，Todo
      return {}
    }
  }
  
  // 本地读取
  for (let i = 0; i < storageList.length; i++) {
    if (id.toString() === storageList[i]['id']) {
      return storageList[i]
    }
  }
}