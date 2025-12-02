/***********************************

> ScriptName        𝐑𝐞𝐯𝐞𝐧𝐮𝐞𝐂𝐚𝐭多合一脚本[墨鱼版]
> Author            @ddgksf2013
> ForHelp           若有屏蔽广告的需求，可公众号后台回复APP名称
> WechatID          墨鱼手记
> TgChannel         https://t.me/ddgksf2021
> Contribute        https://t.me/ddgksf2013_bot
> Feedback          📮 𝐝𝐝𝐠𝐤𝐬𝐟𝟐𝟎𝟏𝟑@𝟏𝟔𝟑.𝐜𝐨𝐦 📮
> UpdateTime        2024-07-09
> Suitable          自行观看“# > ”注释内容，解锁是暂时的，购买也不是永久的[订阅、跑路]
> Attention         📣个别失效的APP请相关需求者自行降级、或寻找替代品、或购买支持
> Attention         如需引用请注明出处，谢谢合作！
> ScriptURL         https://gist.githubusercontent.com/ddgksf2013/dbb1695cd96743eef18f3fac5c6fe227/raw/revenuecat.js


# ========解锁列表======== #
https://appraven.net/collection/77299969

[rewrite_local]

# ～ RevenueCat@ddgksf2013
^https:\/\/api\.revenuecat\.com\/.+\/(receipts|subscribers) url script-request-header https://raw.githubusercontent.com/ddgksf2013/Scripts/master/deleteHeader.js

# iTunes解锁系列
# hostname = buy.itunes.apple.com
^https?:\/\/buy\.itunes\.apple\.com\/verifyReceipt$ url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/iTunes.js



[mitm]

hostname=api.revenuecat.com

***********************************/

// ========= 动态ID ========= //
const mapping = {
'Cookie': ['allaccess','app.ft.Bookkeeping.lifetime']
};

// =========    固定部分  ========= // 
// =========  @ddgksf2021 ========= // 
var ua=$request.headers["User-Agent"]||$request.headers["user-agent"],obj=JSON.parse($response.body);obj.Attention="恭喜你抓到元数据！由墨鱼分享，请勿售卖或分享他人！";var ddgksf2013={is_sandbox:!1,ownership_type:"PURCHASED",billing_issues_detected_at:null,period_type:"normal",expires_date:"2099-12-18T01:04:17Z",grace_period_expires_date:null,unsubscribe_detected_at:null,original_purchase_date:"2022-09-08T01:04:18Z",purchase_date:"2022-09-08T01:04:17Z",store:"app_store"},ddgksf2021={grace_period_expires_date:null,purchase_date:"2022-09-08T01:04:17Z",product_identifier:"com.ddgksf2013.premium.yearly",expires_date:"2099-12-18T01:04:17Z"};const match=Object.keys(mapping).find(e=>ua.includes(e));if(match){let[e,s]=mapping[match];s?(ddgksf2021.product_identifier=s,obj.subscriber.subscriptions[s]=ddgksf2013):obj.subscriber.subscriptions["com.ddgksf2013.premium.yearly"]=ddgksf2013,obj.subscriber.entitlements[e]=ddgksf2021}else obj.subscriber.subscriptions["com.ddgksf2013.premium.yearly"]=ddgksf2013,obj.subscriber.entitlements.pro=ddgksf2021,console.log('操作成功🎉🎉🎉\nCuttlefishの自留地: https://t.me/ddgksf2021');$done({body:JSON.stringify(obj)});
