---
ctime: 2025-11-06T21:14:35+08:00
mtime: 2025-11-07T15:38:47+08:00
---

# 汉语主题词数据库 Report Explorer

```dataviewjs
const container = dv.container;
const current = dv.current();
const currentFileName = current.file.name+".md";
const files = app.vault.getFiles().filter(f=>f.name!==currentFileName);

function view(file){
	noteCon.empty();
	const linkText = app.metadataCache.fileToLinktext(file);
	const content = "![["+linkText+"]]";
	console.log(content);
	dv.paragraph(content,{container:noteCon});
	
	let page = dv.page(file.path);
	viewHR(page,noteCon);
	showMindMap(page,noteCon);
	
	searchBar.scrollIntoView();

}

function getViewLink(file){
	const a = document.createElement("a");
	a.innerText = "🔍";
	a.onclick = ()=>view(file);
	return a;
}

const form = document.createElement("form");
form.action = null;
form.onsubmit = (e)=>{
	const keyword = searchBar.value.toLowerCase();
	const files2 = files.filter(f=>f.name.toLowerCase().includes(keyword)).sort((f1,f2)=>f1.name.length-f2.name.length).slice(0,100);
	
	searchBarLabel.scrollIntoView();
	noteCon.empty();
	if (files2.length === 0){
		dv.paragraph("Not Found", {container:noteCon});
	}else{
		const ul = document.createElement("ul");
		noteCon.appendChild(ul);
		
		files2.forEach(file=>{
			const li = document.createElement("li");
			ul.appendChild(li);
			const linkText = app.metadataCache.fileToLinktext(file);
			dv.api.renderValue(" ",li,dv.component,dv.currentFilePath);
			li.appendChild(getViewLink(file))
			dv.api.renderValue(" [["+linkText+"]]",li,dv.component,dv.currentFilePath);
		
		})
	}
}
container.appendChild(form);

const searchBar = document.createElement("input");
searchBar.type = "text";
searchBar.id = "my-search-bar";

const searchBarLabel = document.createElement("label");
searchBarLabel.for = searchBar.id;
searchBarLabel.innerText = "search bar: ";

const submitButton = document.createElement("input");
submitButton.type = "submit";
submitButton.value = "submit"

form.appendChild(searchBarLabel);
form.appendChild(searchBar);
form.appendChild(document.createTextNode(` `))
form.appendChild(submitButton)

const noteCon = document.createElement("div");
container.appendChild(noteCon)

//form.onsubmit();
view(files.find(f=>f.name==="数学.md"))

function getRelations(n,n2){
	let p = n.page;
	let p2 = n2.page;
	let relations = [];
	for (let key of ["up", "categories","broadterms"]){
		if ((p[key]||[]).some(l=>l.path===p2.file.path)){
			relations.push([key,n,n2])
		}
	}
	if (p.seealso?.path===p2.file.path){
		relations.push(["seealso",n,n2]);
	}
	return relations;
}

function viewHR(page,con) {
	let nodes = [];
	let relations = [];
	let currentPages = [page];	
	
	for (;currentPages.length!==0;) {
		let p = currentPages.pop();
		
		let thisNode = nodes.find(n=>n.path===p.file.path) || {path:p.file.path,page:p,children:[]}
	
		const parentsLinks = [...(p.up||[]),...(p.categories||[]),...(p.broadterms||[])].concat(p.seealso?[p.seealso]:[])
		const parentsPages = parentsLinks.map(l=>l.path||null).filter(path=>path).unique().map(path=>dv.page(path)).filter(p=>p);
		currentPages = currentPages.concat(parentsPages);
		parentsPages.forEach(p2=>{
			let node2 = nodes.find(n=>n.path===p2.file.path);
			if (!node2){
				node2 = {path: p2.file.path, page: p2, children: [thisNode]};
				nodes.push(node2);
			}else{
				let node3 = node2.children.find(n=>n.path===p.file.path);
				if (!node3){
					node2.children.push(thisNode);
				}
			}
			relations = relations.concat(getRelations(thisNode,node2));
		})
	}
	let rootNodes = nodes.filter(n1=>nodes.every(n2=>!n2.children.map(c=>c.path).contains(n1.path)));
	rootNodes.forEach(n=>{n.isRoot=true})
	console.log("rootNodes",rootNodes)
	let content = rootNodes.map(rootNode=>getNodeRowArr(rootNode,null,relations,0).join("\n")+"\n").join("");
	dv.paragraph(content,{container:noteCon});
}

function getNodeRowArr(node,node2,relations,depth=0){
	let line = "\t".repeat(depth)+"- ";
	
	if (!node.isRoot){
		const curRelations = relations.filter(r=>r[1]===node&&r[2]===node2);
		const curRelationsStr = curRelations.map(r=>r[0][0].toUpperCase()).unique().join("").replaceAll("U","D").replaceAll("B","N").replaceAll("C","S");
		line += "**"+curRelationsStr+"** ";
	}
	
	line += "[["+node.page.file.name+"]]";
	
	const childrenLines = node.children.flatMap(c=>getNodeRowArr(
		c,node,relations,depth+1
	))
	
	return [line].concat(childrenLines);
}

function renderItems(items){
	if (!items) {return "";}
	return "      [\"" + items.map(i=>{
		if (i.display){
			return i.display;
		}
		if (i.path){
			return i.path?.replace(/(^.*\/)|(\.md$)/g,"");
		}
		return i;
	}).join(" ")+"\"]\n";
}

function showMindMap(page, con){
	const content = "```mermaid\nmindmap\n  root(("+page.file.name+"))\n"
		+ "    english\n" + "      " + (page.english||"") + "\n"
		+ "    broadterms\n" + renderItems(page.broadterms)
		+ "    narrowerterms\n" + renderItems(page.narrowerterms)
		+ "    relatedterms\n" + renderItems(page.relatedterms)
		+ "    categories\n" + renderItems(page.categories)
		+ "    sources\n" + renderItems(page.sources)
		+ "    synonyms\n" + renderItems(page.synonyms)
		+ "```\n";
	// console.log(content);
	dv.paragraph(content,{container:con});
	// dv.paragraph("````\n"+content+"````\n",{container:con});
}

```
