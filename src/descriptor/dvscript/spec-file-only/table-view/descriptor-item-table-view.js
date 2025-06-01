
const configSectionStr = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/.exec(await dv.io.load(dv.currentFilePath))[0]

function getConfigValue(key){
	return new RegExp("\\|\\s*?"+key+"\\s*?\\|(.*?)\\|","").exec(configSectionStr)[1].trim()
}

const configMap = {
	path: {
		descriptor: getConfigValue("主题词 - 文件夹路径")
	}
}

const descriptorPath = configMap.path.descriptor;

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("dvmodule/get-group-key", resolve))

const headers = [
	"File",
	"03 英文",
	"05 同义词",
	"06 上位词",
	"07 下位词",
	"08 相关词",
	"31 分类",
	"来源",
	"file.cday"
];

const fieldMap = {
	english: "主题词-英文",
	synonyms: "主题词-同义词",
	broadTerms: "主题词-上位词",
	narrowerTerms: "主题词-下位词",
	relatedTerms: "主题词-相关词",
	classifications: "主题词-分类",
	sources: "主题词-来源"
}

const regexMap = {
	excluding: {
		fileName: /(^.*\/)|(\.md$)/g,
		descriptorClassificationFileName: /(^.*\/)|(\s主题词表\.md$)/g
	}
}

const markerMap = {
	resolvedLink: {
		descriptor: "🟢",
		descriptorClassification: "📗"
	},
	text: {
		folderIcon: "📁"
	}
}

class LinkRenderUtil {
	static getDescriptorResolvedLink(l){
		return dv.func.link(
			l.path,
			markerMap.resolvedLink.descriptor+l.path.replace(
				regexMap.excluding.fileName,
				""
			)
		)
	}
	static getDescriptorClassificationResolvedLink(l){
		return dv.func.link(
			l.path,
			markerMap.resolvedLink.descriptorClassification+l.path.replace(
				regexMap.excluding.descriptorClassificationFileName,
				""
			)
		)
	}
}

class ArrayUtil {
	static maxLenLinkArr = 3;
	static clipArr(arr){
		if(arr.length<=this.maxLenLinkArr){
			return arr;
		}
		return [
			...arr.slice(0, this.maxLenLinkArr), 
			"..."
		];
	}
	static isLinkResolvedInFolder(link){
		return dv.func.contains(link.path, "/");
	}
	static getDescriptorItemLinkArr(linkArr){
		return linkArr
			.filter(l=>this.isLinkResolvedInFolder(l))
			.map(l=>LinkRenderUtil.getDescriptorResolvedLink(l)).concat(linkArr
				.filter(l=>!this.isLinkResolvedInFolder(l))
			);
	}
}

class PageProxy {
	#p;
	
	constructor(p){this.#p=p;}
	static get(p){return new this(p)}
	
	getFileLink(){
		return LinkRenderUtil.getDescriptorResolvedLink(this.#p.file.link)
	}
	getEnglish(){
		return this.#p[fieldMap.english];
	}
	getSynonyms(){
		return ArrayUtil.clipArr(
			this.#p[fieldMap.synonyms] || []
		)
	}
	getBroadTerms(){
		return (this.#p[fieldMap.broadTerms] || []).map(l=>
			LinkRenderUtil.getDescriptorResolvedLink(l)
		)
	}
	getNarrowerTerms(){
		return ArrayUtil.clipArr(
			ArrayUtil.getDescriptorItemLinkArr(
				this.#p[fieldMap.narrowerTerms] || []
			)
		)
	}
	getRelatedTerms(){
		return ArrayUtil.clipArr(
			ArrayUtil.getDescriptorItemLinkArr(
				this.#p[fieldMap.relatedTerms] || []
			)
		)
	}
	getClassifications(){
		return (this.#p[fieldMap.classifications] || []).map(l=>
			LinkRenderUtil.getDescriptorClassificationResolvedLink(l)
		)
	}
	getSources(){
		return this.#p[fieldMap.sources] || []
	}
	getCDay(){
		return this.#p.file.cday;
	}

	getElem(){
		return [
			this.getFileLink(),
			this.getEnglish(),
			this.getSynonyms(),
			this.getBroadTerms(),
			this.getNarrowerTerms(),
			this.getRelatedTerms(),
			this.getClassifications(),
			this.getSources(),
			this.getCDay()
		]
	}
}

function getScrollableDiv(container){
	return container.createDiv({attr:{style:"overflow:scroll;"}});
}

function show(){
	dv.container.style.overflowX = "visible";

	const groups = dv
		.pages(`"${descriptorPath}"`)
		.sort(p=>p.file.ctime, "desc")
		.groupBy(p=>getGroupKey(p))
		.sort(g=>g.rows[0].file.ctime, "desc");
	
	groups.forEach(g=>{
		const details = document.createElement("details")
		details.open = true;
		dv.header(4, markerMap.text.folderIcon+g.key,{container:details.createEl("summary"),attr:{style:"display:inline"}})
		dv.api.table(
			headers, 
			g.rows.map(p=>PageProxy.get(p).getElem()),
			getScrollableDiv(details),
			dv.component,
			dv.currentFilePath
		)
		dv.container.appendChild(details)
	});
}

show()