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
                    <ThumbnailFileList data={this.props.data} />
                </table>
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
                            <tr>
                                <td>{item._id.$oid}</td>
                                <td>{item.FileName}</td>
                                <td>{convertFileSize(item.Length)}</td>
                                <td>thumbnail</td>
                                <td>{item.Flag}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                                        id={"id=" + item.SourceId.$oid + "&filetype=image&filename=" + item.FileName + "#" + item._id.$oid}>
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