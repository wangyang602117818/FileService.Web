class AddAttachment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: "",
            accessShow: false,
            buttonValue: culture.upload,
            buttonDisabled: false,
            accesses: [],
            expiredDay: 0
        }
    }
    showAccess(e) {
        this.state.accessShow ? this.setState({ accessShow: false }) : this.setState({ accessShow: true });
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
    accessOk(companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray, success) {
        this.state.accesses.push({ companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray });
        this.setState({ accesses: this.state.accesses }, success);
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
            this.props.attachmentUpload(this.input, access, this.state.expiredDay,
                function (data) {
                    if (data.code == 0) {
                        that.input.value = "";  //清空input框
                        that.setState({ buttonValue: culture.upload, buttonDisabled: false });
                    } else {
                        that.setState({ errorMsg: " " + data.message, buttonValue: culture.upload, buttonDisabled: false });
                    }
                }, function (loaded, total) {
                    var precent = ((loaded / total) * 100).toFixed();
                    that.setState({ buttonValue: precent + "%" });
                });
        } else {
            this.setState({
                errorMsg: culture.no_file_select
            });
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table_modify">
                    <tbody>
                        <tr>
                            <td >{culture.attachment}:</td>
                            <td colSpan="2"><input type="file" multiple name="video" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td width="15%">{culture.access_authority}:</td>
                            <td width="75%">
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
                            <td className="link" width="10%"
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
                            <td colSpan="3">
                                <input type="button" name="btnAttachment" className="button"
                                       value={this.state.buttonValue}
                                       onClick={this.upload.bind(this)}
                                       disabled={this.state.buttonDisabled} />
                                <font color="red">{this.state.errorMsg}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}