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
        this.state = {
            company: {
                companyId: "",
                companyCode: "",
                companyName: ""
            },
            authority: 0,
            codeArray: [],
            nameArray: [],
            realCodes: [],
            userArray: []
        }
    }
    //由外部调用，主动拉取company数据
    getCompanyData() {
        this.refs.companyDropDownListWrap.getData();
    }
    emptyDefault() {
        this.setState({
            company: {
                companyId: "",
                companyCode: "",
                companyName: ""
            }
        });
    }
    afterCompanyInit(companyId, companyCode, companyName) {
        this.state.company = {
            companyId: companyId,
            companyCode: companyCode,
            companyName: companyName
        };
        this.refs.departmentDropDownListWrap.getData(companyId);  //调用deparatment初始化方法
        this.refs.userDropDownListWrap.getData(companyCode);
    }
    companyChanged(e) {
        var companyCode = e.target.value;
        var companyName = this.refs.companyDropDownListWrap.getCompanyNameByCode(companyCode);
        var companyId = this.refs.companyDropDownListWrap.getCompanyIdByCode(companyCode);
        this.setState({
            company: {
                companyId: companyId,
                companyCode: companyCode,
                companyName: companyName
            },
            codeArray: [],
            nameArray: [],
            userArray: []
        });
        this.refs.departmentDropDownListWrap.getData(companyId);  //调用deparatment初始化方法
        this.refs.userDropDownListWrap.getData(companyCode);
    }
    //当用户选取了部门之后触发 参数是选取的数组和当前权限类型
    onSelectNodeChanged(codeArray, nameArray, authority) {
        this.setState({
            codeArray: codeArray,
            nameArray: nameArray,
            authority: authority
        });
    }
    //当用户选取了部门或者点击了权限类型之后触发，参数是要真是需要验证的code列表和当前权限类型
    onRealNodeChanged(codeArray, authority) {
        this.setState({ realCodes: codeArray, authority: authority });
    }
    //当用户选取了人员触发
    onSelectUserChange(users) {
        this.setState({ userArray: users });
    }
    Ok() {
        if (this.state.company.companyId) {
            this.props.accessOk(
                this.state.company.companyId,
                this.state.company.companyCode,
                this.state.company.companyName,
                this.state.authority,
                this.state.codeArray,
                this.state.nameArray,
                this.state.realCodes,
                this.state.userArray, function () {
                    this.refs.companyDropDownListWrap.getData();
                    this.setState({
                        codeArray: [],
                        nameArray: [],
                        realCodes: [],
                        userArray: []
                    })
                }.bind(this));
        }
    }
    render() {
        return (
            <table style={{ width: "100%", marginTop: "0", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td width="13%">{culture.company}:</td>
                        <td width="77%">
                            <CompanyDropDownList
                                ref="companyDropDownListWrap"
                                companyCode={this.state.company.companyCode}
                                existsCompany={this.props.existsCompany}
                                afterCompanyInit={this.afterCompanyInit.bind(this)}
                                companyChanged={this.companyChanged.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.department}:</td>
                        <td>
                            <DepartmentDropDownListWrap
                                ref="departmentDropDownListWrap"
                                department_bar={true}
                                codeArray={this.state.codeArray}
                                nameArray={this.state.nameArray}
                                onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}
                                onRealNodeChanged={this.onRealNodeChanged.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.user}:</td>
                        <td>
                            <UserDropDownListWrap
                                ref="userDropDownListWrap"
                                userArray={this.state.userArray}
                                onSelectUserChange={this.onSelectUserChange.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="convertBtn" onClick={this.Ok.bind(this)}>{culture.ok}</td>
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
            accessShow: false,
            errorMsg: "",
            buttonValue: culture.upload,
            buttonDisabled: false,
            thumbnails: [],
            accesses: [],
            existsCompany: []
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
    accessOk(companyId, companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray, success) {
        this.state.accesses.push({
            companyId, companyCode,
            companyName, authority,
            codeArray, nameArray,
            realCodes, userArray
        });
        this.state.existsCompany.push(companyCode);
        this.setState({ accesses: this.state.accesses, existsCompany: this.state.existsCompany }, success);
    }
    delImage(e) {
        var id = e.target.parentElement.id;
        this.state.thumbnails.splice(id, 1);
        this.setState({
            thumbnails: this.state.thumbnails
        });
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
        e.stopPropagation();
    }
    clickAccess(e) {
        var id = e.target.parentElement.id;
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
            this.props.imageUpload(this.input, this.state.thumbnails, access, function (data) {
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
                            <td width="10%" className="link"
                                onClick={this.showConvert.bind(this)}>
                                {this.state.convertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.convertShow ? <ConvertImage imageOk={this.imageOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td>{culture.access_authority}:</td>
                            <td>
                                {
                                    this.state.accesses.map(function (item, i) {
                                        return (
                                            <span className="convert_flag"
                                                title={JSON.stringify(item)}
                                                key={i}
                                                id={i}
                                                data-code={item.companyId}>
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
                                    <i className="iconfont icon-add"></i>
                                }
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
                            <td colSpan="3"><input type="button"
                                name="btnImg"
                                className="button"
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