class M3u8Data extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="20%">M3u8Id</th>
                            <th width="25%">FileName</th>
                            <th width="10%">Duration</th>
                            <th width="6%">Ts</th>
                            <th width="6%">Cp</th>
                            <th width="6%">Type</th>
                            <th width="12%">Flag</th>
                            <th width="5%">View</th>
                            <th width="5%">Dol</th>
                            <th width="5%">Del</th>
                        </tr>
                    </thead>
                    <M3u8FileList data={this.props.data} />
                </table>
            </div>
        );
    }
}
class M3u8FileList extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.m3u8Url + "/" + id;
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
                                <td>{convertTime(item.Duration)}</td>
                                <td>{item.TsCount}</td>
                                <td>{item.cp}</td>
                                <td>m3u8</td>
                                <td>{item.Flag}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                                        id={"id=" + item.SourceId.$oid + "&filetype=video&filename=" + item.FileName + "#" + item._id.$oid}>
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={item._id.$oid} onClick={this.download.bind(this)}></i>
                                </td>
                                <td><i className="iconfont icon-del" id={item.FileId}></i></td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}