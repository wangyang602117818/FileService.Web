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
                            <th width="20%">{culture.m3u8Id}</th>
                            <th width="25%">{culture.fileName}</th>
                            <th width="6%">{culture.quality}</th>
                            <th width="8%">{culture.duration}</th>
                            <th width="6%">{culture.ts}</th>
                            <th width="6%">{culture.cp}</th>
                            <th width="6%">{culture.type}</th>
                            <th width="8%">{culture.flag}</th>
                            <th width="5%">{culture.view}</th>
                            <th width="5%">{culture.dol}</th>
                            <th width="5%">{culture.del}</th>
                        </tr>
                    </thead>
                    <M3u8FileList fileId={this.props.fileId}
                        data={this.props.data}
                        deleteM3u8={this.props.deleteM3u8} />
                </table>
                <AddSubFile
                    fileId={this.props.fileId}
                />
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
    delete(e) {
        if (window.confirm(" " + culture.delete + " ?")) {
            var thumbId = e.target.id;
            var fileId = e.target.getAttribute("file-id");
            this.props.deleteM3u8(fileId, thumbId);
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
                                <td>{getQuality(item.Quality)}</td>
                                <td>{convertTime(item.Duration)}</td>
                                <td>{item.TsCount}</td>
                                <td>{item.Cp}</td>
                                <td>m3u8</td>
                                <td>{item.Flag}</td>
                                <td>
                                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                                        id={"id=" + item.SourceId.$oid + "&filename=" + item.FileName + "#" + item._id.$oid}>
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
class AddSubFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    videoOk(obj) {
        obj.fileId = this.props.fileId;
        http.postJson(urls.tasks.addVideoTaskUrl, obj, function (data) {
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
                <ConvertVideo videoOk={this.videoOk.bind(this)} />
            </div>
        );
    }
}