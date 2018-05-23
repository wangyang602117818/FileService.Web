class DepartmentData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{ width: "60%" }}>
                <thead>
                    <tr>
                        <th width="30%">{culture.id}</th>
                        <th width="20%">{culture.department_name}</th>
                        <th width="10%">{culture.order}</th>
                        <th width="10%">{culture.layer}</th>
                        <th width="30%">{culture.createTime}</th>
                    </tr>
                </thead>
                <DepartmentList
                    data={this.props.data}
                    onIdClick={this.props.onIdClick}
                    deleteItem={this.props.deleteItem} />
            </table>
        );
    }
}
class DepartmentList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var that = this;
        if (this.props.data.length == 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan='10'>... {culture.no_data} ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <DepartmentItem department={item} key={i}
                                onIdClick={this.props.onIdClick}
                                deleteItem={that.props.deleteItem} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class DepartmentItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td className="link"
                    id={this.props.department._id.$oid.removeHTML()}>
                    <b id={this.props.department._id.$oid.removeHTML()}
                       dangerouslySetInnerHTML={{ __html: this.props.department._id.$oid }}>
                    </b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.department.DepartmentName }}></td>
                <td>{this.props.department.Order}</td>
                <td>{this.props.department.Layer}</td>
                <td>{parseBsonTime(this.props.department.CreateTime)}</td>
            </tr>
        )
    }
}
class Department extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.department ? eval(localStorage.department) : true,
            departmentShow: localStorage.department_add ? eval(localStorage.department_add) : true,
            deleteShow: false,
            deleteToggle: false,
            deleteName: "",
            deleteId: "",
            pageIndex: 1,
            pageSize: localStorage.department_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.department.getUrl;
        this.storagePageShowKey = "department";
        this.storagePageSizeKey = "department_pageSize";
    }
    onDepartmentShow() {
        if (this.state.departmentShow) {
            this.setState({ departmentShow: false });
            localStorage.department_add = false;
        } else {
            this.setState({ departmentShow: true });
            localStorage.department_add = true;
        }
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        http.get(urls.department.getDepartmentUrl + "/" + id, function (data) {
            //if (data.code == 0) {
            //    this.refs.addconfig.onExtensionClick(data.result.Extension, data.result.Type, data.result.Action);
            //    this.setState({ deleteShow: true, deleteId: data.result._id.$oid, deleteName: data.result.Extension });
            //}
        }.bind(this));
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.department_right}</h1>
                <UserToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.department}
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                    pageIndex={this.state.pageIndex}
                    pageSize={this.state.pageSize}
                    pageCount={this.state.pageCount}
                    filter={this.state.filter}
                    onInput={this.onInput.bind(this)}
                    onKeyPress={this.onKeyPress.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                <DepartmentData
                    data={this.state.data.result}
                    onDepartmentClick={this.onDepartmentClick.bind(this)} />

            </div>
        );
    }
}
for (var item in CommonUsePagination) Department.prototype[item] = CommonUsePagination[item];
