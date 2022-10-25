## 总览

![logo](readme/logo-t-y.png)

**`master-fetch` 分支是带有后端接口请求的分支**


### feat-unify-test 分支目标
+ 实现 backend 后端工厂
将后端业务逻辑集中到 backend 了，控制 BackEndFactory 就可以适配不同的后端。
伪代码如下：
export const BackEndFactory = ():IBackend=>{
switch(项目后端配置){
case "无数据库":
return new MockBackend() // 等同： -master ，没有存储
case "indexdb":
return new IndexDbBackend() // 这次开发的，用 indexdb 做测试
case "java":
return new JavaBackend() // 等同： -fetch， 没 java 环境，还没做
case "python":
return new PythonBackend() // 自定义开发的后端
。。。 其他 oss 、云平台的后端 。。。
}}
意义：
1 unify 统一 -fetch 和 master 分支，消除分支之间的差异。
2 方便接入不同的自定义后端平台。
3 前端存储功能让测试工作更加方便

+ 完善事件处理机制
在事件中修改图表配置
在事件中修改图表数据
在事件中调用图表 exposed 函数
数据驱动界面

### 试验功能1：Backend 后端工厂
+ 对比 -fetch 分支，梳理后端逻辑到 backend 目录的 ibackend 接口
  + 登录 - login
  + 登出 - logout
  + 预览，token 注入或单点登陆 - checkToken
  + 显示项目列表和分页 - projectList
  + 保存、发布、修改名称 - updateProject
  + 复制项目 - copyProject
  + 图表内的图片上传 - uploadFile
  + 上传图片显示处理 - getFileUrl
+ IndexDbBackend 用indexdb浏览器数据库实现了 project 相关所有功能。
+ Todo: 统一后端错误处理
+ Todo：开发 javabackend，适配现有的后端

### 试验功能2：事件处理机制
+ 实现最常用的互动：找到图表元素、显示或隐藏、修改数据
+ 核心代码：useLifeHandler.hook.ts
+ 在事件代码中通过 runtime 实现运行时刻的图表管理，提供基础函数：
  + selectComponents 选择多个图表
  + selectOneComponent 选择一个图表
  + getChartConfig 读取图表
  + setChartConfig 设置图表
  + callExposed 调用图表 exposed 的函数
+ 以下例子可以在点击事件中加入代码并预览，测试效果。

+ 例子1 切换显示名称为 饼图 和 柱状图 的图表：
const range = runtime.fn.selectComponents("饼图 柱状图")
const h = runtime.fn.getChartConfig(range, "hide")
runtime.fn.setChartConfig(range, "hide", !h)

+ 例子2 修改一个名称 柱状图001 组件id 2wolqibrx3c000 的图表数据，以下两句等效
runtime.fn.setChartConfig("柱状图001", "dataset", {"dimensions":["product","data1","data2"],"source":[{"product":"Mon","data1":120,"data2":130}]})
runtime.fn.setChartConfig("#2wolqibrx3c000", "dataset", {"dimensions":["product","data1","data2"],"source":[{"product":"Mon","data1":120,"data2":230}]})

+ 例子3 找到一个组并隐藏
const c = runtime.fn.selectOneComponent("分组")
if(c){
  console.log(runtime.fn.getChartConfig(c, "isGroup" ))
  runtime.fn.setChartConfig(c, "hide", true)
}