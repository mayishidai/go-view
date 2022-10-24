
/**
 * 后端接口，相关功能对应表：
 *   登录 - login
 *   登出 - logout
 *   预览，token 注入或单点登陆 - checkToken
 *   显示项目列表和分页 - projectList
 *   保存、发布、修改名称 - updateProject
 *   复制项目 - copyProject
 *   图表内的图片上传 - uploadFile
 *   上传图片显示处理 - getFileUrl
 * 所有接口返回格式：MyResponseType
 */
import { IndexDbBackend } from "./indexdb/indexdbbackend";
// import { PythonBackend } from "./python/pythonbackend";

export interface MyResponseType {
    code: number; // 状态：200 表示接口调用成功，参考：HttpEnum
    msg: string;  // 提示信息，配合 data 和 code 
    data: any;   // data = null 表示接口结果错误，错误原因放在 msg
}

export class MyResponse implements MyResponseType {
    code: number = 200;
    msg: string = "";
    data: any = {};
}

/**
 * 实现 IBackend 后端接口
 * 错误处理：
 */
export interface IBackend {
    /**
     * 初始化后端系统，测试后端连接，oss地址等
     * @param data 可选，备用
     */
    init(data:any):any

    /**
     * 登陆
     * @param data {} .username .password
     * @return MyResponseType 
     * .data 须包含：
     *      token:{tokenValue:"", tokenName:""},
     *      userinfo:{nickname:"",  username: "", id: 用户ID}
     * 错误处理：
     *   1 接口错误 .code 不为 200 .msg 可选，后端反馈错误信息
     *   2 登陆错误 .code=200  .data = null, msg 可选，反馈不能登陆的原因
     * 登陆信息.data 记录：
     *   setLocalStorage(GO_LOGIN_INFO_STORE, res.data)
     */
    login(data:any):any

    /**
     * 通知后端登出
     */
    logout():any

    /**
     * 检查Token是否有效，配合预览页面和单点登陆，备用
     * @param data {tokenValue, tokenName} 
     * @return 同 login()
     */
    checkToken(data:any):any

    /**
     * 项目列表
     * @param data {} .page, .limit
     * @return [项目]，字段名称需要进行 map 
     *   id: projectId
     *   title:projectName
     *   release,
     *   label:remarks
     *   image:indexImage 如果需要挂刷新，在这里处理。如果需要拼接 url（getFileUrl），也在这里处理好。
     */
    projectList(data:any):any
    
    /**
     * 新增项目
     * @param data 
     *   .projectName
     * @return id 新项目 ID
     */
    createProject(data: any):any

    /**
     * 获取项目
     * @param data .projectId
     * @return 
        id:projectId
        projectName,
        state: release,
        remarks,
        content
     */
    fetchProject(data: any):any

    /**
     * 修改项目
     * @param data 
     *   .projectId 必须
     *   .projectName 可选
     *   .release 可选
     *   .content 可选
     *   .object File 可选 对象
     *   .remarks 可选
     * @return 
     */
    updateProject(data: any):any

    /**
     * 复制项目
     * @param data 
     *   .copyId 需要复制的项目ID
     *   .projectName 
     * @return id 新项目ID
     */
    copyProject(data: any):any

    /**
     * 删除项目
     * @param data 
     *   .projectId
     * @return 
     */
    deleteProject(data: any):any

    /**
     * 文件上传
     * @param file File 图片对象 
     * @param params 备用 Todo: 上传文件可带上项目ID和其他附加信息，以便后端文件管理
     * @return .uri 文件对象 uri。建议在图表中保存相对地址，通过 getFileUrl 得到完整地址
     */
    uploadFile(file: File, params: any):any
    /**
     * 文件地址转换，处理 uploadFile 的返回地址。如果是绝对地址，可以不处理
     * @param uploadUri 上传返回的 uri
     * @return 供 image.src 使用的地址信息
     */
    getFileUrl(uploadUri:string):string
}

export const BackEndFactory = new IndexDbBackend();
// export const BackEndFactory = new MockBackend();
// export const BackEndFactory = new PythonBackend();