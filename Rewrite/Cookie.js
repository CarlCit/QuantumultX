/***********************************

> ScriptName        𝐑𝐞𝐯𝐞𝐧𝐮𝐞𝐂𝐚𝐭
> UpdateTime        2026-07-17

[rewrite_local]
# 这里的指令改为了 Quantumult X 标准的 script-response-body 和 script-request-header
# 因为 QX 不能靠单一指令完美处理双向，通常用两个规则指向同一个脚本。合并脚本内部会自动分流处理。

^https:\/\/api\.revenuecat\.com\/.+\/(receipts|subscribers) url script-request-header https://raw.githubusercontent.com/CarlCit/QuantumultX/refs/heads/main/Rewrite/Cookie.js
^https:\/\/api\.revenuecat\.com\/.+\/(receipts|subscribers) url script-response-body https://raw.githubusercontent.com/CarlCit/QuantumultX/refs/heads/main/Rewrite/Cookie.js

[mitm]
hostname=api.revenuecat.com

***********************************/

// ========= 动态ID ========= //
const mapping = {
  'Cookie': ['allaccess', 'app.ft.Bookkeeping.lifetime']
};

// ================== 1. 请求阶段：清除 ETag 避免 304 ================== //
if (typeof $request !== "undefined" && typeof $response === "undefined") {
  var modifiedHeaders = $request.headers;
  function setHeaderValue(e, a, d) {
    var r = a.toLowerCase();
    r in e ? e[r] = d : e[a] = d;
  }
  setHeaderValue(modifiedHeaders, "X-RevenueCat-ETag", "");
  setHeaderValue(modifiedHeaders, "x-revenuecat-etag", "");
  $done({ headers: modifiedHeaders });
} 

// ================== 2. 响应阶段：篡改数据，解锁会员 ================== //
else if (typeof $response !== "undefined") {
  var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
      obj = JSON.parse($response.body);

  obj.Attention = "自定义解锁已激活！"; 

  var carlSub = {
    is_sandbox: false,
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

  var carlEntitlement = {
    grace_period_expires_date: null,
    purchase_date: "2022-09-08T01:04:17Z",
    product_identifier: "com.carl.premium.yearly", 
    expires_date: "2099-12-18T01:04:17Z"
  };

  const match = Object.keys(mapping).find(e => ua.includes(e));

  if (match) {
    let [e, s] = mapping[match];
    s ? (carlEntitlement.product_identifier = s, obj.subscriber.subscriptions[s] = carlSub) 
      : (obj.subscriber.subscriptions["com.carl.premium.yearly"] = carlSub);
    obj.subscriber.entitlements[e] = carlEntitlement;
  } else {
    obj.subscriber.subscriptions["com.carl.premium.yearly"] = carlSub;
    obj.subscriber.entitlements.pro = carlEntitlement;
    console.log('Carl 的专属解锁运行成功 🎉');
  }

  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}
