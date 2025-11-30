---
up:
  - "[[汉语主题词分类]]"
categories:
  - "[[<% tp.file.title.replace(" 主题词分类", "") %>]]"
subpages:<% Object.entries(tp.app.metadataCache.resolvedLinks).filter(e=>Object.keys(e[1]).includes(tp.file.path(true))).filter(e=>e[0].startsWith("chinesethesaurusdb/chinesethesaurus/")).map(e=>tp.app.metadataCache.fileToLinktext(tp.app.vault.getAbstractFileByPath(e[0]))).map(linkText=>"\n  - \"[["+linkText+"]]\"").join("") %>
ctime: <% tp.file.creation_date("YYYY-MM-DDTHH:mm:ssZ") %>
mtime: <% tp.file.last_modified_date("YYYY-MM-DDTHH:mm:ssZ") %>
---

# <% tp.file.title %>

<% Object.entries(tp.app.metadataCache.resolvedLinks).filter(e=>Object.keys(e[1]).includes(tp.file.path(true))).filter(e=>e[0].startsWith("chinesethesaurusdb/chinesethesaurus/")).map(e=>tp.app.metadataCache.fileToLinktext(tp.app.vault.getAbstractFileByPath(e[0]))).map(linkText=>"[["+linkText+"]]").join(" ") %>
