class AddUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            company: "",
            companys: [],
            passWord: "",
            confirm: "",
            departmentShow: false,
            codeArray: [],
            nameArray: [],
            role: "",
            message: ""
        };
    }
    componentDidMount() {
        http.get(urls.department.getUrl + "?pageIndex=1&pageSize=100", function (data) {
            if (data.code == 0) this.setState({ companys: data.result });
        }.bind(this))
    }
    changeState(userName, userRole) {
        this.setState({ userName: userName, role: userRole });
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
        this.setState({ company: e.target.value });
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
                this.props.addUser(this.state, function (data) {
                    if (data.code == 0) {
                        that.setState({ userName: "", passWord: "", confirm: "", role: "", message: "" });
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
    groupInputFocus(e) {
        this.refs.group_input.focus();
    }
    onSelectNode(codeArray, nameArray) {
        this.setState({
            codeArray: codeArray,
            nameArray: nameArray
        })
    }
    delNode(e) {
        var index = parseInt(e.target.id);
        this.refs.ddl.selectNode(this.state.nameArray[index], this.state.codeArray[index]);
        this.state.codeArray.splice(index, 1);
        this.state.nameArray.splice(index, 1);
        this.setState({ codeArray: this.state.codeArray, nameArray: this.state.nameArray });
        e.stopPropagation();
        return false;
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
                                <select name="company" value={this.state.company} onChange={this.companyChanged.bind(this)}>
                                    {this.state.companys.map(function (item, i) {
                                        return <option value={item._id.$oid} key={i}>{item.DepartmentName}</option>
                                    })}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                <div className="ddl_input_con"
                                    tag="open_ddl"
                                    onClick={this.groupInputFocus.bind(this)}>
                                    {this.state.codeArray.map(function (item, i) {
                                        return (
                                            <div className="ddl_item"
                                                key={i}
                                                name={this.state.nameArray[i]}
                                                code={item}
                                                tag="open_ddl">
                                                <span className="ddl_text" tag="open_ddl">{this.state.nameArray[i]}</span>
                                                <i className="iconfont icon-del" id={i} onClick={this.delNode.bind(this)}></i>
                                            </div>)
                                    }.bind(this))}
                                    <input type="text"
                                        name="group_input"
                                        id="group_input"
                                        ref="group_input"
                                        tag="open_ddl"
                                        className="ddl_input" />
                                </div>
                                <DropDownList id="5b0e18c6c4180813fc692aa3"
                                    type="user"
                                    ref="ddl"
                                    selected={this.state.codeArray}
                                    departmentShow={this.state.departmentShow}
                                    onSelectNode={this.onSelectNode.bind(this)} />
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