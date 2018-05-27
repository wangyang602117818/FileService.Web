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
        //orgChart();
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
                <table className="table" style={{ width: "40%" }}>
                    <thead>
                        <tr>
                            <th width="50%">{culture.department_name}</th>
                            <th width="50%">{culture.department_code}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.props.department.DepartmentName}</td>
                            <td>{this.props.department.DepartmentCode}</td>
                        </tr>
                        <tr>
                            <td>|- {this.props.department.DepartmentName}</td>
                            <td>{this.props.department.DepartmentCode}</td>
                        </tr>
                        <tr>
                            <td>|-- {this.props.department.DepartmentName}</td>
                            <td>{this.props.department.DepartmentCode}</td>
                        </tr>
                        <tr>
                            <td>|--- {this.props.department.DepartmentName}</td>
                            <td>{this.props.department.DepartmentCode}</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        )
    }
}
function getHtmlTr(departments) {
    var trHtml = null;
    while (departments.length > 0) {
         trHtml+=<td></td>
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