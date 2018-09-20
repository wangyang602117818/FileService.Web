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
                        <th width="25%">{culture.fileName}</th>
                        <th width="10%">{culture.size}</th>
                        <th width="15%">{culture.deleteDate}</th>
                        <th width="10%">{culture.from}</th>
                        <th width="5%">{culture.owner}</th>
                        <th width="5%">{culture.downloads}</th>
                        <th width="6%">{culture.restore_file}</th>
                        <th width="6%">{culture.permanent_del}</th>
                    </tr>
                </thead>
                {   this.props.data.length==0?
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
    render() {
        return (
            <tr>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource._id.$oid }}></td>
                <td title={this.props.resource.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(15) }}></span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td>{parseBsonTime(this.props.resource.DeleteTime)}</td>
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
            pageIndex: 1,
            pageSize: localStorage.recycle_pageSize || 15,
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.resources.getDeleteUrl;
        this.storagePageShowKey = "recycle";
        this.storagePageSizeKey = "recycle_pageSize";
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
    render() {
        return (
            <div className="main">
                <h1>{culture.recycle_bin}</h1>
                <LogToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.file} show={this.state.pageShow}
                    count={this.state.data.count}
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
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                <FileRecycleData
                    data={this.state.data.result}
                    show={this.state.pageShow}
                    restoreFile={this.restoreFile.bind(this)}
                    deleteFile={this.deleteFile.bind(this)}
                />
            </div>
        );
    }
}
for (var item in CommonUsePagination) FileRecycle.prototype[item] = CommonUsePagination[item];