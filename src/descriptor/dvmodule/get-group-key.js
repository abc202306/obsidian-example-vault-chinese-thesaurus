
function getGroupKey(p){
	const ctime = p.file.ctime;

	if (Date.now()-ctime.ts < 86400000) {
		return "创建于：今天"; // "今天": "today"
	}
	
	return "创建于："+ctime.setLocale('zh-CN').toRelative();
}

input(getGroupKey)