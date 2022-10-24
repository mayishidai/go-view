import { MyResponse, IBackend } from './ibackend'
import { fileToUrl } from '@/utils'


/**
 * MockBackend
 * 模拟纯前端，不会保存，也不报错。
 */

export class MockBackend implements IBackend {
    public async init(data: any) {
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async login(data:any) {
        let rtn:MyResponse = new MyResponse;
        if(data.password == "123456" && data.username == "admin"){
            rtn.data = {
                token:{tokenValue:"mockToken", tokenName:"name"},
                userinfo:{nickname:"nickname", username:data.username, id:1}
            }
        }else{
            rtn.data = null
            rtn.msg = "用户名或密码错误！"
        }
        return rtn;
    }

    public async logout() {
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async checkToken(data:any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async projectList(data:any){
        let rtn:MyResponse = new MyResponse;
        rtn.data =[
            {
              id: 1,
              title: '假数据不可用',
              release: true,
              label: '官方案例'
            },
            {
              id: 2,
              title: '物料2-假数据不可用',
              release: false,
              label: '官方案例'
            },
            {
              id: 3,
              title: '物料3-假数据不可用',
              release: false,
              label: '官方案例'
            },
            {
              id: 4,
              title: '物料4-假数据不可用',
              release: false,
              label: '官方案例'
            },
            {
              id: 5,
              title: '物料5-假数据不可用',
              release: false,
              label: '官方案例'
            }
          ];
        return rtn;
    }

    public async createProject(data: any){
        let rtn:MyResponse = new MyResponse;
        rtn.data.id = "newId"
        return rtn;
    }

    public async fetchProject(data: any){
        let rtn:MyResponse = new MyResponse;
        rtn.data = {
            id:data.projectId,
            projectName: '假数据不可用',
            indexImage:'',
            state: 0,
            remarks: '官方案例',
            content: null
        }
        return rtn;
    }

    public async saveProject(data: object){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }
 
    public async updateProject(data: any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async copyProject(data: any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async deleteProject(data: any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async changeProjectRelease(data: any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async uploadFile(data: File, params:any){
        let rtn:MyResponse = new MyResponse;
        rtn.data.uri = fileToUrl(data)
        return rtn;
    }

    public getFileUrl(uploadUri:string){
        return uploadUri;
    }
}