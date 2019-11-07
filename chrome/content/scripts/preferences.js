initPreferences = function() {
    basedir = Zotero.SyncPDFTools.baseDir();
    localdir = Zotero.SyncPDFTools.localDir();
    convertdirlist = Zotero.SyncPDFTools.convertDirList();

    // Apply setting to
    document.getElementById('id-syncpdftools-basedir').value = basedir
    document.getElementById('id-syncpdftools-localdir').value = localdir
    document.getElementById('id-syncpdftools-convertdirlist').value = convertdirlist

}