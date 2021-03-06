﻿class DepartmentData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="25%">{culture.id}</th>
                        <th width="25%">{culture.company + culture.name}</th>
                        <th width="25%">{culture.company + culture.code}</th>
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
                <td>
                    <b  className="link"
                        onClick={this.props.onIdClick}
                        code={this.props.department.DepartmentCode.removeHTML()}
                        id={this.props.department._id.$oid.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.department._id.$oid }}></b>
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
            addTopDepartmentShow: true,
            addTopDepartmentToggle: true,
            addDepartmentShow: localStorage.department_add ? eval(localStorage.department_add) : true,
            departmentDetailShow: false,
            departmentDetailToggle: true,
            code: null,
            department: null,

            updateDepartmentShow: false,
            updateDepartmentToggle: true,
            addSubDepartmentToggle: true,
            deleteDepartmentToggle: true,
            updateDepartment: null,

            orderBtnDisabled: true,
            updateBtnDisabled: false,
            addSubBtnDisabled: false,
            deleteBtnDisabled: false,
            pageIndex: 1,
            pageSize: localStorage.department_pageSize || 10,
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.department.getUrl;
        this.storagePageShowKey = "department";
        this.storagePageSizeKey = "department_pageSize";
    }
    onTopDepartmentShow() {
        if (this.state.addTopDepartmentToggle) {
            this.setState({ addTopDepartmentToggle: false });
        } else {
            this.setState({ addTopDepartmentToggle: true });
        }
    }
    onUpdateDepartmentShow() {
        if (this.state.updateDepartmentToggle) {
            this.setState({ updateDepartmentToggle: false });
        } else {
            this.setState({ updateDepartmentToggle: true });
        }
    }
    onAddSubDepartmentShow() {
        if (this.state.addSubDepartmentToggle) {
            this.setState({ addSubDepartmentToggle: false });
        } else {
            this.setState({ addSubDepartmentToggle: true });
        }
    }
    onDepartmentDetailShow() {
        if (this.state.departmentDetailToggle) {
            this.setState({ departmentDetailToggle: false });
        } else {
            this.setState({ departmentDetailToggle: true });
        }
    }
    onDeleteDepartmentShow() {
        if (this.state.deleteDepartmentToggle) {
            this.setState({ deleteDepartmentToggle: false });
        } else {
            this.setState({ deleteDepartmentToggle: true });
        }
    }
    onIdClick(e) {
        var code = e.target.getAttribute("code") || e.target.parentElement.getAttribute("code");
        this.getDepartmentDetail(code);
    }
    getDepartmentDetail(code) {
        var _this = this;
        _this.setState({
            code: code,
            departmentDetailShow: false,  //暂时卸载
            updateDepartmentShow: false   //暂时卸载
        }, function () {
            http.get(urls.department.getDepartmentUrl + "?code=" + code, function (data) {
                if (data.code == 0) {
                    _this.setState({
                        addTopDepartmentShow: false,
                        departmentDetailShow: true,  //再次开启
                        updateDepartmentShow: true,  //再次开启
                        department: data.result,
                        updateDepartment: { departmentCode: data.result.DepartmentCode, departmentName: data.result.DepartmentName }
                    }, function () {
                        _this.refs.updateDepartment.onUpdate(data.result.DepartmentName, data.result.DepartmentCode);
                        _this.refs.addSubDepartment.getHexCode();
                    });
                }
            });
        });
    }
    itemClick(e) {
        var code = e.target.getAttribute("data-code");
        var name = e.target.getAttribute("data-name");
        this.setState({
            updateDepartmentShow: true,
            updateDepartment: { departmentCode: code, departmentName: name }
        }, function () {
            this.refs.updateDepartment.onUpdate(name, code);
            this.refs.addSubDepartment.getHexCode();
        });
    }
    updateDepartment(name, code) {
        var department = this.getDataNode(name, code);
        http.postJson(urls.department.updateDepartmentUrl + "/" + department._id.$oid,
            department,
            function (data) {
                if (data.code == 0) {
                    this.getData();
                    this.refs.updateDepartment.onUpdate("", "");
                }
            }.bind(this)
        );
    }
    onOrderChange() {
        this.setState({
            orderBtnDisabled: false,
            updateBtnDisabled: true,
            addSubBtnDisabled: true,
            deleteBtnDisabled: true
        });
    }
    onOrderSave() {
        var department = this.getDataNode(null, null);
        http.postJson(urls.department.updateDepartmentUrl + "/" + department._id.$oid,
            department,
            function (data) {
                if (data.code == 0) this.getDepartmentDetail(department._id.$oid);
                this.setState({
                    orderBtnDisabled: true,
                    updateBtnDisabled: false,
                    addSubBtnDisabled: false,
                    deleteBtnDisabled: false
                });
            }.bind(this)
        );
    }
    deleteItem(func) {
        if (!window.confirm(" " + culture.delete + " ?")) return;
        var deleteCode = this.state.updateDepartment.departmentCode;
        var deleteName = this.state.updateDepartment.departmentName;
        if (deleteCode == this.state.department.DepartmentCode || deleteName == this.state.department.DepartmentName) {
            http.get(urls.department.deleteTopDepartment + "/" + this.state.department._id.$oid, function (data) {
                if (data.code == 0) {
                    this.setState({
                        addTopDepartmentShow: true,
                        departmentDetailShow: false,
                        updateDepartmentShow: false
                    });
                    this.getData();
                }
            }.bind(this));
            return;
        }
        var ol = document.getElementsByClassName("sortable")[0];
        var innerData = this.getDataNodeIterate(ol, null, null, true);
        this.state.department.Department = innerData;
        http.postJson(urls.department.updateDepartmentUrl + "/" + this.state.department._id.$oid,
            this.state.department,
            function (data) {
                if (data.code == 0) {
                    this.getData();
                    this.setState({ updateDepartmentShow: false });
                }
            }.bind(this)
        );
    }
    addSubDepartment(name, code, success) {
        var ol = document.getElementsByClassName("sortable")[0];
        var nodes = ol.getElementsByClassName("sortable_node");
        var topCode = this.state.department.DepartmentCode;
        var topName = this.state.department.DepartmentName;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute("data-select") == "1") {
                topCode = nodes[i].getAttribute("data-code");
                topName = nodes[i].getAttribute("data-name");
            }
        }
        var dept = { DepartmentName: name, DepartmentCode: code, Department: [] };
        if (topCode == this.state.department.DepartmentCode && topName == this.state.department.DepartmentName) {
            this.state.department.Department.push(dept);
        } else {
            var depts = this.state.department.Department;
            this.setDataNodeIterate(this.state.department.Department, topCode, topName, dept);
        }
        http.postJson(urls.department.updateDepartmentUrl + "/" + this.state.department._id.$oid,
            this.state.department,
            function (data) {
                if (data.code == 0) this.getData();
                success(data);
            }.bind(this)
        );
    }
    addTopDepartment(name, code, success) {
        var obj = { departmentName: name, departmentCode: code };
        http.postJson(urls.department.addTopDepartment, obj, function (data) {
            if (data.code == 0) this.getData();
            success(data);
        }.bind(this));
    }
    setDataNodeIterate(departments, topCode, topName, dept) { //递归state中department数据，并且添加子节点
        if (departments.length <= 0) return;
        for (var i = 0; i < departments.length; i++) {
            this.setDataNodeIterate(departments[i].Department, topCode, topName, dept);
            if (departments[i].DepartmentName == topName && departments[i].DepartmentCode == topCode) {
                departments[i].Department.push(dept);
            }
        }
    }
    getDataNode(name, code) {  //获取树状节点中的department数据
        var changed = false;
        var ol = document.getElementsByClassName("sortable")[0];
        var nodes = ol.getElementsByClassName("sortable_node");
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute("data-select") == "1") { changed = true; break; }  //该节点发生了改变
        }
        var data = this.getDataNodeIterate(ol, name, code, false);
        if (!changed && name && code) {  //说明改变的是根节点
            this.state.department.DepartmentName = name;
            this.state.department.DepartmentCode = code;
        }
        this.state.department.Department = data;
        return this.state.department;
    }
    getDataNodeIterate(ol, name, code, del) {
        var dataArray = [];
        var liList = ol.childNodes;
        for (var i = 0; i < liList.length; i++) {
            var dataObj = {};
            var divNode = liList[i].childNodes[0];
            if (divNode.getAttribute("data-select") == "1" && name && code) {
                dataObj.DepartmentName = name;
                dataObj.DepartmentCode = code;
            } else {
                dataObj.DepartmentName = divNode.getAttribute("data-name");
                dataObj.DepartmentCode = divNode.getAttribute("data-code");
            }
            if (divNode.getAttribute("data-select") == "1" && del) continue;
            if (liList[i].childNodes.length == 2) {
                dataObj.Department = this.getDataNodeIterate(liList[i].childNodes[1], name, code, del);
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
                <h1>{culture.company + culture.management}</h1>
                <UserToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.company}
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                    pageIndex={this.state.pageIndex}
                    pageSize={this.state.pageSize}
                    pageCount={this.state.pageCount}
                    filter={this.state.filter}
                    startTime={this.state.startTime}
                    endTime={this.state.endTime}
                    onInput={this.onInput.bind(this)}
                    onKeyPress={this.onKeyPress.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                <DepartmentData
                    data={this.state.data.result}
                    onIdClick={this.onIdClick.bind(this)} />
                {this.state.addTopDepartmentShow ?
                    <TitleArrow title={culture.add + culture.company}
                        show={this.state.addTopDepartmentToggle}
                        onShowChange={this.onTopDepartmentShow.bind(this)} /> : null}
                {this.state.addTopDepartmentShow ?
                    <AddTopDepartment
                        addTopDepartment={this.addTopDepartment.bind(this)}
                        show={this.state.addTopDepartmentToggle}
                    /> : null}
                {this.state.departmentDetailShow ?
                    <TitleArrow title={culture.detail_department + "(" + this.state.department.DepartmentName + ")"}
                        show={this.state.departmentDetailToggle}
                        onShowChange={this.onDepartmentDetailShow.bind(this)} /> : null}
                {this.state.departmentDetailShow ?
                    <DepartmentDetail
                        ref="departmentDetail"
                        department={this.state.department}
                        updateDepartment={this.state.updateDepartment}
                        onOrderSave={this.onOrderSave.bind(this)}
                        onOrderChange={this.onOrderChange.bind(this)}
                        orderBtnDisabled={this.state.orderBtnDisabled}
                        show={this.state.departmentDetailToggle}
                        itemClick={this.itemClick.bind(this)}
                    /> : null}
                {this.state.updateDepartmentShow ?
                    <TitleArrow title={culture.update + "(" + this.state.updateDepartment.departmentName + ")"}
                        show={this.state.updateDepartmentToggle}
                        onShowChange={this.onUpdateDepartmentShow.bind(this)} /> : null}
                {this.state.updateDepartmentShow ?
                    <UpdateDepartment
                        ref="updateDepartment"
                        updateDepartment={this.updateDepartment.bind(this)}
                        updateBtnDisabled={this.state.updateBtnDisabled}
                        show={this.state.updateDepartmentToggle}
                    /> : null}
                {this.state.updateDepartmentShow ?
                    <TitleArrow title={culture.add_sub_department + "(" + this.state.updateDepartment.departmentName + ")"}
                        show={this.state.addSubDepartmentToggle}
                        onShowChange={this.onAddSubDepartmentShow.bind(this)} /> : null}
                {this.state.updateDepartmentShow ?
                    <AddSubDepartment
                        show={this.state.addSubDepartmentToggle}
                        ref="addSubDepartment"
                        addSubDepartment={this.addSubDepartment.bind(this)}
                        addSubBtnDisabled={this.state.addSubBtnDisabled}
                    /> : null}
                {this.state.updateDepartmentShow ?
                    <TitleArrow title={culture.delete + "(" + this.state.updateDepartment.departmentName + ")"}
                        show={this.state.deleteDepartmentToggle}
                        onShowChange={this.onDeleteDepartmentShow.bind(this)} /> : null}
                {this.state.updateDepartmentShow ?
                    <DeleteDepartment
                        ref="deleteDepartment"
                        show={this.state.deleteDepartmentToggle}
                        deleteBtnDisabled={this.state.deleteBtnDisabled}
                        deleteItem={this.deleteItem.bind(this)} /> : null}

            </div>
        );
    }
}
for (var item in CommonUsePagination) Department.prototype[item] = CommonUsePagination[item];
