/* ===== 命令助手 - 分步补全引擎 =====
 * 交互复刻原版命令助手：
 *   输入 tp → 候选显示命令；点击 → 输入栏 "tp "
 *   → 候选 ~ / @s @a @p @e @r；点 @a → 输入栏 "tp @a["
 *   → 候选 x= r= type= ... ；点 x= → "tp @a[x="
 *   → 候选示例值；点 4 → "tp @a[x=4," → 候选 , / ]
 */
(function () {
    "use strict";

    // ---------- DOM ----------
    const ball = document.getElementById("float-ball");
    const panel = document.getElementById("panel");
    const cmdList = document.getElementById("cmd-list");
    const cmdSlots = document.getElementById("cmd-slots");
    const cmdInput = document.getElementById("cmd-input");
    const matchCount = document.getElementById("match-count");
    const panelTitle = document.querySelector(".panel-title");
    const btnCopy = document.getElementById("btn-copy");
    const btnSettings = document.getElementById("btn-settings");
    const settingsModal = document.getElementById("settings-modal");
    const btnCloseSettings = document.getElementById("btn-close-settings");
    const ballAlpha = document.getElementById("ball-alpha");
    const panelAlpha = document.getElementById("panel-alpha");
    const ballAlphaVal = document.getElementById("ball-alpha-val");
    const panelAlphaVal = document.getElementById("panel-alpha-val");
    const toast = document.getElementById("toast");

    const K = { pos: "mch.ball.pos", ballA: "mch.ball.alpha", panelA: "mch.panel.alpha" };
    let panelOpen = false;
    let toastTimer = null;

    // ---------- 基础工具 ----------
    function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
    function load(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
    }

    function escHtml(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // ---------- 类型中文名 ----------
    const TYPE_CN = {
        literal: "选项", selector: "实体", position: "x y z", dest: "坐标/实体",
        item: "物品", block: "方块", entity: "实体ID", effect: "效果",
        enchant: "附魔", sound: "音效", int: "整数", float: "数值",
        bool: "布尔", text: "文本", message: "消息", json: "JSON", exec: "…"
    };

    // 坐标样式 token
    function isCoord(tok) {
        return /^[~^]?[+-]?(\d+\.?\d*|\.\d+)?$/.test(tok) && tok !== "";
    }
    function isSel(tok) { return /^@/.test(tok); }

    // 数字示例
    function numHints(p) {
        if (p.ex) return [p.ex, "1", "10"];
        const n = p.n || "", d = p.d || "";
        const hay = n + d;
        if (/数量/.test(hay)) return ["64", "32", "16", "8", "1"];
        if (/等级|强度/.test(hay)) return ["1", "3", "5", "10"];
        if (/秒|时间|持续/.test(hay)) return ["30", "60", "600"];
        if (/半径|范围|间距/.test(hay)) return ["5", "10", "50"];
        if (/伤害/.test(hay)) return ["10", "20", "100"];
        if (/分数/.test(hay)) return ["100", "10", "1"];
        return ["1", "10", "100"];
    }

    // 列表获取：enum list 字段可能是字符串键或内联数组
    function getList(p) {
        if (p.t === "literal") return p.list || [];
        if (p.t === "enum") {
            if (typeof p.list === "string") return ENUMS[p.list] || [];
            return p.list || [];
        }
        return [];
    }

    // ---------- 参数消耗状态机 ----------
    // 返回 { idx: 当前参数下标(可能=p.length表示全部完成), rest: 剩余未消耗token }
    function walk(params, toks) {
        let i = 0, pi = 0;
        while (i < toks.length && pi < params.length) {
            const p = params[pi], tok = toks[i];
            if (p.t === "exec") {
                // 找 run：run 后的 token 由外层递归处理，这里直接停在 exec
                return { idx: pi, rest: toks.slice(i), execTok: toks.slice(i) };
            }
            if (p.t === "literal" || p.t === "enum") {
                const vals = getList(p).map(v => v[0]);
                if (vals.indexOf(tok) >= 0) { i++; pi++; }
                else if (p.o) pi++;            // 跳过可选参数
                else return { idx: pi, rest: toks.slice(i) }; // 停在必填参数
            } else if (p.t === "position" || p.t === "dest") {
                if (isCoord(tok)) {
                    let n = 0;
                    while (i < toks.length && n < 3 && isCoord(toks[i])) { i++; n++; }
                    pi++;
                } else if (p.t === "dest" && (isSel(tok) || true)) { i++; pi++; }
                else if (p.o) pi++;
                else { i++; pi++; }            // 宽松：吃掉当完成
            } else if (p.t === "message" || p.t === "text") {
                i = toks.length; pi++;         // 吃掉剩余全部
            } else {
                i++; pi++;                     // selector/item/int/bool... 一词一参数
            }
        }
        return { idx: pi, rest: [] };
    }

    // ---------- 候选生成 ----------
    // 每个候选 { l: 主文本, d: 描述, v: 插入值(完整输入栏新值) }
    let cands = [];
    let doneStr = "";   // 已完成词串（插入前缀）

    // c[0]=显示值 c[1]=描述 c[2]=插入词(不含doneStr前缀) c[3]=尾缀：undefined→空格 0→无 字符串→原样
    function mkCands(list) {
        return list.map(c => {
            const tail = c[3] === 0 ? "" : (c[3] === undefined ? " " : c[3]);
            return { l: c[0], d: c[1] || "", v: (doneStr ? doneStr + " " : "") + c[2] + tail };
        });
    }

    // 选择器子状态机：cur 如 @a / @a[ / @a[x / @a[x= / @a[x=4 / @a[x=4,
    function selCands(cur) {
        if (!cur || cur === "@") {
            return mkCands(SELECTORS.map(s => [s[0], s[1], s[0]]));
        }
        const m = /^@([a-zA-Z])\[?(.*)$/.exec(cur);
        if (!m) return mkCands(SELECTORS.map(s => [s[0], s[1], s[0]]));
        const letter = m[1], hasBracket = cur.indexOf("[") >= 0;
        if (!hasBracket) {
            const out = SELECTORS
                .filter(s => s[0].slice(1, 2).toLowerCase() === letter.toLowerCase())
                .map(s => [s[0], s[1], s[0]]);
            if (/^@[a-zA-Z]$/.test(cur)) out.push(["[...", "插入选择器参数", cur + "[", 0]);
            return mkCands(out);
        }
        // 有 [ ：解析内部
        const inner = m[2]; // [ 之后内容
        const parts = inner.split(",");
        const last = parts[parts.length - 1];
        const usedKeys = {};
        parts.slice(0, -1).forEach(pt => { const k = pt.split("=")[0]; if (k) usedKeys[k] = 1; });
        const base = cur.slice(0, cur.length - last.length); // 含 @a[ 及之前参数,

        if (last.indexOf("=") < 0) {
            // 等键名
            const q = last.toLowerCase();
            const out = SEL_PARAMS
                .filter(sp => !usedKeys[sp[0]] && (!q || sp[0].indexOf(q) >= 0))
                .map(sp => [sp[0] + "=", sp[1], base + sp[0] + "=", 0]);
            if (!out.length) out.push([", ", "参数输入完毕？", base, 0]);
            return mkCands(out);
        }
        const eq = last.indexOf("=");
        const key = last.slice(0, eq), val = last.slice(eq + 1);
        if (val === "") {
            // 等值候选（尾缀均为无，继续等值后续）
            let vs = [];
            if (key === "type") vs = ENTITY_TYPES.map(v => [v[0], v[1]]);
            else if (key === "m") vs = [["0", "生存"], ["1", "创造"], ["2", "冒险"], ["3", "观察者"]];
            else if (key === "c") vs = [["1", "最近1个"], ["3", "最近3个"], ["-1", "全部"]];
            else if (key === "scores") vs = [["{金币=10}", "计分板条件示例"]];
            else if (/^(r|rm|x|y|z|dx|dy|dz|rx|rxm|ry|rym|l|lm)$/.test(key))
                vs = [["4", "示例值"], ["10", "示例值"], ["50", "示例值"]];
            else vs = [["(手输)", "输入" + key + " 的值"]];
            return mkCands(vs.map(v => [v[0], v[1], base + key + "=" + v[0], 0]));
        }
        // 值已输入："," 或 "]"
        return mkCands([
            [",", "下一个参数", cur + ",", 0],
            ["]", "结束参数", cur + "]", " "]
        ]);
    }

    // 普通参数候选
    function paramCands(p, cur) {
        const q = (cur || "").toLowerCase();
        let out = [];
        switch (p.t) {
            case "literal":
            case "enum":
                out = getList(p).filter(v => !q || v[0].toLowerCase().indexOf(q) >= 0)
                    .map(v => [v[0], v[1], v[0]]);
                break;
            case "selector":
                if (/^@/.test(cur || "")) return selCands(cur);
                out = SELECTORS.map(s => [s[0], s[1], s[0]]);
                break;
            case "position":
                out = [["~ ~ ~", "当前位置", "~ ~ ~"], ["^ ^ ^", "视线方向", "^ ^ ^"], ["~", "当前轴", "~"]];
                if (q && !~"~^".indexOf(q[0])) out.push([q, "数字坐标", q]);
                break;
            case "dest":
                if (/^@/.test(cur || "")) return selCands(cur);
                out = SELECTORS.map(s => [s[0], s[1], s[0]])
                    .concat([["~ ~ ~", "当前位置", "~ ~ ~"], ["^ ^ ^", "视线方向", "^ ^ ^"]]);
                break;
            case "item": out = ITEMS.map(v => [v[0], v[1], v[0]]); break;
            case "block": out = BLOCKS.map(v => [v[0], v[1], v[0]]); break;
            case "entity": out = ENTITY_TYPES.map(v => [v[0], v[1], v[0]]); break;
            case "effect": out = EFFECTS.map(v => [v[0], v[1], v[0]]); break;
            case "enchant": out = ENCHANTS.map(v => [v[0], v[1], v[0]]); break;
            case "sound": out = SOUNDS.map(v => [v[0], v[1], v[0]]); break;
            case "bool": out = ENUMS.bool.map(v => [v[0], v[1], v[0]]); break;
            case "int":
            case "float":
                out = numHints(p).map(n => [n, p.d || "数值", n]);
                break;
            case "json":
                if (p.tpl) out = [[p.tpl, "JSON模板", p.tpl]];
                break;
            case "exec":
                out = ENUMS.executeSub.map(v => [v[0], v[1], v[0]])
                    .concat(SELECTORS.map(s => [s[0], s[1], s[0]]))
                    .concat([["~ ~ ~", "位置", "~ ~ ~"]]);
                break;
            case "text":
            case "message":
            default:
                out = [];
                break;
        }
        if (q) out = out.filter(c => c[0].toLowerCase().indexOf(q) >= 0);
        return mkCands(out);
    }

    // ---------- 命令解析主入口 ----------
    // 预排序：token 数多的键优先（最长前缀匹配）
    const SORTED_KEYS = Object.keys(CTREE)
        .sort((a, b) => b.split(" ").length - a.split(" ").length || a.localeCompare(b));

    function resolve(done, cur, alreadyStr) {
        // alreadyStr: exec run 之前的完整前缀
        const joined = done.join(" ");
        doneStr = [alreadyStr || "", joined].filter(Boolean).join(" ");

        // 1. 最长前缀匹配：命令键的 token 序列是 done 的前缀，剩余为参数
        for (const key of SORTED_KEYS) {
            const kt = key.split(" ");
            if (done.length >= kt.length &&
                done.slice(0, kt.length).join(" ") === key) {
                const cmd = CTREE[key];
                const restTokens = done.slice(kt.length);
                const w = walk(cmd.p, restTokens);
                if (w.execTok) {
                    const ri = w.execTok.indexOf("run");
                    if (ri >= 0) {
                        const after = w.execTok.slice(ri + 1);  // run 之后的完成词
                        // preStr = run 之前的词 + run（doneStr 可能已含 run，避免重复）
                        const preStr = done.slice(0, done.length - w.execTok.length + ri).join(" ") + " run";
                        // 递归解析子命令（当前编辑词 cur 不变）
                        return resolve(after, cur, preStr);
                    }
                }
                return { cmd, w, rest: restTokens, key };
            }
        }

        // 2. 前缀匹配 → 子命令候选
        if (joined) {
            const nexts = {};
            for (const key in CTREE) {
                const kt = key.split(" ");
                if (kt.length > done.length &&
                    kt.slice(0, done.length).join(" ") === joined) {
                    const nw = kt[done.length];
                    if (!nexts[nw]) nexts[nw] = CTREE[key].d;
                }
            }
            const q = (cur || "").toLowerCase();
            let list = Object.keys(nexts).filter(w => !q || w.indexOf(q) >= 0)
                .map(w => [w, nexts[w], w]);
            if (list.length) {
                cands = mkCands(list);
                cmdSlots.classList.remove("show");
                panelTitle.textContent = "⛏ " + joined;
                matchCount.textContent = list.length + " 个子命令";
                renderCands();
                return null;
            }
        }

        // 3. 模糊搜索命令名
        const query = ((joined ? joined + " " : "") + (cur || "")).trim().toLowerCase();
        let keys = Object.keys(CTREE);
        if (query) {
            keys = keys.filter(k => k.indexOf(query) >= 0 || CTREE[k].d.indexOf(query) >= 0);
            keys.sort((a, b) => {
                const pa = a.startsWith(query) ? 0 : 1, pb = b.startsWith(query) ? 0 : 1;
                return pa - pb || a.length - b.length;
            });
        } else {
            keys.sort();
        }
        cands = mkCands(keys.map(k => [k, CTREE[k].d, k]));
        cmdSlots.classList.remove("show");
        panelTitle.textContent = "⛏ 命令助手";
        matchCount.textContent = keys.length + " 条命令";
        renderCands();
        return null;
    }

    let editingFlag = false;

    // ---------- 渲染 ----------
    function renderCands() {
        if (!cands.length) {
            cmdList.innerHTML = '<div class="empty-tip">没有匹配项，换个关键字试试</div>';
            return;
        }
        cmdList.innerHTML = cands.map((c, i) =>
            '<button class="cmd-btn" data-i="' + i + '">' +
            '<span class="cmd-syntax">' + escHtml(c.l) + '</span>' +
            (c.d ? '<span class="cmd-desc">' + escHtml(c.d) + '</span>' : '') +
            '</button>').join("");
    }

    function renderSlots(cmd, curIdx) {
        if (!cmd || !cmd.p.length) { cmdSlots.classList.remove("show"); return; }
        const html = cmd.p.map((p, i) => {
            const tag = (p.o ? "[" : "<") + (p.n || "") + (p.n ? ":" : "") + (TYPE_CN[p.t] || "") + (p.o ? "]" : ">");
            const cls = i < curIdx ? "slot done" : (i === curIdx ? "slot cur" : "slot");
            return '<span class="' + cls + '">' + escHtml(tag) + '</span>';
        }).join("");
        cmdSlots.innerHTML = html;
        cmdSlots.classList.add("show");
    }

    // ---------- 主计算 ----------
    function compute() {
        const text = cmdInput.value.replace(/^\/+/, "").replace(/\s+/g, " ");
        editingFlag = text.length > 0 && !/\s$/.test(cmdInput.value.replace(/^\/+/, ""));
        let tokens = text.trim() ? text.trim().split(" ") : [];
        const done = editingFlag ? tokens.slice(0, -1) : tokens;
        const cur = editingFlag ? (tokens[tokens.length - 1] || "") : "";

        const res = resolve(done, cur, "");
        if (!res) return; // resolve 已渲染（命令名/子命令候选）

        const { cmd, w, key } = res;
        panelTitle.textContent = "⛏ " + key;
        renderSlots(cmd, w.idx);

        if (w.idx >= cmd.p.length) {
            cands = [];
            matchCount.textContent = "✓ 已完整";
            cmdList.innerHTML = '<div class="empty-tip">✓ 命令已完整，点右侧「复制」即可使用</div>';
            return;
        }

        const p = cmd.p[w.idx];
        // 选择器子状态：cur 以 @ 开头
        if (/^@/.test(cur) && (p.t === "selector" || p.t === "dest" || p.t === "exec")) {
            cands = selCands(cur);
        } else {
            cands = paramCands(p, cur);
        }

        // 文本类无候选时的提示
        if (!cands.length) {
            let tip;
            if (p.t === "message" || p.t === "text") tip = "✏ 自由输入" + (p.n ? "：" + p.n : "") + (p.d ? "（" + p.d + "）" : "") + "，输完空格即可";
            else if (p.t === "json") tip = "✏ 输入 JSON 文本" + (p.d ? "（" + p.d + "）" : "");
            else tip = "✏ 请输入" + (p.n || TYPE_CN[p.t]);
            matchCount.textContent = TYPE_CN[p.t] || "";
            cmdList.innerHTML = '<div class="empty-tip">' + escHtml(tip) + '</div>';
            return;
        }

        matchCount.textContent = cands.length + " 项";
        renderCands();
    }

    // 点击候选 → 替换整个输入栏
    cmdList.addEventListener("click", e => {
        const btn = e.target.closest(".cmd-btn");
        if (!btn) return;
        const c = cands[+btn.dataset.i];
        if (!c) return;
        cmdInput.value = (c.v.charAt(0) === "/" ? "" : "/") + c.v;
        cmdInput.focus();
        const len = cmdInput.value.length;
        try { cmdInput.setSelectionRange(len, len); } catch (err) { }
        compute();
    });

    cmdInput.addEventListener("input", compute);
    cmdInput.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); copyInput(); }
    });

    // ---------- 复制 ----------
    // 复制成功后清空输入栏，回到初始候选
    function clearAfterCopy() {
        cmdInput.value = "";
        compute();
    }
    function copyFallback(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { }
        document.body.removeChild(ta);
        if (ok) { showToast("已复制到剪贴板"); clearAfterCopy(); }
        else showToast("复制失败，请手动长按复制");
    }
    function copyInput() {
        const text = cmdInput.value.trim();
        if (!text) { showToast("输入栏是空的"); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                () => { showToast("已复制到剪贴板"); clearAfterCopy(); },
                () => copyFallback(text));
        } else copyFallback(text);
    }
    btnCopy.addEventListener("click", copyInput);

    // ---------- 透明度设置 ----------
    function applyBallAlpha(pct) { ball.style.opacity = String(pct / 100); ballAlphaVal.textContent = pct + "%"; }
    function applyPanelAlpha(pct) {
        document.documentElement.style.setProperty("--panel-alpha", String(pct / 100));
        panelAlphaVal.textContent = pct + "%";
    }
    ballAlpha.addEventListener("input", () => { applyBallAlpha(+ballAlpha.value); save(K.ballA, ballAlpha.value); });
    panelAlpha.addEventListener("input", () => { applyPanelAlpha(+panelAlpha.value); save(K.panelA, panelAlpha.value); });

    function openSettings() { settingsModal.classList.add("open"); }
    function closeSettings() { settingsModal.classList.remove("open"); }
    btnSettings.addEventListener("click", openSettings);
    btnCloseSettings.addEventListener("click", closeSettings);
    settingsModal.addEventListener("click", e => { if (e.target === settingsModal) closeSettings(); });

    // ---------- 大窗口 ----------
    function togglePanel() {
        panelOpen = !panelOpen;
        if (panelOpen) { panel.classList.add("open"); compute(); }
        else { panel.classList.remove("open"); cmdInput.blur(); }
    }

    // ---------- 悬浮球拖动 ----------
    let dragging = false, moved = false, startX = 0, startY = 0, origX = 0, origY = 0;

    function setBallPos(x, y) {
        const w = ball.offsetWidth, h = ball.offsetHeight;
        const vw = window.innerWidth, vh = window.innerHeight;
        ball.style.left = Math.min(Math.max(x, 8), vw - w - 8) + "px";
        ball.style.top = Math.min(Math.max(y, 8), vh - h - 8) + "px";
        ball.style.right = "auto";
    }
    function saveBallPos() {
        const r = ball.getBoundingClientRect();
        save(K.pos, JSON.stringify({ x: r.left, y: r.top }));
    }
    function snapToEdge() {
        const r = ball.getBoundingClientRect();
        const targetX = (r.left + r.width / 2) < window.innerWidth / 2 ? 8 : window.innerWidth - r.width - 8;
        ball.classList.add("snapping");
        setBallPos(targetX, r.top);
        setTimeout(() => ball.classList.remove("snapping"), 240);
    }

    ball.addEventListener("pointerdown", e => {
        e.preventDefault();
        try { ball.setPointerCapture(e.pointerId); } catch (err) { }
        dragging = true; moved = false;
        startX = e.clientX; startY = e.clientY;
        const r = ball.getBoundingClientRect();
        origX = r.left; origY = r.top;
    });
    ball.addEventListener("pointermove", e => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (!moved && Math.sqrt(dx * dx + dy * dy) > 8) moved = true;
        if (moved) setBallPos(origX + dx, origY + dy);
    });
    function onBallUp() {
        if (!dragging) return;
        dragging = false;
        if (moved) { snapToEdge(); saveBallPos(); }
        else togglePanel();
    }
    ball.addEventListener("pointerup", onBallUp);
    ball.addEventListener("pointercancel", () => { dragging = false; });

    function clampBall() {
        if (dragging) return;
        const r = ball.getBoundingClientRect();
        setBallPos(r.left, r.top);
        saveBallPos();
    }
    window.addEventListener("resize", clampBall);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", clampBall);

    // ---------- 初始化 ----------
    (function init() {
        const bA = Math.min(100, Math.max(20, parseInt(load(K.ballA, "100"), 10) || 100));
        const pA = Math.min(100, Math.max(20, parseInt(load(K.panelA, "95"), 10) || 95));
        ballAlpha.value = bA; panelAlpha.value = pA;
        applyBallAlpha(bA); applyPanelAlpha(pA);
        try {
            const p = JSON.parse(load(K.pos, "null"));
            if (p && typeof p.x === "number") setBallPos(p.x, p.y);
        } catch (e) { }
        compute();
    })();
})();
