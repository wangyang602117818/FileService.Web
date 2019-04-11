class ThumbnailData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="25%">{culture.thumbnailId}</th>
                            <th width="30%">{culture.fileName}</th>
                            <th width="10%">{culture.size}</th>
                            <th width="10%">{culture.type}</th>
                            <th width="10%">{culture.flag}</th>
                            <th width="5%">{culture.view}</th>
                            <th width="5%">{culture.dol}</th>
                            <th width="5%">{culture.del}</th>
                        </tr>
                    </thead>
                    <ThumbnailFileList fileId={this.props.fileId} data={this.props.data} deleteThumbnail={this.props.deleteThumbnail} />
                </table>
                <AddThumbnail
                    fileId={this.props.fileId}
                />
            </div>
        );
    }
}
class ThumbnailFileList extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.thumbnailUrl + "/" + id;
    }
    delete(e) {
        if (window.confirm(" " + culture.delete + " ?")) {
            var thumbId = e.target.id;
            var fileId = e.target.getAttribute("file-id");
            this.props.deleteThumbnail(fileId, thumbId);
        }
    }
    render() {
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
                            <tr key={i}>
                                <td>{item._id.$oid}</td>
                                <td>{item.FileName}</td>
                                <td>{convertFileSize(item.Length)}</td>
                                <td>thumbnail</td>
                                <td>{item.Flag}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                                        id={"id=" + item.SourceId.$oid + "&filename=" + encodeURIComponent(item.FileName) + "#" + item._id.$oid}>
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={item._id.$oid} onClick={this.download.bind(this)}></i>
                                </td>
                                <td>
                                    <i className="iconfont icon-del"
                                        file-id={this.props.fileId}
                                        id={item._id.$oid}
                                        onClick={this.delete.bind(this)}></i>
                                </td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class AddThumbnail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    imageOk(convert) {
        convert.fileId = this.props.fileId;
        http.postJson(urls.tasks.addThumbnailTaskUrl, convert, function (data) {
            if (data.code == 0) {

            } else {
                alert(data.message);
            }
        }.bind(this));
    }
    render() {
        return (
            <div>
                <TitleTxt title={culture.add + culture.convert + culture.task} />
                <br />
                <ConvertImage imageOk={this.imageOk.bind(this)} />
            </div>
        );
    }
}