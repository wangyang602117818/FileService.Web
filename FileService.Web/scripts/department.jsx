class DepartmentData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{ width: "70%" }}>
                <thead>
                    <tr>
                        <th width="25%">{culture.id}</th>
                        <th width="20%">{culture.department_name}</th>
                        <th width="15%">{culture.department_code}</th>
                        <th width="10%">{culture.order}</th>
                        <th width="10%">{culture.layer}</th>
                        <th width="20%">{culture.createTime}</th>
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
                    onClick={this.props.onIdClick}
                    id={this.props.department._id.$oid.removeHTML()}>
                    <b id={this.props.department._id.$oid.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.department._id.$oid }}>
                    </b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.department.DepartmentName }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.department.DepartmentCode }}></td>
                <td>{this.props.department.Order}</td>
                <td>{this.props.department.Layer}</td>
                <td>{parseBsonTime(this.props.department.CreateTime)}</td>
            </tr>
        )
    }
}
class DeleteDepartment extends React.Component {
    constructor(props) {
        super(props);
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
                                    onClick={this.props.deleteItem.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class Department extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.department ? eval(localStorage.department) : true,
            addDepartmentShow: localStorage.department_add ? eval(localStorage.department_add) : true,
            updateDepartmentShow: localStorage.update_department_show ? eval(localStorage.update_department_show) : true,
            deleteShow: false,
            deleteToggle: false,
            id: "",
            departmentName: "",
            departmentCode: "",
            randomCode: "",
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
        if (this.state.addDepartmentShow) {
            this.setState({ addDepartmentShow: false });
            localStorage.department_add = false;
        } else {
            this.setState({ addDepartmentShow: true });
            localStorage.department_add = true;
        }
    }
    onUpdateDepartmentShow() {
        if (this.state.updateDepartmentShow) {
            this.setState({ updateDepartmentShow: false });
            localStorage.update_department_show = false;
        } else {
            this.setState({ updateDepartmentShow: true });
            localStorage.update_department_show = true;
        }
    }
    onDeleteShow(e) {
        if (this.state.deleteToggle) {
            this.setState({ deleteToggle: false });
        } else {
            this.setState({ deleteToggle: true });
        }
    }
    addDepartment(para, success) {
        http.post(urls.department.addDepartmentUrl, para, function (data) {
            if (data.code == 0) this.getData();
            success(data);
        }.bind(this));
    }
    deleteDepartment() {
        var id = this.state.id;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.department.deleteUrl + "/" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                    that.setState({ deleteShow: false });
                }
                else {
                    alert(data.message);
                }
            });
        }
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        http.get(urls.department.getDepartmentUrl + "/" + id, function (data) {
            if (data.code == 0) {
                //this.refs.addDepartment.onIdClick(data.result._id.$oid,
                //    data.result.DepartmentName,
                //    data.result.Order,
                //    data.result.ParentId);
                //this.setState({ deleteShow: true, deleteId: data.result._id.$oid, deleteName: data.result.Extension });
                this.setState({ id: data.result._id.$oid, departmentName: data.result.DepartmentName, departmentCode: data.result.DepartmentCode, deleteShow: true });
                this.refs.addDepartment.getHexCode();
            }
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
                    onIdClick={this.onIdClick.bind(this)} />
                <TitleArrow title={culture.update_department}
                    show={this.state.updateDepartmentShow}
                    onShowChange={this.onUpdateDepartmentShow.bind(this)} />
                <UpdateDepartment show={this.state.updateDepartmentShow} />
                <TitleArrow title={culture.add_sub_department + "(" + this.state.departmentName + ")"}
                    show={this.state.addDepartmentShow}
                    onShowChange={this.onDepartmentShow.bind(this)} />
                <AddSubDepartment ref="addDepartment"
                    randomCode={this.state.randomCode}
                    addDepartment={this.addDepartment.bind(this)}
                    show={this.state.addDepartmentShow}
                    departmentCode={this.state.departmentCode} />
                {this.state.deleteShow ?
                    <TitleArrow title={culture.delete_department + "(" + this.state.departmentName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={this.onDeleteShow.bind(this)} /> : null}
                {this.state.deleteShow ?
                    <DeleteDepartment
                        show={this.state.deleteToggle}
                        deleteItem={this.deleteDepartment.bind(this)} /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Department.prototype[item] = CommonUsePagination[item];
