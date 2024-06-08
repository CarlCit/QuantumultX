[MITM]
hostname = payapp.weixin.qq.com

[rewrite_local]
https:\/\/payapp\.weixin\.qq\.com\/coupon-center-user\/home\/login url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/wechat_pay_coupon.js
