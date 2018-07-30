class AddAttachment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: "",
            accessShow: false,
            buttonValue: culture.upload,
            buttonDisabled: false,
            accesses: [],
            existsCompany: []
        }
    }
    showAccess(e) {
        this.state.accessShow ? this.setState({ accessShow: false }) : this.setState({ accessShow: true });
    }
    delAccess(e) {
        var id = e.target.parentElement.id;
        this.state.accesses.splice(id, 1);
        this.state.existsCompany.splice(id, 1);
        this.setState({
            accesses: this.state.accesses,
            existsCompany: this.state.existsCompany
        }, function () {
                if (this.refs.accessAuthority) {
                    this.refs.accessAuthority.emptyDefault();
                    this.refs.accessAuthority.getCompanyData();
                }
        }.bind(this));
    }
    fileChanged(e) {
        this.input = e.target;
        this.setState({
            errorMsg: ""
        })
    }
    accessOk(companyId, companyCode, companyName, authority,codeArray, nameArray, realCodes, userArray, success) {
        this.state.accesses.push({ companyId, companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray });
        this.state.existsCompany.push(companyCode);
        this.setState({ accesses: this.state.accesses, existsCompany: this.state.existsCompany}, success);
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
            this.props.attachmentUpload(this.input, access,
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
                                            <span className="convert_flag" title={JSON.stringify(item)} key={i} id={i} data-code={item.companyId}>
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
                                    //用于判断下拉框不显示该条数据
                                    existsCompany={this.state.existsCompany}
                                    ref="accessAuthority"
                                    accessOk={this.accessOk.bind(this)} /> : null}
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