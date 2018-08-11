class ConvertVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            format: 0,
            quality: 0,
            flag: "",
            button_disabled: true
        }
    }
    qualityChange(e) {
        this.setState({
            quality: e.target.value
        });
    }
    flagChange(e) {
        this.setState({ flag: e.target.value });
        if (e.target.value.length > 0) {
            this.setState({ button_disabled: false });
        } else {
            this.setState({ button_disabled: true });
        }
    }
    Ok(e) {
        if (this.state.flag) {
            this.props.videoOk(this.state);
            this.setState({
                format: 0,
                flag: "",
                button_disabled: true
            });
        }
    }
    render() {
        return (
            <table className="table_modify" style={{ width: "50%", marginTop: "0px", borderCollapse: "collapse" }}>
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
                        <td colSpan="3" style={{ textAlign: "center" }}>
                            <input type="button" value={culture.ok}
                                className="sub_button"
                                onClick={this.Ok.bind(this)}
                                disabled={this.state.button_disabled} />
                        </td>

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
            accessShow: false,
            errorMsg: "",
            buttonValue: culture.upload,
            buttonDisabled: false,
            videos: [],
            accesses: [],
        }
    }
    showConvert(e) {
        this.state.convertShow ? this.setState({ convertShow: false }) : this.setState({ convertShow: true });
    }
    showAccess(e) {
        this.state.accessShow ? this.setState({ accessShow: false }) : this.setState({ accessShow: true });
    }
    delVideo(e) {
        var id = e.target.parentElement.id;
        this.state.videos.splice(id, 1);
        this.setState({
            videos: this.state.videos
        });
    }
    delAccess(e) {
        var id = e.target.parentElement.id;
        var name = e.target.parentElement.getAttribute("data-name");
        var code = e.target.parentElement.getAttribute("data-code");
        this.state.accesses.splice(id, 1);
        this.setState({
            accesses: this.state.accesses,
        }, function () {
            this.refs.accessAuthority.addCompanyData(code, name);
        }.bind(this));
        e.stopPropagation();
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
            var access = [];
            for (var i = 0; i < this.state.accesses.length; i++) {
                access.push({
                    company: this.state.accesses[i].companyCode,
                    companyDisplay: this.state.accesses[i].companyName,
                    departmentCodes: this.state.accesses[i].codeArray,
                    departmentDisplay: this.state.accesses[i].nameArray,
                    authority: this.state.accesses[i].authority,
                    accessCodes: this.state.accesses[i].realCodes,
                    accessUsers: this.state.accesses[i].userArray
                })
            }
            this.props.videoUpload(this.input, this.state.videos, access, function (data) {
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
        this.setState({ videos: this.state.videos});
    }
    accessOk(companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray, success) {
        this.state.accesses.push({ companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray });
        this.setState({ accesses: this.state.accesses }, success);
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
                            <td width="10%" className="link"
                                onClick={this.showConvert.bind(this)}>
                                {this.state.convertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.convertShow ? <ConvertVideo videoOk={this.videoOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td>{culture.access_authority}:</td>
                            <td>
                                {
                                    this.state.accesses.map(function (item, i) {
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(item)}
                                                key={i}
                                                id={i}
                                                data-code={item.companyCode}
                                                data-name={item.companyName}>
                                                <span className="flag_txt">{item.companyName}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delAccess.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link"
                                onClick={this.showAccess.bind(this)}>
                                {this.state.accessShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.accessShow ? <AccessAuthority
                                    ref="accessAuthority"
                                    accessOk={this.accessOk.bind(this)} /> : null}
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