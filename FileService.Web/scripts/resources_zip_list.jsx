class ZipFileData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="20%">FileId</th>
                            <th width="30%">FileName</th>
                            <th width="10%">Size</th>
                            <th width="15%">Type</th>
                            <th width="10%">From</th>
                            <th width="5%">View</th>
                            <th width="5%">Dol</th>
                            <th width="5%">Del</th>
                        </tr>
                    </thead>
                    <ZipFileList data={this.props.data}
                        fileId={this.props.fileId}
                        fileName={this.props.fileName} />
                </table>
            </div>
        );
    }
}
class ZipFileList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId: ""
        }
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.previewConvert + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        if (/.zip/i.test(this.props.fileName)) {
            window.location.href = urls.downloadZipInnerUrl + "?" + id;
        }
        if (/.rar/i.test(this.props.fileName)) {
            window.location.href = urls.downloadRarInnerUrl + "?" + id;
        }
    }
    render() {
        if (this.props.data.length == 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan='10'>... no files ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <tr>
                                <td>{item._id.$oid}</td>
                                <td>{item.FileName}</td>
                                <td>{convertFileSize(item.Length)}</td>
                                <td>attachment</td>
                                <td>{/.zip/i.test(this.props.fileName) ? "zip" : "rar"}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)} id={"id=" + item._id.$oid + "&filetype=attachment&filename=" + item.FileName}>
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={"id=" + this.props.fileId + "&filename=" + item.FileName} onClick={this.download.bind(this)}></i>
                                </td>
                                <td></td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}