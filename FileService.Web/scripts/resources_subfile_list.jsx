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
                            <th width="25%">{culture.fileId}</th>
                            <th width="30%">{culture.fileName}</th>
                            <th width="10%">{culture.size}</th>
                            <th width="10%">{culture.type}</th>
                            <th width="10%">{culture.from}</th>
                            <th width="5%">{culture.view}</th>
                            <th width="5%">{culture.dol}</th>
                            <th width="5%">{culture.del}</th>
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