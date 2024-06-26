/*
------------------------------------------
@Author: Sliverkiss
@Date: 2024.05.08 21:08:18
@Description: 奶茶多合一签到
------------------------------------------
- 适用于所有企迈小程序
- 自动清除无效任务默认关闭，可在boxjs打开
- 支持霸王茶姬、沪上阿姨、益禾堂等签到, 具体名单可查阅https://www.qmai.cn/Case.Html

重写：
1.打开小程序,收录小程序任务或更新token
2.手动完成一次签到,收录活动id

[Script]
http-response ^https:\/\/(webapi|webapi2)\.qmai\.cn\/web\/seller\/(oauth\/flash-sale-login|account\/login-minp) script-path=https://gist.githubusercontent.com/Sliverkiss/8b4f5487e0f28786c7dec9c7484dcd5e/raw/teaMilk.js, requires-body=true, timeout=60, tag=奶茶获取token

http-request ^https:\/\/(webapi|webapi2|qmwebapi)\.qmai\.cn\/web\/(catering\/integral|cmk-center)\/sign\/(signIn|takePartInSign) script-path=https://gist.githubusercontent.com/Sliverkiss/8b4f5487e0f28786c7dec9c7484dcd5e/raw/teaMilk.js, requires-body=true, timeout=60, tag=奶茶获取token

[MITM]
hostname = webapi2.qmai.cn,webapi.qmai.cn,qmwebapi.qmai.cn

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/
const $ = new Env("TeaMilk");
const ckName = "teaMilk_data";
const userCookie = $.toObj($.isNode() ? process.env[ckName] : $.getdata(ckName)) || {};
//notify
const notify = $.isNode() ? require('./sendNotify') : '';
$.notifyMsg = []
//debug
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';
//自动清除无效任务
$.is_remove = ($.isNode() ? process.env["teaMilk_remove"] : $.getdata("teaMilk_remove")) || 'false';
$.doFlag = { "true": "✅", "false": "⛔️" };
//成功个数
$.succCount = 0;
//静态数据
$.storeAccount = {
    "49006": {
        id: "49006",
        name: "霸王茶姬",
        appId: "wxafec6f8422cb357b",
        oldActivityId: "100820000000000686",
        newActivityId: "947079313798000641",
        userList: userCookie?.["49006"]?.userList || []
    },
    "201424": {
        id: "201424",
        name: "沪上阿姨",
        appId: "wxd92a2d29f8022f40",
        oldActivityId: "702822503017398273",
        newActivityId: "",
        userList: userCookie?.["201424"]?.userList || []
    },
    ...userCookie
}
//------------------------------------------
const baseUrl = "https://webapi.qmai.cn"
const _headers = {
    'Qm-User-Token': "",
    'Qm-From': 'wechat',
    'Content-Type': 'application/json'
};
const fetch = async (o) => {
    try {
        if (typeof o === 'string') o = { url: o };
        if (o?.url?.startsWith("/") || o?.url?.startsWith(":")) o.url = baseUrl + o.url
        const res = await Request({ ...o, headers: o.headers || _headers, url: o.url })
        debug(res);
        //if (!(res?.code == 0 || res?.code == 400041)) throw new Error(res?.msg || `用户需要去登录`);
        return res;
    } catch (e) {
        $.ckStatus = false;
        $.log(`⛔️ 请求发起失败！${e}`);
    }
}
//------------------------------------------
async function main() {
    try {
        //垃圾回收区
        $.removeList = [], $.notifyList = [];
        for (let item in $.storeAccount) {
            let store = $.storeAccount[item];
            //将无效任务压入垃圾回收区
            if (!store.appId) {
                //开启自动移除任务
                $.is_remove != 'false' && $.removeList.push(item);
                $.log(`[ERROR] 「${store.name}」任务不存在活动id,跳过任务...\n`);
                continue;
            }
            //跳过无效任务
            if (!store.userList.length) {
                $.log(`[ERROR] 「${store.name}」任务不存在账号,跳过任务...\n`);
                continue;
            }
            //$.log(`\n==============📣执行任务📣==============\n`)
            //init
            $.notifyMsg = [], $.ckStatus = true, $.succCount = 0
            $.log(`[INFO] 开始执行「${store.name}」签到任务...\n`);
            $.log(`[INFO] 当前共检测到 ${store.userList.length || 0} 个账号\n`);
            for (let user of store.userList) {
                $.log(`[INFO] 当前用户: ${user.userName}\n`);
                _headers['Qm-User-Token'] = user.token;
                let o = { appid: store.appId, oldActivityId: store.oldActivityId, newActivityId: store.newActivityId }
                if (store?.appId) {
                    store?.oldActivityId && await oldSignin(o);
                    store?.newActivityId && await newSignin(o);
                    let point = await getPoint(o);
                    //判断ck状态
                    !$.ckStatus
                        ? $.notifyMsg.push(`[${user.userName}] 签到失败,登录已过期`)
                        : ($.notifyMsg.push(`[${user.userName}] 签到成功,当前共${point}积分`), $.succCount++);
                } else {
                    $.log(`[INFO] 活动id不存在,停止执行「${store.name}」签到任务\n`);
                    break;
                }
            }
            $.notifyList.push({
                name: `${store.name}签到`,
                title: `共${store.userList.length}个账号,成功${$.succCount}个,失败${store.userList.length - 0 - $.succCount}个`,
                message: $.notifyMsg.join('\n')
            })
        }
        await Promise.allSettled($.notifyList?.map(e => sendMsg(e)));
        //清空垃圾回收区
        $.removeList.map(e => delete $.storeAccount[e]);
        $.setjson($.storeAccount, ckName);
    } catch (e) {
        throw e
    }
}

//旧签到
async function oldSignin(o) {
    try {
        const opts = {
            url: "/web/catering/integral/sign/signIn",
            type: "post",
            dataType: "json",
            body: { "activityId": o.oldActivityId, "mobilePhone": "1111", "userName": "微信用户", "appid": o.appid }
        }
        //post方法
        let { code, message, data, status } = await fetch(opts) ?? {};
        if (code == 0 || code == 400041) {
            console.log("[INFO] 旧签到接口:" + message + "\n");
        } else {
            $.log(`[ERROR] signIn签到错误：${message} `);
        }
    } catch (e) {
        $.log(e);
    }
}
//新签到
async function newSignin(o) {
    try {
        const opts = {
            url: "/web/cmk-center/sign/takePartInSign",
            type: "post",
            dataType: "json",
            body: { "appid": o.appid, "activityId": o.newActivityId }
        }
        //post方法
        let { code, message, data, status } = await fetch(opts) ?? {};
        if (code == 0 || code == 400041) {
            console.log("[INFO] 新签到接口:" + message + "\n");
        } else {
            $.log(`[ERROR] takePartInSign签到错误：${message}`);
        }
    } catch (e) {
        $.log(e);
    }
}

//查询用户积分信息
async function getPoint(o) {
    try {
        const opts = {
            url: "/web/catering2-apiserver/crm/points-info",
            type: "post", dataType: "json",
            body: { appid: o.appid }
        }
        let res = await fetch(opts);
        if (!(res?.code == 0 || res?.code == 400041)) throw new Error(res?.msg || `用户需要去登录`);
        return res?.data?.totalPoints;
    } catch (e) {
        $.ckStatus = false;
        $.log(e);
    }
}

//查询店铺信息
async function getTitle(o) {
    try {
        const opts = {
            url: "/web/catering/design/homePage-Config",
            params: { type: 2, appid: o.appid },
            headers: {
                'Qm-User-Token': o.token,
                'Qm-From': 'wechat',
                'Content-Type': 'application/json'
            }
        }
        let res = await fetch(opts);
        debug(res?.data?.storeId);
        return res?.data?.storeId;
    } catch (e) {
        $.ckStatus = false;
        $.log(e);
    }
}

//获取Cookie
async function getCookie() {
    try {
        if ($request && $request.method === 'OPTIONS') return;
        //捕获活动id
        if ($request.url.match(/sign/)) {
            const { appid, activityId } = $.toObj($request.body);
            const { "qm-user-token": token } = ObjectKeys2LowerCase($request.headers);
            let storeId = await getTitle({ token, appid });
            for (let store in $.storeAccount) {
                if (store == storeId) {
                    $.storeAccount[store] = {
                        ...$.storeAccount[store],
                        appId: appid,
                        oldActivityId: activityId,
                        newActivityId: activityId
                    }
                    $.store = $.storeAccount[store];
                    // 保存更改
                    $.setjson($.storeAccount, ckName);
                    break;
                }
            }
            // 发送消息
            const message = $.store?.appId ? `🎉 获取${$.store.name}活动id成功!` : `❌ 获取${$.store.name}活动id失败!`;
            $.msg($.name, message, "");
        } else {
            const body = $.toObj($response?.body) ?? "";
            if (!body) throw new Error("Surge用户: 手动运行请切换到Cron环境");
            const { store: { id: storeId, name }, user: { mobile }, token } = body?.data

            if (!mobile) throw new Error(`获取ck失败，请先登录并绑定手机号`);

            const newData = {
                "userId": mobile,
                "token": token,
                "userName": phone_num(mobile),
            }
            //捕获未知小程序
            if (!$.storeAccount[storeId]) {
                $.storeAccount[storeId] = {
                    "id": storeId,
                    "name": name,
                    userList: [newData]
                }
                $.setjson($.storeAccount, ckName);
                return $.msg($.name, `🎉收录${name}小程序成功!`, "请手动完成一次签到，获取活动id");
            }
            let account = $.storeAccount[storeId];
            let userList = account.userList || [];
            const index = userList.findIndex(e => e.userId == newData.userId);
            index != -1 ? $.storeAccount[storeId].userList[index] = newData : $.storeAccount[storeId].userList.push(newData);

            $.setjson($.storeAccount, ckName);
            $.msg(name, `🎉${newData.userName}更新token成功!`, ``);
        }
    } catch (e) {
        throw e;
    }
}

function phone_num(phone_num) { if (phone_num.length == 11) { let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"); return data; } else { return phone_num; } }

//主程序执行入口
!(async () => {
    try {
        if (typeof $request != "undefined") {
            await getCookie();
        } else {
            await main();
        }
    } catch (e) {
        throw e;
    }
})()
    .catch((e) => { $.logErr(e), $.msg($.name, `⛔️ script run error!`, e.message || e) })
    .finally(async () => {
        $.done({ ok: 1 });
    });

/** ---------------------------------固定不动区域----------------------------------------- */
//prettier-ignore
async function sendMsg(o) { o && ($.isNode() ? await notify.sendNotify(o.name, o.message) : $.msg(o.name, o.title || "", o.message, { "media-url": $.avatar })) }
function DoubleLog(o) { o && ($.log(`${o}`), $.notifyMsg.push(`${o}`)) };
function debug(o, r) {
    if ("true" === $.is_debug) {
        $.log("")
        $.log($.toStr(o));
        $.log("")
    }
}
//From xream's ObjectKeys2LowerCase
function ObjectKeys2LowerCase(obj) { return !obj ? {} : Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])) };
//From sliverkiss's Request
async function Request(t) { "string" == typeof t && (t = { url: t }); try { if (!t?.url) throw new Error("[发送请求] 缺少 url 参数"); let { url: o, type: e, headers: r = {}, body: s, params: a, dataType: n = "form", resultType: u = "data" } = t; const p = e ? e?.toLowerCase() : "body" in t ? "post" : "get", c = o.concat("post" === p ? "?" + $.queryStr(a) : ""), i = t.timeout ? $.isSurge() ? t.timeout / 1e3 : t.timeout : 1e4; "json" === n && (r["Content-Type"] = "application/json;charset=UTF-8"); const y = s && "form" == n ? $.queryStr(s) : $.toStr(s), l = { ...t, ...t?.opts ? t.opts : {}, url: c, headers: r, ..."post" === p && { body: y }, ..."get" === p && a && { params: a }, timeout: i }, m = $.http[p.toLowerCase()](l).then((t => "data" == u ? $.toObj(t.body) || t.body : $.toObj(t) || t)).catch((t => $.log(`❌请求发起失败！原因为：${t}`))); return Promise.race([new Promise(((t, o) => setTimeout((() => o("当前请求已超时")), i))), m]) } catch (t) { console.log(`❌请求发起失败！原因为：${t}`) } }
//From chavyleung's Env.js
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise(((e, r) => { s.call(this, t, ((t, s, a) => { t ? r(t) : e(s) })) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; if (this.getdata(t)) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e => { this.get({ url: t }, ((t, s, r) => e(r))) })) } runScript(t, e) { return new Promise((s => { let r = this.getdata("@chavy_boxjs_userCfgs.httpapi"); r = r ? r.replace(/\n/g, "").trim() : r; let a = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); a = a ? 1 * a : 20, a = e && e.timeout ? e.timeout : a; const [i, o] = r.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: a }, headers: { "X-Key": i, Accept: "*/*" }, timeout: a }; this.post(n, ((t, e, r) => s(r))) })).catch((t => this.logErr(t))) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), r = !s && this.fs.existsSync(e); if (!s && !r) return {}; { const r = s ? t : e; try { return JSON.parse(this.fs.readFileSync(r)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), r = !s && this.fs.existsSync(e), a = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, a) : r ? this.fs.writeFileSync(e, a) : this.fs.writeFileSync(t, a) } } lodash_get(t, e, s = void 0) { const r = e.replace(/\[(\d+)\]/g, ".$1").split("."); let a = t; for (const t of r) if (a = Object(a)[t], void 0 === a) return s; return a } lodash_set(t, e, s) { return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, s, r) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[r + 1]) >> 0 == +e[r + 1] ? [] : {}), t)[e[e.length - 1]] = s), t } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, r] = /^@(.*?)\.(.*?)$/.exec(t), a = s ? this.getval(s) : ""; if (a) try { const t = JSON.parse(a); e = t ? this.lodash_get(t, r, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, r, a] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(r), o = r ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, a, t), s = this.setval(JSON.stringify(e), r) } catch (e) { const i = {}; this.lodash_set(i, a, t), s = this.setval(JSON.stringify(i), r) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, ((t, s, r) => { !t && s && (s.body = r, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, r) })); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: r, headers: a, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: r, headers: a, body: i, bodyBytes: o }, i, o) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } })).then((t => { const { statusCode: r, statusCode: a, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: r, statusCode: a, headers: i, rawBody: o, body: n }, n) }), (t => { const { message: r, response: a } = t; e(r, a, a && s.decode(a.rawBody, this.encoding)) })) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, ((t, s, r) => { !t && s && (s.body = r, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, r) })); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: r, headers: a, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: r, headers: a, body: i, bodyBytes: o }, i, o) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let r = require("iconv-lite"); this.initGotEnv(t); const { url: a, ...i } = t; this.got[s](a, i).then((t => { const { statusCode: s, statusCode: a, headers: i, rawBody: o } = t, n = r.decode(o, this.encoding); e(null, { status: s, statusCode: a, headers: i, rawBody: o, body: n }, n) }), (t => { const { message: s, response: a } = t; e(s, a, a && r.decode(a.rawBody, this.encoding)) })) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let r = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in r) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? r[e] : ("00" + r[e]).substr(("" + r[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let r = t[s]; null != r && "" !== r && ("object" == typeof r && (r = JSON.stringify(r)), e += `${s}=${r}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", r = "", a) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: return { url: t.url || t.openUrl || t["open-url"] }; case "Loon": return { openUrl: t.openUrl || t.url || t["open-url"], mediaUrl: t.mediaUrl || t["media-url"] }; case "Quantumult X": return { "open-url": t["open-url"] || t.url || t.openUrl, "media-url": t["media-url"] || t.mediaUrl, "update-pasteboard": t["update-pasteboard"] || t.updatePasteboard }; case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, r, i(a)); break; case "Quantumult X": $notify(e, s, r, i(a)); case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), r && t.push(r), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name}, 错误!`, t); break; case "Node.js": this.log("", `❗️${this.name}, 错误!`, t.stack) } } wait(t) { return new Promise((e => setTimeout(e, t))) } done(t = {}) { const e = ((new Date).getTime() - this.startTime) / 1e3; switch (this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
