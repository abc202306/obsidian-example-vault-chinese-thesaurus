async function getConfigValue(key){
	const fileContent = await dv.io.load(dv.currentFilePath);
	const configSectionStrRegExp = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/;
	const configSectionStr = configSectionStrRegExp.exec(fileContent)[0]
	const configValueRegExp = new RegExp("\\|\\s*?"+key+"\\s*?\\|\\s*(.*?)\\s*\\|","")
	return configValueRegExp.exec(configSectionStr)[1]
}

async function getConfig(key){
	return (await Promise.all([
		"汉语主题词表数据根目录",
		key
	].map(async i=>getConfigValue(i)))).join("/")
}

const configMap = {
	path: {
		descriptor: await getConfig("主题词子目录"),
		descriptorCls: await getConfig("主题词分类表子目录"),
		assemblyDescriptorCls: await getConfig("主题词组配分类表子目录")
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
	"下位主题词表",
	"file.cday"
]

const fieldMap = {
	narrowerClses: "narrowertermclassifications"
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

function getNarrowerDCls(p){
	return (p[fieldMap.narrowerClses]||[])
		.map(l=>dv.func.link(
				l.path,
				markerMap.resolvedLink.descriptorClassification+l.path.replace(regexMap.excluding.assemblyDescriptorClsFileName,"")
			))
}

function getElem(p){
	return [
		dv.func.link(p.file.path,markerMap.resolvedLink.descriptorClassification+p.file.path.replace(regexMap.excluding.descriptorClsFileName,"")),
		getDCDescriptors(p, descriptorPath),
		getNarrowerDCls(p),
		p.file.cday
	]
}

dv.container.style.overflowX = "visible";

let i = 0;

dv.pages(`"${descriptorClsPath}"`)
	.sort(p=>p.file.ctime, "desc")
	.groupBy(p=>getGroupKey(p))
	.sort(g=>g.rows[0].file.ctime, "desc")
	.forEach(g=>{
		const details = document.createElement("details")
		dv.header(4, markerMap.text.folderIcon+g.key+" ("+g.rows.length+")", {container: details.createEl("summary"), attr:{style:"display:inline"}});
		dv.api.table(
			headers, 
			g.rows.map(p=>getElem(p)), 
			details.createDiv({attr:{style:"overflow:scroll"}}),
			dv.component,
			dv.currentFilePath
		)
		dv.container.appendChild(details)
		if(i < 1){
			details.open = true;
		}
		i++;
	})