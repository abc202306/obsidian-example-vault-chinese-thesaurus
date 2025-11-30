
const getConfigObjectFromMarkdownFileSection = await new Promise(resolve=>dv.view("get-config", resolve));
const queryConfig = await getConfigObjectFromMarkdownFileSection("汉语主题词数据库 Query Config", "配置");
const rootDir = queryConfig.find(record=>record["配置变量名"]==="汉语主题词表数据根目录")["配置变量值"];
const folderName = queryConfig.find(record=>record["配置变量名"]==="主题词子目录")["配置变量值"];
/** @function */
const getGroupKey = await new Promise(resolve => dv.view("get-group-key", resolve))

function joinPath(...paths){
	const newPaths = paths.filter(p=>p.length!==0).map(p=>p.replace(/^\//,"").replace(/\/$/,""))
	return newPaths.join("/")
}

const config = {
	paths: {
		descriptor: joinPath(rootDir, folderName)
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
		english: "english",
		synonyms: "synonyms",
		broadTerms: "broadterms",
		narrowerTerms: "narrowerterms",
		relatedTerms: "relatedterms",
		classifications: "categories",
		sources: "sources"
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

	const ps = dv.pages(`"${config.paths.descriptor}"`);

	const groups = ps
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

function buttonOnclick(){
	dv.container.empty();
	show();
}

const button = document.createElement("button");
button.innerText = "开始显示视图（耗时操作）";
button.onclick = buttonOnclick;
dv.container.appendChild(button);
