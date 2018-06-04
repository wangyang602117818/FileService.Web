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
                        <th width="25%">{culture.department_name}</th>
                        <th width="25%">{culture.department_code}</th>
                        <th width="25%">{culture.createTime}</th>
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
            addDepartmentShow: localStorage.department_add ? eval(localStorage.department_add) : true,
            departmentDetailShow: false,
            departmentDetailToggle: true,
            department: null,

            updateDepartmentShow: false,
            updateDepartmentToggle: true,
            updateDepartment: null,

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
    onUpdateDepartmentShow() {
        if (this.state.updateDepartmentToggle) {
            this.setState({ updateDepartmentToggle: false });
        } else {
            this.setState({ updateDepartmentToggle: true });
        }
    }
    onDepartmentDetailShow() {
        if (this.state.departmentDetailToggle) {
            this.setState({ departmentDetailToggle: false });
        } else {
            this.setState({ departmentDetailToggle: true });
        }
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        http.get(urls.department.getDepartmentUrl + "/" + id, function (data) {
            if (data.code == 0) {
                this.setState({
                    departmentDetailShow: true,
                    department: data.result,
                    updateDepartment: { departmentCode: data.result.DepartmentCode, departmentName: data.result.DepartmentName },
                    updateDepartmentShow: true
                }, function () {
                    this.refs.updateDepartment.onUpdate(data.result.DepartmentName, data.result.DepartmentCode);
                });
            }
        }.bind(this));
    }
    itemClick(e) {
        var code = e.target.getAttribute("data-code");
        var name = e.target.getAttribute("data-name");
        this.setState({
            updateDepartmentShow: true,
            updateDepartment: { departmentCode: code, departmentName: name }
        }, function () {
            this.refs.updateDepartment.onUpdate(name, code);
        });
    }
    updateDepartment(name, code) {
        this.getDataNode(name, code);
    }
    getDataNode(name, code) {
        var changed = false;
        var ol = document.getElementsByClassName("sortable")[0];
        var nodes = ol.getElementsByClassName("sortable_node");
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute("data-select") == "1") { changed = true; break; }
        }
        var data = this.getDataNodeIterate(ol, name, code);
        if (!changed) {
            this.state.department.DepartmentName = name;
            this.state.department.DepartmentCode = code;
        }
        this.state.department.Department = data;
        http.postJson(urls.department.updateDepartmentUrl + "/" + this.state.department._id.$oid,
            this.state.department,
            function (data) {
                if (data.code == 0) {
                    this.setState({ updateDepartmentShow: false, department: this.state.department });
                }
            }.bind(this));
    }
    getDataNodeIterate(ol, name, code) {
        var dataArray = [];
        var liList = ol.childNodes;
        for (var i = 0; i < liList.length; i++) {
            var dataObj = {};
            var divNode = liList[i].childNodes[0];
            if (divNode.getAttribute("data-select") == "1") {
                dataObj.DepartmentName = name;
                dataObj.DepartmentCode = code;
            } else {
                dataObj.DepartmentName = divNode.getAttribute("data-name");
                dataObj.DepartmentCode = divNode.getAttribute("data-code");
            }
            if (liList[i].childNodes.length == 2) {
                dataObj.Department = this.getDataNodeIterate(liList[i].childNodes[1], name, code);
            } else {
                dataObj.Department = [];
            }
            dataArray.push(dataObj);
        }
        return dataArray;
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
                {this.state.departmentDetailShow ?
                    <TitleArrow title={culture.detail_department + "(" + this.state.department.DepartmentName + ")"}
                        show={this.state.departmentDetailToggle}
                        onShowChange={this.onDepartmentDetailShow.bind(this)} /> : null}
                {this.state.departmentDetailShow ?
                    <DepartmentDetail
                        ref="departmentDetail"
                        department={this.state.department}
                        updateDepartment={this.state.updateDepartment}
                        show={this.state.departmentDetailToggle}
                        itemClick={this.itemClick.bind(this)}
                    /> : null}
                {this.state.updateDepartmentShow ?
                    <TitleArrow title={culture.update_department + "(" + this.state.updateDepartment.departmentName + ")"}
                        show={this.state.updateDepartmentToggle}
                        onShowChange={this.onUpdateDepartmentShow.bind(this)} /> : null}
                {this.state.updateDepartmentShow ?
                    <UpdateDepartment
                        ref="updateDepartment"
                        updateDepartment={this.updateDepartment.bind(this)}
                        show={this.state.updateDepartmentToggle}
                    /> : null}

            </div>
        );
    }
}
for (var item in CommonUsePagination) Department.prototype[item] = CommonUsePagination[item];
