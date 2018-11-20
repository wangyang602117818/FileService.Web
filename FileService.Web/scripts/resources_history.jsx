class ResourcesHistory extends React.Component {
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
                            <th width="15%">{culture.uploadTime}</th>
                            <th width="15%">{culture.replaceTime}</th>
                            <th width="15%">{culture.dol}</th>
                        </tr>
                    </thead>
                    <HistoryFileList data={this.props.data} />
                </table>
            </div>
        );
    }
}
class HistoryFileList extends React.Component {
    constructor(props) {
        super(props);
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.downloadHistoryUrl + "/" + id;
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
                                <td>{parseBsonTime(item.uploadDate)}</td>
                                <td>{parseBsonTime(item.ReplaceTime)}</td>
                                <td>
                                    <i className="iconfont icon-download" id={item._id.$oid} onClick={this.download.bind(this)}></i>
                                </td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}