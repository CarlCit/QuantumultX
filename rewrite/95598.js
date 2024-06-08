# 重写规则配置片段包含若干条重写规则，并可以包含若干作用于 MitM 的主机名；可通过资源引用的方式使用。
# 片段文件将保存在 Quantumult X 目录下的 Profiles 子目录中。
# 样例可参见 https://raw.githubusercontent.com/crossutility/Quantumult-X/master/sample-import-rewrite.snippet
 
 
 
;^http://example.com/resource1/4/ url reject-dict


[mimt]
hostname = osg-open.sgcc.com.cn
[rewrite_local]
^https?:\/\/osg-open\.sgcc\.com\.cn\/osg-open-p0001\/member\/c5\/f05 url script-request-header https://raw.githubusercontent.com/Yuheng0101/X/main/Tasks/95598/95598.weapp.js
