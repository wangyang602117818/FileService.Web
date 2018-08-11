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
                            <th width="20%">{culture.fileId}</th>
                            <th width="35%">{culture.fileName}</th>
                            <th width="10%">{culture.size}</th>
                            <th width="15%">{culture.type}</th>
                            <th width="10%">{culture.from}</th>
                            <th width="5%">{culture.view}</th>
                            <th width="5%">{culture.dol}</th>
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
                                <td>attachment</td>
                                <td>{/.zip/i.test(this.props.fileName) ? "zip" : "rar"}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)} id={"id=" + item._id.$oid + "&filename=" + item.FileName}>
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={"id=" + this.props.fileId + "&filename=" + item.FileName} onClick={this.download.bind(this)}></i>
                                </td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}