class ResourcesData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            prefix: "data:image/*;base64,",
            imageData: ""
        }
    }
    mouseMove(id, x, y) {
        //http.get(urls.getFileIconBigUrl + "/" + id + "/", function (data) {
        //    if (data.code == 0) {
        //        this.setState({ x: this.state.x - data.result.Width, y: y, imageData: data.result.File.$binary });
        //    } else {
        //        this.setState({ imageData: "" });
        //    }
        //}.bind(this));
        //this.setState({ id: id, x: x, y: y });
    }
    render() {
        return (
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="18%">{culture.fileId}</th>
                            <th width="25%">{culture.fileName}</th>
                            <th width="7%">{culture.size}</th>
                            <th width="11%">{culture.uploadTime}</th>
                            <th width="10%">{culture.from}</th>
                            <th width="8%">{culture.owner}</th>
                            <th width="5%">{culture.downloads}</th>
                            <th width="5%">{culture.view}</th>
                            <th width="5%">{culture.dol}</th>
                            <th width="5%">{culture.del}</th>
                        </tr>
                    </thead>
                    {this.props.data.length == 0 ?
                        <tbody>
                            <tr>
                                <td colSpan='10'>... {culture.no_data} ...</td>
                            </tr>
                        </tbody> :
                        <tbody>
                            {this.props.data.map(function (item, i) {
                                return (
                                    <ResourceItem resource={item} key={i}
                                        removeItem={this.props.removeItem}
                                        mouseMove={this.mouseMove.bind(this)}
                                        onIdClick={this.props.onIdClick} />
                                )
                            }.bind(this))}
                        </tbody>
                    }
                </table>
                {this.state.imageData ?
                    <div className="preLayer" style={{ left: this.state.x, top: this.state.y }}>
                        <img src={this.state.prefix + this.state.imageData} />
                    </div> : null
                }
            </div>
        );
    }
}
class ResourceItem extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.downloadUrl + "/" + id;
    }
    mouseOverView(e) {
        var id = e.target.getAttribute("data-id");
        var pageX = e.target.parentElement.getBoundingClientRect().left;
        var pageY = e.pageY;
        this.props.mouseMove(id, pageX, pageY);
    }
    render() {
        return (
            <tr className={this.props.resource.FileId.$oid.removeHTML() == "000000000000000000000000" ? "doing" : "done"}>
                <td>
                    <b
                        className="link"
                        data-type={this.props.resource.FileType.removeHTML()}
                        data-filename={this.props.resource.FileName.removeHTML()}
                        data-fileid={this.props.resource._id.$oid.removeHTML()}
                        data-owner={this.props.resource.Owner.removeHTML()}
                        onClick={this.props.onIdClick}
                        dangerouslySetInnerHTML={{ __html: this.props.resource._id.$oid }}>
                    </b>
                </td>
                <td title={this.props.resource.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.FileName.removeHTML())}></i>&nbsp;
                    <span
                        className="link"
                        dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(15) }}
                        onClick={this.preView.bind(this)}
                        id={"id=" + this.props.resource._id.$oid.removeHTML() + "&filename=" + encodeURIComponent(this.props.resource.FileName.removeHTML())}>
                    </span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td title={parseBsonTime(this.props.resource.CreateTime)}>{parseBsonTimeNoneSecond(this.props.resource.CreateTime)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.From || culture.unknow }}></td>
                <td>{this.props.resource.Owner}</td>
                <td>{this.props.resource.Download}</td>
                <td>
                    <i className="iconfont icon-view"
                        onClick={this.preView.bind(this)}
                        onMouseOver={this.mouseOverView.bind(this)}
                        data-id={this.props.resource._id.$oid.removeHTML() + this.props.resource.FileName.removeHTML().getFileExtension()}
                        id={"id=" + this.props.resource._id.$oid.removeHTML() + "&filename=" + encodeURIComponent(this.props.resource.FileName.removeHTML())}></i>
                </td>
                <td>
                    <i className="iconfont icon-download" onClick={this.download.bind(this)} id={this.props.resource._id.$oid.removeHTML()}></i>
                </td>
                <td>
                    <i className="iconfont icon-del" onClick={this.props.removeItem} id={this.props.resource._id.$oid.removeHTML()}></i>
                </td>
            </tr>
        )
    }
}
class ResourcesDataPic extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {

        return (
            <div className="table_grid">
                {this.props.data.map(function (item, i) {
                    return (<ResourcesDataPicItem
                        deleted={this.props.deleted}
                        selectedIds={this.props.selectedIds}
                        onResourceSelected={this.props.onResourceSelected}
                        resource={item}
                        key={i} />)
                }.bind(this))}
            </div>
        );
    }
}
class ResourcesDataPicItem extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var target = e.target;
        while (target.nodeName == "path" || target.nodeName == "svg" || target.className.indexOf("table_grid_item_wrap") == -1) {
            target = target.parentElement;
        }
        window.open(urls.preview + "?" + target.id, "_blank");
    }
    render() {
        var fileIconId = this.props.resource.Expired ? "ffffffffffffffffffffffff" : this.props.resource.FileId.$oid.removeHTML();
        var fileId = this.props.resource._id.$oid.removeHTML();
        var fileName = this.props.resource.FileName.removeHTML();
        var fileType = this.props.resource.FileType.removeHTML();
        var owner = this.props.resource.Owner.removeHTML();
        var className = "table_grid_item_wrap ";
        className += fileIconId == "000000000000000000000000" ? "doing " : "done ";
        className += this.props.selectedIds.indexOf(fileId) > -1 ? "selected" : "";
        var preId = "id=" + fileId + "&filename=" + encodeURIComponent(fileName);
        if (this.props.deleted) preId = preId + "&deleted=true";
        return (
            <div className={className}
                onClick={this.preView.bind(this)}
                data-fileid={fileId}
                id={preId}>
                <div className="table_grid_item">
                    <i className="iconfont icon-ok"
                        onClick={this.props.onResourceSelected}
                        data-type={fileType}
                        data-filename={fileName}
                        data-fileid={fileId}
                        data-owner={owner}
                    />
                    <div className="table_grid_content">
                        <div className="file_icon" style={{ backgroundImage: "url(" + urls.getFileIconUrl + "/" + fileIconId + fileName.getFileExtension() + ")" }}>
                            <div className="file_icon_preview">
                                {fileType == "video" ?
                                    <svg viewBox="0 0 1024 1024" version="1.1" width="32" height="32"><path d="M512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64zM414.656 726.272 414.656 297.728l311.616 190.464L414.656 726.272z" fill="#484848" ></path></svg> : null}
                            </div>
                        </div>
                    </div>
                    <div className="table_grid_name"
                        title={fileName}
                        dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(5) }}></div>
                </div>
            </div>
        )
    }
}
class ReplaceFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: null,
            buttonValue: culture.save,
            message: "",
            button_disabled: false,
        }
    }
    fileInputChange(e) {
        if (e.target.files.length == 0) {
            this.setState({ input: null, message: "" });
        } else {
            this.setState({ input: e.target, message: "" });
        }
    }
    replaceFile(e, success) {
        if (this.state.input == null) {
            this.setState({ message: culture.no_file_select, });
        } else {
            this.setState({ button_disabled: true });
            this.props.replaceFile(this.state.input,
                function (data) {
                    if (data.code == 0) {
                        this.state.input.value = "";
                        this.setState({ buttonValue: culture.save, button_disabled: false });
                    } else {
                        this.setState({ message: data.message, button_disabled: false });
                    }
                    if (success) success(data);
                }.bind(this),
                function (loaded, total) {
                    var precent = ((loaded / total) * 100).toFixed() + "%";
                    this.setState({ buttonValue: precent });
                }.bind(this));
        }
    }
    render() {
        var accept = "";
        if (imageExtensions.indexOf(this.props.fileName.getFileExtension()) > -1) {
            accept = "image/*";
        }
        if (videoExtensions.indexOf(this.props.fileName.getFileExtension()) > -1) {
            accept = "video/*";
        }
        if (officeExtensions.indexOf(this.props.fileName.getFileExtension()) > -1) {
            for (var i = 0; i < officeExtensions.length; i++) {
                accept += officeExtensions[i] + ",";
            }
        }
        if (compressExtensions.indexOf(this.props.fileName.getFileExtension()) > -1) {
            accept = ".rar,.zip";
        }
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>{culture.file}:</td>
                            <td><input type="file"
                                name="replaceFile"
                                accept={accept}
                                id="replaceFile" onChange={this.fileInputChange.bind(this)} /></td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button"
                                    name="btnreplaceFile"
                                    className="button"
                                    value={this.state.buttonValue}
                                    onClick={this.replaceFile.bind(this)}
                                    disabled={this.state.button_disabled}
                                /> {'\u00A0'}
                                <font color="red">{this.state.message}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class Resources extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.resource ? eval(localStorage.resource) : true,
            imageShow: eval(localStorage.image_show) ? true : false,
            videoShow: eval(localStorage.video_show) ? true : false,
            attachmentShow: eval(localStorage.attachment_show) ? true : false,
            listType: localStorage.resourse_list_type || "list",
            ///////////
            subFileShow: false,
            subFileToggle: true,
            historyToggle: false,
            tsTimeShow: false,
            tsTimeToggle: false,
            subFileArray: [],
            historyFileArray: [],
            tsTime: [],
            fileId: "",
            fileName: "",
            fileType: "",
            innerFileName: "",
            owner: "",
            subComponent: null,
            ////////////
            accessFileShow: false,
            accessToggle: false,
            sharedFileShow: false,
            sharedToggle: false,
            replaceFileShow: false,
            replaceFileToggle: false,
            sharedUrl: "",
            sharedData: [],
            access: [],
            departments: [],
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 15,
            pageCount: 1,
            from: localStorage.resource_from || "",
            orderField: "CreateTime",
            orderFieldType: "desc",
            resourceFileType: localStorage.resourceFileType || "",
            selectedList: [],
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] }
        }
        this.url = urls.resources.getUrl;
        this.storagePageShowKey = "resource";
        this.storagePageSizeKey = "handler_pageSize";
    }
    onImageShow() {
        if (this.state.imageShow) {
            this.setState({ imageShow: false });
            localStorage.image_show = false;
        } else {
            this.setState({ imageShow: true });
            localStorage.image_show = true;
        }
    }
    onVideoShow() {
        if (this.state.videoShow) {
            this.setState({ videoShow: false });
            localStorage.video_show = false;
        } else {
            this.setState({ videoShow: true });
            localStorage.video_show = true;
        }
    }
    onAttachmentShow() {
        if (this.state.attachmentShow) {
            this.setState({ attachmentShow: false });
            localStorage.attachment_show = false;
        } else {
            this.setState({ attachmentShow: true });
            localStorage.attachment_show = true;
        }
    }
    removeItem(e) {
        var id = e.target.id;
        if (window.confirm(" " + culture.delete + " ?")) {
            this.removeFile(id);
        }
    }
    removeFile(id) {
        http.get(urls.removeUrl + "/" + id, function (data) {
            if (data.code == 0) {
                this.getData();
            }
            else {
                alert(data.message);
            }
        }.bind(this));
    }
    imageUpload(input, thumbnails, access, expiredDay, success, process) {
        var that = this;
        http.post(urls.resources.uploadImageUrl, {
            images: input,
            output: thumbnails.length > 0 ? JSON.stringify(thumbnails) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
            expiredDay: expiredDay
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    videoUpload(input, videos, access, expiredDay, success, process) {
        var that = this;
        http.post(urls.resources.uploadVideoUrl, {
            videos: input,
            output: videos.length > 0 ? JSON.stringify(videos) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
            expiredDay: expiredDay
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    attachmentUpload(input, access, expiredDay, success, process) {
        var that = this;
        http.post(urls.resources.uploadAttachmentUrl, {
            attachments: input,
            access: access.length > 0 ? JSON.stringify(access) : null,
            expiredDay: expiredDay
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    onIdClick(e) {
        var fileId = "",
            fileType = "",
            fileName = "",
            owner = "";
        if (e.target.nodeName.toLowerCase() == "span") {
            fileId = e.target.parentElement.getAttribute("data-fileid");
            fileName = e.target.parentElement.getAttribute("data-filename");
            fileType = e.target.parentElement.getAttribute("data-type");
            owner = e.target.parentElement.getAttribute("data-owner");
        } else {
            fileId = e.target.getAttribute("data-fileid");
            fileName = e.target.getAttribute("data-filename");
            fileType = e.target.getAttribute("data-type");
            owner = e.target.getAttribute("data-owner");
        }
        this.getFileMetaData(fileId, fileName, fileType, owner);
    }
    getFileMetaData(fileId, fileName, fileType, owner) {
        var innerFileName = fileName, subComponent = null;
        this.state.subFileArray = [];
        this.state.historyFileArray = [];
        switch (fileType) {
            case "image":
                this.getThumbnail(fileId);
                fileName = culture.thumbnails + "(" + fileName + ")";
                subComponent = ThumbnailData;
                break;
            case "video":
                this.getM3u8(fileId);
                fileName = culture.m3u8List + "(" + fileName + ")";
                subComponent = M3u8Data;
                break;
            default:
                this.getSubFile(fileId);
                var fileExt = fileName.getFileExtension().toLowerCase();
                if (fileExt == ".zip" || fileExt == ".rar") {
                    subComponent = ZipFileData;
                } else {
                    subComponent = SubFileData;
                }
                fileName = culture.fileList + "(" + fileName + ")";
                break;
        }
        var access = this.getFileAccess(fileId);
        var departments = this.getAllCompany();
        this.getSharedUrl();
        this.getSharedList(fileId);
        this.getHistory(fileId);
        if (owner == userName || trim(owner) == "") {
            this.setState({ accessFileShow: true, sharedFileShow: true, replaceFileShow: true });
        } else {
            this.setState({ accessFileShow: false, sharedFileShow: false, replaceFileShow: false });
        }
        if (fileType == "video") {
            this.state.tsTimeShow = true;
        } else {
            this.state.tsTimeShow = false;
        }
        this.setState({
            fileName: fileName,
            fileType: fileType,
            innerFileName: innerFileName,
            owner: owner,
            fileId: fileId,
            subFileShow: true,
            tsTimeShow: this.state.tsTimeShow,
            subComponent: subComponent,
            access: access,
            departments: departments
        }, function () {
            if (this.refs.updateAccess) { this.refs.updateAccess.getCompany(); }
        }.bind(this));
    }
    getFileAccess(fileId) {
        if (fileId.length != 24) return;
        var access = [];
        http.getSync(urls.resources.getAccessUrl + "/" + fileId, function (data) {
            if (data.code == 0) access = data.result;
        }.bind(this));
        return access;
    }
    getAllCompany() {
        var departments = [];
        http.getSync(urls.department.getAllDepartment, function (data) {
            if (data.code == 0) departments = data.result;
        }.bind(this));
        return departments;
    }
    getThumbnail(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getThumbnailMetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                this.setState({ subFileArray: data.result });
            }
        }.bind(this));
    }
    getM3u8(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getM3u8MetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                var m3u8Ids = [];
                for (var i = 0; i < data.result.length; i++) {
                    m3u8Ids.push(data.result[i]._id.$oid);
                }
                this.getTsTime(m3u8Ids);
                this.setState({ subFileArray: data.result });
            }
        }.bind(this));
    }
    getTsTime(ids) {
        http.postJson(urls.tsTimeUrl, { ids: ids }, function (data) {
            if (data.code == 0) {
                this.setState({ tsTime: data.result });
            }
        }.bind(this));
    }
    getSubFile(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getSubFileMetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                this.state.subFileArray = data.result;
            }
            this.setState({ subFileArray: this.state.subFileArray });
        }.bind(this));
    }
    getHistory(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.getFileHistorysUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                this.setState({ historyFileArray: data.result });
            }
        }.bind(this));
    }
    getSharedList(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.shared.getShared + "?fileId=" + fileId, function (data) {
            if (data.code == 0) {
                this.state.sharedData = data.result;
            }
            this.setState({ sharedData: this.state.sharedData });
        }.bind(this));
    }
    onSaveAccess(companyCode, companyName, codeArray, nameArray, authority, realCodes, userArray, success) {
        var update = false;
        for (var i = 0; i < this.state.access.length; i++) {
            if (this.state.access[i].Company == companyCode) {
                update = true;  //修改access中的权限
                //替换
                this.state.access.splice(i, 1, {
                    Company: companyCode,
                    CompanyDisplay: companyName,
                    DepartmentCodes: codeArray,
                    DepartmentDisplay: nameArray,
                    Authority: authority,
                    AccessCodes: realCodes,
                    AccessUsers: userArray
                });
            }
        }
        //往access中添加权限
        if (!update) {
            this.state.access.push({
                Company: companyCode,
                CompanyDisplay: companyName,
                DepartmentCodes: codeArray,
                DepartmentDisplay: nameArray,
                Authority: authority,
                AccessCodes: realCodes,
                AccessUsers: userArray
            });
        }
        var fileIds = [];
        if (this.state.listType == "list") {
            fileIds.push(this.state.fileId);
        } else {
            fileIds = this.state.selectedList;
        }
        this.updateAccess(fileIds, this.state.access, success);
    }
    updateAccess(fileIds, access, success) {
        http.postJson(urls.resources.updateAccessUrl,
            { fileIds: fileIds, access: access },
            function (data) {
                if (data.code == 0) {
                    this.setState({ access: this.state.access });
                } else {
                    alert(data.message);
                }
                if (success) success(data);
            }.bind(this))
    }
    emptyAccess(e, success) {
        http.postJson(urls.resources.updateAccessUrl, { fileIds: [this.state.fileId], access: [] }, function (data) {
            if (data.code == 0) {
                this.setState({ access: [] });
            } else {
                alert(data.message);
            }
            if (success) success(data);
        }.bind(this));
    }
    delAccess(e) {
        var id = e.target.parentElement.id;
        var name = e.target.parentElement.getAttribute("data-name");
        var code = e.target.parentElement.getAttribute("data-code");
        this.state.access.splice(id, 1);
        this.setState({ access: this.state.access });
        e.stopPropagation();
    }
    deleteThumbnail(fileId, thumbId) {
        http.get(urls.resources.deleteThumbnailUrl + "?fileId=" + fileId + "&thumbnailId=" + thumbId, function (data) {
            if (data.code == 0) {
                this.getThumbnail(fileId);
            } else {
                alert(data.message);
            }
        }.bind(this));
    }
    deleteM3u8(fileId, m3u8Id) {
        http.get(urls.resources.deleteM3u8Url + "?fileId=" + fileId + "&m3u8Id=" + m3u8Id, function (data) {
            if (data.code == 0) {
                this.getM3u8(fileId);
            } else {
                alert(data.message);
            }
        }.bind(this));
    }
    getSharedUrl() {
        http.get(urls.getObjectIdUrl, function (data) {
            if (data.code == 0) {
                this.setState({ sharedUrl: baseUrl + "shared/" + data.result });
            }
        }.bind(this));
    }
    shared(obj) {
        obj.fileId = this.state.fileId;
        obj.sharedUrl = this.state.sharedUrl;
        http.postJson(urls.shared.addshared, obj, function (data) {
            if (data.code == 0) {
                this.getSharedList(obj.fileId);
                this.getSharedUrl();
            }
        }.bind(this));
    }
    disableShared(e) {
        if (window.confirm(" " + culture.disabled + culture.shared_link + " ?")) {
            var id = e.target.id;
            http.get(urls.shared.disabledShared + "/" + id, function (data) {
                if (data.code == 0) {
                    this.getSharedList(this.state.fileId);
                }
            }.bind(this))
        }
    }
    enableShared(e) {
        var id = e.target.id;
        http.get(urls.shared.enableShared + "/" + id, function (data) {
            if (data.code == 0) {
                this.getSharedList(this.state.fileId);
            }
        }.bind(this))
    }
    onTipsClick(e) {
        if (e.target.id == "resource_list") {
            this.setState({ listType: "icon" });
            localStorage.resourse_list_type = "icon";
        } else {
            this.setState({ listType: "list" });
            localStorage.resourse_list_type = "list";
        }
        this.setState({
            subFileShow: false,
            accessFileShow: false,
            sharedFileShow: false,
            replaceFileShow: false,
            selectedList: []
        });
    }
    onFilterClick(e) {
        var id = e.target.id;
        if (e.target.className.indexOf("current") != -1) return;
        this.setState({ resourceFileType: id }, function () {
            localStorage.resourceFileType = id;
            this.getData();
        }.bind(this));
    }
    onFromChange(e) {
        var from = e.target.value;
        this.setState({ from: from }, function () {
            localStorage.resource_from = from;
            this.getData();
        }.bind(this));
    }
    onResourceSelected(e) {
        var id = e.target.getAttribute("data-fileid");
        for (var i = 0; i < this.state.data.result.length; i++) {
            if (this.state.data.result[i]._id.$oid.removeHTML() == id) {
                if (this.state.selectedList.indexOf(id) == -1) {
                    this.state.selectedList.push(id);
                } else {
                    this.state.selectedList.remove(id);
                }
            }
        }
        this.setState({ data: this.state.data });
        //选择单个
        if (this.state.selectedList.length == 1) {
            var fileId = this.state.selectedList[0];
            for (var i = 0; i < this.state.data.result.length; i++) {
                if (this.state.data.result[i]._id.$oid == fileId) {
                    var fileName = this.state.data.result[i].FileName.removeHTML();
                    var fileType = this.state.data.result[i].FileType.removeHTML();
                    var owner = this.state.data.result[i].Owner.removeHTML();
                    this.getFileMetaData(fileId, fileName, fileType, owner);
                }
            }
        } else {
            var selCount = this.state.selectedList.length, innerFileName = [];
            for (var i = 0; i < this.state.data.result.length; i++) {
                var fileId = this.state.data.result[i]._id.$oid.removeHTML();
                var owner = this.state.data.result[i].Owner.removeHTML();
                if (this.state.selectedList.indexOf(fileId) > -1) {
                    innerFileName.push(this.state.data.result[i].FileName.removeHTML())
                    if (owner == userName) selCount--;
                }
            }
            //选择的文件有不是自己传的
            if (selCount == 0) {
                this.setState({
                    accessFileShow: true,
                    innerFileName: innerFileName
                });
            } else {
                this.setState({ accessFileShow: false });
            }
            this.setState({ subFileShow: false, sharedFileShow: false, replaceFileShow: false, tsTimeShow: false }, function () {
                if (this.refs.updateAccess) { this.refs.updateAccess.getCompany(); }
            }.bind(this));
        }
        this.setState({ selectedList: this.state.selectedList });
        if (this.state.selectedList.length == 0) {
            this.setState({
                subFileShow: false,
                accessFileShow: false,
                tsTimeShow: false
            });
        }
        e.stopPropagation();
    }
    onOrderChanged(e) {
        var order = e.target.getAttribute("order");
        if (order) {
            this.setState({
                orderField: order,
                orderFieldType: this.state.orderFieldType == "desc" ? "asc" : "desc"
            }, function () {
                this.getData();
            }.bind(this));
        }
    }
    removeByIds() {
        if (window.confirm(" " + culture.delete + " ?")) {
            if (this.state.selectedList.length > 0) {
                http.post(urls.removeFilesUrl, { ids: this.state.selectedList }, function (data) {
                    if (data.code == 0) {
                        this.getData();
                        this.setState({ selectedList: [] });
                    }
                    else {
                        alert(data.message);
                    }
                }.bind(this));
            } else {
                http.get(urls.removeAppFilesUrl + "?appName=" + this.state.from, function (data) {
                    if (data.code == 0) {
                        this.getData();
                        this.setState({ selectedList: [] });
                    }
                    else {
                        alert(data.message);
                    }
                }.bind(this));
            }
        }
    }
    downloadByIds() {
        for (var i = 0; i < this.state.selectedList.length; i++) {
            var url = urls.downloadUrl + "/" + this.state.selectedList[i];
            window.open(url);
        }
    }
    replaceFile(input, success, progress) {
        http.post(urls.replaceFileUrl, {
            file: input,
            fileId: this.state.fileId,
            fileType: this.state.fileType
        }, function (data) {
            success(data);
            this.getData();
        }.bind(this), progress);
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.resources}</h1>
                <TitleArrowComponent title={culture.all + culture.resources}
                    type="file"
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    listType={this.state.listType}
                    delShow={this.state.selectedList.length > 0 ? true : false}
                    from={this.state.from}
                    removeByIds={this.removeByIds.bind(this)}
                    downloadByIds={this.downloadByIds.bind(this)}
                    orderField={this.state.orderField}
                    onOrderChanged={this.onOrderChanged.bind(this)}
                    onTipsClick={this.onTipsClick.bind(this)}
                    fileType={this.state.resourceFileType}
                    onFilterClick={this.onFilterClick.bind(this)}
                    onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                    pageIndex={this.state.pageIndex}
                    pageSize={this.state.pageSize}
                    pageCount={this.state.pageCount}
                    filter={this.state.filter}
                    startTime={this.state.startTime}
                    endTime={this.state.endTime}
                    onInput={this.onInput.bind(this)}
                    onKeyPress={this.onKeyPress.bind(this)}
                    from={this.state.from}
                    onFromChange={this.onFromChange.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                {this.state.listType == "list" ?
                    <ResourcesData data={this.state.data.result}
                        removeItem={this.removeItem.bind(this)}
                        onIdClick={this.onIdClick.bind(this)} /> :
                    <ResourcesDataPic data={this.state.data.result}
                        deleted={false}
                        selectedIds={this.state.selectedList}
                        onResourceSelected={this.onResourceSelected.bind(this)} />
                }
                <TitleArrow title={culture.add + culture.image}
                    show={this.state.imageShow}
                    onShowChange={this.onImageShow.bind(this)} />
                <AddImage show={this.state.imageShow}
                    imageUpload={this.imageUpload.bind(this)} />
                <TitleArrow title={culture.add + culture.video}
                    show={this.state.videoShow}
                    onShowChange={this.onVideoShow.bind(this)} />
                <AddVideo show={this.state.videoShow}
                    videoUpload={this.videoUpload.bind(this)} />
                <TitleArrow title={culture.add + culture.attachment}
                    show={this.state.attachmentShow}
                    onShowChange={this.onAttachmentShow.bind(this)} />
                <AddAttachment show={this.state.attachmentShow}
                    attachmentUpload={this.attachmentUpload.bind(this)} />
                {this.state.subFileShow ?
                    <TitleArrow title={this.state.fileName}
                        show={this.state.subFileToggle}
                        onShowChange={e => this.setState({ subFileToggle: !this.state.subFileToggle })} /> : null
                }
                {this.state.subFileShow ?
                    <this.state.subComponent
                        show={this.state.subFileToggle}
                        data={this.state.subFileArray}
                        fileId={this.state.fileId}
                        fileName={this.state.innerFileName}
                        deleteThumbnail={this.deleteThumbnail.bind(this)}
                        deleteM3u8={this.deleteM3u8.bind(this)}
                    /> : null
                }
                {this.state.subFileShow ?
                    <TitleArrow title={culture.history + "(" + this.state.innerFileName + ")"}
                        show={this.state.historyToggle}
                        onShowChange={e => this.setState({ historyToggle: !this.state.historyToggle })} /> : null
                }
                {this.state.subFileShow ?
                    <ResourcesHistory
                        show={this.state.historyToggle}
                        data={this.state.historyFileArray}
                    /> : null
                }
                {
                    this.state.tsTimeShow ?
                        <TitleArrow title={culture.playtime + "(" + this.state.innerFileName + ")"}
                            show={this.state.tsTimeToggle}
                            onShowChange={e => this.setState({ tsTimeToggle: !this.state.tsTimeToggle })} /> : null
                }
                {
                    this.state.tsTimeShow ?
                        <TsTime show={this.state.tsTimeToggle} data={this.state.tsTime} /> : null
                }
                {this.state.accessFileShow ?
                    <TitleArrow
                        title={culture.change_access + "(" + this.state.innerFileName + ")"}
                        show={this.state.accessToggle}
                        onShowChange={e => this.setState({ accessToggle: !this.state.accessToggle })} /> : null
                }
                {this.state.accessFileShow ?
                    <UpdateAccess
                        show={this.state.accessToggle}
                        ref="updateAccess"
                        departments={this.state.departments}
                        access={this.state.access}
                        delAccess={this.delAccess.bind(this)}
                        emptyAccess={this.emptyAccess.bind(this)}
                        onSaveAccess={this.onSaveAccess.bind(this)}
                    /> : null
                }
                {this.state.sharedFileShow ?
                    <TitleArrow
                        title={culture.shared + culture.file + "(" + this.state.innerFileName + ")"}
                        show={this.state.sharedToggle}
                        onShowChange={e => this.setState({ sharedToggle: !this.state.sharedToggle })} /> : null
                }
                {this.state.sharedFileShow ?
                    <SharedFile
                        show={this.state.sharedToggle}
                        data={this.state.sharedData}
                        fileId={this.state.fileId}
                        sharedUrl={this.state.sharedUrl}
                        shared={this.shared.bind(this)}
                        disableShared={this.disableShared.bind(this)}
                        enableShared={this.enableShared.bind(this)}
                    /> : null
                }
                {
                    this.state.replaceFileShow ?
                        <TitleArrow
                            title={culture.replace + culture.file + "(" + this.state.innerFileName + ")"}
                            show={this.state.replaceFileToggle}
                            onShowChange={e => this.setState({ replaceFileToggle: !this.state.replaceFileToggle })} /> : null
                }
                {
                    this.state.replaceFileShow ?
                        <ReplaceFile show={this.state.replaceFileToggle}
                            fileName={this.state.innerFileName}
                            fileType={this.state.fileType}
                            replaceFile={this.replaceFile.bind(this)}
                        /> : null
                }
            </div>
        );
    }
}
for (var item in CommonUsePagination) Resources.prototype[item] = CommonUsePagination[item];
//Object.assign(Resources.prototype, CommonUsePagination);