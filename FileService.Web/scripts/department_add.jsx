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
            opacity: .6,
            placeholder: 'placeholder',
            revert: 250,
            tabSize: 25,
            tolerance: 'pointer',
            toleranceElement: '> div',
            change: function () {
                console.log("x");
            }
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
            <div className="department_container">
                <ol className="sortable">
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
                <div className="sortable_node">
                    <i className="iconfont icon-menu"></i>
                    <span className="sortable_node_title">{this.props.item.DepartmentName}</span>
                    <i className="iconfont icon-dot"></i>
                    <i className="iconfont icon-remove"></i>
                    <i className="iconfont icon-add1"></i>
                    <i className="iconfont icon-edit"></i>
                </div>
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
                    <DepartmentLi item={item} key={i} />
                })}
            </ol>
        );
    }
}
class DepartmentTr extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {this.props.data.map(function (item, i) {
                    <tr key={i}>
                        <td>{item.DepartmentName}</td>
                        <td>{item.DepartmentCode}</td>
                    </tr>

                })}
            </div>
        );
    }
}
class SubDepartment extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tbody>
                <tr>
                    <td>{this.props.data.DepartmentName}</td>
                    <td>{this.props.data.DepartmentCode}</td>
                </tr>
                {this.props.data.Department.map(function (item, i) {
                    return <SubDepartment data={item} key={i} />
                })}
            </tbody>
        );
    }
}
//class NestedUl extends React.Component {
//    constructor(props) {
//        super(props);
//    }
//    render() {
//        return (
//            <ul>
//                {this.props.data.map(function (item, i) {
//                    return (
//                        <li key={i}>
//                            <DataNode name={item.DepartmentName} id={item.DepartmentCode} />
//                            {item.Department.length > 0 ?
//                                <NestedUl data={item.Department} /> : null
//                            }
//                        </li>
//                    )
//                })}
//            </ul>
//        );
//    }
//}
//class DataNode extends React.Component {
//    constructor(props) {
//        super(props);
//    }
//    allowDrop(e) {
//        e.preventDefault();
//    }
//    onDragStart(e) {
//        var id = e.target.id;
//        e.dataTransfer.setData("Text", id);
//    }
//    drop(e) {
//        e.preventDefault();
//        var originId = e.dataTransfer.getData("Text");
//        var html = $(".orgChart ul #" + originId).parent()[0].outerHTML;
//        $(".orgChart ul #" + originId).parent().remove();

//        var id = e.target.id;
//        var nodeName = $(".orgChart ul #" + id).next();

//        if (nodeName[0].nodeName.toLowerCase() == "ul") {
//            $(".orgChart ul #" + id).next().append(html);
//        }
//        orgChart();
//    }
//    render() {
//        return (
//            <div className="node"
//                id={this.props.id}
//                onDrop={this.drop}
//                onDragOver={this.allowDrop}
//                draggable="true"
//                onDragStart={this.onDragStart}>
//                <div className="node_title" title={this.props.name}>{this.props.name}</div>
//                <div className="node_bottom">
//                    <i className="iconfont icon-del"></i>
//                    <i className="iconfont icon-edit"></i>
//                    <i className="iconfont icon-add"></i>
//                </div>
//            </div>
//        )
//    }
//}