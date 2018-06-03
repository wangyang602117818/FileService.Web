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
                        return <DepartmentLi item={item} key={i} />
                    })}
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
            <li id={this.props.item.DepartmentCode} >
                <DataNode name={this.props.item.DepartmentName}
                    id={this.props.item.DepartmentCode}
                    count={this.props.item.Department.length} />
                {this.props.item.Department.length > 0 ?
                    <DepartmentSubLi item={this.props.item.Department} /> : null
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
            <ol style={{ display:"none" }}>
                {this.props.item.map(function (item, i) {
                    return <DepartmentLi item={item} key={i} />
                })}
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
            <div className="sortable_node">
                <i className="iconfont icon-menu"></i>
                <span className="sortable_node_title">{this.props.name}</span>
                {this.props.count > 0 ?
                    <i className="iconfont icon-right1" onClick={this.showChildLi}></i> :
                    <i className="iconfont icon-dot"></i>
                }
                <i className="iconfont icon-remove"></i>
                <i className="iconfont icon-add1"></i>
                <i className="iconfont icon-edit"></i>
            </div>
        )
    }
}