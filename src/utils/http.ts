/**
 * 请求失败统一处理，allowRoute 允许跳转。
 * @param MyResponse MyResponseType，可以为空。
 * @return 
 */
 import { ResultEnum } from "@/enums/httpEnum"
 import { PageEnum, ErrorPageNameMap } from "@/enums/pageEnum"
 import { redirectErrorPage, routerTurnByName } from '@/utils'
 
 export const httpErrorHandle = (MyResponse?:any, allowRoute:boolean = true) => {
   if(MyResponse){
    const {code, msg} = MyResponse
    if (MyResponse.code === ResultEnum.TOKEN_OVERDUE) {
      window['$message'].error(msg || window['$t']('http.token_overdue_message'))
      if(allowRoute) routerTurnByName(PageEnum.BASE_LOGIN_NAME)
      return
    }
 
    if (MyResponse.code != ResultEnum.SUCCESS) {
      // 其他错误处理 Todo
      if (ErrorPageNameMap.get(code) && allowRoute) {
        redirectErrorPage(code)
      }
    }
  }
  window['$message'].error(window['$t']('http.error_message'))
}