﻿class AddUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            passWord: "",
            confirm: "",
            departmentShow: false,
            codeArray: "",
            nameArray: "",
            role: "",
            message: ""
        };
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
    groupFocus() {
        event.preventDefault();
        //this.refs.group_input.focus();
    };
    onDepartmentShow() {
        this.setState({ departmentShow: true });
    }
    onDepartmentHidden() {
        this.setState({ departmentShow: false });
    }
    selectNode(codeArray, nameArray) {
        this.setState({
            codeArray: codeArray,
            nameArray: nameArray
        })
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table table_user" style={{ width: "45%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.username}:</td>
                            <td><input type="text" name="userName" value={this.state.userName} onChange={this.nameChanged.bind(this)} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.password}:</td>
                            <td>
                                <input type="password" name="passWord" value={this.state.passWord} onChange={this.passWordChanged.bind(this)} /><font color="red">*</font><br />
                                <input type="password" name="confirm" value={this.state.confirm} onChange={this.confirmChanged.bind(this)} /><font color="red">*</font>({culture.confirm})
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department}:</td>
                            <td>
                                <label for="group">
                                    <div className="ddl_input_con">
                                        <div className="ddl_item">
                                            <span className="ddl_text">sssss</span>
                                            <i className="iconfont icon-del"></i>
                                        </div>
                                        <div className="ddl_item">
                                            <span className="ddl_text">aaaa</span>
                                            <i className="iconfont icon-del"></i>
                                        </div>
                                        <input type="text"
                                            name="group"
                                            id="group"
                                            ref="group_input"
                                            className="ddl_input" />
                                    </div>
                                    <DropDownList id="5b0e18c6c4180813fc692aa3"
                                        type="user"
                                        departmentShow={this.state.departmentShow ? "block" : "none"}
                                        selectNode={this.selectNode.bind(this)} />
                                </label>
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
                            <td colSpan="2"><input type="button" value={culture.add} className="button" onClick={this.addUser.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}