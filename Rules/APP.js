# NAME: 屏蔽一些破解 APP 联网行为
# AUTHOR: CarlCit
# REPO: https://github.com/CarlCit/QuantumultX/
# UPDATED: 2024-06-10

# Bartender 5
PROCESS-PATH-REGEX,^/Applications/Bartender\ 5.app/Contents/MacOS/Bartender\ 5$,REJECT
PROCESS-PATH-REGEX,^~/Applications/Bartender\ 5.app/Contents/MacOS/Bartender\ 5$,REJECT

# 屏蔽其他可能的辅助进程，目前没有发现有
PROCESS-PATH-REGEX,^/Library/Application Support/Bartender\ 5.*$,REJECT
PROCESS-PATH-REGEX,^/Users/[^/]+/Library/Application Support/Bartender\ 5.*$,REJECT
PROCESS-PATH-REGEX,^/usr/local/bin/Bartender-helper$,REJECT
PROCESS-PATH-REGEX,^/usr/bin/Bartender-helper$,REJECT
PROCESS-PATH-REGEX,^/System/Library/Bartender\ 5.*$,REJECT
PROCESS-PATH-REGEX,^/Users/[^/]+/Library/Bartender\ 5.*$,REJECT

