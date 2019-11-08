Zotero.SyncPDFTools = new function () {

    this.init = function () {
        
    }

    //Preference Section

    this.getPref = function (pref) {
        return Zotero.Prefs.get('extensions.zotero.syncpdftools.' + pref, true);
    };

    this.setPref = function (pref, value) {
        Zotero.Prefs.set('extensions.zotero.syncpdftools.' + pref, value, true);
    };

    this.baseDir = function () {
        if (this.getPref("basedir") === undefined) {
            this.setPref("basedir", "/")
        }
        return this.getPref("basedir")
    };
    this.localDir = function () {
        if (this.getPref("localdir") === undefined) {
            this.setPref("localdir", "/")
        }
        return this.getPref("localdir")
    };
    this.convertDirList = function() {
        if (this.getPref("convertdirlist") === undefined) {
            this.setPref("convertdirlist", "")
        }
        let listString = this.getPref("convertdirlist");
        let list = listString.split(",");
        for(let i = 0;i < list.length;i++){
            if(list[i]==""||list[i]==null||list[i]==undefined){
                list.splice(i,1);
                i=i-1;
            }
        }
        return list
    };

    this.getAltPath = function(path){
        let baseDir = this.baseDir();
        let convertDirList = this.convertDirList();
        convertDirList.push(baseDir);
        Zotero.debug("Origin Path:" + path)
        Zotero.debug("Base Path:" + baseDir)
        for(let i = 0; i < convertDirList.length;i++){
            let dir = convertDirList[i];
            Zotero.debug(dir)
            if(path.match(dir.replace(/\\/g, "\\\\")) != null ){
                Zotero.debug(path)
                let alrdir = path.replace(dir, "");
                Zotero.debug("Relative address:" + alrdir)
                return alrdir
            }
        }
        return path

    }

    this.getFullPath = function(path){
        let localDir = this.localDir();
        path = localDir.replace("//", "/") + path
        if (path.indexOf("/") != 0) {
            path = path.replace(/\//g, "\\").replace(/\\\\/g,"\\");
            if(Zotero.isWin){
                path = OS.Path.normalize(path)
            }
        } else {
            path = path.replace(/\\/g, "/");
            if(!Zotero.isWin){
                path = OS.Path.normalize(path);
            }else{
                path = path.replace("//","/")
            }
            
        }
        Zotero.debug("Converted Path:" + path)
        return path
    }

    this.openSelectedItems = async function () {
        let win = Services.wm.getMostRecentWindow("navigator:browser");
        let items = win.ZoteroPane.getSelectedItems();
        for(i = 0; i < items.length;i++) {
            let item = items[i];
            if (!item.isAttachment()) {
                let attachmentID = item.getAttachments()[0]
                item = JSON.parse(JSON.stringify(Zotero.Items.getAsync(attachmentID))).fulfillmentValue
            } else {
                item.path = item.getFilePath()
            }
            await this.launchFile(item.path,item.contentType)
            result = await this.launchFile(item.path,item.contentType);
            if(!result){
                Zotero.debug("open error:"+item.path)
            }
        }
    }

    this.launchFile = async function (path, contentType) {
        // Custom PDF handler
        if(await OS.File.exists(path)){
            Zotero.debug("open local file: "+path)
            
        }else{
            path = this.getFullPath(this.getAltPath(path))
            Zotero.debug("open synced file: "+path)
        }
        if(!await OS.File.exists(path)){
            return false
        }
        if (contentType === 'application/pdf') {
            let pdfHandler  = Zotero.Prefs.get("fileHandler.pdf");
            if (pdfHandler) {
                if (await OS.File.exists(pdfHandler)) {
                    Zotero.launchFileWithApplication(path, pdfHandler);
                    return true;
                }
                else {
                    Zotero.logError(`${pdfHandler} not found -- launching file normally`);
                }
            }
        }
        Zotero.launchFile(path);
        return true
    }


    this.rebaseSelectedAttachments = async function () {
        let win = Services.wm.getMostRecentWindow("navigator:browser");
        let atts = win.ZoteroPane.getSelectedItems();
        for(i = 0; i < atts.length;i++) {
            let att = atts[i];
            if (!att.isAttachment()) {
                let attachmentID = att.getAttachments()[0];
                att = await Zotero.Items.getAsync(attachmentID);
            } 
            att = await this.rebaseAttachment(att);
            if(!att){
                Zotero.debug("rebase error")
            }
        }
    };

    this.rebaseAttachment = async function(att){
        let oldPath =  att.getFilePath();
        if(await OS.File.exists(oldPath)){
            Zotero.debug("Old Path: "+oldPath+" is exist")  
        }else{
            let newPath = this.getFullPath(this.getAltPath(oldPath))
            if(await OS.File.exists(newPath)){
                await att.relinkAttachmentFile(newPath);
                Zotero.debug("new attachment path: "+newPath)
            }else{
                Zotero.debug("faild rebase attachment path: "+oldPath)
                return false
            }
        }
        return true
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', function (e) {
        Zotero.SyncPDFTools.init();
    }, false);
}