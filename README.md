---
ctime: 2025-05-27T14:07:05+08:00
mtime: 2025-11-06T20:39:54+08:00
---

# README

这是一个 Obsidian 示例库，用于存储和可视化显示 《汉语主题词表》 的主题词

This is an Obsidian Example Vault for storing and visualizing the subject terms of the "Chinese Thesaurus".

预览： https://abc202306.github.io/website-obsidian-example-vault-chinese-thesaurus

> [!NOTE]
> 
> 1. [截图-pictures](#截图-pictures)
> 2. [笔记数据的来源](#笔记数据的来源)
> 3. [项目文档-docs](#项目文档-docs)
> 4. [集锦笔记-collection](#集锦笔记-collection)
> 5. [文件夹结构](#文件夹结构)
> 6. [窗体笔记-base](#窗体笔记-base)
> 7. [报表笔记-report](#报表笔记-report)
> 8. [白板笔记-canvas](#白板笔记-canvas)
> 9. [JavaScript脚本文件](#JavaScript脚本文件)
> 10. [中国图书馆分类法简表截图](#中国图书馆分类法简表截图)

## 截图-pictures

> （打开笔记 `view/汉语主题词表的视图.md` 的效果）

![ct-preview-01-05](/assets/pictures/ctvaultpreview/ct-preview-01-05.png)

![ct-preview-01-06](/assets/pictures/ctvaultpreview/ct-preview-01-06.png)

![ct-preview-02-03](/assets/pictures/ctvaultpreview/ct-preview-02-03.png)

![ct-preview-03-01](/assets/pictures/ctvaultpreview/ct-preview-03-01.png)

![ct-preview-04-01](/assets/pictures/ctvaultpreview/ct-preview-04-01.png)

## 笔记数据的来源

- 分类笔记数据的来源
	- 《中国图书馆分类法》数据来源于Github 仓库 [acdzh/Chinese-Library-Classification: CLC, 中图法, 中国图书馆分类法](https://github.com/acdzh/Chinese-Library-Classification)
	- 《中国图书馆分类法》附加的《ZT* 通用概念》和《ZY* 附表》数据来源于 [汉语主题词表服务系统](https://ct.istic.ac.cn/site/organize/index)
- 主题词笔记数据的来源
	- 《汉语主题词表》数据来源于网站 [汉语主题词表服务系统](https://ct.istic.ac.cn/site/organize/index)

## 项目文档-docs

- [1. 【设计文档】笔记库的结构和依赖](/docs/1.%20【设计文档】笔记库的结构和依赖.md)
- [2. 【设计文档】汉语主题词表笔记的相关标准](/docs/2.%20【设计文档】汉语主题词表笔记的相关标准.md)
- [3. 【参考文档】如何剪藏《汉表服务系统》的主题词](/docs/3.%20【参考文档】如何剪藏《汉表服务系统》的主题词.md)
- [4. 【参考文档】论如何使用笔记库](/docs/4.%20【参考文档】论如何使用笔记库.md)

## 集锦笔记-collection

- [中国图书馆分类法](/collection/中国图书馆分类法.md)
- [中国图书馆分类法别名](/collection/中国图书馆分类法别名.md)
- [汉语主题词](/collection/汉语主题词.md)
- [汉语主题词来源](/collection/汉语主题词来源.md)
- [汉语主题词分类](/collection/汉语主题词分类.md)

## 文件夹结构

- `assets/`
	- `documents/javascript/`
		- `module/`
		- `report/`
	- `pictures/`
		- `clcbasescreenshots/`
		- `clcitemcover/`
			- ...
		- `clcitemicon/`
			- ...
		- `clcwebsitepreview/`
		- `ctvaultpreview/`
- `base/`
- `canvas/`
- `chineselibraryclassification/`
	- ...
- `chineselibraryclassificationaliases/`
	- ...
- `chinesethesaurus/`
- `chinesethesaurusclassification/`
- `chinesethesaurussources/`
- `collection/`
- `docs/`
- `report/`

## 窗体笔记-base

- [Chinese Thesaurus Source Base](/base/Chinese%20Thesaurus%20Source%20Base.base)
- [Chinese Library Classification Base](/base/Chinese%20Library%20Classification%20Base.base)
- [Chinese Thesaurus Classification Base](/base/Chinese%20Thesaurus%20Classification%20Base.base)
- [Chinese Thesaurus Base](/base/Chinese%20Thesaurus%20Base.base)

## 报表笔记-report

- [汉语主题词数据库 Report](/report/汉语主题词数据库%20Report.md)
- [汉语主题词数据库 Report Config](/report/汉语主题词数据库%20Report%20Config.md)
- [汉语主题词数据库 Report Flow All Record Limit 50](/report/汉语主题词数据库%20Report%20Flow%20All%20Record%20Limit%2050.md)
- [汉语主题词数据库 Report Table Classification](/report/汉语主题词数据库%20Report%20Table%20Classification.md)
- [汉语主题词数据库 Report Table Term](/report/汉语主题词数据库%20Report%20Table%20Term.md)
- [汉语主题词数据库 Report Explorer](/report/汉语主题词数据库%20Report%20Explorer.md)

## 白板笔记-canvas

- [中国图书馆分类法 Canvas](/canvas/中国图书馆分类法%20Canvas.canvas)
- [D 政治、法律 Canvas](/canvas/D%20政治、法律%20Canvas.canvas)
- [H 语言、文字 Canvas](/canvas/H%20语言、文字%20Canvas.canvas)
- [J2 绘画 Canvas](/canvas/J2%20绘画%20Canvas.canvas)
- [O 数理科学和化学 Canvas](/canvas/O%20数理科学和化学%20Canvas.canvas)

## JavaScript脚本文件

- `assets/documents/javascript/`
	- `module/`
		- [get-config](/assets/documents/javascript/module/get-config.js)
		- [get-group-key](/assets/documents/javascript/module/get-group-key.js)
		- [get-dc-descriptors](/assets/documents/javascript/module/get-dc-descriptors.js)
	- `report/`
		- [汉语主题词数据库 Report Table Term](/assets/documents/javascript/report/汉语主题词数据库%20Report%20Table%20Term.js)
		- [汉语主题词数据库 Report Table Classification](/assets/documents/javascript/report/汉语主题词数据库%20Report%20Table%20Classification.js)
		- [汉语主题词数据库 Report Flow All Record Limit 50](/assets/documents/javascript/report/汉语主题词数据库%20Report%20Flow%20All%20Record%20Limit%2050.js)

## 中国图书馆分类法简表截图

![screencapture-clc-nlc-cn-ztfdsb-jsp-2025-06-05-13_18_53](/assets/pictures/clcwebsitepreview/screencapture-clc-nlc-cn-ztfdsb-jsp-2025-06-05-13_18_53.png)
