/**
 * dataviewjs 脚本 | dataviewjs script;
 * fileName: `folder-view.js`;
 * built in property: ["icon", "cover", "kws", "tags", "description", "status", "categories", "rating"];
 * indexedKeyFuncMap: ["status", "categories", "rating"];
 * config.scrollIntoViewOption.behaior: value is in ["smooth", "instant", "auto"];
 * config.indexedKeyFuncMap: add entries like {key: convertPageIntoValueFunc} to the value;
 */

const config = {
	rootFolderView: {
		mocLevel: 4,
		folderLevel: 7
	},
	specFolderView: {
		mocLevel: 5
	},
	scrollIntoViewOption: {
		behavior: "smooth" /**  */
	},
	indexedKeyFuncMap: {
		status: p => p.status,
		categories: p => p.categories,
		rating: p => p.rating,
		description: p => p.description ? "hasdescription": undefined
	} 
};

const behavior = config.scrollIntoViewOption.behavior;
const allPages = dv.pages();

class Node {
	type; /** file OR folder */
	path;
	displayName;
	children;
	level;
	id;
	page;
	pureLevel;
	constructor({ type, path, displayName, children, level, pureLevel }) {
		this.type = type;
		this.path = path;
		this.displayName = displayName;
		this.children = children || [];
		this.level = level || -1;
		this.pureLevel = pureLevel || this.level;
		if (type === "file") {
			this.page = dv.page(path);
		}
	}
}
function tryTurnLinkIntoLinkText(linkOrStr) {
	if (!dv.value.isLink(linkOrStr)) {
		const str = linkOrStr;
		return str;
	} else {
		const link = linkOrStr;
		return link.display || link.path.split("/").at(-1).replace(/\.md$/, "");
	}
}

function getKeywordsFromPage(page) {
	return dv.array([
		...(page.kws || []).map(kw => tryTurnLinkIntoLinkText(kw)),
		...page.file.tags.map(tag => tag.substring(1))
	]).distinct();
}

function getKeywords(pages) {
	return pages.flatMap(p => getKeywordsFromPage(p)).distinct();
}

function scrollIntoView01(liSummary, li2Summary) {
	liSummary.scrollIntoView({ behavior: behavior });
	tempHighlight(liSummary);
	tempHighlight2(liSummary.parentElement);
	tempHighlight(li2Summary);
	tempHighlight2(li2Summary.parentElement);
}
function scrollIntoView02(liSummary, li2Summary) {
	li2Summary.scrollIntoView({ behavior: behavior });
	scrollIntoView01(liSummary, li2Summary);
}
function tempHighlight(elem) {
	elem.style.backgroundColor = "rgba(255,255,0,0.5)";
	setTimeout(() => {
		elem.style.backgroundColor = "";;
	}, 2000);
}
function tempHighlight2(elem) {
	elem.style.backgroundColor = "rgba(255,255,0,0.1)";
	setTimeout(() => {
		elem.style.backgroundColor = "";
	}, 2000);
}
function turnPageArrIntoLinkArrStr(pages01) {
	return "\\[" + pages01.map((p, i) => dv.fileLink(p.file.path, false, "" + (i + 1))).join(", ") + "\\]";
}
function tryGetPageArr(str) {
	let page = dv.page(str);
	const pages01 = [];
	if (page) {
		pages01.push(page);
	}
	const pages02 = dv.array(pages01).concat(allPages.filter(p => p.file.aliases.some(a => a.toLowerCase() === str.toLowerCase())));
	return pages02;
}
function tryRenderWithLink(str) {
	const pages02 = tryGetPageArr(str);
	let firstPart;
	let page;
	if (pages02.length !== 0) {
		page = pages02[0];
		firstPart = dv.fileLink(page.file.path, false, str);
	}

	let secondPart = "";
	const pages03 = pages02.slice(1);
	const pages04 = allPages.filter(p => p.file.aliases.some(a => str.toLowerCase().startsWith(a.toLowerCase())));
	const pages05 = allPages.filter(p => p.file.aliases.some(a => str.toLowerCase().endsWith(a.toLowerCase())));
	const pages06 = allPages.filter(p => p.file.aliases.some(a => {
		const strL = str.toLowerCase();
		const aL = a.toLowerCase();
		return !strL.startsWith(aL) && !strL.endsWith(aL) && strL.includes(aL);
	}));
	const pages07 = pages04.concat(pages05).concat(pages06).distinct().filter(p => p.file.path !== page?.file?.path);

	if (pages03.length !== 0) {
		secondPart += " ";
		secondPart += "&lt;";
		secondPart += pages03.map((p, i) => dv.fileLink(p.file.path, false, "" + (i + 1))).join(", ");
		secondPart += "&gt;";
	}
	if (pages07.length !== 0) {
		secondPart += " ";
		secondPart += "\\[";
		secondPart += pages07.map((p, i) => dv.fileLink(p.file.path, false, "" + (i + 1))).join(", ");
		secondPart += "\\]";
	}

	let renderResult = firstPart || str;

	if (secondPart) {
		renderResult += secondPart;
	}

	return renderResult;
}
class Tree {
	treeRootNode;
	nodes;
	constructor(pagePaths, cwdDisplay) {
		this.treeRootNode = new Node({
			type: "folder",
			path: "",
			displayName: tryRenderWithLink(cwdDisplay),
			children: [],
			level: 0
		});
		this.nodes = [this.treeRootNode];
		pagePaths.forEach(pagePath => {
			this.pushPagePath(pagePath);
		});
	}
	static getFileNode(pagePath) {
		let pathParts;
		let fileNodeShortPath;
		let fileNodeDisplayNameSpan;
		let page;
		let tdata;

		pathParts = pagePath.split("/");
		page = dv.page(pagePath);

		fileNodeShortPath = pathParts.at(-1).replace(/\.md$/, "");
		const pageLink = dv.fileLink(
			page.file.name,
			false,
			fileNodeShortPath
		);

		fileNodeDisplayNameSpan = document.createElement("span");


		if (page.icon && dv.value.isLink(page.icon)) {
			const iconFileLink = dv.fileLink(
				page.icon.path,
				true,
				"16"
			);
			dv.span(iconFileLink, { container: fileNodeDisplayNameSpan });
		} else {
			dv.span("📄", { container: fileNodeDisplayNameSpan });
		}

		dv.span(pageLink, { container: fileNodeDisplayNameSpan });

		const cDayStr = page.file.ctime.toFormat("yyyy-MM-dd");
		const cDayPage = dv.page(cDayStr);

		const cDaySpan = document.createElement("span");
		cDaySpan.style.float = "right";
		cDaySpan.style.whiteSpace = "nowrap";
		if (cDayPage) {
			dv.span("➕[[" + cDayStr + "]]", { container: cDaySpan });
		} else {
			cDaySpan.innerText = "➕" + cDayStr;
		}

		fileNodeDisplayNameSpan.appendChild(cDaySpan);

		const mDayStr = page.file.mday.toFormat("yyyy-MM-dd");
		const mDayPage = dv.page(mDayStr);

		const mDaySpan = document.createElement("span");
		mDaySpan.style.float = "right";
		mDaySpan.style.whiteSpace = "nowrap";
		if (mDayPage) {
			dv.span("❇️[[" + mDayStr + "]]", { container: mDaySpan });
		} else {
			mDaySpan.innerText = "❇️" + mDayStr;
		}

		fileNodeDisplayNameSpan.appendChild(mDaySpan);


		if (page.description && page.description.length != 0) {
			const blockQuote = document.createElement("blockquote");
			blockQuote.innerText = page.description;
			fileNodeDisplayNameSpan.appendChild(blockQuote);
		}


		if (page.cover && dv.value.isLink(page.cover)) {
			fileNodeDisplayNameSpan.appendChild(document.createElement("br"));
			dv.span(dv.fileLink(page.cover.path, true, "300"), { container: fileNodeDisplayNameSpan });
		}

		tdata = [];
		if (page.kws && dv.value.isArray(page.kws) && page.kws.length !== 0) {
			tdata.push(["🟢", page.kws.join(" ")]);
		}
		if (page.file.tags.length !== 0) {
			tdata.push(["🔴", page.file.tags.join(" ")]);
		}
		if (page.categories && dv.value.isArray(page.categories) && page.categories.length !== 0) {
			tdata.push(["🟠", page.categories.join(" ")]);
		}
		if (page.status) {
			tdata.push(["ℹ️", page.status]);
		}
		if (page.rating && typeof page.rating === "number") {
			tdata.push(["⭐", "⭐".repeat(page.rating % 6)]);
		}
		if (tdata.length !== 0) {
			fileNodeDisplayNameSpan.appendChild(document.createElement("br"));

			const table = document.createElement("table");
			table.style.marginTop = "1em";
			table.style.marginBottom = "1em";
			const tbody = document.createElement("tbody");
			table.appendChild(tbody);
			tdata.forEach(tRowData => {
				const tr = document.createElement("tr");
				tRowData.forEach(tItemData => {
					const td = document.createElement("td");
					dv.span(tItemData, { container: td });
					tr.appendChild(td);
				});
				tbody.appendChild(tr);
			});
			fileNodeDisplayNameSpan.appendChild(table);
		}

		const fileNode = new Node({
			type: "file",
			path: pagePath,
			displayName: fileNodeDisplayNameSpan,
			level: pathParts.length
		});

		return fileNode;
	}
	pushPagePath(pagePath) {
		let fileNode;
		const pathParts = pagePath.split("/");
		let iInit = pathParts.length - 1;
		if (pagePath.endsWith(".md")) {
			fileNode = Tree.getFileNode(pagePath);
			this.nodes.push(fileNode);
			iInit = pathParts.length - 2;
		}


		let folderNode;
		let i;
		for (i = iInit; i >= 0; i--) {

			const folderPath = pathParts.slice(0, i + 1).join("/");

			const folderNodeInList = this.nodes.find(node => node.path === folderPath);
			const node = folderNode || fileNode;
			if (folderNodeInList && node) {
				folderNodeInList.children.push(node);
				break;
			}
			const children = [];
			if (node) {
				children.push(node);
			}
			folderNode = new Node({
				type: "folder",
				path: folderPath,
				displayName: tryRenderWithLink(pathParts[i]),
				children: children,
				level: i + 1
			});

			this.nodes.push(folderNode);
		}

		if (i === -1) {
			this.treeRootNode.children.push(folderNode || fileNode);
		}
	}
	static getListItemPair() {
		const li = document.createElement("li");
		li.style.listStyleType = "none";
		const liSummary = document.createElement("span");

		liSummary.classList.add("li-summary");
		li.appendChild(liSummary);
		return [li, liSummary];
	}

	static toResult(node, vID, { isMonthQueryFolder, isDayQueryFolder, folderViewFunc, mocLevel }) {
		if (!node) {
			throw Error("node is null");
		}
		const [li, liSummary] = this.getListItemPair();

		liSummary.id = "view(" + vID + ")" + "-(result-content)-li(" + node.path + ")";

		let display;

		if (node.type === "file") {
			const page = dv.page(node.path);

			const kws = getKeywordsFromPage(page);
			if (kws.length === 0) {
				liSummary.classList.add("kw-withoutkeyword");
			}
			kws.forEach(kw => {
				const keywordClass = "kw-" + kw.replaceAll(/[\s\[\]\(\)\.]/g, "-");
				liSummary.classList.add(keywordClass);
			});

			Object.entries(config.indexedKeyFuncMap).forEach(([key, keyFunc]) => {
				let indexItems = keyFunc(page);
				if (!indexItems) {
					indexItems = [];
				}
				if (!dv.value.isArray(indexItems)) {
					indexItems = [indexItems];
				}
				if (indexItems.length === 0){
					liSummary.classList.add("index-" + key + "-withoutindex")
				}
				indexItems.forEach(indexItem => {
					const indexItemKey = tryTurnLinkIntoLinkText(indexItem);
					let indexClass;
					try{
						indexClass = "index-" + key + "-" + (indexItemKey+"").replaceAll(/[\s\[\]\(\)\.]/g, "-");
					}catch(e){
						console.log(indexItemKey)
						console.log(key)
						throw e;
					}
					
					liSummary.classList.add(indexClass);
				});
			});

			liSummary.classList.add("ctime-" + page.file.ctime.toFormat("yyyy-MM"));
			liSummary.classList.add("mtime-" + page.file.mtime.toFormat("yyyy-MM"));


			display = node.displayName;
			dv.api.renderValue(display, liSummary, dv.component, dv.currentFilePath);
			return { resultContent: li, resultMoc: null };
		} else if (node.type === "folder") {
			let li2;
			let li2Summary;
			[li2, li2Summary] = this.getListItemPair();
			li2Summary.id = "view(" + vID + ")" + "-(result-moc)-li(" + node.path + ")";


			let curFolderNode = node;
			const folderNodeList = [curFolderNode];
			if (!folderViewFunc) {
				while (curFolderNode.children && curFolderNode.children.length === 1 && curFolderNode.children.at(0)?.type === "folder") {
					curFolderNode.children[0].pureLevel = curFolderNode.pureLevel;
					curFolderNode = curFolderNode.children[0];
					folderNodeList.push(curFolderNode);
				}
			}


			display = folderNodeList.map(folderNode => folderNode.displayName).join("/");
			if (curFolderNode.children.length !== 0) {
				display = display + " (" + curFolderNode.children.length + ")";
			}

			let folderIcon = "📁";
			if (curFolderNode.pureLevel >= mocLevel) {
				folderIcon = "🏵️";
			}
			if (isMonthQueryFolder) {
				folderIcon = "📅";
			} else if (isDayQueryFolder) {
				folderIcon = "🕦";
			}

			const a1 = document.createElement("a");
			let a2;

			a1.innerText = folderIcon;


			let childrenUL2;

			let a3;

			if (folderViewFunc) {
				a3 = document.createElement("a");
				a3.innerText = "🔎";
				a3.onclick = () => {
					setTimeout(() => { a3.innerText = "⬇️"; }, 2000);
					tempHighlight(liSummary);
					tempHighlight2(liSummary.parentElement);
					folderViewFunc(curFolderNode.path);
				};
			}
			a1.onclick = () => scrollIntoView02(liSummary, li2Summary);

			a2 = document.createElement("a");
			a2.innerText = folderIcon;
			a2.onclick = () => scrollIntoView01(liSummary, li2Summary);

			li2Summary.appendChild(a2);
			dv.api.renderValue(
				display,
				li2Summary,
				dv.component,
				dv.currentFilePath
			);
			childrenUL2 = document.createElement("ul");
			li2.appendChild(childrenUL2);

			liSummary.appendChild(a1);
			if (folderViewFunc) {
				liSummary.appendChild(a3);
			}
			dv.api.renderValue(
				display,
				liSummary,
				dv.component,
				dv.currentFilePath
			);

			const childrenUL = document.createElement("ul");
			li.appendChild(childrenUL);

			const dataArr = dv.array(curFolderNode.children || []);
			const childFolders = dataArr.filter(c => c.type === "folder").sort(c => c.path);
			const childFiles = dataArr.filter(c => c.type === "file").sort(c => c.page.file.ctime, "desc");

			function push(childNodes, ul, ul2, { isMonthQueryFolder, isDayQueryFolder, mocLevel }) {
				childNodes.forEach(childNode => {
					const result = Tree.toResult(childNode, vID, { isMonthQueryFolder: isMonthQueryFolder, isDayQueryFolder: isDayQueryFolder, folderViewFunc: folderViewFunc, mocLevel: mocLevel });
					ul.appendChild(result.resultContent);
					if (result.resultMoc) {
						ul2.appendChild(result.resultMoc);
					}
				});

			}
			push(childFolders, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
			if (childFiles.length < 10) {
				push(childFiles, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
			} else {
				if (!isMonthQueryFolder && !isDayQueryFolder) {
					const monthQueryFolders = childFiles.groupBy(c => dv.func.dateformat(c.page.file.ctime, "yyyy-MM"))
						.sort(g => g.key, "desc")
						.map(g => {
							const monthQueryFolder = new Node({
								type: "folder",
								path: curFolderNode.path + "/" + g.key,
								displayName: tryRenderWithLink(g.key),
								children: g.rows.array(),
								level: curFolderNode.level + 1,
								pureLevel: curFolderNode.pureLevel + 1
							});
							return monthQueryFolder;
						});

					if (monthQueryFolders.length !== 1) {
						push(monthQueryFolders, childrenUL, childrenUL2, { isMonthQueryFolder: true, isDayQueryFolder: false, mocLevel: mocLevel });
					} else {
						push(childFiles, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
					}

				} else if (isMonthQueryFolder) {
					const dayQueryFolders = childFiles.groupBy(c => dv.func.dateformat(c.page.file.cday, "yyyy-MM-dd"))
						.sort(g => g.key, "desc")
						.map(g => {
							const dayQueryFolder = new Node({
								type: "folder",
								path: curFolderNode.path + "/" + g.key,
								displayName: tryRenderWithLink(g.key),
								children: g.rows.array(),
								level: curFolderNode.level + 1,
								pureLevel: curFolderNode.pureLevel + 1
							});
							return dayQueryFolder;
						});
					if (dayQueryFolders.length !== 1) {
						push(dayQueryFolders, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: true, mocLevel: mocLevel });
					} else {
						push(childFiles, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
					}
				} else {
					push(childFiles, childrenUL, childrenUL2, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
				}
			}

			return { resultContent: li, resultMoc: ((curFolderNode.pureLevel < mocLevel) ? li2 : null) };
		} else {
			throw new Error("Error: TreeNode: Unexpected: curFolderNode.type===" + curFolderNode?.type);
		}
	}
}

class Main {
	static main() {
		Main.con.style.display = "flex";
		Main.con.style.flexDirection = "column";

		dv.container.style.overflowX = "visible";
		Main.con.appendChild(Main.viewNavCon);
		Main.con.appendChild(Main.curViewCon);
		dv.container.appendChild(Main.con);
		console.time("rootfolder");
		this.displayRootFolderStructDepthN();
		console.timeEnd("rootfolder");
	}
	static con = document.createElement("div");
	static viewNavCon = document.createElement("div");
	static viewNavConIsLoaded = false;
	static curViewCon = document.createElement("div");
	static curViewConIsLoaded = false;
	static viewConMap = {};
	static now = Date.now();
	static getViewCon() {
		const con = document.createElement("div");
		con.style.display = "flex";
		con.style.width = "100%";
		con.style.order = "1";
		return con;
	}
	static getMocCon() {
		const divMoc = document.createElement("div");
		divMoc.style.height = "calc(100vh - 80px)";
		divMoc.style.overflowY = "scroll";

		divMoc.style.flexShrink = "0";
		return divMoc;
	}
	static getResultContentCon() {
		const divResultContent = document.createElement("div");
		divResultContent.style.width = "100%";
		divResultContent.style.overflowY = "scroll";
		divResultContent.style.height = "calc(100vh - 80px)";
		return divResultContent;
	}
	static appendRowsTo(con) {
		for (let i = 0; i < 50; ++i) {
			con.appendChild(document.createElement("br"));
		}
	}
	static displayRootFolderStructDepthN(callerCWD) {
		const mocLevel = config.rootFolderView.mocLevel;
		const folderLevel = config.rootFolderView.folderLevel;
		if (!Main.viewNavConIsLoaded) {
			const oldViewNavCon = Main.viewNavCon;

			const vID = "viewnav-" + Main.now;
			Main.viewNavCon = this.getViewCon();
			Main.viewNavCon.style.order = "0";
			Main.viewNavCon.id = vID;
			const viewNavConMoc = this.getMocCon();
			const viewNavConResult = this.getResultContentCon();
			Main.viewNavCon.appendChild(viewNavConMoc);
			Main.viewNavCon.appendChild(viewNavConResult);

			const pagePaths = allPages
				.map(page => page.file.folder)
				.filter(pagePath => pagePath.length !== 0 && pagePath.split("/").length < folderLevel)
				.distinct()
				.sort(pagePath => pagePath);
			const cwdDisplay = "Root";
			const tree = new Tree(pagePaths, cwdDisplay);
			const { resultContent, resultMoc } = Tree.toResult(tree.treeRootNode, vID, {
				mocLevel: mocLevel, isMonthQueryFolder: false, isDayQueryFolder: false, folderViewFunc: (folderPath) => {
					const cwd = folderPath;
					Main.displayFolderStruct(cwd, { isCache: false });

				}
			});
			function createH2() {
				const h2 = document.createElement("h2");
				const a = document.createElement("a");
				a.innerText = "🔎";
				a.onclick = () => {
					if (Main.curViewConIsLoaded) {
						Main.curViewCon.scrollIntoView({ behavior: behavior });
						Main.curViewCon.querySelectorAll("h2").forEach(h2 => tempHighlight(h2));
						tempHighlight2(Main.curViewCon);
					}
				};
				h2.appendChild(a);
				h2.appendChild(document.createTextNode("Folders"));
				return h2;
			}
			const ul = document.createElement("ul");
			ul.appendChild(resultContent);
			viewNavConResult.appendChild(createH2());
			viewNavConResult.appendChild(ul);
			Main.appendRowsTo(viewNavConResult);

			const ul2 = document.createElement("ul");
			ul2.appendChild(resultMoc);
			viewNavConMoc.appendChild(createH2());
			viewNavConMoc.appendChild(ul2);
			Main.appendRowsTo(viewNavConMoc);
			oldViewNavCon.replaceWith(Main.viewNavCon);
			Main.viewNavConIsLoaded = true;
		}

		const callerElemID = "view(" + Main.viewNavCon.id + ")" + "-(result-content)-li(" + callerCWD + ")";
		const elem = document.getElementById(callerElemID);
		if (elem) {
			elem.scrollIntoView({ behavior: behavior });
			tempHighlight(elem);
			tempHighlight2(elem.parentElement);
		}
	}

	static displayFolderStruct(cwd, { isCache, query }) {
		const vID = "viewresultcontent-" + Main.now + "-" + cwd;
		const mocLevel = config.specFolderView.mocLevel;

		let cachedViewCon = Main.viewConMap[vID];
		let newViewCon;
		if (!cachedViewCon) {
			newViewCon = this.getViewCon();
			newViewCon.id = vID;

			function createA() {
				const a = document.createElement("a");
				a.innerText = "🔎";
				a.onclick = () => {
					Main.curViewCon.querySelectorAll("h2").forEach(h2 => tempHighlight(h2));
					tempHighlight2(Main.curViewCon);
					Main.displayRootFolderStructDepthN(cwd);
				};
				return a;
			}
			function createH2() {
				const h2 = document.createElement("h2");
				h2.appendChild(createA());
				const headerText = cwd.length === 0 ? "Root" : cwdParts.at(-1);
				dv.span(headerText, { container: h2 });
				return h2;
			}

			const cwdParts = cwd.split("/");


			const divMoc = this.getMocCon();

			divMoc.appendChild(createH2());

			const blockQuote = cwd.length === 0
				? "> Root"
				: cwdParts.map((part, i) => "> " + "    ".repeat(i) + "- " + part + (i !== cwdParts.length - 1 ? "/" : "") + "\n").join("");
			dv.span(blockQuote, { container: divMoc });


			const divResultContent = this.getResultContentCon();

			divResultContent.appendChild(createH2());

			newViewCon.appendChild(divMoc);
			newViewCon.appendChild(divResultContent);

			const folderMarkerPos = cwd.length === 0 ? 0 : cwd.length + 1;
			const pages = dv.pages(`"${cwd}"`);
			const pagePaths = pages
				.map(page => page.file.path.slice(folderMarkerPos))
				.sort(pagePath => pagePath);

			function appendResult() {
				let cwdDisplay = cwd.split("/").at(-1);
				if (cwdDisplay.length === 0) {
					cwdDisplay = "Root";
				}
				const tree = new Tree(pagePaths, cwdDisplay);

				const ul = document.createElement("ul");
				const ul2 = document.createElement("ul");
				const { resultContent, resultMoc } = Tree.toResult(tree.treeRootNode, vID, { isMonthQueryFolder: false, isDayQueryFolder: false, mocLevel: mocLevel });
				ul.appendChild(resultContent);
				ul2.appendChild(resultMoc);
				divResultContent.appendChild(ul);
				divMoc.appendChild(ul2);

				const links = tryGetPageArr(cwdDisplay).map(p => p.file.link);
				if (links.length !== 0) {
					const resultInfoH = document.createElement("h3");
					const resultInfoSummarySpan = document.createElement("span");
					resultInfoSummarySpan.id = "view(" + vID + ")-info-" + "(result-content)";
					resultInfoH.appendChild(resultInfoSummarySpan);
					divResultContent.appendChild(resultInfoH);

					const resultInfoContentDiv = document.createElement("div");
					divResultContent.appendChild(resultInfoContentDiv);

					const resultInfoMocLI = document.createElement("li");
					resultInfoMocLI.style.listStyleType = "none";
					const resultInfoMocLISummarySpan = document.createElement("span");
					resultInfoMocLISummarySpan.id = "view(" + vID + ")-info-" + "(result-moc)";
					resultInfoMocLI.appendChild(resultInfoMocLISummarySpan);
					ul2.appendChild(resultInfoMocLI);

					const a = document.createElement("a");
					const a2 = document.createElement("a");
					a.innerText = "📜";
					a2.innerText = "📜";
					a.onclick = () => scrollIntoView01(resultInfoSummarySpan, resultInfoMocLISummarySpan);
					a2.onclick = () => scrollIntoView02(resultInfoSummarySpan, resultInfoMocLISummarySpan);
					resultInfoSummarySpan.appendChild(a2);
					resultInfoMocLISummarySpan.appendChild(a);


					dv.span(links.join(", "), { container: resultInfoSummarySpan });
					dv.span(links.join(", "), { container: resultInfoMocLISummarySpan });

					links.forEach(link => {
						dv.paragraph(dv.func.embed(link), { container: resultInfoContentDiv });
					});
				}

				const kws = getKeywords(pages);
				if (kws.length !== 0) {
					dv.header(3, "🏷️Keywords", { container: divMoc });

					const buttonCon = document.createElement("div");
					buttonCon.style.width = "400px";
					divMoc.appendChild(buttonCon);

					const showAllButton = document.createElement("button");
					showAllButton.innerText = "[All] (" + pages.length + ")";
					showAllButton.onclick = () => {
						ul.querySelectorAll("li").forEach(li => li.style.display = "");
						divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
						showAllButton.style.backgroundColor = "rgba(0,0,255,0.3)";
					};
					buttonCon.appendChild(showAllButton);

					const showAllUntaggedButton = document.createElement("button");
					showAllUntaggedButton.innerText = "[Untagged] (" + pages.filter(p => getKeywordsFromPage(p).length === 0).length + ")";
					showAllUntaggedButton.onclick = () => {
						ul.querySelectorAll("li").forEach(li => li.style.display = "");
						const keywordClass = "kw-withoutkeyword";
						const cssSelector = "li:not(:has(." + keywordClass + "))";
						ul.querySelectorAll(cssSelector).forEach(li => li.style.display = "none");
						divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
						showAllUntaggedButton.style.backgroundColor = "rgba(0,0,255,0.3)";
					};
					buttonCon.appendChild(showAllUntaggedButton);

					const kwInfos = kws.map(kw => [kw, pages.filter(p => getKeywordsFromPage(p).includes(kw))])
						.sort(([_, relatedPages]) => relatedPages.length, "desc");

					kwInfos.forEach(([kw, relatedPages]) => {
						const kwButton = document.createElement("button");
						kwButton.innerText = kw + " (" + relatedPages.length + ")";
						kwButton.onclick = () => {
							ul.querySelectorAll("li").forEach(li => li.style.display = "");
							const keywordClass = "kw-" + kw.replaceAll(/[\s\[\]\(\)\.]/g, "-");
							const cssSelector = "li:not(:has(." + keywordClass + "))";
							ul.querySelectorAll(cssSelector).forEach(li => li.style.display = "none");
							divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
							kwButton.style.backgroundColor = "rgba(0,0,255,0.3)";
						};
						buttonCon.appendChild(kwButton);
					});
				}


				const indexDivArr = dv.array(Object.entries(config.indexedKeyFuncMap)).map(([key, keyFunc]) => {
					const indexDiv = document.createElement("div");
					const indexMap = {};
					pages.forEach(p => {
						let indexItems = keyFunc(p);
						if (!indexItems) {
							return null;
						}
						if (!dv.value.isArray(indexItems)) {
							indexItems = [indexItems];
						}
						indexItems.forEach(indexItem => {
							const indexItemKey = tryTurnLinkIntoLinkText(indexItem);
							if (!indexMap[indexItemKey]) {
								indexMap[indexItemKey] = [p];
							} else {
								indexMap[indexItemKey].push(p);
							}
						});
					});
					const indexMapEntries = dv.array(Object.entries(indexMap)).sort(([_, relatedPages]) => relatedPages.length, "desc");
					console.log(indexMapEntries);
					if (indexMapEntries.length !== 0) {
						dv.header(4, "✅" + key, { container: indexDiv });

						const buttonCon = document.createElement("div");
						buttonCon.style.width = "400px";
						indexDiv.appendChild(buttonCon);

						const showAllButton = document.createElement("button");
						showAllButton.innerText = "[All] (" + pages.length + ")";
						showAllButton.onclick = () => {
							ul.querySelectorAll("li").forEach(li => li.style.display = "");
							divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
							showAllButton.style.backgroundColor = "rgba(0,0,255,0.3)";
						};
						buttonCon.appendChild(showAllButton);

						const showAllUnindexedButton = document.createElement("button");
						showAllUnindexedButton.innerText = "[Unindexed] (" + pages.filter(p => indexMapEntries.every(([_, relatedPages]) => relatedPages.every(p2 => p2.file.path !== p.file.path))).length + ")";
						showAllUnindexedButton.onclick = () => {
							ul.querySelectorAll("li").forEach(li => li.style.display = "");
							const keywordClass = "index-" + key + "-withoutindex";
							const cssSelector = "li:not(:has(." + keywordClass + "))";
							ul.querySelectorAll(cssSelector).forEach(li => li.style.display = "none");
							divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
							showAllUnindexedButton.style.backgroundColor = "rgba(0,0,255,0.3)";
						};
						buttonCon.appendChild(showAllUnindexedButton);

						indexMapEntries.forEach(([indexItemKey, relatedPages]) => {
							const indexItemKeyButton = document.createElement("button");
							indexItemKeyButton.innerText = indexItemKey + " (" + relatedPages.length + ")";
							indexItemKeyButton.onclick = () => {
								ul.querySelectorAll("li").forEach(li => li.style.display = "");
								const indexItemKeyClass = "index-" + key + "-" + (indexItemKey+"").replaceAll(/[\s\[\]\(\)\.]/g, "-");
								const cssSelector = "li:not(:has(." + indexItemKeyClass + "))";
								ul.querySelectorAll(cssSelector).forEach(li => li.style.display = "none");
								divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
								indexItemKeyButton.style.backgroundColor = "rgba(0,0,255,0.3)";
							};
							buttonCon.appendChild(indexItemKeyButton);
						});

						return indexDiv;
					} else {
						return null;
					}
				}).filter(indexDiv => indexDiv);

				if (indexDivArr.length !== 0) {
					dv.header(3, "🔖Indexes", { container: divMoc });
					indexDivArr.forEach(indexDiv => {
						divMoc.appendChild(indexDiv);
					});
				}

				[
					["➕[C]", "ctime"],
					["❇️[M]", "mtime"]
				].forEach(([timePropertyIcon, timePropertyName]) => {
					const months = pages.map(p => p.file[timePropertyName].toFormat("yyyy-MM"))
						.distinct()
						.sort(monthStr => monthStr, "desc");
					if (months.length !== 0) { /** separate variables */
						dv.header(3, timePropertyIcon + "Months", { container: divMoc });
						const buttonCon = document.createElement("div");
						buttonCon.style.width = "400px";
						divMoc.appendChild(buttonCon);

						const showAllButton = document.createElement("button");
						showAllButton.innerText = "[All] (" + pages.length + ")";
						showAllButton.onclick = () => {
							ul.querySelectorAll("li").forEach(li => li.style.display = "");
							divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
							showAllButton.style.backgroundColor = "rgba(0,0,255,0.3)";
						};
						buttonCon.appendChild(showAllButton);

						months.map(monthStr => [monthStr, pages.filter(p => p.file[timePropertyName].toFormat("yyyy-MM") === monthStr)])
							.sort(([monthStr, _]) => monthStr, "desc")
							.forEach(([monthStr, relatedPages]) => {
								const monthButton = document.createElement("button");
								monthButton.innerText = monthStr + " (" + relatedPages.length + ")";
								monthButton.onclick = () => {
									ul.querySelectorAll("li").forEach(li => li.style.display = "");
									const monthClass = timePropertyName + "-" + monthStr;
									const cssSelector = "li:not(:has(." + monthClass + "))";
									ul.querySelectorAll(cssSelector).forEach(li => li.style.display = "none");
									divMoc.querySelectorAll("button").forEach(btn => btn.style.backgroundColor = "");
									monthButton.style.backgroundColor = "rgba(0,0,255,0.3)";
								};
								buttonCon.appendChild(monthButton);
							});
					}
				});


				Main.appendRowsTo(divResultContent);
				Main.appendRowsTo(divMoc);
			}
			const itemDefaultCountMax = 300;
			if (pagePaths.length < itemDefaultCountMax) {
				appendResult();
			} else {
				const button = document.createElement("button");
				button.innerText = "Show the hidden " + pagePaths.length + " items (itemDefaultCountMax=" + itemDefaultCountMax + ")";
				button.onclick = () => {
					button.remove();
					appendResult();
				};
				divMoc.appendChild(button);
			}


			Main.viewConMap[vID] = newViewCon;
			Main.curViewConIsLoaded = true;
		}
		if (!isCache) {
			const oldViewCon = Main.curViewCon;
			if (cachedViewCon) {
				Main.curViewCon = cachedViewCon;
				const order = cachedViewCon.style.order;
				Object.values(Main.viewConMap)
					.filter(vc => vc.style.order < order)
					.forEach(vc => vc.style.order = Number(vc.style.order) + 1);
				cachedViewCon.style.order = "1";
			} else {
				Main.curViewCon = newViewCon;

				if (oldViewCon !== newViewCon) {
					Object.values(Main.viewConMap)
						.forEach(vc => vc.style.order = Number(vc.style.order) + 1);
					oldViewCon.parentElement.insertBefore(newViewCon, oldViewCon);
				}
			}

			Main.curViewCon.querySelectorAll("h2").forEach(h2 => tempHighlight(h2));
			tempHighlight2(Main.curViewCon);

			Main.curViewCon.scrollIntoView({ behavior: behavior });
		}
	}
}

Main.main();