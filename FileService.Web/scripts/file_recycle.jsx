class FileRecycleData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="18%">{culture.fileId}</th>
                        <th>{culture.fileName}</th>
                        <th width="10%">{culture.size}</th>
                        <th width="13%">{culture.deleteTime}</th>
                        <th width="10%">{culture.from}</th>
                        <th width="8%">{culture.owner}</th>
                        <th width="5%">{culture.downloads}</th>
                        <th width="6%">{culture.restore_file}</th>
                        <th width="6%">{culture.permanent_del}</th>
                    </tr>
                </thead>
                {this.props.data.length == 0 ?
                    <tbody>
                        <tr>
                            <td colSpan='10'>... no data ...</td>
                        </tr>
                    </tbody> :
                    <tbody>
                        {this.props.data.map(function (item, i) {
                            return (
                                <FileRecycleItem resource={item} key={i}
                                    restoreFile={this.props.restoreFile}
                                    deleteFile={this.props.deleteFile} />
                            )
                        }.bind(this))}
                    </tbody>
                }
            </table>
        );
    }
}
class FileRecycleItem extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    render() {
        return (
            <tr>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource._id.$oid }}></td>
                <td title={this.props.resource.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.FileName.removeHTML())}></i>&nbsp;
                    <span
                        className="link"
                        dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(15) }}
                        onClick={this.preView.bind(this)}
                        id={"id=" + this.props.resource._id.$oid.removeHTML() + "&filename=" + this.props.resource.FileName.removeHTML() + "&deleted=true"}></span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td title={parseBsonTime(this.props.resource.DeleteTime)}>{parseBsonTimeNoneSecond(this.props.resource.DeleteTime)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.From || culture.unknow }}></td>
                <td>{this.props.resource.Owner}</td>
                <td>{this.props.resource.Download}</td>
                <td>
                    <i className="iconfont icon-restore" onClick={this.props.restoreFile} id={this.props.resource._id.$oid.removeHTML()}></i>
                </td>
                <td>
                    <i className="iconfont icon-del" onClick={this.props.deleteFile} id={this.props.resource._id.$oid.removeHTML()}></i>
                </td>
            </tr>
        )
    }
}
class FileRecycle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.recycle ? eval(localStorage.recycle) : true,
            listType: localStorage.file_recycle_type || "list",
            pageIndex: 1,
            pageSize: localStorage.recycle_pageSize || 15,
            pageCount: 1,
            orderField: "DeleteTime",
            orderFieldType: "desc",
            selectedList: [],
            resourceFileType: localStorage.recycleFileType || "",
            from: localStorage.recycle_from || "",
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.resources.getDeleteUrl;
        this.storagePageShowKey = "recycle";
        this.storagePageSizeKey = "recycle_pageSize";
    }
    onTipsClick(e) {
        if (e.target.id == "resource_list") {
            this.setState({ listType: "icon" });
            localStorage.file_recycle_type = "icon";
        } else {
            this.setState({ listType: "list" });
            localStorage.file_recycle_type = "list";
        }
    }
    deleteFile(e) {
        var id = e.target.id;
        if (window.confirm(" " + culture.permanent_del + " ?")) {
            http.get(urls.deleteFileUrl + "/" + id, function (data) {
                if (data.code == 0) {
                    this.getData();
                }
                else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    deleteFiles() {
        if (window.confirm(" " + culture.permanent_del + " ?")) {
            http.postJson(urls.deleteFilesUrl, { ids: this.state.selectedList }, function (data) {
                if (data.code == 0) {
                    this.getData();
                }
                else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    restoreFile(e) {
        var id = e.target.id;
        if (window.confirm(" " + culture.restore_file + " ?")) {
            http.get(urls.restoreFileUrl + "/" + id, function (data) {
                if (data.code == 0) {
                    this.getData();
                }
                else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    restoreFiles(e) {
        if (window.confirm(" " + culture.restore_file + " ?")) {
            http.post(urls.restoreFilesUrl, { ids: this.state.selectedList }, function (data) {
                if (data.code == 0) {
                    this.getData();
                }
                else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    onResourceSelected(e) {
        var id = e.target.getAttribute("data-fileid");
        for (var i = 0; i < this.state.data.result.length; i++) {
            if (this.state.data.result[i]._id.$oid == id) {
                if (this.state.selectedList.indexOf(id) == -1) {
                    this.state.selectedList.push(id);
                } else {
                    this.state.selectedList.remove(id);
                }
            }
        }
        this.setState({ data: this.state.data, selectedList: this.state.selectedList });
        e.stopPropagation();
    }
    onFilterClick(e) {
        var id = e.target.id;
        if (e.target.className.indexOf("current") != -1) return;
        this.setState({ resourceFileType: id }, function () {
            localStorage.recycleFileType = id;
            this.getData();
        }.bind(this));
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
    onFromChange(e) {
        var from = e.target.value;
        this.setState({ from: from }, function () {
            localStorage.recycle_from = from;
            this.getData();
        }.bind(this));
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.recycle_bin}</h1>
                <LogToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrowComponent title={culture.all + culture.resources}
                    type="file_recycle"
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    listType={this.state.listType}
                    delShow={this.state.selectedList.length > 0 ? true : false}
                    removeByIds={this.deleteFiles.bind(this)}
                    orderField={this.state.orderField}
                    onOrderChanged={this.onOrderChanged.bind(this)}
                    onTipsClick={this.onTipsClick.bind(this)}
                    fileType={this.state.resourceFileType}
                    onFilterClick={this.onFilterClick.bind(this)}
                    restoreFiles={this.restoreFiles.bind(this)}
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
                    <FileRecycleData
                        data={this.state.data.result}
                        show={this.state.pageShow}
                        deleteFile={this.deleteFile.bind(this)}
                        restoreFile={this.restoreFile.bind(this)}
                    /> :
                    <ResourcesDataPic data={this.state.data.result}
                        deleted={true}
                        selectedIds={this.state.selectedList}
                        onResourceSelected={this.onResourceSelected.bind(this)} />
                }
            </div>
        );
    }
}
for (var item in CommonUsePagination) FileRecycle.prototype[item] = CommonUsePagination[item];