
const configSectionStr = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/.exec(await dv.io.load(dv.currentFilePath))[0]

function getConfigValue(key){
	return new RegExp("\\|\\s*?"+key+"\\s*?\\|(.*?)\\|","").exec(configSectionStr)[1].trim()
}

const configMap = {
	path: {
		descriptor: getConfigValue("主题词 - 文件夹路径"),
		descriptorCls: getConfigValue("主题词分类表 - 文件夹路径"),
		assemblyDescriptorCls: getConfigValue("主题词组配分类表 - 文件夹路径")
	}
}

const descriptorPath = configMap.path.descriptor;
const descriptorClsPath = configMap.path.descriptorCls;
const assemblyDescriptorClsPath = configMap.path.assemblyDescriptorCls;

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("dvmodule/get-group-key", resolve))

/** @function */
const getDCDescriptors = await new Promise(resolve => dv.view("dvmodule/get-dc-descriptors", resolve))

const headers = [
	"File",
	"主题词",
	"上位主题词表",
	"file.cday"
]

const fieldMap = {
	broadClses: "主题词表-上位主题词表"
}

const regexMap = {
	excluding: {
		descriptorClsFileName: /(^.*\/)|(主题词表\.md$)/g,
		assemblyDescriptorClsFileName: /(.*\/)|(组配 主题词表\.md$)/g
	}
}

const markerMap = {
	resolvedLink: {
		descriptorClassification: "📗"
	},
	text: {
		folderIcon: "📁"
	}
}

function getBroadDCls(p){
	return (p[fieldMap.broadClses]||[])
		.map(l=>dv.func.link(
				l.path,
				markerMap.resolvedLink.descriptorClassification+l.path.replace(regexMap.excluding.descriptorClsFileName,"")
			))
}

function getElem(p){
	return [
		dv.func.link(p.file.path,markerMap.resolvedLink.descriptorClassification+p.file.path.replace(regexMap.excluding.assemblyDescriptorClsFileName,"")),
		getDCDescriptors(p, descriptorPath),
		getBroadDCls(p),
		p.file.cday
	]
}

dv.container.style.overflowX = "visible";

dv.pages(`"${assemblyDescriptorClsPath}"`)
	.sort(p=>p.file.ctime, "desc")
	.groupBy(p=>getGroupKey(p))
	.sort(g=>g.rows[0].file.ctime, "desc")
	.forEach(g=>{
		const details = document.createElement("details");
		details.open = true;
		dv.header(4, markerMap.text.folderIcon+g.key,{container:details.createEl("summary"),attr:{style:"display:inline"}});
		dv.api.table(
			headers, 
			g.rows.map(p=>getElem(p)), 
			details.createDiv({attr:{style:"overflow:scroll"}}),
			dv.component,
			dv.currentFilePath
		)
		dv.container.appendChild(details)
	})
