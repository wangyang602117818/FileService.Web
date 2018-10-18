class UpdateUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            passWord: "",
            confirm: "",

            companyCode: "",  //company默认值
            companyName: "",   //显示值
            companyData: [],  //company数据

            codeArray: [],       //department默认值
            realCodeArray: [],   //真实的code列表
            departments: [],   //department数据
            department_authority: "0",  //权限类型

            nameArray: [],     //显示值
            role: "",
            message: "",

            roleTipShow: false
        };
    }
    hiddenRoleTip(e) {
        this.setState({ roleTipShow: false });
    }
    componentDidMount() {
        http.get(urls.department.getAllDepartment, function (data) {
            var companyData = [];
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    companyData.push({ code: data.result[i].DepartmentCode, name: data.result[i].DepartmentName });
                }
            }
            if (companyData.length > 0) {
                this.setState({
                    companyCode: companyData[0].code,
                    companyName: companyData[0].name,
                    companyData: companyData
                }, function () {
                    this.getDepartment(companyData[0].code);
                });
            }
        }.bind(this));
    }
    getDepartment(code) {
        if (!code) return;
        http.get(urls.department.getDepartmentUrl + "?code=" + code, function (data) {
            if (data.code == 0) {
                var departments = assembleDepartmentData(data.result);
                for (var i = 0; i < departments.length; i++) {
                    if (this.state.codeArray.indexOf(departments[i].DepartmentCode) > -1) departments[i].Select = true;
                }
                this.setState({ departments: departments });
            }
        }.bind(this));
    }
    //父组件调用，用于点击某一个用户之后。回显状态
    changeState(userName, userRole, companyCode, companyDisplay, codeArray, departmentDisplay) {
        this.setState({
            userName: userName,
            role: userRole,
            companyCode: companyCode,
            companyName: companyDisplay,
            codeArray: codeArray,
            nameArray: departmentDisplay
        }, function () {
            this.getDepartment(companyCode);
        });
    }
    nameChanged(e) {
        this.setState({ userName: e.target.value });
    }
    passWordChanged(e) {
        this.setState({ passWord: e.target.value });
    }
    confirmChanged(e) {
        this.setState({ confirm: e.target.value });
    }
    roleChanged(e) {
        this.setState({ role: e.target.value });
    }
    onCompanyChange(e) {
        var companyCode = e.target.value, companyName = "";
        for (var i = 0; i < this.state.companyData.length; i++) {
            if (this.state.companyData[i].code == companyCode) companyName = this.state.companyData[i].name;
        }
        this.setState({
            companyCode: companyCode,
            companyName: companyName,
            codeArray: [],
            nameArray: [],
            realCodeArray: []
        }, function () {
            this.getDepartment(companyCode);
        });
    }
    tagClick(e) {
        if (e.target.innerText == "none") {
            this.setState({ role: "" });
        } else {
            this.setState({ role: e.target.innerText });
        }
    }
    updateUser(e) {
        var that = this;
        if (this.state.userName && this.state.passWord && this.state.confirm) {
            if (this.state.passWord === this.state.confirm) {
                this.props.updateUser({
                    userName: this.state.userName,
                    passWord: this.state.passWord,
                    company: this.state.companyCode,
                    companyDisplay: this.state.companyName,
                    department: this.state.codeArray,
                    departmentDisplay: this.state.nameArray,
                    role: this.state.role
                }, function (data) {
                    if (data.code == 0) {
                        that.setState({
                            userName: "",
                            passWord: "",
                            confirm: "",
                            role: "",
                            message: ""
                        });
                    } else {
                        that.setState({ message: data.message });
                    }
                });
            } else {
                this.setState({ message: culture.password_not_match });
                return;
            }
        }
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.setState({ codeArray: codeArray, nameArray: nameArray });
    }
    onRealNodeChanged(codeArray) {
        this.setState({ realCodeArray: codeArray });
    }
    dataChanged(departments) {
        this.setState({ departments: departments });
    }
    departmentAuthorityChange(id) {
        this.setState({ department_authority: id });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table table_user" style={{ width: "45%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.username}:</td>
                            <td><input type="text"
                                name="userName"
                                value={this.state.userName}
                                onChange={this.nameChanged.bind(this)} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.password}:</td>
                            <td>
                                <input type="password" name="passWord"
                                    value={this.state.passWord}
                                    onChange={this.passWordChanged.bind(this)} /><font color="red">*</font><br />
                                <input type="password" name="confirm"
                                    value={this.state.confirm}
                                    onChange={this.confirmChanged.bind(this)} /><font color="red">*</font>({culture.confirm})
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.company}:</td>
                            <td>
                                <CompanyDropDownList
                                    data={this.state.companyData}
                                    default={this.state.companyCode}
                                    onChange={this.onCompanyChange.bind(this)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                <DepartmentDropDownListWrap
                                    data={this.state.departments}
                                    default={this.state.codeArray}
                                    dataChanged={this.dataChanged.bind(this)}
                                    department_bar={false}
                                    department_authority={this.state.department_authority}
                                    onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}
                                    onRealNodeChanged={this.onRealNodeChanged.bind(this)}
                                    departmentAuthorityChange={this.departmentAuthorityChange.bind(this)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.role}:</td>
                            <td>
                                <input type="text" name="role" value={this.state.role} onChange={this.roleChanged.bind(this)} />
                                <span className="role_help" onClick={(e) => this.setState({ roleTipShow: true })}>(?)</span>
                                <br />
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>admin</span>
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>management</span>
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>none</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.save}
                                className="button"
                                onClick={this.updateUser.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
                <RoleTip show={this.state.roleTipShow} hiddenRoleTip={this.hiddenRoleTip.bind(this)} />
            </div>
        );
    }
}
class AddUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            passWord: "",
            confirm: "",

            companyCode: "",  //company默认值
            companyName: "",   //显示值
            companyData: [],  //company数据

            codeArray: [],       //department默认值
            realCodeArray: [],   //真实的code列表
            departments: [],   //department数据
            department_authority: "0",  //权限类型

            nameArray: [],     //显示值
            role: "",
            message: "",

            roleTipShow: false
        };
    }
    hiddenRoleTip(e) {
        this.setState({ roleTipShow: false });
    }
    componentDidMount() {
        http.get(urls.department.getAllDepartment, function (data) {
            var companyData = [];
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    companyData.push({ code: data.result[i].DepartmentCode, name: data.result[i].DepartmentName });
                }
            }
            if (companyData.length > 0) {
                this.setState({
                    companyCode: companyData[0].code,
                    companyName: companyData[0].name,
                    companyData: companyData
                }, function () {
                    this.getDepartment(companyData[0].code);
                });
            }
        }.bind(this));
    }
    getDepartment(code) {
        if (!code) return;
        http.get(urls.department.getDepartmentUrl + "?code=" + code, function (data) {
            if (data.code == 0) {
                var departments = assembleDepartmentData(data.result);
                for (var i = 0; i < departments.length; i++) {
                    if (this.state.codeArray.indexOf(departments[i].DepartmentCode) > -1) departments[i].Select = true;
                }
                this.setState({ departments: departments });
            }
        }.bind(this));
    }
    nameChanged(e) {
        this.setState({ userName: e.target.value });
    }
    passWordChanged(e) {
        this.setState({ passWord: e.target.value });
    }
    confirmChanged(e) {
        this.setState({ confirm: e.target.value });
    }
    roleChanged(e) {
        this.setState({ role: e.target.value });
    }
    onCompanyChange(e) {
        var companyCode = e.target.value, companyName = "";
        for (var i = 0; i < this.state.companyData.length; i++) {
            if (this.state.companyData[i].code == companyCode) companyName = this.state.companyData[i].name;
        }
        this.setState({
            companyCode: companyCode,
            companyName: companyName,
            codeArray: [],
            nameArray: [],
            realCodeArray: []
        }, function () {
            this.getDepartment(companyCode);
        });
    }
    tagClick(e) {
        if (e.target.innerText == "none") {
            this.setState({ role: "" });
        } else {
            this.setState({ role: e.target.innerText });
        }
    }
    addUser(e) {
        var that = this;
        if (this.state.userName && this.state.passWord && this.state.confirm) {
            if (this.state.passWord === this.state.confirm) {
                this.props.addUser({
                    userName: this.state.userName,
                    passWord: this.state.passWord,
                    company: this.state.companyCode,
                    companyDisplay: this.state.companyName,
                    department: this.state.codeArray,
                    departmentDisplay: this.state.nameArray,
                    role: this.state.role
                }, function (data) {
                    if (data.code == 0) {
                        that.setState({
                            userName: "",
                            passWord: "",
                            confirm: "",
                            role: "",
                            message: ""
                        });
                    } else {
                        that.setState({ message: data.message });
                    }
                });
            } else {
                this.setState({ message: culture.password_not_match });
                return;
            }
        }
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.setState({ codeArray: codeArray, nameArray: nameArray });
    }
    onRealNodeChanged(codeArray) {
        this.setState({ realCodeArray: codeArray });
    }
    dataChanged(departments) {
        this.setState({ departments: departments });
    }
    departmentAuthorityChange(id) {
        this.setState({ department_authority: id });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table table_user" style={{ width: "45%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.username}:</td>
                            <td><input type="text"
                                name="userName"
                                value={this.state.userName}
                                onChange={this.nameChanged.bind(this)} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.password}:</td>
                            <td>
                                <input type="password" name="passWord"
                                    value={this.state.passWord}
                                    onChange={this.passWordChanged.bind(this)} /><font color="red">*</font><br />
                                <input type="password" name="confirm"
                                    value={this.state.confirm}
                                    onChange={this.confirmChanged.bind(this)} /><font color="red">*</font>({culture.confirm})
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.company}:</td>
                            <td>
                                <CompanyDropDownList
                                    data={this.state.companyData}
                                    default={this.state.companyCode}
                                    onChange={this.onCompanyChange.bind(this)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                <DepartmentDropDownListWrap
                                    data={this.state.departments}
                                    default={this.state.codeArray}
                                    dataChanged={this.dataChanged.bind(this)}
                                    department_bar={false}
                                    department_authority={this.state.department_authority}
                                    onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}
                                    onRealNodeChanged={this.onRealNodeChanged.bind(this)}
                                    departmentAuthorityChange={this.departmentAuthorityChange.bind(this)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.role}:</td>
                            <td>
                                <input type="text" name="role" value={this.state.role} onChange={this.roleChanged.bind(this)} />
                                <span className="role_help" onClick={(e) => this.setState({ roleTipShow: true })}>(?)</span>
                                <br />
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>admin</span>
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>management</span>
                                <span className="tag_txt" onClick={this.tagClick.bind(this)}>none</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.save}
                                className="button"
                                onClick={this.addUser.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
                <RoleTip show={this.state.roleTipShow} hiddenRoleTip={this.hiddenRoleTip.bind(this)} />
            </div>
        );
    }
}
class RoleTip extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "role_tip show" : "role_tip hidden"}>
                <div className="role_tip_title">
                    <i className="iconfont icon-del" onClick={this.props.hiddenRoleTip.bind(this)}></i>
                </div>
                {current_culture == "zh-CN" ?
                    <RoleTipZh /> :
                    <RoleTipEn />
                }
            </div>
        )
    }
}
class RoleTipEn extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="role_tip_txt">
                <span>
                    Only owner have the authority to shared&update file access
                </span>
                <span className="role_tip_txt_title">
                    admin:
                </span>
                <span className="role_tip_txt_text">
                    User can do everything in the application,manage users,config application,delete resource
                </span>
                <span className="role_tip_txt_title">
                    management:
                </span>
                <span className="role_tip_txt_text">
                    User can config application,upload file,but can't manage users,can't delete resource
                </span>
                <span className="role_tip_txt_title">
                    none:
                </span>
                <span className="role_tip_txt_text">
                    User can view resource,log,but can't config application、manage users、delete resource
                </span>
            </div>
        )
    }
}
class RoleTipZh extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="role_tip_txt">
                <span>
                    只有文件的 拥有者 才有权限 配置文件访问权限 和 分享文件
                </span>
                <span className="role_tip_txt_title">
                    admin:
                </span>
                <span className="role_tip_txt_text">
                    用户有权限做任何事,包括管理用户,配置应用程序,删除资源
                </span>
                <span className="role_tip_txt_title">
                    management:
                </span>
                <span className="role_tip_txt_text">
                    用户可以配置应用程序,上传文件,但是不能管理用户,不能删除资源
                </span>
                <span className="role_tip_txt_title">
                    none:
                </span>
                <span className="role_tip_txt_text">
                    用户可以查看资源,查看日志,但是不能配置应用程序,不能管理用户,不能删除资源
                </span>
            </div>
        )
    }
}