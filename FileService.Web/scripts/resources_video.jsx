class ConvertVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            format: 0,
            quality: 0,
            flag: ""
        }
    }
    qualityChange(e) {
        this.setState({
            quality: e.target.value
        });
    }
    flagChange(e) {
        this.setState({
            flag: e.target.value
        });
    }
    Ok(e) {
        if (this.state.flag) {
            this.props.videoOk(this.state);
            this.setState({
                format: 0,
                quality: 0,
                flag: ""
            });
        }
    }
    render() {
        return (
            <table style={{ width: "50%", marginTop: "0px",borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td width="30%">{culture.outputFormat}:</td>
                        <td width="70%">
                            <select name="format" value={this.state.format}>
                                <option value="0">M3u8</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.quality}:</td>
                        <td>
                            <select name="quality" value={this.state.quality} onChange={this.qualityChange.bind(this)}>
                                <option value="0">{culture.original}</option>
                                <option value="1">{culture.lower}</option>
                                <option value="2">{culture.medium}</option>
                                <option value="3">{culture.bad}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.flag}:</td>
                        <td>
                            <input type="text" name="flag" value={this.state.flag} onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="convertBtn" onClick={this.Ok.bind(this)}>{culture.ok}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}
class AddVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convertShow: false,
            errorMsg: "",
            buttonValue: culture.upload,
            buttonDisabled: false,
            videos: []
        }
    }
    showConvert(e) {
        this.state.convertShow ? this.setState({ convertShow: false }) : this.setState({ convertShow: true });
    }
    delVideo(e) {
        var id = e.target.parentElement.id;
        this.state.videos.splice(id, 1);
        this.setState({
            videos: this.state.videos
        });
    }
    fileChanged(e) {
        this.input = e.target;
        this.setState({
            errorMsg: ""
        })
    }
    upload() {
        var that = this;
        if (this.input && this.input.files.length > 0) {
            this.setState({ buttonDisabled: true });
            this.props.videoUpload(this.input, this.state.videos, function (data) {
                if (data.code == 0) {
                    that.input.value = "";
                    that.setState({ buttonValue: culture.upload, buttonDisabled: false });
                } else {
                    that.setState({ errorMsg: " " + data.message, buttonValue: culture.upload, buttonDisabled: false });
                }
                
            }, function (loaded, total) {
                var precent = ((loaded / total) * 100).toFixed() + "%";
                that.setState({ buttonValue: precent });
            });
        } else {
            this.setState({
                errorMsg: culture.no_file_select
            });
        }
    }
    videoOk(obj) {
        this.state.videos.push(obj);
        this.setState({
            videos: this.state.videos
        });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table_modify">
                    <tbody>
                        <tr>
                            <td>{culture.video}:</td>
                            <td colSpan="2"><input type="file" multiple name="video" accept="video/mp4,video/x-ms-wmv,video/avi" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr style={{ height: "40px" }}>
                            <td width="15%">{culture.convert}:</td>
                            <td width="75%">
                                {
                                    this.state.videos.map(function (item, i) {
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(item)} key={i} id={i}>
                                                <span className="flag_txt">{item.flag}</span>
                                                <span className="flag_txt flag_del" onClick={this.delVideo.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link" onClick={this.showConvert.bind(this)}><i className="iconfont icon-add"></i></td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.convertShow ? <ConvertVideo videoOk={this.videoOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3"><input type="button" name="btnVideo" className="button"
                                value={this.state.buttonValue}
                                disabled={this.state.buttonDisabled}
                                onClick={this.upload.bind(this)} /> <font color="red">{this.state.errorMsg}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}