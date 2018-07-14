class AddUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            companyId: "",
            companyCode: "",
            passWord: "",
            confirm: "",
            departmentShow: false,
            existsCompany: [],
            codeArray: [],
            nameArray: [],
            role: "",
            message: ""
        };
    }
    //父组件调用，用于点击某一个用户之后。回显状态
    changeState(userName, userRole, companyCode, codeArray) {
        this.setState({
            userName: userName,
            role: userRole,
            companyCode: companyCode,
        });
        //this.refs.companyDropDownList.getData();
        this.refs.departmentDropDownListWrap.unSelectNode(codeArray);
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
    companyChanged(e) {
        var companyCode = e.target.value;
        var companyId = this.refs.companyDropDownList.getCompanyIdByCode(companyCode);
        this.setState({
            companyId: companyId,
            companyCode: companyCode,
            codeArray: [],
            nameArray: []
        });
        this.refs.departmentDropDownListWrap.getData(companyId);  //调用deparatment初始化方法
    }
    afterCompanyInit(companyId, companyCode, companyName) {
        this.setState({
            companyId: companyId,
            companyCode: companyCode
        });
        //调用deparatment初始化方法
        this.refs.departmentDropDownListWrap.getData(companyId);

        //console.log(this.state.company);
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
                    department: this.state.codeArray,
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
    onDepartmentShow() {
        this.setState({ departmentShow: true });
    }
    onDepartmentHidden() {
        this.setState({ departmentShow: false });
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.setState({
            codeArray: codeArray,
            nameArray: nameArray
        });
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
                                    companyCode={this.state.companyCode}
                                    ref="companyDropDownList"
                                    existsCompany={this.state.existsCompany}
                                    afterCompanyInit={this.afterCompanyInit.bind(this)}
                                    companyChanged={this.companyChanged.bind(this)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                {/*惰性加载，由comapny加载完成之后手动调用getData方法加载里面的数据*/}
                                <DepartmentDropDownListWrap
                                    ref="departmentDropDownListWrap"
                                    department_bar={false}
                                    codeArray={this.state.codeArray}
                                    nameArray={this.state.nameArray}
                                    onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}
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