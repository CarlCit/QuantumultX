[MITM]
hostname = api.aeonbuy.com

[rewrite_local]
https:\/\/api\.aeonbuy\.com\/api\/access-auth-api\/auth\/third\/silentWechatMiniLogin url script-response-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/aeon_sign.js
