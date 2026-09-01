/* ===== 基础数据：选择器 / 枚举 / 值候选库 ===== */

// 目标选择器
const SELECTORS = [
    ["@s", "命令执行者自己"],
    ["@p", "距离最近的玩家"],
    ["@a", "所有玩家"],
    ["@e", "所有实体"],
    ["@r", "随机玩家"],
];

// @a[ 内的参数（键名 → 描述）
const SEL_PARAMS = [
    ["x", "x坐标"], ["y", "y坐标"], ["z", "z坐标"],
    ["dx", "x方向偏移范围"], ["dy", "y方向偏移范围"], ["dz", "z方向偏移范围"],
    ["r", "最大半径(格)"], ["rm", "最小半径(格)"],
    ["c", "数量限制(-1为全部)"],
    ["m", "游戏模式(0生存1创造2冒险3观察)"],
    ["type", "实体类型"],
    ["name", "实体名称"],
    ["tag", "标签"],
    ["family", "族群(如zombie)"],
    ["scores", "计分板条件 如scores={金币=10}"],
    ["rx", "俯仰角最大值"], ["rxm", "俯仰角最小值"],
    ["ry", "朝向角最大值"], ["rym", "朝向角最小值"],
    ["l", "最大经验等级"], ["lm", "最小经验等级"],
];

// type= 的值候选（常用实体）
const ENTITY_TYPES = [
    ["player", "玩家"], ["zombie", "僵尸"], ["skeleton", "骷髅"],
    ["creeper", "苦力怕"], ["spider", "蜘蛛"], ["enderman", "末影人"],
    ["witch", "女巫"], ["slime", "史莱姆"], ["drowned", "溺尸"],
    ["zombie_villager", "僵尸村民"], ["pillager", "掠夺者"],
    ["vindicator", "卫道士"], ["phantom", "幻翼"],
    ["wolf", "狼"], ["cat", "猫"], ["horse", "马"], ["cow", "牛"],
    ["pig", "猪"], ["chicken", "鸡"], ["sheep", "羊"],
    ["villager_v2", "村民"], ["iron_golem", "铁傀儡"],
    ["arrow", "箭"], ["item", "掉落物"], ["xp_orb", "经验球"],
    ["tnt", "被点燃的TNT"], ["falling_block", "下落方块"],
    ["lightning_bolt", "闪电"], ["minecart", "矿车"], ["boat", "船"],
];

// 枚举
const ENUMS = {
    gamemode: [["s", "生存"], ["survival", "生存"], ["c", "创造"], ["creative", "创造"], ["a", "冒险"], ["adventure", "冒险"], ["spectator", "观察者"]],
    weather: [["clear", "晴天"], ["rain", "下雨"], ["thunder", "雷暴"]],
    difficulty: [["peaceful", "和平"], ["easy", "简单"], ["normal", "普通"], ["hard", "困难"]],
    bool: [["true", "是"], ["false", "否"]],
    fillmode: [["destroy", "破坏原有方块"], ["hollow", "只留外壳"], ["keep", "只填空气"], ["outline", "只填外壳"]],
    setblockmode: [["replace", "替换"], ["destroy", "破坏并掉落"], ["keep", "仅空气处"]],
    timerset: [["day", "白天"], ["night", "夜晚"], ["noon", "正午"], ["midnight", "午夜"], ["sunrise", "日出"], ["sunset", "日落"]],
    gamerule: [["keepinventory", "死亡不掉落"], ["dofiretick", "火势蔓延"], ["domobspawning", "生物生成"], ["dodaylightcycle", "时间流动"], ["pvp", "玩家互伤"], ["mobgriefing", "生物破坏方块"], ["showcoordinates", "显示坐标"], ["commandblockoutput", "命令方块输出"], ["sendcommandfeedback", "命令执行反馈"], ["drowningdamage", "溺水伤害"], ["falldamage", "摔落伤害"], ["firedamage", "火焰伤害"], ["doentitydrops", "实体掉落"], ["doinsomnia", "幻翼生成"], ["randomtickspeed", "随机刻速度"], ["tntexplodes", "TNT爆炸"], ["naturalregeneration", "自然回血"]],
    rot: [["0", "不旋转"], ["90", "顺时针90°"], ["180", "旋转180°"], ["270", "逆时针90°"]],
    displayloc: [["list", "Tab玩家列表"], ["sidebar", "屏幕侧边栏"], ["belowname", "玩家名牌下方"]],
    sortorder: [["ascending", "升序"], ["descending", "降序"]],
    executeSub: [["as", "改变执行者"], ["at", "改变执行位置和朝向"], ["align", "对齐方块格"], ["positioned", "改变执行位置"], ["rotated", "改变执行朝向"], ["in", "改变执行维度"], ["anchored", "锚定眼睛/脚"], ["if", "条件满足则执行"], ["unless", "条件不满足则执行"], ["run", "执行命令"]],
    slotmain: [["slot.hotbar", "快捷栏 0-8"], ["slot.inventory", "背包 0-35"], ["slot.weapon.mainhand", "主手"], ["slot.weapon.offhand", "副手"], ["slot.armor.head", "头盔"], ["slot.armor.chest", "胸甲"], ["slot.armor.legs", "护腿"], ["slot.armor.feet", "靴子"]],
    hudelm: [["all", "全部"], ["paper_doll", "纸娃娃"], ["armor", "护甲条"], ["hotbar", "快捷栏"], ["heart", "血量"], ["food", "饥饿"], ["air", "氧气泡"], ["crosshair", "准星"], ["experience", "经验条"], ["score", "计分侧栏"]],
};

// 物品 / 方块 / 效果 / 附魔 / 音效
const ITEMS = [
    ["diamond", "钻石"], ["diamond_block", "钻石块"], ["diamond_sword", "钻石剑"], ["diamond_pickaxe", "钻石镐"], ["diamond_axe", "钻石斧"], ["diamond_shovel", "钻石锹"],
    ["iron_ingot", "铁锭"], ["iron_sword", "铁剑"], ["gold_ingot", "金锭"], ["emerald", "绿宝石"], ["coal", "煤炭"], ["redstone", "红石"],
    ["apple", "苹果"], ["golden_apple", "金苹果"], ["bread", "面包"], ["cooked_beef", "牛排"],
    ["bow", "弓"], ["arrow", "箭"], ["shield", "盾牌"], ["elytra", "鞘翅"], ["totem_of_undying", "不死图腾"],
    ["ender_pearl", "末影珍珠"], ["ender_eye", "末影之眼"], ["experience_bottle", "附魔之瓶"],
    ["bed", "床"], ["chest", "箱子"], ["crafting_table", "工作台"], ["furnace", "熔炉"],
    ["tnt", "TNT"], ["torch", "火把"], ["command_block", "命令方块"], ["structure_block", "结构方块"], ["barrier", "屏障"],
    ["bucket", "桶"], ["water_bucket", "水桶"], ["lava_bucket", "岩浆桶"],
    ["flint_and_steel", "打火石"], ["name_tag", "命名牌"], ["lead", "拴绳"], ["saddle", "鞍"],
    ["compass", "指南针"], ["clock", "时钟"], ["map", "地图"], ["paper", "纸"],
];

const BLOCKS = [
    ["stone", "石头"], ["grass", "草方块"], ["dirt", "泥土"], ["cobblestone", "圆石"],
    ["planks", "木板"], ["log", "原木"], ["leaves", "树叶"], ["sand", "沙子"], ["gravel", "沙砾"],
    ["glass", "玻璃"], ["obsidian", "黑曜石"], ["bedrock", "基岩"],
    ["water", "水"], ["lava", "岩浆"], ["ice", "冰"],
    ["brick_block", "砖块"], ["stone_bricks", "石砖"], ["quartz_block", "石英块"],
    ["glowstone", "萤石"], ["sea_lantern", "海晶灯"],
    ["tnt", "TNT"], ["chest", "箱子"], ["crafting_table", "工作台"], ["furnace", "熔炉"],
    ["command_block", "命令方块"], ["chain_command_block", "连锁命令方块"], ["repeating_command_block", "循环命令方块"],
    ["structure_block", "结构方块"], ["structure_void", "结构空位"], ["barrier", "屏障"],
    ["iron_block", "铁块"], ["gold_block", "金块"], ["diamond_block", "钻石块"], ["emerald_block", "绿宝石块"],
    ["redstone_block", "红石块"], ["lapis_block", "青金石块"], ["coal_block", "煤炭块"],
    ["wool", "羊毛"], ["concrete", "混凝土"], ["hay_block", "干草块"],
    ["soul_sand", "灵魂沙"], ["magma", "岩浆块"], ["netherrack", "下界岩"], ["basalt", "玄武岩"], ["blackstone", "黑石"],
];

const EFFECTS = [
    ["speed", "速度"], ["slowness", "缓慢"], ["haste", "急迫"], ["mining_fatigue", "挖掘疲劳"],
    ["strength", "力量"], ["instant_health", "瞬间治疗"], ["instant_damage", "瞬间伤害"], ["jump_boost", "跳跃提升"],
    ["nausea", "反胃"], ["regeneration", "生命恢复"], ["resistance", "抗性提升"], ["fire_resistance", "防火"],
    ["water_breathing", "水下呼吸"], ["invisibility", "隐身"], ["blindness", "失明"], ["night_vision", "夜视"],
    ["hunger", "饥饿"], ["weakness", "虚弱"], ["poison", "中毒"], ["wither", "凋零"],
    ["health_boost", "生命提升"], ["absorption", "伤害吸收"], ["saturation", "饱和"],
    ["slow_falling", "缓降"], ["levitation", "飘浮"], ["darkness", "黑暗"],
];

const ENCHANTS = [
    ["protection", "保护"], ["fire_protection", "火焰保护"], ["feather_falling", "摔落保护"], ["blast_protection", "爆炸保护"], ["projectile_protection", "弹射物保护"], ["thorns", "荆棘"],
    ["respiration", "水下呼吸"], ["depth_strider", "深海探索者"], ["aqua_affinity", "水下速掘"],
    ["sharpness", "锋利"], ["smite", "亡灵杀手"], ["bane_of_arthropods", "节肢杀手"], ["knockback", "击退"], ["fire_aspect", "火焰附加"], ["looting", "抢夺"],
    ["efficiency", "效率"], ["silk_touch", "精准采集"], ["unbreaking", "耐久"], ["fortune", "时运"], ["mending", "经验修补"],
    ["power", "力量"], ["punch", "冲击"], ["flame", "火矢"], ["infinity", "无限"],
    ["loyalty", "忠诚"], ["impaling", "穿刺"], ["riptide", "激流"], ["channeling", "引雷"],
    ["multishot", "多重射击"], ["piercing", "穿透"], ["quick_charge", "快速装填"],
    ["soul_speed", "灵魂疾行"], ["swift_sneak", "迅捷潜行"],
];

const SOUNDS = [
    ["random.orb", "经验球"], ["random.levelup", "升级"], ["random.click", "点击"],
    ["random.explode", "爆炸"], ["random.pop", "弹出"], ["random.break", "破坏"],
    ["random.bow", "射箭"], ["random.anvil_land", "铁砧落地"],
    ["mob.zombie.say", "僵尸"], ["mob.skeleton.say", "骷髅"], ["mob.creeper.say", "苦力怕"],
    ["note.pling", "音符"], ["fire.fire", "火焰"],
    ["beacon.activate", "信标激活"], ["raid.horn", "袭击号角"],
];
