


async function getConfigValue(key){
	const fileContent = await dv.io.load(dv.currentFilePath);
	const configSectionStrRegExp = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/;
	const configSectionStr = configSectionStrRegExp.exec(fileContent)[0]
	const configValueRegExp = new RegExp("\\|\\s*?"+key+"\\s*?\\|\\s*(.*?)\\s*\\|","")
	return configValueRegExp.exec(configSectionStr)[1]
}

const config = {
	paths: {
		descriptor: await getConfigValue("主题词 - 文件夹路径")
	},
	headers: [
		"File",
		"03 英文",
		"05 同义词",
		"06 上位词",
		"07 下位词",
		"08 相关词",
		"31 分类",
		"来源",
		"file.cday"
	],
	fields: {
		english: "主题词-英文",
		synonyms: "主题词-同义词",
		broadTerms: "主题词-上位词",
		narrowerTerms: "主题词-下位词",
		relatedTerms: "主题词-相关词",
		classifications: "主题词-分类",
		sources: "主题词-来源"
	},
	markers: {
		resolvedLink: {
			descriptor: "🟢",
			descriptorClassification: "📗"
		},
		text: {
			folderIcon: "📁"
		}
	},
	regexps: {
		excluding: {
			fileName: /(^.*\/)|(\.md$)/g,
			descriptorClassificationFileName: /(^.*\/)|(\s主题词表\.md$)/g
		}
	}
}

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("dvmodule/get-group-key", resolve))

class LinkRenderUtil {
	static getDescriptorResolvedLink(l){
		return dv.func.link(
			l.path,
			config.markers.resolvedLink.descriptor+l.path.replace(
				config.regexps.excluding.fileName,
				""
			)
		)
	}
	static getDescriptorClassificationResolvedLink(l){
		if (l === undefined){
			return undefined
		}
		if (typeof l === "string"){
			return l;
		}
		return dv.func.link(
			l.path,
			config.markers.resolvedLink.descriptorClassification+l.path.replace(
				config.regexps.excluding.descriptorClassificationFileName,
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
		return this.#p[config.fields.english];
	}
	getSynonyms(){
		return ArrayUtil.clipArr(
			this.#p[config.fields.synonyms] || []
		)
	}
	getBroadTerms(){
		return (this.#p[config.fields.broadTerms] || []).map(l=>
			LinkRenderUtil.getDescriptorResolvedLink(l)
		)
	}
	getNarrowerTerms(){
		return ArrayUtil.clipArr(
			ArrayUtil.getDescriptorItemLinkArr(
				this.#p[config.fields.narrowerTerms] || []
			)
		)
	}
	getRelatedTerms(){
		return ArrayUtil.clipArr(
			ArrayUtil.getDescriptorItemLinkArr(
				this.#p[config.fields.relatedTerms] || []
			)
		)
	}
	getClassifications(){
		return (this.#p[config.fields.classifications] || []).map(l=>
			LinkRenderUtil.getDescriptorClassificationResolvedLink(l)
		)
	}
	getSources(){
		return this.#p[config.fields.sources] || []
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
		.pages(`"${config.paths.descriptor}"`)
		.sort(p=>p.file.ctime, "desc")
		.groupBy(p=>getGroupKey(p))
		.sort(g=>g.rows[0].file.ctime, "desc");
	
	let i = 0;

	groups.forEach(g=>{
		const details = document.createElement("details")
		dv.header(4, config.markers.text.folderIcon+g.key+" ("+g.rows.length+")",{container:details.createEl("summary"),attr:{style:"display:inline"}})
		dv.api.table(
			config.headers, 
			g.rows.map(p=>PageProxy.get(p).getElem()),
			getScrollableDiv(details),
			dv.component,
			dv.currentFilePath
		)
		dv.container.appendChild(details);
		if(i < 1){
			details.open = true;
		}
		i++;
	});
}

show()