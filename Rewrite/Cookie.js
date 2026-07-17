/***********************************

> ScriptName        𝐑𝐞𝐯𝐞𝐧𝐮𝐞𝐂𝐚𝐭
> UpdateTime        2026-07-17


[rewrite_local]
# 将两个脚本合并为一个本地双向脚本 revenuecat.js
^https:\/\/api\.revenuecat\.com\/.+\/(receipts|subscribers) url script-analyze-echo-response https://raw.githubusercontent.com/CarlCit/QuantumultX/main/revenuecat.js

[mitm]
hostname=api.revenuecat.com

***********************************/

// ========= 动态ID ========= //
const mapping = {
  'Cookie': ['allaccess', 'app.ft.Bookkeeping.lifetime']
};

// =========    固定部分  ========= // 
var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
    obj = JSON.parse($response.body);

// 这里可以改成你自己的提示语
obj.Attention = "自定义解锁已激活！"; 

var ddgksf2013 = {
  is_sandbox: !1,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  period_type: "normal",
  expires_date: "2099-12-18T01:04:17Z",
  grace_period_expires_date: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2022-09-08T01:04:18Z",
  purchase_date: "2022-09-08T01:04:17Z",
  store: "app_store"
};

// 1. 这里的 product_identifier 改为你自己的默认 ID
var ddgksf2021 = {
  grace_period_expires_date: null,
  purchase_date: "2022-09-08T01:04:17Z",
  product_identifier: "com.carl.premium.yearly", 
  expires_date: "2099-12-18T01:04:17Z"
};

const match = Object.keys(mapping).find(e => ua.includes(e));

if (match) {
  let [e, s] = mapping[match];
  // 2. 这里的兜底 ID 替换为你的默认 ID
  s ? (ddgksf2021.product_identifier = s, obj.subscriber.subscriptions[s] = ddgksf2013) 
    : (obj.subscriber.subscriptions["com.carl.premium.yearly"] = ddgksf2013);
  obj.subscriber.entitlements[e] = ddgksf2021;
} else {
  // 3. 这里的默认订阅 ID 替换为你的默认 ID
  obj.subscriber.subscriptions["com.carl.premium.yearly"] = ddgksf2013;
  obj.subscriber.entitlements.pro = ddgksf2021;
  console.log('Carl 的专属解锁运行成功 🎉');
}

$done({ body: JSON.stringify(obj) });
