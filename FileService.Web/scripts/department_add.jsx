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
        //this.getHexCode();
        $('ol.sortable').nestedSortable({
            disableNesting: 'no-nest',
            forcePlaceholderSize: true,
            handle: 'div',
            helper: 'clone',
            items: 'li',
            maxLevels: 6,
            opacity: .6,
            placeholder: 'placeholder',
            revert: 250,
            tabSize: 25,
            tolerance: 'pointer',
            toleranceElement: '> div'
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
            <div className={this.props.show ? "show" : "hidden"}>
                <ol className="sortable">
                    <li id={this.props.department.DepartmentCode}>
                        <DataNode
                            name={this.props.department.DepartmentName}
                            id={this.props.department.DepartmentCode} />
                        <NestedUl data={this.props.department.Department} />
                    </li>
                    
                </ol>
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
            <ol>
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
            <div className="sortable_node"
                id={this.props.id}>
                {this.props.name}
            </div>
        )
    }
}