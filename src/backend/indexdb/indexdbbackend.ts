import { MyResponse, IBackend } from '../ibackend'
import { createDB, DBSelect, onDBSelect } from '../indexdb/indexdb'
import { fileToUrl, fileToBlob } from "@/utils"

const PROJECT_TABLE = "project"
const IMAGE_TABLE = "image" // 保存图片，未实现，Todo
const DB_NAME = "goview"
const DB_VER = "1"

export class IndexDbBackend implements IBackend {
    public async init(data: any) {
        let rtn:MyResponse = new MyResponse;
        const db:IDBDatabase = await createDB(DB_NAME, DB_VER, [
            {
                storeName: PROJECT_TABLE,
                option: {
                    keyPath: "projectId", autoIncrement:true
                },
                index: [
                    {name: 'projectId', keyPath: "projectId", unique: true},
                    {name: 'projectName', keyPath: "projectName", unique: false},
                    {name: 'release', keyPath: "release", unique: false},
                    {name: 'remarks', keyPath: "remarks", unique: false},
                    {name: 'content', keyPath: "content", unique: false},
                    {name: 'indexImage', keyPath: "indexImage", unique: false}
                ]
            }
        ])
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
            rtn.msg = "admin 和 123456"
        }
        return rtn;
    }

    public async logout() {
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async checkToken(data: any) {
        let rtn:MyResponse = new MyResponse;
        console.log("CheckToken: " + data.token)
        rtn.data = {
            token:{tokenValue:"mockToken", tokenName:"name"},
            userinfo:{nickname:"nickname", username:data.username, id:1}
        }
        return rtn;
    }

    public async projectList(data:any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        const r:any = await db.getAll()
        rtn.data = []
        r.map(function (item: any) {
            let url = ""
            if(item.indexImage){
                const Url = URL || window.URL || window.webkitURL
                url = Url.createObjectURL(item.indexImage)
            }
            rtn.data.push({
                id: item.projectId,
                title: item.projectName,
                release: item.release == 1,
                label:item.remarks,
                image:url
            })
        })
        return rtn;
    }

    public async createProject(data: any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        rtn.data.id = await db.add({ projectName:data.projectName })
        return rtn;
    }

    public async fetchProject(data: any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        const r:any = await db.get(parseInt(data.projectId))
        rtn.data = {
            id:r.projectId,
            projectName: r.projectName,
            state: r.release,
            remarks: r.remarks,
            content: r.content
        }
        return rtn;
    }

    public async updateProject(data: any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        const row:any = await db.get(parseInt(data.projectId))
        if("content" in data) row.content = data.content
        if("projectName" in data) row.projectName = data.projectName
        if("release" in data) row.release = data.release
        if("remarks" in data) row.remarks = data.remarks
        if("object" in data) {
            row.indexImage = await fileToBlob(data.object)
        }
        await db.put(row)
        return rtn;
    }

    public async copyProject(data: any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        const row:any = await db.get(parseInt(data.copyId))
        rtn.data.id =await db.add({
            projectName:data.projectName,
            content:row.content,
            indexImage:row.indexImage,
            remarks:row.remarks
        })
        return rtn;
    }

    public async deleteProject(data: any){
        let rtn:MyResponse = new MyResponse;
        const db:DBSelect = await onDBSelect(PROJECT_TABLE, DB_VER)
        await db.del(parseInt(data.projectId))
        return rtn;
    }

    public async changeProjectRelease(data: any){
        let rtn:MyResponse = new MyResponse;
        return rtn;
    }

    public async uploadFile(data: File, params:any){
        // Todo: 图片可以保存在表中
        let rtn:MyResponse = new MyResponse;
        rtn.data.uri = fileToUrl(data)
        return rtn;
    }

    public getFileUrl(uploadUri:string){
        return uploadUri;
    }
}

