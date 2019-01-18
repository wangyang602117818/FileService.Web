class ConvertVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convert: {
                format: 0,
                quality: 0,
                flag: ""
            },
            convertDisplay: {
                format: "m3u8",
                quality: culture.original,
                flag: ""
            },
            button_disabled: true
        }
    }
    qualityChange(e) {
        var qualityId = e.target.value;
        var qualityName = "";
        for (var i = 0; i < e.target.length; i++) {
            if (qualityId == e.target[i].value) {
                qualityName = e.target[i].text;
                break;
            }
        }
        this.state.convert.quality = qualityId;
        this.state.convertDisplay.quality = qualityName;
        this.setState({
            convert: this.state.convert,
            convertDisplay: this.state.convertDisplay
        });
    }
    flagChange(e) {
        this.state.convert.flag = e.target.value;
        this.state.convertDisplay.flag = e.target.value;
        if (e.target.value.length > 0) {
            this.setState({
                convert: this.state.convert,
                convertDisplay: this.state.convertDisplay,
                button_disabled: false
            });
        } else {
            this.setState({ convert: this.state.convert, button_disabled: true });
        }
    }
    Ok(e) {
        if (this.state.convert.flag) {
            this.props.videoOk(this.state.convert, this.state.convertDisplay);
            this.setState({
                button_disabled: true
            })
        }
    }
    render() {
        return (
            <table className="table_modify" style={{ width: "100%", marginTop: "0px", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td width="15%">{culture.outputFormat}:</td>
                        <td width="85%">
                            <select name="format"
                                value={this.state.convert.format}
                                onChange={e => { }}>
                                <option value="0">M3u8</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.quality}:</td>
                        <td>
                            <select name="quality"
                                value={this.state.convert.quality}
                                onChange={this.qualityChange.bind(this)}>
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
                            <input type="text" name="flag"
                                value={this.state.convert.flag}
                                onChange={this.flagChange.bind(this)} /><font color="red">*</font>
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
            videosDisplay: [],
            accesses: [],
            expiredDay: 0
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
        this.state.videosDisplay.splice(id, 1);
        this.setState({
            videos: this.state.videos,
            videosDisplay: this.state.videosDisplay
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
            if (this.refs.accessAuthority)
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
            this.props.videoUpload(this.input, this.state.videos, access, this.state.expiredDay, function (data) {
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
    videoOk(convert, convertDisplay) {
        this.state.videos.push({
            format: convert.format,
            quality: convert.quality,
            flag: convert.flag
        });
        this.state.videosDisplay.push({
            format: convertDisplay.format,
            quality: convertDisplay.quality,
            flag: convertDisplay.flag
        });
        this.setState({ videos: this.state.videos, videosDisplay: this.state.videosDisplay });
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
                            <td colSpan="2"><input type="file" multiple name="video" accept="video/*" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr style={{ height: "40px" }}>
                            <td width="15%">{culture.convert}:</td>
                            <td width="75%">
                                {
                                    this.state.videos.map(function (item, i) {
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(this.state.videosDisplay[i])} key={i} id={i}>
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
                            <td>{culture.expired_date}:</td>
                            <td colSpan="2">
                                <input type="number" name="expiredDay" style={{ width: "50px" }} value={this.state.expiredDay} onChange={e => { this.setState({ expiredDay: e.target.value }) }} />{'\u00A0'}{'\u00A0'}{culture.day}
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