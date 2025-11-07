const getConfigObjectFromMarkdownFileSection = await new Promise(resolve=>dv.view("get-config", resolve));
const reportConfig = await getConfigObjectFromMarkdownFileSection("汉语主题词数据库 Report Config", "配置");
const rootDir = reportConfig.find(record=>record["配置变量名"]==="汉语主题词表数据根目录")["配置变量值"];

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("get-group-key", resolve))

const configMap = {
	path: {
		relatedCTData: rootDir,
	}
}

const relatedCTDataPath = configMap.path.relatedCTData;

let i = 0;
let j = 0;
dv.pages(`"${relatedCTDataPath}"`)
	.sort(p=>p.file.ctime,"desc")
	.limit(50)
	.groupBy(p=>getGroupKey(p))
	.sort(g=>g.rows[0].file.ctime,"desc")
	.forEach(g=>{
		const details = document.createElement("details")
		
		dv.header(3, "📁"+g.key+" ("+g.rows.length+")", {container:details.createEl("summary"),attr:{style:"display:inline"}})
		dv.paragraph("\n",{container:details})
		g.rows.forEach(p=>{
			const details02 = details.createEl("details");
			dv.header(4, "📄"+p.file.cday.toFormat("yyyy-MM-dd")+" | "+p.file.link,{container:details02.createEl("summary"),attr:{style:"display:inline"}});
			function createEventListener(details02){
				function eventListener(){
					if(details02.open){
						details02.removeEventListener("toggle", eventListener);
						dv.paragraph("\n"+dv.func.embed(p.file.link)+"\n",{container:details02});
					}
				}
				return eventListener;
			}
			details02.addEventListener("toggle",createEventListener(details02))
			if(j < 0){
				details02.open = true;
				details.dispatchEvent(new ToggleEvent("toggle",{oldState:"close",newState:"open"}))
			}
			j++;
		})
		dv.paragraph("\n",{container:details})
		dv.container.appendChild(details);
		if (i < 1){
			details.open = true;
		}
		i++;
	})