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
                <ResourcesList data={this.props.data} deleteItem={this.props.deleteItem} onIdClick={this.props.onIdClick} />
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
                    data-type={this.props.resource.metadata.FileType.removeHTML()}
                    data-fileName={this.props.resource.filename.removeHTML()}
                    data-fileId={this.props.resource._id.$oid}
                    onClick={this.props.onIdClick}
                ><b>{this.props.resource._id.$oid}</b>
                </td>
                <td title={this.props.resource.filename.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.filename.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.resource.filename.getFileName(15) }}>
                    </span>
                </td>
                <td>{convertFileSize(this.props.resource.length)}</td>
                <td>{parseBsonTime(this.props.resource.uploadDate)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.metadata.From || culture.unknow }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.metadata.FileType }}></td>
                <td>
                    <i className="iconfont icon-view"
                        onClick={this.preView.bind(this)} id={"id=" + this.props.resource._id.$oid + "&filetype=" + this.props.resource.metadata.FileType + "&filename=" + this.props.resource.filename.removeHTML()}>
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
            subComponent: null,
            ////////////
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
    deleteItem(e) {
        var id = e.target.id;
        if (window.confirm(" Delete ?")) {
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
    imageUpload(input, thumbnails, success, process) {
        var that = this;
        http.post(urls.resources.uploadImageUrl, {
            images: input,
            output: thumbnails.length > 0 ? JSON.stringify(thumbnails) : null
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    videoUpload(input, videos, success, process) {
        var that = this;
        http.post(urls.resources.uploadVideoUrl, {
            videos: input,
            output: videos.length > 0 ? JSON.stringify(videos) : null
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    attachmentUpload(input, success, process) {
        var that = this;
        http.post(urls.resources.uploadAttachmentUrl, {
            attachments: input
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    onIdClick(e) {
        var fileId = "",
            fileType = "",
            fileName = "",
            subComponent = null;
        if (e.target.nodeName.toLowerCase() == "b") {
            fileId = e.target.parentElement.getAttribute("data-fileId");
            fileName = e.target.parentElement.getAttribute("data-fileName");
            fileType = e.target.parentElement.getAttribute("data-type");
        } else {
            fileId = e.target.getAttribute("data-fileId");
            fileName = e.target.getAttribute("data-fileName");
            fileType = e.target.getAttribute("data-type");
        }
        this.state.subFileArray = [];
        switch (fileType) {
            case "image":
                this.getThumbnail(fileId);
                fileName = "Thumbnails(" + fileName + ")";
                subComponent = ThumbnailData;
                break;
            case "video":
                this.getM3u8(fileId);
                fileName = "M3u8List(" + fileName + ")";
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
                fileName = "FileList(" + fileName + ")";
                break;
        }
        this.setState({
            fileName: fileName,
            fileId: fileId,
            subFileShow: true,
            subComponent: subComponent
        });
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
                <TitleArrow title="Add Image"
                    show={this.state.imageShow}
                    onShowChange={this.onImageShow.bind(this)} />
                <AddImage show={this.state.imageShow}
                    imageUpload={this.imageUpload.bind(this)} />
                <TitleArrow title="Add Video"
                    show={this.state.videoShow}
                    onShowChange={this.onVideoShow.bind(this)} />
                <AddVideo show={this.state.videoShow}
                    videoUpload={this.videoUpload.bind(this)} />
                <TitleArrow title="Add Attachment"
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
            </div>
        );
    }
}
for (var item in CommonUsePagination) Resources.prototype[item] = CommonUsePagination[item];
//Object.assign(Resources.prototype, CommonUsePagination);