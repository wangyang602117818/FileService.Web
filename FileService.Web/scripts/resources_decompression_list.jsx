class DeCompressionFileData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="30%">FileName</th>
                            <th width="20%">Size</th>
                            <th width="15%">Type</th>
                            <th width="20%">From</th>
                            <th width="5%">View</th>
                            <th width="5%">Dol</th>
                            <th width="5%">Del</th>
                        </tr>
                    </thead>
                    <DeCompressionFileList data={this.props.data} />
                </table>
            </div>
        );
    }
}
class DeCompressionFileList extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.downloadUrl + "/" + id;
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
                                <td>{item.Name}</td>
                                <td>{convertFileSize(item.Length)}</td>
                                <td>attachment</td>
                                <td>zip</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)} >
                                    </i>
                                </td>
                                <td>
                                    <i className="iconfont icon-download" id={item.Name} onClick={this.download.bind(this)}></i>
                                </td>
                                <td><i className="iconfont icon-del" id={item.Name}></i></td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}