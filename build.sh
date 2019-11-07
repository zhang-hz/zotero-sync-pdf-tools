#!/bin/sh

version=2.0.0
if [ -z $DEBUG ]; then
 	zip -r builds/zotero-sync-pdf-tools-${version}-fx.xpi chrome/* chrome.manifest install.rdf
else
	zip -r builds/zotero-sync-pdf-tools-${version}-debug.xpi chrome/* chrome.manifest install.rdf
fi
