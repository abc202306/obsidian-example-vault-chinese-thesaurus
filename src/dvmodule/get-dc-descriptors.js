
function getDCDescriptors(p){
	const descriptorPath = dv.current()["主题词-文件夹路径"];
	return dv.func.unique(
			p.file.outlinks.concat(p.file.inlinks)
		)
		.filter(l=>l.path.startsWith(descriptorPath))
		.map(l=>dv.func.link(
			l.path, 
			"🟢"+l.path.replace(/(^.*\/)|(\.md$)/g,"")
		))
}

input(getDCDescriptors)
