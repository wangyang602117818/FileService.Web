class DepartmentDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: "",
            message: ""
        };
    }
    componentDidMount() {
        this.initSortable();
    }
    initSortable() {
        $('ol.sortable').nestedSortable({
            handle: '.icon-menu',
            items: 'li',
            maxLevels: 15,
            relocate: function () {
                this.props.onOrderChange(null, null);
            }.bind(this)
        });
    }
    render() {
        return (
            <div className={this.props.show ? "show department_container" : "hidden department_container"}>
                <ol className="sortable" style={{ marginLeft: "0px" }}>
                    {this.props.department.Department.map(function (item, i) {
                        return <DepartmentLi
                            item={item}
                            key={i}
                            updateDepartment={this.props.updateDepartment}
                            itemClick={this.props.itemClick} />
                    }.bind(this))}
                </ol>
                <br/>
                <input type="button"
                    value={culture.save}
                    className="button"
                    disabled={this.props.orderBtnDisabled}
                    onClick={this.props.onOrderSave.bind(this)} />
            </div>
        )
    }
}
class DepartmentLi extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <li>
                <DataNode
                    name={this.props.item.DepartmentName}
                    id={this.props.item.DepartmentCode}
                    count={this.props.item.Department.length}
                    updateDepartment={this.props.updateDepartment}
                    itemClick={this.props.itemClick}
                />
                {this.props.item.Department.length > 0 ?
                    <DepartmentSubLi
                        item={this.props.item.Department}
                        itemClick={this.props.itemClick}
                        updateDepartment={this.props.updateDepartment} /> : null
                }
            </li>
        )
    }
}
class DepartmentSubLi extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ol style={{ display: "none" }}>
                {this.props.item.map(function (item, i) {
                    return <DepartmentLi item={item} key={i}
                        itemClick={this.props.itemClick}
                        updateDepartment={this.props.updateDepartment} />
                }.bind(this))}
            </ol>
        );
    }
}
class DataNode extends React.Component {
    constructor(props) {
        super(props);
    }
    showChildLi(e) {
        if (e.target.parentElement.nextElementSibling) {
            if (e.target.parentElement.nextElementSibling.style.display == "block") {
                e.target.parentElement.nextElementSibling.style.display = "none";
                e.target.className = "iconfont icon-right1";
            } else {
                e.target.parentElement.nextElementSibling.style.display = "block";
                e.target.className = "iconfont icon-down1";
            }
        }
        e.stopPropagation();
    }
    stopProp(e) {
        e.stopPropagation();
    }
    render() {
        return (
            <div className={this.props.id == this.props.updateDepartment.departmentCode ? "sortable_node sortable_select" : "sortable_node"}
                data-select={this.props.id == this.props.updateDepartment.departmentCode ? "1" : "0"}
                data-code={this.props.id}
                data-name={this.props.name}
                onClick={this.props.itemClick}
                title={this.props.id}
            >
                <i className="iconfont icon-menu"
                    onClick={this.stopProp}></i>
                <span className="sortable_node_title"
                    data-code={this.props.id}
                    data-name={this.props.name}>{this.props.name}</span>
                {this.props.count > 0 ?
                    <i className="iconfont icon-right1" onClick={this.showChildLi}></i> :
                    <i className="iconfont icon-dot"
                        data-code={this.props.id}
                        data-name={this.props.name}></i>
                }
            </div>
        )
    }
}
class UpdateDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: ""
        }
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ departmentCode: data.result });
            }
        }.bind(this));
    }
    onUpdate(name, code) {
        this.setState({ departmentName: name, departmentCode: code });
    }
    nameChange(e) {
        this.setState({ departmentName: e.target.value });
    }
    codeChange(e) {
        this.setState({ departmentCode: e.target.value });
    }
    updateDepartment(e) {
        if (this.state.departmentName && this.state.departmentCode) {
            this.props.updateDepartment(this.state.departmentName, this.state.departmentCode);
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
                                <input type="text" name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChange.bind(this)} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department_code}:</td>
                            <td><input type="text" name="departmentCode"
                                value={this.state.departmentCode}
                                onChange={this.codeChange.bind(this)} />
                                <font color="red">*</font>&nbsp;
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button"
                                    value={culture.update}
                                    className="button"
                                    disabled={this.props.updateBtnDisabled}
                                    onClick={this.updateDepartment.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
class AddSubDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: ""
        }
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ departmentCode: data.result });
            }
        }.bind(this));
    }
    nameChange(e) {
        this.setState({ departmentName: e.target.value });
    }
    codeChange(e) {
        this.setState({ departmentCode: e.target.value });
    }
    addSubDepartment(e) {
        if (this.state.departmentName && this.state.departmentCode) {
            this.props.addSubDepartment(this.state.departmentName, this.state.departmentCode, function (data) {
                if (data.code == 0) this.setState({ departmentName: "", departmentCode: "" })
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
                                <input type="text" name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChange.bind(this)} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department_code}:</td>
                            <td><input type="text"
                                name="departmentCode"
                                value={this.state.departmentCode}
                                onChange={this.codeChange.bind(this)} />
                                <font color="red">*</font>&nbsp;
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button"
                                    value={culture.add}
                                    className="button"
                                    disabled={this.props.addSubBtnDisabled}
                                    onClick={this.addSubDepartment.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
class DeleteDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ""
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ border: "0" }}>
                    <tbody>
                        <tr>
                            <td style={{ border: "0" }}>
                                <input type="button"
                                    value={culture.delete}
                                    className="button"
                                    disabled={this.props.deleteBtnDisabled}
                                    onClick={this.props.deleteItem.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class AddTopDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            departmentName: "",
            departmentCode: ""
        }
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
    nameChange(e) {
        this.setState({ departmentName: e.target.value });
    }
    codeChange(e) {
        this.setState({ departmentCode: e.target.value });
    }
    addTopDepartment(e) {
        if (this.state.departmentName && this.state.departmentCode) {
            this.props.addTopDepartment(this.state.departmentName, this.state.departmentCode, function (data) {
                if (data.code == 0) this.setState({ departmentName: "", departmentCode: "" })
            }.bind(this));
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.company + culture.name}:</td>
                            <td>
                                <input type="text" name="departmentName"
                                    value={this.state.departmentName}
                                    onChange={this.nameChange.bind(this)} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.company + culture.code}:</td>
                            <td><input type="text"
                                name="departmentCode"
                                value={this.state.departmentCode}
                                onChange={this.codeChange.bind(this)} />
                                <font color="red">*</font>&nbsp;
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button"
                                    value={culture.add}
                                    className="button"
                                    onClick={this.addTopDepartment.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}