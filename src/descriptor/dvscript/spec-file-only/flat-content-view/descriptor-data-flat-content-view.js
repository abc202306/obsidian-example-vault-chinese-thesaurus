
const configSectionStr = /\n##\s配置\n(([^]*?(?=\n##\s))|([^]*))/.exec(await dv.io.load(dv.currentFilePath))[0]

function getConfigValue(key){
	return new RegExp("\\|\\s*?"+key+"\\s*?\\|(.*?)\\|","").exec(configSectionStr)[1].trim()
}

const configMap = {
	path: {
		relatedCTData: getConfigValue("汉语主题词表数据 - 文件夹路径"),
	}
}

const relatedCTDataPath = configMap.path.relatedCTData;

/** @function */
const getGroupKey = await new Promise(resolve => dv.view("dvmodule/get-group-key", resolve))

dv.pages(`"${relatedCTDataPath}"`)
	.sort(p=>p.file.ctime,"desc")
	.groupBy(p=>getGroupKey(p))
	.sort(g=>g.rows[0].file.ctime,"desc")
	.forEach(g=>{
		const details = document.createElement("details")
		details.open = true;
		dv.header(3, "📁"+g.key, {container:details.createEl("summary"),attr:{style:"display:inline"}})
		dv.paragraph("\n",{container:details})
		g.rows.forEach(p=>{
			const details02 = details.createEl("details");
			details02.open = true;
			dv.header(4, "📄"+p.file.link+" ("+p.file.cday.toFormat("yyyy-MM-dd")+")",{container:details02.createEl("summary"),attr:{style:"display:inline"}});
			dv.paragraph("\n"+dv.func.embed(p.file.link)+"\n",{container:details02})
		})
		dv.paragraph("\n",{container:details})
		dv.container.appendChild(details)
	})