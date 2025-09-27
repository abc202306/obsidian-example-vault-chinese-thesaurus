---
ctime: 2025-09-27T15:40:20+08:00
mtime: 2025-09-27T16:51:50+08:00
---

# 汉语主题词数据库 Report Table Classification Assembly

```dataviewjs

const getConfigObjectFromMarkdownFileSection = await new Promise(resolve=>dv.view("get-config", resolve));
const reportConfig = await getConfigObjectFromMarkdownFileSection("汉语主题词数据库 Report Config", "配置");
const rootDir = reportConfig.find(record=>record["配置变量名"]==="汉语主题词表数据根目录")["配置变量值"];

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("get-group-key", resolve))
/** @function */
const getDCDescriptors = await new Promise(resolve => dv.view("get-dc-descriptors", resolve));

const configMap = {
	path: {
		descriptor: rootDir + "/" + reportConfig.find(record=>record["配置变量名"]==="主题词子目录")["配置变量值"],
		descriptorCls: rootDir + "/" + reportConfig.find(record=>record["配置变量名"]==="主题词分类表子目录")["配置变量值"],
		assemblyDescriptorCls: rootDir + "/" + reportConfig.find(record=>record["配置变量名"]==="主题词组配分类表子目录")["配置变量值"]
	}
}

const descriptorPath = configMap.path.descriptor;
const descriptorClsPath = configMap.path.descriptorCls;
const assemblyDescriptorClsPath = configMap.path.assemblyDescriptorCls;

const headers = [
	"File",
	"主题词",
	"上位主题词表",
	"file.cday"
]

const fieldMap = {
	broadClses: "broadtermclassifications"
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

let i = 0;

dv.pages(`"${assemblyDescriptorClsPath}"`)
	.sort(p=>p.file.ctime, "desc")
	.groupBy(p=>getGroupKey(p))
	.sort(g=>g.rows[0].file.ctime, "desc")
	.forEach(g=>{
		const details = document.createElement("details");
		dv.header(4, markerMap.text.folderIcon+g.key+" ("+g.rows.length+")",{container:details.createEl("summary"),attr:{style:"display:inline"}});
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

```
