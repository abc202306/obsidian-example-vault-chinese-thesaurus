
function getGroupKey(p){
	const ctime = p.file.ctime;

	if (Date.now()-ctime.ts < 86400) {
		return "today";
	}
	
	return ctime.setLocale('en-US').toRelative();
}

input(getGroupKey)