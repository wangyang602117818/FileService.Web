﻿class DepartmentDetail extends React.Component {
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
                    id={this.props.item.DepartmentCode} />
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
            <ol>
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
    render() {
        return (
            <div className="sortable_node">
                <i className="iconfont icon-menu"></i>
                <span className="sortable_node_title">{this.props.name}</span>
                <i className="iconfont icon-dot"></i>
                <i className="iconfont icon-remove"></i>
                <i className="iconfont icon-add1"></i>
                <i className="iconfont icon-edit"></i>
            </div>
        )
    }
}