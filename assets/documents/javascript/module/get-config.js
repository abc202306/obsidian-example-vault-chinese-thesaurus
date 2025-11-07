async function getConfigObjectFromMarkdownFileSection(fileName, sectionName) {
    const fileContent = await dv.io.load(dv.page(fileName).file.path);
    const sectionRegex = new RegExp(`#{1,6} ${sectionName}\n(?<section>[^]*?)(?=\n#{1,6} |$)`, 'g');
    const tableRegex = /(?<table>\|.*\|\n\|[\s\-\|]*\|\n(\|.*\|\n)*)/
    let match = sectionRegex.exec(fileContent);
    if (!match?.groups?.section) {
        console.error(`Section "${sectionName}" not found in file "${fileName}".`);
        return null;
    }
    console.log("Found section:", match.groups.section);
    match = tableRegex.exec(match.groups.section+"\n");
    if (!match?.groups?.table) {
        console.error(`No table found in section "${sectionName}" of file "${fileName}".`);
        return null;
    }
    console.log("Found table:", match.groups.table);
    try {
        return parseMarkdownTableStrToJSObject(match.groups.table.trim());
    } catch (e) {
        console.error("Failed to parse JSON from section:", e);
        return null;
    }
    return null;
}

function parseMarkdownTableStrToJSObject(tableStr) {
    const lines = tableStr.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split('|').map(h => h.trim()).map((h,idx)=> h || `col${idx}`);
    const data = lines.slice(2).map(line => {
        const values = line.split('|').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || "";
        });
        return obj;
    });
    return data;
}

input(getConfigObjectFromMarkdownFileSection);
