class ConvertImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            format: 0,
            flag: "",
            model: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    }
    formatChange(e) {
        this.setState({ format: e.target.value });
    }
    flagChange(e) {
        this.setState({ flag: e.target.value });
    }
    modelChange(e) {
        this.setState({ model: e.target.value });
    }
    xChange(e) {
        this.setState({ x: e.target.value });
    }
    yChange(e) {
        this.setState({ y: e.target.value });
    }
    widthChange(e) {
        this.setState({ width: e.target.value });
    }
    heightChange(e) {
        this.setState({ height: e.target.value });
    }
    Ok(e) {
        if (this.state.flag && (this.state.width || this.state.height)) {
            this.props.imageOk(this.state);
            this.setState({
                format: 0,
                flag: "",
                model: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0
            });
        }
    }
    render() {
        return (
            <table style={{ width: "100%", marginTop: "0", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td>{culture.outputFormat}:</td>
                        <td colSpan="3">
                            <select name="format" value={this.state.format} onChange={this.formatChange.bind(this)}>
                                <option value="0">{culture.default}</option>
                                <option value="1">Jpeg</option>
                                <option value="2">Png</option>
                                <option value="3">Gif</option>
                                <option value="4">Bmp</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.flag}:</td>
                        <td colSpan="3">
                            <input type="text"
                                name="flag"
                                maxLength="20"
                                value={this.state.flag}
                                onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.model}:</td>
                        <td>
                            <select name="model"
                                value={this.state.model}
                                onChange={this.modelChange.bind(this)}>
                                <option value="0">{culture.scale}</option>
                                <option value="1">{culture.cut}</option>
                                <option value="2">{culture.by_width}</option>
                                <option value="3">{culture.by_height}</option>
                            </select>
                        </td>
                        <td colSpan="2" ref="">
                            top:<input type="text" name="x" style={{ width: "35px" }}
                                value={this.state.model == "1" ? this.state.x : "0"}
                                disabled={this.state.model == "1" ? false : true}
                                onChange={this.xChange.bind(this)} />px
                            {'\u00A0'}
                            left:<input type="text" name="y" style={{ width: "35px" }}
                                value={this.state.model == "1" ? this.state.y : "0"}
                                disabled={this.state.model == "1" ? false : true}
                                onChange={this.yChange.bind(this)} />px
                        </td>
                    </tr>
                    <tr>
                        <td width="15%">{culture.width}:</td>
                        <td width="35%"><input type="text" name="width"
                            style={{ width: "60px" }}
                            value={this.state.width}
                            disabled={this.state.model == "3" ? true : false}
                            onChange={this.widthChange.bind(this)} />px</td>
                        <td width="20%">{culture.height}:</td>
                        <td width="30%"><input type="text" name="height"
                            style={{ width: "60px" }}
                            value={this.state.height}
                            disabled={this.state.model == "2" ? true : false}
                            onChange={this.heightChange.bind(this)} />px</td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="convertBtn" onClick={this.Ok.bind(this)}>{culture.ok}</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
class AccessAuthority extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table style={{ width: "100%", marginTop: "0", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td>{culture.company}:</td>
                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td>{culture.department}:</td>
                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td>{culture.user}:</td>
                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="convertBtn">{culture.ok}</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
class AddImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convertShow: false,
            accessShow: true,
            errorMsg: "",
            buttonValue: culture.upload,
            buttonDisabled: false,
            thumbnails: []
        }
    }
    showConvert(e) {
        this.state.convertShow ? this.setState({ convertShow: false }) : this.setState({ convertShow: true });
    }
    showAccess(e) {
        this.state.accessShow ? this.setState({ accessShow: false }) : this.setState({ accessShow: true });
    }
    imageOk(obj) {
        this.state.thumbnails.push(obj);
        this.setState({
            thumbnails: this.state.thumbnails
        });
    }
    accessOk(obj) {

    }
    delImage(e) {
        var id = e.target.parentElement.id;
        this.state.thumbnails.splice(id, 1);
        this.setState({
            thumbnails: this.state.thumbnails
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
            this.props.imageUpload(this.input, this.state.thumbnails, function (data) {
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
            })
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table_modify">
                    <tbody>
                        <tr>
                            <td>{culture.image}:</td>
                            <td colSpan="2"><input type="file" multiple name="image" accept="image/gif,image/jpeg,image/png,image/bmp" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td width="15%">{culture.convert}:</td>
                            <td width="75%">
                                {
                                    this.state.thumbnails.map(function (item, i) {
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(item)} key={i} id={i}>
                                                <span className="flag_txt">{item.flag}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delImage.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link" onClick={this.showConvert.bind(this)}><i className="iconfont icon-add"></i></td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.convertShow ? <ConvertImage imageOk={this.imageOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td>{culture.access_authority}:</td>
                            <td></td>
                            <td width="10%" className="link" onClick={this.showAccess.bind(this)}><i className="iconfont icon-add"></i></td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.accessShow ? <AccessAuthority accessOk={this.accessOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3"><input type="button" name="btnImg" className="button"
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