class ResourcesData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="18%">{culture.fileId}</th>
                        <th width="25%">{culture.fileName}</th>
                        <th width="7%">{culture.size}</th>
                        <th width="14%">{culture.uploadDate}</th>
                        <th width="10%">{culture.from}</th>
                        <th width="5%">{culture.owner}</th>
                        <th width="5%">{culture.downloads}</th>
                        <th width="5%">{culture.view}</th>
                        <th width="5%">{culture.dol}</th>
                        <th width="5%">{culture.del}</th>
                    </tr>
                </thead>
                <ResourcesList data={this.props.data}
                    deleteItem={this.props.deleteItem}
                    onIdClick={this.props.onIdClick} />
            </table>
        );
    }
}
class ResourcesList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var that = this;
        if (this.props.data.length == 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan='10'>... {culture.no_data} ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <ResourceItem resource={item} key={i}
                                deleteItem={that.props.deleteItem}
                                onIdClick={that.props.onIdClick} />
                        )
                    })}
                </tbody>
            );
        }
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
    render() {
        return (
            <tr className={this.props.resource.FileId.$oid == "000000000000000000000000" ? "doing" : "done"}>
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
                        id={"id=" + this.props.resource._id.$oid + "&filename=" + this.props.resource.FileName.removeHTML()}>
                    </span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td>{parseBsonTime(this.props.resource.CreateTime)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.From || culture.unknow }}></td>
                <td>{this.props.resource.Owner}</td>
                <td>{this.props.resource.Download}</td>
                <td>
                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                        id={"id=" + this.props.resource._id.$oid + "&filename=" + this.props.resource.FileName.removeHTML()}></i>
                </td>
                <td>
                    <i className="iconfont icon-download" onClick={this.download.bind(this)} id={this.props.resource._id.$oid}></i>
                </td>
                <td>
                    <i className="iconfont icon-del" onClick={this.props.deleteItem} id={this.props.resource._id.$oid}></i>
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
                    return (<ResourcesDataPicItem fileName={item.FileName} fileId={item._id.$oid} key={i} />)
                })}
            </div>
        );
    }
}
class ResourcesDataPicItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="table_grid_item_wrap" >
                <div className="table_grid_item">
                    <div className="table_grid_content">
                        <img src={urls.getFileIconUrl + "/" + this.props.fileId.removeHTML() + "?name=" + this.props.fileName.removeHTML()} />
                        <div className="file_icon_preview">
                            <svg viewBox="0 0 1024 1024" version="1.1" width="32" height="32"><path d="M512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64zM414.656 726.272 414.656 297.728l311.616 190.464L414.656 726.272z" fill="#484848"></path></svg>
                        </div>
                    </div>
                    <div className="table_grid_name"
                        title={this.props.fileName.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.fileName.getFileName(5) }}></div>
                </div>
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
            subFileArray: [],
            fileId: "",
            fileName: "",
            innerFileName: "",
            owner: "",
            subComponent: null,
            ////////////
            accessToggle: true,
            sharedToggle: true,
            sharedUrl: "",
            sharedData: [],
            access: [],
            departments: [],
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 10,
            pageCount: 1,
            filter: "",
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
    deleteItem(e) {
        var id = e.target.id;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.deleteUrl + "?id=" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                }
                else {
                    alert(data.message);
                }
            });
        }
    }
    imageUpload(input, thumbnails, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadImageUrl, {
            images: input,
            output: thumbnails.length > 0 ? JSON.stringify(thumbnails) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    videoUpload(input, videos, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadVideoUrl, {
            videos: input,
            output: videos.length > 0 ? JSON.stringify(videos) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    attachmentUpload(input, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadAttachmentUrl, {
            attachments: input,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    onIdClick(e) {
        var fileId = "",
            fileType = "",
            innerFileName = "",
            fileName = "",
            owner = "",
            subComponent = null;
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
        innerFileName = fileName;
        this.state.subFileArray = [];
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
            case "attachment":
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
        this.setState({
            fileName: fileName,
            innerFileName: innerFileName,
            owner: owner,
            fileId: fileId,
            subFileShow: true,
            subComponent: subComponent,
            access: access,
            departments: departments
        }, function () {
            if (this.refs.updateAccess)
                this.refs.updateAccess.getCompany();
        });
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
            if (data.code == 0) this.state.subFileArray = data.result;
            this.setState({ subFileArray: this.state.subFileArray });
        }.bind(this));
    }
    getM3u8(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getM3u8MetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) this.state.subFileArray = data.result;
            this.setState({ subFileArray: this.state.subFileArray });
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
        http.postJson(urls.resources.updateAccessUrl, { fileId: this.state.fileId, access: this.state.access }, function (data) {
            if (data.code == 0) {
                this.setState({ access: this.state.access });
            } else {
                alert(data.message);
            }
            if (success) success(data);
        }.bind(this))
    }
    emptyAccess(e) {
        http.postJson(urls.resources.updateAccessUrl, { fileId: this.state.fileId, access: [] }, function (data) {
            if (data.code == 0) {
                this.setState({ access: [] });
            } else {
                alert(data.message);
            }
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
        obj.fileName = this.state.innerFileName;
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
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.resources}</h1>
                <TitleArrowComponent title={culture.all + culture.resources}
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    listType={this.state.listType}
                    onTipsClick={this.onTipsClick.bind(this)}
                    onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                    pageIndex={this.state.pageIndex}
                    pageSize={this.state.pageSize}
                    pageCount={this.state.pageCount}
                    filter={this.state.filter}
                    onInput={this.onInput.bind(this)}
                    onKeyPress={this.onKeyPress.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                {this.state.listType == "list" ?
                    <ResourcesData data={this.state.data.result}
                        deleteItem={this.deleteItem.bind(this)}
                        onIdClick={this.onIdClick.bind(this)} /> :
                    <ResourcesDataPic data={this.state.data.result} />
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
                        fileName={this.state.fileName}
                        deleteThumbnail={this.deleteThumbnail.bind(this)}
                        deleteM3u8={this.deleteM3u8.bind(this)}
                    /> : null
                }
                {
                    ((this.state.owner == userName || trim(this.state.owner) == "") && this.state.subFileShow) ?
                        <TitleArrow title={culture.change_access + "(" + this.state.innerFileName + ")"}
                            show={this.state.accessToggle}
                            onShowChange={e => this.setState({ accessToggle: !this.state.accessToggle })} /> : null
                }
                {
                    ((this.state.owner == userName || trim(this.state.owner) == "") && this.state.subFileShow) ?
                        <UpdateAccess show={this.state.accessToggle}
                            ref="updateAccess"
                            departments={this.state.departments}
                            access={this.state.access}
                            delAccess={this.delAccess.bind(this)}
                            emptyAccess={this.emptyAccess.bind(this)}
                            onSaveAccess={this.onSaveAccess.bind(this)}
                        /> : null
                }
                {
                    ((this.state.owner == userName || trim(this.state.owner) == "") && this.state.subFileShow) ?
                        <TitleArrow title={culture.shared + "(" + this.state.innerFileName + ")"}
                            show={this.state.sharedToggle}
                            onShowChange={e => this.setState({ sharedToggle: !this.state.sharedToggle })} /> : null
                }
                {
                    ((this.state.owner == userName || trim(this.state.owner) == "") && this.state.subFileShow) ?
                        <SharedFile show={this.state.sharedToggle}
                            data={this.state.sharedData}
                            fileId={this.state.fileId}
                            sharedUrl={this.state.sharedUrl}
                            shared={this.shared.bind(this)}
                            disableShared={this.disableShared.bind(this)}
                            enableShared={this.enableShared.bind(this)}
                        /> : null
                }
            </div>
        );
    }
}
for (var item in CommonUsePagination) Resources.prototype[item] = CommonUsePagination[item];
//Object.assign(Resources.prototype, CommonUsePagination);