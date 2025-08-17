const config = {
	rootFolderView: {
		mocLevel: 4,
		folderLevel: 10
	},
	specFolderView: {
		mocLevel: 5
	}
}
// 
// built in property: ["icon", "cover", "kws", "tags"]
//

class Node {
	type; // file OR folder
	path;
	displayName;
	children;
	level;
	id;
	page;
	pureLevel;
	constructor({type,path,displayName,children,level,pureLevel}){
		this.type = type;
		this.path = path;
		this.displayName = displayName;
		this.children = children || [];
		this.level = level || -1;
		this.pureLevel = pureLevel || this.level;
		if (type==="file"){
			this.page = dv.page(path);
		}
	}
}

class Tree {
	treeRootNode;
	nodes;
	constructor(pagePaths, cwdDisplay){
		this.treeRootNode = new Node({
			type: "folder",
			path: "",
			displayName: cwdDisplay.split("/").at(-1),
			children: [],
			level: 0
		});
		this.nodes = [this.treeRootNode];
		pagePaths.forEach(pagePath=>{
			this.pushPagePath(pagePath)
		})
	}
	static getFileNode(pagePath){
		let pathParts;
		let fileNodeShortPath;
		let fileNodeDisplayName;
		let page;
		let tdata;
		
		pathParts = pagePath.split("/");
		page = dv.page(pagePath);
		
		fileNodeShortPath = pathParts.at(-1).replace(/\.md$/,"");
		const pageLink = dv.fileLink(
			page.file.name,
			false,
			fileNodeShortPath
		)
		fileNodeDisplayName = pageLink;
		if (page.icon&&dv.value.isLink(page.icon)){
			const iconFileLink = dv.fileLink(
				page.icon.path,
				true,
				"16"
			)
			fileNodeDisplayName = iconFileLink+" "+fileNodeDisplayName;
		}
		
		tdata = []
		if(page.kws&&page.kws.length!==0){
			tdata.push(["🟢", page.kws.join(" ")])
		}
		if(page.file.tags.length!==0){
			tdata.push(["🔴", page.file.tags.join(" ")])
		}
		if(tdata.length!==0){
			fileNodeDisplayName += "<br>";
			const tbodyInnerHTML = tdata.map(tr=>`<tr>${tr.map(td=>`<td>${td}</td>`).join("")}</tr>`).join("");
			fileNodeDisplayName += `<table><tbody>${tbodyInnerHTML}</tbody></table>`;
		}
		if(page.cover&&dv.value.isLink(page.cover)){
			fileNodeDisplayName += "<br>"+dv.fileLink(page.cover.path,true,"300");
		}
		
		const fileNode = new Node({
			type: "file",
			path: pagePath,
			displayName: fileNodeDisplayName,
			level: pathParts.length
		})
		
		return fileNode;
	}
	pushPagePath(pagePath){
		let fileNode;
		const pathParts = pagePath.split("/");
		let iInit = pathParts.length-1;
		if (pagePath.endsWith(".md")){
			fileNode = Tree.getFileNode(pagePath)
			this.nodes.push(fileNode);
			iInit = pathParts.length-2;
		}
		
		
		let folderNode;
		let i;
		for (i = iInit; i >= 0; i--){
			
			const folderPath = pathParts.slice(0, i+1).join("/");
			
			const folderNodeInList = this.nodes.find(node=>node.path===folderPath);
			const node = folderNode||fileNode;
			if (folderNodeInList&&node){
				folderNodeInList.children.push(node);
				break;
			}
			const children = []
			if (node){
				children.push(node)
			}
			folderNode = new Node({
				type: "folder",
				path: folderPath,
				displayName: pathParts[i],
				children: children,
				level: i+1
			});
			
			this.nodes.push(folderNode);
		}
		
		if (i===-1){
			this.treeRootNode.children.push(folderNode||fileNode);
		}
	}
	static getListItemPair(){
		const li = document.createElement("li");
		li.style.listStyleType="none"
		const liSummary = document.createElement("span");

		liSummary.classList.add("li-summary")
		li.appendChild(liSummary);
		return [li, liSummary];
	}
	
	static toResult(node, vID, {isMonthQueryFolder, isDayQueryFolder, folderViewFunc, mocLevel}){
		if (!node){
			throw Error("node is null")
		}
		const [li, liSummary] = this.getListItemPair();
		
		liSummary.id = "view("+vID+")"+"-(result-content)-li("+node.path+")"
		
		let display;
		
		if (node.type==="file"){
			display = node.displayName;
			dv.api.renderValue(display,liSummary,dv.component,dv.currentFilePath)
			return {resultContent: li, resultMoc:null};
		}else if(node.type==="folder"){
			let li2;
			let li2Summary;
			[li2, li2Summary] = this.getListItemPair();
			li2Summary.id = "view("+vID+")"+"-(result-moc)-li("+node.path+")";
			
			
			let curFolderNode = node;
			const folderNodeList = [curFolderNode]
			if(!folderViewFunc){
				while (curFolderNode.children&&curFolderNode.children.length===1&&curFolderNode.children.at(0)?.type==="folder"){
					curFolderNode.children[0].pureLevel = curFolderNode.pureLevel;
					curFolderNode = curFolderNode.children[0]
					folderNodeList.push(curFolderNode)
				}
			}
			
			
			display = folderNodeList.map(folderNode=>folderNode.displayName).join("/");
			if (curFolderNode.children.length!==0){
				display = display+" ("+curFolderNode.children.length+")"
			}
			
			let folderIcon = "📁";
			if (isMonthQueryFolder){
				folderIcon = "📅"
			}else if(isDayQueryFolder){
				folderIcon = "🕦"
			}
			if (curFolderNode.pureLevel>=mocLevel){
				folderIcon = "🏵️"
			}
			
			const a1 = document.createElement("a");
			let a2;
			
			a1.innerText = folderIcon;
			
			
			let childrenUL2;
			
			let a3;
			
			function scrollIntoView01(){
				liSummary.scrollIntoView({behavior:"smooth"})
				liSummary.style.backgroundColor="rgba(255,255,0,0.5)";
				setTimeout(()=>{
					liSummary.style.backgroundColor="";
				},2000)
				
				li2Summary.style.backgroundColor="rgba(255,255,0,0.5)";
				setTimeout(()=>{
					li2Summary.style.backgroundColor="";
				},2000)
			}
			function scrollIntoView02(){
				li2Summary.scrollIntoView({behavior:"smooth"})
				scrollIntoView01()
			}
			
			if (folderViewFunc){
				a3 = document.createElement("a");
				a3.innerText = "🔎"
				a3.onclick = ()=>{
					folderViewFunc(curFolderNode.path)
				}
			}
			a1.onclick = scrollIntoView02;
			
			a2 = document.createElement("a");
			a2.innerText = folderIcon;
			a2.onclick = scrollIntoView01;
			
			li2Summary.appendChild(a2)
			dv.api.renderValue(
				display,
				li2Summary,
				dv.component,
				dv.currentFilePath
			)
			childrenUL2 = document.createElement("ul");
			li2.appendChild(childrenUL2);
			
			liSummary.appendChild(a1)
			if(folderViewFunc){
				liSummary.appendChild(a3)
			}
			dv.api.renderValue(
				display,
				liSummary,
				dv.component,
				dv.currentFilePath
			)
			
			const childrenUL = document.createElement("ul");
			li.appendChild(childrenUL);
			
			const dataArr = dv.array(curFolderNode.children||[]);
			const childFolders = dataArr.filter(c=>c.type==="folder").sort(c=>c.path);
			const childFiles = dataArr.filter(c=>c.type==="file").sort(c=>c.page.file.ctime,"desc");

			function push(childNodes, ul, ul2, {isMonthQueryFolder, isDayQueryFolder, mocLevel}){
				childNodes.forEach(childNode=>{
					const result = Tree.toResult(childNode,vID,{isMonthQueryFolder:isMonthQueryFolder, isDayQueryFolder:isDayQueryFolder,folderViewFunc:folderViewFunc, mocLevel:mocLevel});
					ul.appendChild(result.resultContent);
					if(result.resultMoc){
						ul2.appendChild(result.resultMoc);
					};
				});
				
			}
			push(childFolders, childrenUL,childrenUL2,{isMonthQueryFolder:false, isDayQueryFolder:false, mocLevel:mocLevel});
			if (childFiles.length<10){
				push(childFiles, childrenUL,childrenUL2,{isMonthQueryFolder:false, isDayQueryFolder:false, mocLevel:mocLevel});
			}else{
				if (!isMonthQueryFolder&&!isDayQueryFolder){
					const monthQueryFolders = childFiles.groupBy(c=>dv.func.dateformat(c.page.file.cday,"yyyy-MM"))
					.sort(g=>g.key,"desc")
					.map(g=>{
						const monthQueryFolder = new Node({
							type: "folder",
							path: curFolderNode.path+"/"+g.key,
							displayName: g.key,
							children: g.rows.array(),
							level: curFolderNode.level+1,
							pureLevel: curFolderNode.pureLevel+1
						});
						return monthQueryFolder;
					})
					push(monthQueryFolders, childrenUL,childrenUL2, {isMonthQueryFolder:true, isDayQueryFolder:false, mocLevel:mocLevel});
				}else if(isMonthQueryFolder){
					const dayQueryFolders = childFiles.groupBy(c=>dv.func.dateformat(c.page.file.cday,"yyyy-MM-dd"))
					.sort(g=>g.key,"desc")
					.map(g=>{
						const dayQueryFolder = new Node({
							type: "folder",
							path: curFolderNode.path+"/"+g.key,
							displayName: g.key,
							children: g.rows.array(),
							level: curFolderNode.level+1,
							pureLevel: curFolderNode.pureLevel+1
						});
						return dayQueryFolder;
					})
					push(dayQueryFolders, childrenUL,childrenUL2, {isMonthQueryFolder:false, isDayQueryFolder:true, mocLevel:mocLevel});
				}else{
					push(childFiles, childrenUL,childrenUL2,{isMonthQueryFolder:false, isDayQueryFolder:false, mocLevel:mocLevel});
				}
			}
			
			return {resultContent: li, resultMoc: ((curFolderNode.pureLevel<mocLevel)?li2:null)};
		}else{
			throw new Error("Error: TreeNode: Unexpected: curFolderNode.type==="+curFolderNode?.type)
		}	
	}
}

class Main{
	static main(){
		dv.container.style.overflowX = "visible"
		Main.con.appendChild(Main.viewNavCon)
		Main.con.appendChild(Main.curViewCon)
		dv.container.appendChild(Main.con)
		//this.displayFolderStruct(defaultCWD, defaultSource)
		this.displayRootFolderStructDepthN()
	}
	static con = document.createElement("div");
	static viewNavCon = document.createElement("div");
	static viewNavConIsLoaded = false;
	static curViewCon = document.createElement("div");
	static viewConMap = {};
	static now = Date.now();
	static getCon(){
		const con = document.createElement("div")
		con.style.display="flex"
		con.style.width = "100%"
		return con;
	}
	static getMocCon(){
		const divMoc = document.createElement("div")
		divMoc.style.overflowY = "scroll"
		divMoc.style.height = "calc(100vh - 100px)"
		divMoc.style.flexShrink = "0"
		return divMoc;
	}
	static getResultContentCon(){
		const divResultContent = document.createElement("div")
		divResultContent.style.width = "100%"
		divResultContent.style.overflowY = "scroll"
		divResultContent.style.height = "calc(100vh - 100px)"
		return divResultContent;
	}
	static appendRowsTo(con){
		for (let i = 0; i < 50; ++i){
			con.appendChild(document.createElement("br"))
		}
	}
	static displayRootFolderStructDepthN(callerCWD){
		const mocLevel = config.rootFolderView.mocLevel;
		const folderLevel = config.rootFolderView.folderLevel;
		if(!Main.viewNavConIsLoaded){
			const oldViewNavCon = Main.viewNavCon;
			
			const vID = "viewnav-"+Main.now;
			Main.viewNavCon = this.getCon();
			Main.viewNavCon.id = vID;
			const viewNavConMoc = this.getMocCon();
			const viewNavConResult = this.getResultContentCon();
			Main.viewNavCon.appendChild(viewNavConMoc)
			Main.viewNavCon.appendChild(viewNavConResult)
			
			const pagePaths = dv.pages()
				.map(page=>page.file.folder)
				.distinct()
				.filter(pagePath=>pagePath.length!==0&&pagePath.split("/").length<=folderLevel)
				.distinct()
				.sort(pagePath=>pagePath)
			const cwdDisplay = "Root"
			const tree = new Tree(pagePaths, cwdDisplay);
			
			const {resultContent,resultMoc} = Tree.toResult(tree.treeRootNode,vID,{mocLevel:mocLevel,isMonthQueryFolder:false, isDayQueryFolder:false,folderViewFunc:(folderPath)=>{
				const cwd = folderPath;
				const source = `"${cwd}"`;
				Main.displayFolderStruct(cwd,source);
				
			}})
			
			const ul = document.createElement("ul")
			ul.appendChild(resultContent)
			dv.header(2,"🔎Folders",{container:viewNavConResult})
			viewNavConResult.appendChild(ul)
			Main.appendRowsTo(viewNavConResult)
			
			const ul2 = document.createElement("ul")
			ul2.appendChild(resultMoc)
			dv.header(2,"🔎Folders",{container:viewNavConMoc})
			viewNavConMoc.appendChild(ul2)
			Main.appendRowsTo(viewNavConMoc)
			oldViewNavCon.replaceWith(Main.viewNavCon)
			Main.viewNavConIsLoaded = true;
		}
		
		const callerElemID = "view("+Main.viewNavCon.id+")"+"-(result-content)-li("+callerCWD+")";
		document.getElementById(callerElemID)?.scrollIntoView({behavior:"smooth"})
	}

	static displayFolderStruct(cwd, source) {
		const vID = "viewresultcontent-"+Main.now+"-"+cwd+"-"+source;
		const mocLevel = config.specFolderView.mocLevel;
		
		let viewCon = Main.viewConMap[vID];
		if (!viewCon){
			viewCon = this.getCon();
			viewCon.id = vID
			
			const pagePaths = dv.pages(source)
				.map(page=>page.file.path.slice(cwd.length+1))
				.sort(pagePath=>pagePath)
			const cwdDisplay = cwd.split("/").at(-1);
			const tree = new Tree(pagePaths, cwdDisplay);
	
			const ul = document.createElement("ul")
			const ul2 = document.createElement("ul")
			const {resultContent,resultMoc} = Tree.toResult(tree.treeRootNode,vID,{isMonthQueryFolder:false, isDayQueryFolder:false, mocLevel:mocLevel})
			ul.appendChild(resultContent);
			ul2.appendChild(resultMoc);		
			
			const cwdParts = cwd.split("/");
			function createA(){
				const a = document.createElement("a")
				a.innerText = "🔎"
				a.onclick = ()=>{
					Main.displayRootFolderStructDepthN(cwd)
				}
				return a;
			}
			function createH2(){
				const h2 = document.createElement("h2")
				h2.appendChild(createA())
				dv.span(cwdParts.at(-1),{container:h2})
				return h2;
			}
			
			const divMoc = this.getMocCon();
			
			divMoc.append(createH2())
			
			dv.span("> "+cwdParts.slice(0,cwdParts.length-1).join("/"),{container:divMoc})
			divMoc.appendChild(ul2)
			Main.appendRowsTo(divMoc)
			
			
			const divResultContent = this.getResultContentCon();
			
			divResultContent.append(createH2())
			divResultContent.appendChild(ul)
			Main.appendRowsTo(divResultContent)
			
			viewCon.appendChild(divMoc)
			viewCon.appendChild(divResultContent)
			Main.viewConMap[vID] = viewCon;
		}
		
		const oldViewCon = Main.curViewCon;
		Main.curViewCon = viewCon;
		
		if (oldViewCon !== viewCon){
			oldViewCon.replaceWith(viewCon)
		}
		
		Main.curViewCon.scrollIntoView({behavior:"smooth"})
	}
}

Main.main()