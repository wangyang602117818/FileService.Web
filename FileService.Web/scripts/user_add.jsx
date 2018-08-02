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
            message: ""
        };
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
            codeArray: codeArray
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
            nameArray:[],
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
                                <input type="text" name="role" value={this.state.role} onChange={this.roleChanged.bind(this)} /> (?)<br />
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
            </div>
        );
    }
}