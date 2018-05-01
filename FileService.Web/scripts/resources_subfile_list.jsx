class SubFileData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="25%">FileId</th>
                            <th width="30%">FileName</th>
                            <th width="10%">Size</th>
                            <th width="10%">Type</th>
                            <th width="10%">From</th>
                            <th width="5%">View</th>
                            <th width="5%">Dol</th>
                            <th width="5%">Del</th>
                        </tr>
                    </thead>
                    <SubFileList data={this.props.data} />
                </table>
            </div>
        );
    }
}
class SubFileList extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.previewConvert + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.downloadConvertUrl + "/" + id;
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
                                <td>{item.filename}</td>
                                <td>{convertFileSize(item.length)}</td>
                                <td>{item.metadata.FileType}</td>
                                <td>{item.metadata.From}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                                        id={"id=" + item._id.$oid + "&filetype=attachment&filename=" + item.filename}>
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={item._id.$oid} onClick={this.download.bind(this)}></i>
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