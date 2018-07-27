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
                        <th width="30%">{culture.fileName}</th>
                        <th width="8%">{culture.size}</th>
                        <th width="14%">{culture.uploadDate}</th>
                        <th width="10%">{culture.from}</th>
                        <th width="8%">{culture.fileType}</th>
                        <th width="4%">{culture.view}</th>
                        <th width="4%">{culture.dol}</th>
                        <th width="4%">{culture.del}</th>
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
            <tr>
                <td className="link"
                    data-type={this.props.resource.FileType.removeHTML()}
                    data-filename={this.props.resource.FileName.removeHTML()}
                    data-fileid={this.props.resource._id.$oid.removeHTML()}
                    onClick={this.props.onIdClick}>
                    <b
                        data-type={this.props.resource.FileType.removeHTML()}
                        data-filename={this.props.resource.FileName.removeHTML()}
                        data-fileid={this.props.resource._id.$oid.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.resource._id.$oid }}>
                    </b>
                </td>
                <td title={this.props.resource.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(15) }}>
                    </span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td>{parseBsonTime(this.props.resource.CreateTime)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.From || culture.unknow }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.FileType }}></td>
                <td>
                    <i className="iconfont icon-view"
                        onClick={this.preView.bind(this)} id={"id=" + this.props.resource._id.$oid + "&filetype=" + this.props.resource.FileType + "&filename=" + this.props.resource.FileName.removeHTML()}>
                    </i>
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
class UpdateAccess extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <div className="update_access_con">
                <div className="update_access_disp">
                    {culture.access_authority}:

                </div>
                <table>
                    <tbody>
                        <tr>
                            <td colSpan="2">公司</td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                
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
            ///////////
            subFileShow: false,
            subFileToggle: true,
            subFileArray: [],
            fileId: "",
            fileName: "",
            innerFileName: "",
            subComponent: null,
            ////////////
            accessToggle: true,
            access: [],
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
    onSubFileShow() {
        if (this.state.subFileToggle) {
            this.setState({ subFileToggle: false });
        } else {
            this.setState({ subFileToggle: true });
        }
    }
    onChangeAccessShow() {
        if (this.state.accessToggle) {
            this.setState({ accessToggle: false });
        } else {
            this.setState({ accessToggle: true });
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
            subComponent = null;
        if (e.target.nodeName.toLowerCase() == "span") {
            fileId = e.target.parentElement.getAttribute("data-fileid");
            fileName = e.target.parentElement.getAttribute("data-filename");
            fileType = e.target.parentElement.getAttribute("data-type");
        } else {
            fileId = e.target.getAttribute("data-fileid");
            fileName = e.target.getAttribute("data-filename");
            fileType = e.target.getAttribute("data-type");
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
        this.getFileAccess(fileId);
        this.setState({
            fileName: fileName,
            innerFileName: innerFileName,
            fileId: fileId,
            subFileShow: true,
            subComponent: subComponent
        });
    }
    getFileAccess(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getAccessUrl + "/" + fileId, function (data) {
            if (data.code == 0) this.state.access = data.result;
            this.setState({ access: this.state.access });
        }.bind(this));
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
    render() {
        return (
            <div className="main">
                <h1>{culture.resources}</h1>
                <TitleArrow title={culture.all + culture.resources}
                    show={this.state.pageShow}
                    count={this.state.data.count}
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
                <ResourcesData data={this.state.data.result}
                    deleteItem={this.deleteItem.bind(this)}
                    onIdClick={this.onIdClick.bind(this)} />
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
                        onShowChange={this.onSubFileShow.bind(this)} /> : null
                }
                {this.state.subFileShow ?
                    <this.state.subComponent
                        show={this.state.subFileToggle}
                        data={this.state.subFileArray}
                        fileId={this.state.fileId}
                        fileName={this.state.fileName}
                    /> : null
                }
                {this.state.subFileShow ?
                    <TitleArrow title={culture.change_access + "(" + this.state.innerFileName + ")"}
                        show={this.state.accessToggle}
                        onShowChange={this.onChangeAccessShow.bind(this)} /> : null
                }
                <UpdateAccess />
            </div>
        );
    }
}
for (var item in CommonUsePagination) Resources.prototype[item] = CommonUsePagination[item];
//Object.assign(Resources.prototype, CommonUsePagination);