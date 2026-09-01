/* 命令助手补全引擎 - Node 环境测试（DOM stub） */
const fs = require("fs");
const path = require("path");
const base = path.join(__dirname, "www", "js");

// ---------- DOM stubs ----------
function makeEl(id) {
    return {
        id, value: "", innerHTML: "", textContent: "",
        style: {}, offsetWidth: 58, offsetHeight: 58,
        _handlers: {},
        addEventListener(ev, fn) { this._handlers[ev] = fn; },
        removeEventListener() {},
        setPointerCapture() {},
        focus() {}, blur() {},
        setSelectionRange() {},
        getBoundingClientRect() { return { left: 100, top: 400, width: 58, height: 58 }; },
        classList: {
            _s: new Set(),
            add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
            contains(c) { return this._s.has(c); }, toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }
        }
    };
}
const els = {};
["float-ball", "panel", "cmd-list", "cmd-slots", "cmd-input", "match-count",
    "btn-copy", "btn-settings", "settings-modal", "btn-close-settings",
    "ball-alpha", "panel-alpha", "ball-alpha-val", "panel-alpha-val", "toast"
].forEach(id => els[id] = makeEl(id));
els["panel-title"] = makeEl("panel-title");

global.document = {
    getElementById: id => els[id] || makeEl(id),
    querySelector: sel => sel === ".panel-title" ? els["panel-title"] : makeEl("q"),
    documentElement: { style: { setProperty() {} } },
    createElement: () => makeEl("tmp"),
    body: { appendChild() {}, removeChild() {} }
};
global.window = {
    innerWidth: 390, innerHeight: 844,
    addEventListener() {}, visualViewport: null
};
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
global.navigator = {};

// ---------- 加载脚本（顶层 const 转 var，间接 eval 挂到全局） ----------
const indirectEval = eval;
function loadScript(file) {
    const code = fs.readFileSync(path.join(base, file), "utf8")
        .replace(/^const\s+(SELECTORS|SEL_PARAMS|ENTITY_TYPES|ENUMS|ITEMS|BLOCKS|EFFECTS|ENCHANTS|SOUNDS|CTREE)\s*=/gm, "var $1 =");
    indirectEval(code);
}
loadScript("data.js");
loadScript("ctree.js");
loadScript("app.js");

// ---------- 测试工具 ----------
const input = els["cmd-input"];
const list = els["cmd-list"];
function type(text) {
    input.value = text;
    input._handlers["input"]();
    return list.innerHTML;
}
function candsText() {
    const m = list.innerHTML.match(/class="cmd-syntax">([^<]*)</g) || [];
    return m.map(s => s.replace(/class="cmd-syntax">/, "").replace(/<$/, ""));
}
function clickCand(label) {
    const idx = candsText().indexOf(label);
    if (idx < 0) throw new Error("找不到候选: " + label + " | 现有: " + candsText().join(" , "));
    list._handlers["click"]({ target: { closest: () => ({ dataset: { i: String(idx) } }) } });
    return input.value;
}
let pass = 0, fail = 0;
function check(name, cond, extra) {
    if (cond) { pass++; console.log("  PASS", name); }
    else { fail++; console.log("  FAIL", name, extra || ""); }
}

// ---------- 场景测试 ----------
console.log("== 1. 输入 t → 命令名候选 ==");
type("t");
check("含 tp 命令", candsText().includes("tp"), candsText().slice(0, 5).join(","));

console.log("== 2. 点击 tp → 输入栏 'tp ' ==");
let v = clickCand("tp");
check("输入栏 = /tp ", v === "/tp ", JSON.stringify(v));

console.log("== 3. tp 后候选：选择器 + 坐标 ==");
type("/tp ");
const t3 = candsText();
check("含 @s", t3.includes("@s"));
check("含 @a", t3.includes("@a"));
check("含 ~ ~ ~", t3.includes("~ ~ ~"), t3.join(","));

console.log("== 4. 点击 @a（目的地槽）→ 'tp @a ' ==");
v = clickCand("@a");
check("输入栏 = /tp @a ", v === "/tp @a ", JSON.stringify(v));

console.log("== 5. 输入 tp @a（无尾空格）→ 候选 [ 插入参数 ==");
type("/tp @a");
check("含 [...", candsText().includes("[..."), candsText().join(","));
v = clickCand("[...");
check("点击后 = /tp @a[", v === "/tp @a[", JSON.stringify(v));

console.log("== 6. @a[ → 键名候选 x= r= type= ==");
type("/tp @a[");
const t6 = candsText();
check("含 x=", t6.includes("x="));
check("含 r=", t6.includes("r="));
check("含 type=", t6.includes("type="));
check("无重复 x=（usedKeys过滤）", t6.filter(x => x === "x=").length === 1);

console.log("== 7. 点击 x= → 'tp @a[x=' → 值候选 ==");
v = clickCand("x=");
check("输入栏 = /tp @a[x=", v === "/tp @a[x=", JSON.stringify(v));
type("/tp @a[x=");
check("值候选含 4", candsText().includes("4"), candsText().join(","));

console.log("== 8. 点击 4 → 'tp @a[x=4' → , 和 ] ==");
v = clickCand("4");
check("输入栏 = /tp @a[x=4", v === "/tp @a[x=4", JSON.stringify(v));
type("/tp @a[x=4");
const t8 = candsText();
check("含 , 下一参数", t8.includes(","));
check("含 ] 结束参数", t8.includes("]"));

console.log("== 9. 点击 ] → 'tp @a[x=4] ' 完成 ==");
v = clickCand("]");
check("输入栏 = /tp @a[x=4] ", v === "/tp @a[x=4] ", JSON.stringify(v));

console.log("== 10. scoreboard 多级子命令 ==");
type("/scoreboard ");
const t10 = candsText();
check("子命令 objectives", t10.includes("objectives"), t10.join(","));
check("子命令 players", t10.includes("players"));
v = clickCand("players");
check("= /scoreboard players ", v === "/scoreboard players ", JSON.stringify(v));
type("/scoreboard players ");
check("下一级 set/add", candsText().includes("set") && candsText().includes("add"), candsText().join(","));

console.log("== 11. give 物品候选 ==");
type("/give @s ");
check("含 diamond", candsText().includes("diamond"), candsText().slice(0, 4).join(","));
v = clickCand("diamond");
check("= /give @s diamond ", v === "/give @s diamond ", JSON.stringify(v));

console.log("== 12. gamemode 枚举 ==");
type("/gamemode ");
const t12 = candsText();
check("含 s", t12.includes("s"));
check("含 spectator", t12.includes("spectator"));

console.log("== 13. execute run 递归 ==");
type("/execute as @a run ");
const t13 = candsText();
check("run 后有命令候选 tp", t13.includes("tp"), t13.slice(0, 5).join(","));
v = clickCand("tp");
check("= /execute as @a run tp ", v === "/execute as @a run tp ", JSON.stringify(v));
type("/execute as @a run tp ");
check("子命令参数候选含 @s", candsText().includes("@s"));

console.log("== 14. 参数槽显示 ==");
type("/give @s diamond 64 ");
check("slots 渲染", els["cmd-slots"].classList.contains("show"));
check("slots 含玩家/物品槽", els["cmd-slots"].innerHTML.indexOf("玩家") >= 0);

console.log("== 15. type= 实体候选 ==");
type("/kill @e[type=");
const t15 = candsText();
check("含 zombie", t15.includes("zombie"), t15.join(","));

console.log("== 16. 模糊搜索 ==");
type("传送");
check("中文搜索命中 tp", candsText().includes("tp") || candsText().includes("teleport"), candsText().join(","));

console.log("\n结果: " + pass + " 通过, " + fail + " 失败");
process.exit(fail ? 1 : 0);
