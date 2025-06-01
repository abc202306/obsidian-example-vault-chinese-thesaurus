
function getDCDescriptors(p, descriptorPath){
	if (!descriptorPath.endsWith("/")){
		descriptorPath += "/";
	}

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
