class ReplaceDepartment extends React.Component {
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
        orgChart();
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
            <div className={this.props.show ? "show" : "hidden"}>
                <div className="orgChart">
                    <ul style={{ display: "none" }}>
                        <li>
                            <DataNode name={this.props.department.DepartmentName} id={this.props.department.DepartmentCode} />
                            <NestedUl data={this.props.department.Department} />
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}
class NestedUl extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ul>
                {this.props.data.map(function (item, i) {
                    return (
                        <li key={i}>
                            <DataNode name={item.DepartmentName} id={item.DepartmentCode} />
                            {item.Department.length > 0 ?
                                <NestedUl data={item.Department} /> : null
                            }
                        </li>
                    )
                })}
            </ul>
        );
    }
}
class DataNode extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node">
                <div className="node_title" title={this.props.name}>{this.props.name}</div>
                <div className="node_bottom">
                    <i className="iconfont icon-del"></i>
                    <i className="iconfont icon-edit"></i>
                    <i className="iconfont icon-add"></i>
                </div>
            </div>
        )
    }
}