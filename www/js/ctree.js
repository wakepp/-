/* ===== 命令树（基岩版 1.21） =====
 * 键可含空格(多级子命令)，引擎按最长前缀匹配
 * 参数: n=名称 t=类型 o=可选 d=描述 ex=数字示例 tpl=json模板 list=枚举键
 * 类型: literal(selector列表) selector position dest enum item block entity
 *       effect enchant sound int float bool text message json exec
 */
const CTREE = {
    // ---- 传送 ----
    "tp": { d: "传送实体", p: [
        { n: "目标", t: "dest", o: 1, d: "坐标或实体(默认自己)" },
        { n: "目的地", t: "dest", d: "坐标(x y z)或目标实体" } ]},
    "teleport": { d: "传送实体(同tp)", p: [
        { n: "目标", t: "dest", o: 1 },
        { n: "目的地", t: "dest" } ]},
    "spawnpoint": { d: "设置重生点", p: [
        { n: "玩家", t: "selector", o: 1 },
        { n: "位置", t: "position", o: 1 } ]},
    "setworldspawn": { d: "设置世界出生点", p: [
        { n: "位置", t: "position", o: 1 } ]},
    "spreadplayers": { d: "随机分散传送", p: [
        { n: "中心x", t: "float", d: "如 0" },
        { n: "中心z", t: "float", d: "如 0" },
        { n: "最小间距", t: "float", d: "如 10" },
        { n: "最大范围", t: "float", d: "如 100" },
        { n: "目标", t: "selector" } ]},

    // ---- 物品 ----
    "give": { d: "给予玩家物品", p: [
        { n: "玩家", t: "selector" },
        { n: "物品", t: "item" },
        { n: "数量", t: "int", o: 1, ex: "64" },
        { n: "数据值", t: "int", o: 1 },
        { n: "组件", t: "json", o: 1, tpl: '{"minecraft:keep_on_death":{}}' } ]},
    "clear": { d: "清除玩家物品", p: [
        { n: "玩家", t: "selector", o: 1 },
        { n: "物品", t: "item", o: 1 },
        { n: "数据值", t: "int", o: 1 },
        { n: "最大数量", t: "int", o: 1 } ]},
    "replaceitem block": { d: "替换容器内物品", p: [
        { n: "容器位置", t: "position" },
        { n: "槽位", t: "text", d: "slot.container 序号" },
        { n: "物品", t: "item" },
        { n: "数量", t: "int", o: 1 } ]},
    "replaceitem entity": { d: "替换实体物品", p: [
        { n: "目标", t: "selector" },
        { n: "槽位", t: "enum", list: "slotmain", d: "槽位后接序号 如 slot.hotbar 0" },
        { n: "物品", t: "item" },
        { n: "数量", t: "int", o: 1 } ]},
    "enchant": { d: "给手持物品附魔", p: [
        { n: "玩家", t: "selector" },
        { n: "附魔", t: "enchant" },
        { n: "等级", t: "int", o: 1, ex: "1" } ]},
    "xp": { d: "给予经验", p: [
        { n: "数量", t: "text", d: "数字 或 数字L(等级) 如 10L" },
        { n: "玩家", t: "selector", o: 1 } ]},

    // ---- 实体 ----
    "summon": { d: "召唤实体", p: [
        { n: "实体", t: "entity" },
        { n: "位置", t: "position", o: 1 },
        { n: "生成事件", t: "text", o: 1, d: "如 minecraft:as_baby" },
        { n: "名称", t: "text", o: 1, d: "如 小明" } ]},
    "kill": { d: "杀死实体", p: [
        { n: "目标", t: "selector", o: 1, d: "默认自己" } ]},
    "effect": { d: "给予状态效果", p: [
        { n: "目标", t: "selector" },
        { n: "效果", t: "literal", list: [["clear", "清除全部效果"]], o: 1 },
        { n: "效果", t: "effect", o: 1 },
        { n: "秒数", t: "int", o: 1, ex: "30" },
        { n: "强度", t: "int", o: 1, ex: "1" },
        { n: "隐藏粒子", t: "bool", o: 1 } ]},
    "event entity": { d: "触发实体事件", p: [
        { n: "目标", t: "selector" },
        { n: "事件名", t: "text", d: "如 minecraft:ageable_grow_up" } ]},
    "damage": { d: "对实体造成伤害", p: [
        { n: "目标", t: "selector" },
        { n: "伤害值", t: "int", ex: "10" },
        { n: "伤害类型", t: "text", o: 1, d: "如 entity_attack fall fire" },
        { n: "击退", t: "bool", o: 1 } ]},
    "tag": { d: "管理实体标签", p: [
        { n: "目标", t: "selector" },
        { n: "操作", t: "literal", list: [["add", "添加标签"], ["remove", "移除标签"], ["list", "列出标签"]] },
        { n: "标签名", t: "text", o: 1 } ]},
    "testfor": { d: "检测实体", p: [
        { n: "目标", t: "selector" } ]},
    "querytarget": { d: "获取实体详细数据", p: [
        { n: "目标", t: "selector" } ]},
    "ride": { d: "实体骑乘", p: [
        { n: "骑乘者", t: "selector" },
        { n: "操作", t: "literal", list: [["start_riding", "开始骑乘"], ["stop_riding", "停止骑乘"]] },
        { n: "载具", t: "selector", o: 1 } ]},

    // ---- 世界 / 方块 ----
    "setblock": { d: "放置方块", p: [
        { n: "位置", t: "position" },
        { n: "方块", t: "block" },
        { n: "方块状态", t: "text", o: 1, d: "如 [\"direction\"=1]" },
        { n: "处理方式", t: "enum", list: "setblockmode", o: 1 } ]},
    "fill": { d: "填充区域", p: [
        { n: "起点", t: "position" },
        { n: "终点", t: "position" },
        { n: "方块", t: "block" },
        { n: "方块状态", t: "text", o: 1 },
        { n: "填充模式", t: "enum", list: "fillmode", o: 1 } ]},
    "clone": { d: "复制区域", p: [
        { n: "起点", t: "position" },
        { n: "终点", t: "position" },
        { n: "目的地", t: "position" },
        { n: "掩码模式", t: "text", o: 1, d: "masked/replace/filtered" },
        { n: "复制模式", t: "text", o: 1, d: "force/move/normal" } ]},
    "structure load": { d: "加载结构", p: [
        { n: "结构名", t: "text", d: "如 myhouse" },
        { n: "位置", t: "position" },
        { n: "旋转", t: "enum", list: "rot", o: 1 },
        { n: "镜像", t: "text", o: 1, d: "none/x/z/xz" } ]},
    "structure save": { d: "保存结构", p: [
        { n: "结构名", t: "text" },
        { n: "起点", t: "position" },
        { n: "终点", t: "position" },
        { n: "包含实体", t: "bool", o: 1 } ]},
    "testforblock": { d: "检测方块", p: [
        { n: "位置", t: "position" },
        { n: "方块", t: "block" } ]},
    "testforblocks": { d: "检测区域相同", p: [
        { n: "起点1", t: "position" },
        { n: "终点1", t: "position" },
        { n: "起点2", t: "position" } ]},
    "tickingarea add": { d: "添加常加载区块", p: [
        { n: "起点", t: "position" },
        { n: "终点", t: "position" },
        { n: "名称", t: "text", o: 1 } ]},
    "tickingarea list": { d: "列出常加载区块", p: [] },
    "tickingarea remove": { d: "移除常加载区块", p: [
        { n: "名称/位置", t: "text" } ]},
    "locate": { d: "定位最近结构", p: [
        { n: "类型", t: "literal", list: [["structure", "定位结构"], ["biome", "定位群系"]] },
        { n: "名称", t: "text", d: "如 village_plains" } ]},
    "getspawnpoint": { d: "获取重生点", p: [
        { n: "玩家", t: "selector", o: 1 } ]},

    // ---- 时间 / 天气 ----
    "time set": { d: "设置时间", p: [
        { n: "时间", t: "enum", list: "timerset", o: 1 },
        { n: "刻度", t: "int", o: 1, d: "0-24000" } ]},
    "time add": { d: "增加时间", p: [
        { n: "刻度", t: "int", ex: "1000" } ]},
    "time query": { d: "查询时间", p: [
        { n: "查询项", t: "literal", list: [["daytime", "当前刻"], ["gametime", "游戏总时长"], ["day", "第几天"]] } ]},
    "weather": { d: "设置天气", p: [
        { n: "天气", t: "enum", list: "weather" },
        { n: "持续秒数", t: "int", o: 1, ex: "600" } ]},
    "alwaysday": { d: "锁定白天", p: [
        { n: "开关", t: "bool", o: 1 } ]},
    "daylock": { d: "锁定时间", p: [
        { n: "开关", t: "bool", o: 1 } ]},
    "toggledownfall": { d: "切换雨晴", p: [] },

    // ---- 模式 / 规则 ----
    "gamemode": { d: "切换游戏模式", p: [
        { n: "模式", t: "enum", list: "gamemode" },
        { n: "玩家", t: "selector", o: 1 } ]},
    "gamerule": { d: "设置游戏规则", p: [
        { n: "规则", t: "enum", list: "gamerule" },
        { n: "值", t: "bool", o: 1, d: "true/false 或数字" } ]},
    "difficulty": { d: "设置难度", p: [
        { n: "难度", t: "enum", list: "difficulty" } ]},
    "setmaxplayers": { d: "设置最大玩家数", p: [
        { n: "数量", t: "int", ex: "10" } ]},

    // ---- 计分板 ----
    "scoreboard objectives add": { d: "创建记分项", p: [
        { n: "记分项名", t: "text", d: "如 coins" },
        { n: "准则", t: "literal", list: [["dummy", "唯一可用准则"]] },
        { n: "显示名", t: "text", o: 1, d: "如 金币" } ]},
    "scoreboard objectives list": { d: "列出记分项", p: [] },
    "scoreboard objectives remove": { d: "删除记分项", p: [
        { n: "记分项名", t: "text" } ]},
    "scoreboard objectives setdisplay": { d: "设置显示位置", p: [
        { n: "位置", t: "enum", list: "displayloc" },
        { n: "记分项", t: "text", o: 1 },
        { n: "排序", t: "enum", list: "sortorder", o: 1 } ]},
    "scoreboard players set": { d: "设置分数", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text", d: "如 coins" },
        { n: "分数", t: "int", ex: "100" } ]},
    "scoreboard players add": { d: "增加分数", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text" },
        { n: "数值", t: "int", ex: "10" } ]},
    "scoreboard players remove": { d: "减少分数", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text" },
        { n: "数值", t: "int", ex: "10" } ]},
    "scoreboard players list": { d: "列出分数", p: [
        { n: "目标", t: "selector", o: 1 } ]},
    "scoreboard players reset": { d: "重置分数", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text", o: 1 } ]},
    "scoreboard players test": { d: "检测分数范围", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text" },
        { n: "最小值", t: "int", ex: "0" },
        { n: "最大值", t: "int", o: 1 } ]},
    "scoreboard players operation": { d: "分数运算", p: [
        { n: "目标", t: "selector" },
        { n: "目标记分项", t: "text" },
        { n: "运算符", t: "literal", list: [["+=", "加"], ["-=", "减"], ["*=", "乘"], ["/=", "除"], ["%=", "取余"], ["=", "赋值"], ["<", "取小"], [">", "取大"], ["<>", "交换"]] },
        { n: "来源目标", t: "selector" },
        { n: "来源记分项", t: "text" } ]},

    // ---- execute ----
    "execute": { d: "条件/变换执行命令", p: [
        { n: "子命令", t: "enum", list: "executeSub" },
        { t: "exec", n: "链式参数", d: "继续子命令，run 执行命令" } ]},
    "execute as": { d: "以实体身份执行", p: [
        { n: "执行者", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute at": { d: "在实体位置执行", p: [
        { n: "位置实体", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute positioned": { d: "在指定位置执行", p: [
        { n: "位置", t: "position" },
        { t: "exec", n: "后续" } ]},
    "execute positioned as": { d: "在实体位置执行", p: [
        { n: "位置实体", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute rotated": { d: "以指定朝向执行", p: [
        { n: "yRot", t: "float", d: "水平角 如 0" },
        { n: "xRot", t: "float", d: "俯仰角 如 0" },
        { t: "exec", n: "后续" } ]},
    "execute rotated as": { d: "以实体朝向执行", p: [
        { n: "朝向实体", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute align": { d: "对齐方块格执行", p: [
        { n: "轴", t: "text", d: "xyz组合 如 xz" },
        { t: "exec", n: "后续" } ]},
    "execute anchored": { d: "锚定执行", p: [
        { n: "锚点", t: "literal", list: [["eyes", "眼睛"], ["feet", "脚"]] },
        { t: "exec", n: "后续" } ]},
    "execute in": { d: "切换维度执行", p: [
        { n: "维度", t: "text", d: "overworld/nether/the_end" },
        { t: "exec", n: "后续" } ]},
    "execute if block": { d: "方块满足则执行", p: [
        { n: "位置", t: "position" },
        { n: "方块", t: "block" },
        { t: "exec", n: "后续" } ]},
    "execute if entity": { d: "实体存在则执行", p: [
        { n: "目标", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute if score": { d: "分数满足则执行", p: [
        { n: "目标", t: "selector" },
        { n: "记分项", t: "text" },
        { n: "比较", t: "literal", list: [["matches", "匹配范围 如 1.."], ["<", "小于"], ["<=", "小于等于"], [">", "大于"], [">=", "大于等于"]] },
        { n: "范围/值", t: "text", d: "如 10 或 1..20" },
        { t: "exec", n: "后续" } ]},
    "execute unless block": { d: "方块不满足则执行", p: [
        { n: "位置", t: "position" },
        { n: "方块", t: "block" },
        { t: "exec", n: "后续" } ]},
    "execute unless entity": { d: "实体不存在则执行", p: [
        { n: "目标", t: "selector" },
        { t: "exec", n: "后续" } ]},
    "execute if blocks": { d: "区域相同则执行", p: [
        { n: "起点1", t: "position" },
        { n: "终点1", t: "position" },
        { n: "起点2", t: "position" },
        { n: "模式", t: "literal", list: [["all", "全部比较"], ["masked", "忽略空气"]] },
        { t: "exec", n: "后续" } ]},

    // ---- 通用 / 信息 ----
    "help": { d: "命令帮助", p: [
        { n: "页码", t: "int", o: 1, ex: "1" } ]},
    "list": { d: "列出在线玩家", p: [] },
    "say": { d: "广播消息", p: [
        { n: "消息", t: "message" } ]},
    "me": { d: "第三人称动作", p: [
        { n: "动作", t: "message" } ]},
    "tell": { d: "私聊玩家", p: [
        { n: "玩家", t: "selector" },
        { n: "消息", t: "message" } ]},
    "msg": { d: "私聊玩家", p: [
        { n: "玩家", t: "selector" },
        { n: "消息", t: "message" } ]},
    "w": { d: "私聊玩家", p: [
        { n: "玩家", t: "selector" },
        { n: "消息", t: "message" } ]},
    "title": { d: "显示标题", p: [
        { n: "玩家", t: "selector" },
        { n: "位置", t: "literal", list: [["title", "大标题"], ["subtitle", "小标题"], ["actionbar", "动作栏"], ["clear", "清空"], ["reset", "重置"], ["times", "设置时间"]] },
        { n: "内容/参数", t: "text", o: 1, d: "文本 或 times时为 淡入 停留 淡出" } ]},
    "titleraw": { d: "JSON标题", p: [
        { n: "玩家", t: "selector" },
        { n: "位置", t: "literal", list: [["title", "大标题"], ["subtitle", "小标题"], ["actionbar", "动作栏"]] },
        { n: "JSON", t: "json", o: 1, tpl: '{"rawtext":[{"text":"你好"}]}' } ]},
    "kick": { d: "踢出玩家", p: [
        { n: "玩家", t: "selector" },
        { n: "原因", t: "message", o: 1 } ]},

    // ---- 权限 ----
    "op": { d: "给予管理员", p: [
        { n: "玩家", t: "selector" } ]},
    "deop": { d: "移除管理员", p: [
        { n: "玩家", t: "selector" } ]},
    "ability": { d: "设置玩家能力", p: [
        { n: "玩家", t: "selector" },
        { n: "能力", t: "literal", list: [["mayfly", "允许飞行"], ["muted", "禁言"], ["worldbuilder", "世界建造者"]] },
        { n: "开关", t: "bool" } ]},
    "whitelist": { d: "管理白名单", p: [
        { n: "操作", t: "literal", list: [["add", "添加"], ["remove", "移除"], ["list", "列出"], ["on", "开启"], ["off", "关闭"], ["reload", "重载"]] },
        { n: "玩家", t: "selector", o: 1 } ]},
    "immutableworld": { d: "世界不可破坏", p: [
        { n: "开关", t: "bool", o: 1 } ]},

    // ---- 音效 / 特效 ----
    "playsound": { d: "播放音效", p: [
        { n: "音效", t: "sound" },
        { n: "玩家", t: "selector", o: 1 },
        { n: "位置", t: "position", o: 1 },
        { n: "音量", t: "float", o: 1, ex: "1" },
        { n: "音调", t: "float", o: 1, ex: "1" } ]},
    "stopsound": { d: "停止音效", p: [
        { n: "玩家", t: "selector", o: 1 },
        { n: "音效", t: "sound", o: 1 } ]},
    "particle": { d: "生成粒子", p: [
        { n: "效果", t: "text", d: "如 minecraft:heart_particle" },
        { n: "位置", t: "position", o: 1 } ]},
    "music": { d: "播放背景音乐", p: [
        { n: "操作", t: "literal", list: [["play", "播放"], ["queue", "排队"], ["stop", "停止"], ["volume", "音量"]] },
        { n: "曲目/参数", t: "text", o: 1, d: "如 record.pigstep" } ]},
    "fog": { d: "视野雾效", p: [
        { n: "玩家", t: "selector" },
        { n: "操作", t: "literal", list: [["push", "添加"], ["remove", "移除"], ["pop", "弹出"]] },
        { n: "雾效果ID", t: "text", o: 1, d: "如 minecraft:fog_crimson_forest" } ]},
    "playanimation": { d: "播放实体动画", p: [
        { n: "实体", t: "selector" },
        { n: "动画名", t: "text", d: "如 animation.humanoid.base_pose" },
        { n: "停止表达式", t: "text", o: 1 } ]},
    "camera": { d: "摄像机视角", p: [
        { n: "玩家", t: "selector" },
        { n: "操作", t: "literal", list: [["set", "设置"], ["clear", "清除"]] },
        { n: "预设", t: "text", o: 1, d: "minecraft:first_person/free等" } ]},
    "hud": { d: "隐藏/恢复HUD", p: [
        { n: "玩家", t: "selector" },
        { n: "操作", t: "literal", list: [["hide", "隐藏"], ["reset", "恢复"]] },
        { n: "元素", t: "enum", list: "hudelm", o: 1 } ]},

    // ---- 输入 / 交互 ----
    "inputpermission": { d: "禁用/启用玩家输入", p: [
        { n: "操作", t: "literal", list: [["set", "设置"], ["query", "查询"]] },
        { n: "玩家", t: "selector" },
        { n: "权限", t: "literal", list: [["camera", "视角"], ["movement", "移动"]] },
        { n: "开关", t: "bool", o: 1 } ]},
    "recipe": { d: "给予/夺走配方", p: [
        { n: "操作", t: "literal", list: [["give", "给予"], ["take", "夺走"]] },
        { n: "玩家", t: "selector" },
        { n: "配方", t: "text", d: "如 cake" } ]},
    "dialogue": { d: "打开NPC对话", p: [
        { n: "NPC", t: "selector" },
        { n: "操作", t: "literal", list: [["change", "切换场景"], ["open", "打开"]] },
        { n: "场景名", t: "text" },
        { n: "玩家", t: "selector", o: 1 } ]},
    "mobevent": { d: "开关生物事件", p: [
        { n: "事件", t: "text", d: "如 pillager_patrols" },
        { n: "开关", t: "bool", o: 1 } ]},

    // ---- 函数 / 脚本 ----
    "function": { d: "执行函数文件", p: [
        { n: "函数路径", t: "text", d: "如 cmd/fly" } ]},
    "scriptevent": { d: "发送脚本事件", p: [
        { n: "消息ID", t: "text", d: "如 mc:start" },
        { n: "消息内容", t: "text", o: 1 } ]},
    "reload": { d: "重载函数文件", p: [] },
};
