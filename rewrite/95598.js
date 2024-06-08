
 
;^http://example.com/resource1/4/ url reject-dict


[mimt]
hostname = osg-open.sgcc.com.cn
[rewrite_local]
^https?:\/\/osg-open\.sgcc\.com\.cn\/osg-open-p0001\/member\/c5\/f05 url script-request-header https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/95598/95598.weapp.js
