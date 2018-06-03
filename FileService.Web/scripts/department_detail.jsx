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
        this.getHexCode();
        $('ol.sortable').nestedSortable({
            disableNesting: 'no-nest',
            forcePlaceholderSize: true,
            handle: '.icon-menu',
            helper: 'clone',
            items: 'li',
            maxLevels: 10,
        });
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ departmentCode: data.result });
            }
        }.bind(this));
    }
    render() {
        return (
            <div className={this.props.show ? "show department_container" : "hidden department_container"}>
                <ol className="sortable" style={{ marginLeft: "0px" }}>
                    {this.props.department.Department.map(function (item, i) {
                        return <DepartmentLi item={item} key={i}
                            itemClick={this.props.itemClick} />
                    }.bind(this))}
                </ol>
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
                    itemClick={this.props.itemClick}
                />
                {this.props.item.Department.length > 0 ?
                    <DepartmentSubLi
                        item={this.props.item.Department}
                        itemClick={this.props.itemClick} /> : null
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
                        itemClick={this.props.itemClick} />
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
        if (e.target.parentElement.nextElementSibling.style.display == "block") {
            e.target.parentElement.nextElementSibling.style.display = "none";
            e.target.className = "iconfont icon-right1";
        } else {
            e.target.parentElement.nextElementSibling.style.display = "block";
            e.target.className = "iconfont icon-down1";
        }
        
    }
    render() {
        return (
            <div className="sortable_node"
                id={this.props.id} name={this.props.name}
                onClick={this.props.itemClick}
            >
                <i className="iconfont icon-menu"></i>
                <span className="sortable_node_title">{this.props.name}</span>
                {this.props.count > 0 ?
                    <i className="iconfont icon-right1" onClick={this.showChildLi}></i> :
                    <i className="iconfont icon-dot"></i>
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
    onUpdate(name,code) {
        this.setState({ departmentName: name, departmentCode: code });
    }
    nameChange(e) {
        this.setState({ departmentName: e.target.value });
    }
    codeChange(e) {
        this.setState({ departmentCode: e.target.value });
    }
    updateDepartment(e) {
        console.log(this.state);
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
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.department_code}:</td>
                            <td><input type="text" name="departmentCode"
                                value={this.state.departmentCode}
                                onChange={this.codeChange.bind(this)} /></td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button"
                                    value={culture.update}
                                    className="button"
                                    onClick={this.updateDepartment.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}