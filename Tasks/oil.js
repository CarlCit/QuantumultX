/*
[task_local]
0 0 8 ? * * https://raw.githubusercontent.com/deezertidal/shadowrocket-rules/main/js/oil.js, tag=每日油价, enabled=true
*/
const apiurl = "https://apis.tianapi.com/oilprice/index?key=d718b0f7c2b6d71cb3a9814e90bf847f&prov=%E6%B9%96%E5%8C%97%0A";

$task.fetch({ url: apiurl }).then(response => {
    var obj = JSON.parse(response.body);
    var prov = obj.result.prov;
    var p0 = "0号柴油:" + "¥" + obj.result.p0 + "\xa0\xa0\xa0";
    var p92 = "92号汽油:" + "¥" + obj.result.p92 + "\xa0\xa0\xa0";
    var p95 = "95号汽油:" + "¥" + obj.result.p95 + "\xa0\xa0\xa0";
    var p98 = "98号汽油:" + "¥" + obj.result.p98 + "\xa0\xa0\xa0";
    var time = obj.result.time;
    $notify("⌘ 今日油价 ⌘", prov, p92 + p95 + p98 + p0);
    $done();
}, reason => {
    console.log(reason.error);
    $done();
});
