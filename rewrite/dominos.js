;^http://example.com/resource1/4/ url reject-dict
http-request ^https:\/\/game\.dominos\.com\.cn\/.+\/game\/gameDone script-path=https://gist.githubusercontent.com/Sliverkiss/6b4da0d367d13790a9fd1d928c82bdf8/raw/dlm.js,requires-body=true, timeout=10, tag=达美乐披萨获取token

[MITM]
hostname =game.dominos.com.cn
