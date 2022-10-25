import { CreateComponentType, EventLife } from '@/packages/index.d'
import * as echarts from 'echarts'
import { BackEndFactory } from '@/backend/ibackend'
import { reactive, toRef , watch, computed} from 'vue';

/**
 * 事件测试：
 * 
切换显示名称为 饼图 和 柱状图 的图标
const range = runtime.fn.selectComponents("饼图 柱状图")
const h = runtime.fn.getChartConfig(range, "hide")
runtime.fn.setChartConfig(range, "hide", !h)

修改一个名称 柱状图001 组件id 2wolqibrx3c000 的图表数据，以下两句等效
runtime.fn.setChartConfig("柱状图001", "dataset", {"dimensions":["product","data1","data2"],"source":[{"product":"Mon","data1":120,"data2":130}]})
runtime.fn.setChartConfig("#2wolqibrx3c000", "dataset", {"dimensions":["product","data1","data2"],"source":[{"product":"Mon","data1":120,"data2":230}]})

找到一个组并隐藏
const c = runtime.fn.selectOneComponent("分组")
if(c){
  console.log(runtime.fn.getChartConfig(c, "isGroup" ))
  runtime.fn.setChartConfig(c, "hide", true)
}

调用组件 exposed 函数的例子
组件中增加： defineExpose({ actionTest:actionTest })
以下调用名称为 柱状图 组件的 actionTest
runtime.fn.callExposed("柱状图", "actionTest")


数据驱动界面：
图表A 的 MOUNTED 加入对 status1 的 Watch， = "0" 隐藏
watch(()=>runtime.variables.status1, newValue => runtime.fn.setChartConfig(this, "hide", newValue == "0"))
图表B 的 MOUNTED 也加入对 status1 的 Watch = "1" 隐藏
watch(()=>runtime.variables.status1, newValue => runtime.fn.setChartConfig(this, "hide", newValue == "1"))
点击事件代码，实现图表A 和 图表B 的切换显示：
if(runtime.variables.status1 == "0"){
  runtime.variables.status1 = "1"
} else{
  runtime.variables.status1 = "0"
}

图表A 的 MOUNTED 加入对 data1 的 Watch
watch(()=>runtime.datasets.data1, 
newValue => runtime.fn.setChartConfig(this, "dataset", newValue))
图表B 的 MOUNTED 加入对 data1 的 Watch
watch(()=>runtime.datasets.data1, 
newValue => runtime.fn.setChartConfig(this, "dataset", newValue))
点击事件代码，修改datasets.data1，同时更新图表A 和 图表B 的数据 ：
runtime.datasets.data1 = {"dimensions":["product","data1","data2"],"source":[{"product":"Mon","data1":120,"data2":230}]}

 * 
 */





// * 初始化
export const useSystemInit = async () => {
  const res = await BackEndFactory.init({}) as any;
}

const getOneChartConfig = (component:any, configName:string, params?:any)=>{
  let root = null
  if(component.proxy.chartConfig) root = component.proxy.chartConfig
  else if (component.proxy.groupData) root = component.proxy.groupData
  // if(!root) return null
  switch(configName){
    case "hide":
      return root.status.hide
      break;
    case "dataset":
      return root.option.dataset
      break;
    case "isGroup":
      return root.isGroup
      break;
    case "key":
      return root.key
      break;
    case "attr":
      return root.attr
      break; 
    case "name":
      return root.chartConfig.title
  }
}

const setOneChartConfig = (component:any, configName:string, newValue:any, params?:any)=>{
  let root = null
  if(component.proxy.chartConfig) root = component.proxy.chartConfig
  else if (component.proxy.groupData) root = component.proxy.groupData
  switch(configName){
    case "hide":
      root.status.hide = newValue
      break;
    case "dataset":
      root.option.dataset = newValue
      break;
  }
}


/**
 * 选择器语法：参考 css selectors
 *     名称 组件名称，不能有空格和特殊字符（. # 引号等）
 *     [name=名称]   Todo
 *     #id  组件编号
 *     .key 组件类型  Todo
 * @param selectors 
 * @returns []
 */
const getComponentsBySelectors = (selectors:string):any[]=>{
  // 返回：数组，可能多个
  let  rtn:any[] = []
  const ar = selectors.split(" ")
  for(let a of ar){
    rtn = rtn.concat(getComponentsBySelector(a))
  }
  return rtn
}

const getComponentsBySelector = (selector:string):any[]=>{
  // 返回：数组，可能多个
  const rtn:any[] = []
  if(selector.substring(0,1) == "#")
  {
    const key = selector.substring(1)
    if(key in components){
      return [components[key]]
    }
    return rtn
  }
  for (let key in components) {
    if(getOneChartConfig(components[key], "name") == selector){
      rtn.push(components[key])
    }
  }
  return rtn
}


// 所有图表组件集合对象
const components: { [K in string]?: any } = {}

const runtime = {
  // 变量，管理各种状态
  variables:reactive({}),
  // 数据集
  datasets:reactive({}),
  // 组件列表 {}
  components:components,
  // 帮助类
  fn:{
    /**
     * 选择一个组件
     * @param selectors string 选择器语法 | component | [component]
     * @return 第一个符合要求的 component 或 null
     */
    selectOneComponent:(selectors:any)=>{
      const cList = runtime.fn.selectComponents(selectors)
      if(cList.length > 0){
        return cList[0]
      }
      return null
    },
    /**
     * 选择组件
     * @param selectors string 选择器语法 | component | [component]
     * @return 要求的 [component] 或 []
     */
    selectComponents:(selectors:any):any[]=>{
      if(!selectors) return []
      if(typeof selectors == "string") return getComponentsBySelectors(selectors)
      if(Array.isArray(selectors)) return selectors
      return [selectors]
    },
    /**
     * 获取组件的值，如果多个，使用第一个
     * @param selectors string 选择器语法 | component | [component]
     * @param configName 配置名称
     * @param params 备用参数，可选
     * @returns 配置的值
     */
    getChartConfig:(selectors:any, configName:string, params?:any)=>{
      const component:any = runtime.fn.selectOneComponent(selectors)
      if(!component && !component.proxy) return null
      return getOneChartConfig(component, configName, params)
    },
    /**
     * 设置组件的值，支持多个
     * @param selectors string 选择器语法 | component | [component]
     * @param configName 配置名称
     * @param newValue 新值
     * @param params 备用参数，可选
     * @returns 配置的值
     */
    setChartConfig:(selectors:any, configName:string, newValue:any, params?:any)=>{
      const cList:any[] = runtime.fn.selectComponents(selectors)
      for(let c of cList){
        if(!c && !c.proxy) return null
        setOneChartConfig(c, configName, newValue, params)
      }
    },
    /**
     * 调用组件暴露的函数，组件中使用 defineExpose 进行定义
     * @param selectors string 选择器语法 | component | [component]
     * @param action 组件中 defineExpose 的函数名
     * @param params 调用的参数只支持一个参数或没有参数
     * @returns 无
     */
    callExposed:(selectors:any, action:string, params?:any)=>{
      const cList:any[] = runtime.fn.selectComponents(selectors)
      for(let c of cList){
        if(!c && !c.exposed) return null
        if(typeof c.exposed[action] == "function") c.exposed[action](params)
      }
    }
  }
}

// 项目提供的npm 包变量
export const npmPkgs = { echarts, toRef , watch, computed, runtime }

export const useLifeHandler = (chartConfig: CreateComponentType) => {
  const events = chartConfig.events || {}
  console.log("chartConfig.events") 
  console.log(chartConfig.events) 
  // 生成生命周期事件
  let lifeEvents = {
    [EventLife.BEFORE_MOUNT](e: any) {
      // 存储组件
      components[chartConfig.id] = e.component
      const fnStr = (events[EventLife.BEFORE_MOUNT] || '').trim()
      generateFunc(fnStr, e, e.component)
    },
    [EventLife.MOUNTED](e: any) {
      const fnStr = (events[EventLife.MOUNTED] || '').trim()
      generateFunc(fnStr, e, e.component)
    }
  }
  // 遍历，按需侦听
  for(let key in EventLife)
  {
    if(key != "BEFORE_MOUNT" && key != "MOUNTED"){
      const k = EventLife[key as keyof typeof EventLife] 
      const fnStr = (events[<EventLife>k] || '').trim()
      if(fnStr){
        lifeEvents[k as keyof typeof lifeEvents] = (e:any) => {
          const fnStr = (events[<EventLife>k] || '').trim()
          generateFunc(fnStr, e, components[chartConfig.id])
        }
      }
    }
  }
  return lifeEvents
}

/**
 *
 * @param fnStr 用户方法体代码
 * @param e 执行生命周期的动态组件实例
 */
function generateFunc(fnStr: string, e: any, component:any) {
  if(fnStr == "") return
  try {
    // npmPkgs 便于拷贝 echarts 示例时设置option 的formatter等相关内容
    Function(`
      "use strict";
      return (
        async function(e, components, node_modules){
          const {${Object.keys(npmPkgs).join()}} = node_modules;
          ${fnStr}
        }
      )`)().bind(component)(e, components, npmPkgs)
  } catch (error) {
    console.error(error)
  }
}
