class AddSubDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: "",
            order: 0,
            parentCode: "",
            message: ""
        };
    }
    componentDidMount() {
        this.getHexCode();
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ departmentCode: data.result });
            }
        }.bind(this));
    }
    nameChanged(e) {
        this.setState({ departmentName: e.target.value });
    }
    codeChanged(e) {
        this.setState({ departmentCode: e.target.value });
    }
    orderChanged(e) {
        this.setState({ order: e.target.value });
    }
    addDepartment(e) {
        this.state.parentCode = this.props.departmentCode;
        if (this.state.departmentName && this.state.departmentCode) {
            this.props.addDepartment(this.state, function (data) {
                if (data.code == 0) {
                    this.setState({ departmentName: "", departmentCode: "" });
                } else {
                    this.setState({ message: data.message });
                }
            }.bind(this));
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.department_name}:</td>
                            <td>
                                <input type="text"
                                    name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department_code}:</td>
                            <td>
                                <input type="text"
                                    name="departmentCode"
                                    size="12"
                                    value={this.state.departmentCode}
                                    onChange={this.codeChanged.bind(this)} /><font color="red">*</font>
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.order}:</td>
                            <td>
                                <input type="text"
                                    name="order"
                                    size="6"
                                    value={this.state.order}
                                    onChange={this.orderChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.add}
                                className="button"
                                onClick={this.addDepartment.bind(this)} /><font color="red">{" " + this.state.message}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class UpdateDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            departmentName: "",
            departmentCode: "",
            order: 0,
            parentCode: "",
            message: ""
        };
    }
    nameChanged(e) {
        this.setState({ departmentName: e.target.value });
    }
    orderChanged(e) {
        this.setState({ order: e.target.value });
    }
    codeChanged(e) {
        this.setState({ departmentCode: e.target.value });
    }
    parentCodeChange(e) {
        this.setState({ parentCode: e.target.value });
    }
    updateDepartment(e) {

    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.department_name}:</td>
                            <td>
                                <input type="text"
                                    name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department_code}:</td>
                            <td>
                                <input type="text"
                                    size="12"
                                    name="departmentCode"
                                    value={this.state.departmentCode}
                                    onChange={this.codeChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.parent_department}</td>
                            <td>
                                <select name="parentCode" value={this.state.parentCode} onChange={this.parentCodeChange.bind(this)}>
                                    <option value="0">{culture.default}</option>
                                    <option value="1">Jpeg</option>
                                    <option value="2">Png</option>
                                    <option value="3">Gif</option>
                                    <option value="4">Bmp</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.order}:</td>
                            <td>
                                <input type="text"
                                    name="order"
                                    size="6"
                                    value={this.state.order}
                                    onChange={this.orderChanged.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.add}
                                className="button"
                                onClick={this.updateDepartment.bind(this)} /><font color="red">{" " + this.state.message}</font>
                            </td>
                        </ tr>
                    </tbody>
                </table>
            </div>
        )
    }
}