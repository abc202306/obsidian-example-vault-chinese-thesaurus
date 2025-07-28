
async function getConfigValue(key){
	const fileContent = await dv.io.load(dv.currentFilePath);
	const configSectionStrRegExp = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/;
	const configSectionStr = configSectionStrRegExp.exec(fileContent)[0]
	const configValueRegExp = new RegExp("\\|\\s*?"+key+"\\s*?\\|\\s*(.*?)\\s*\\|","")
	return configValueRegExp.exec(configSectionStr)[1]
}

const configMap = {
	path: {
		relatedCTData: await getConfigValue("汉语主题词表数据根目录"),
	}
}

const relatedCTDataPath = configMap.path.relatedCTData;

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("dvmodule/get-group-key", resolve))

let i = 0;
let j = 0;
dv.pages(`"${relatedCTDataPath}"`)
	.sort(p=>p.file.ctime,"desc")
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