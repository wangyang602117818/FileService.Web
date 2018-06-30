﻿////////////////////////////////////////////////////
//////////////////CompanyDropDownList/////////////////////
///////////////////////////////////////////////////
class CompanyDropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            company: "",
            companys: [],
        }
    }
    componentDidMount() {
        http.get(urls.department.getAllDepartment, function (data) {
            if (data.code == 0) {
                this.setState({ companys: data.result });
                if (data.result.length > 0) {
                    this.setState({ company: data.result[0]._id.$oid });
                    if (this.props.afterCompanyInit) this.props.afterCompanyInit(data.result[0]._id.$oid);
                }
            }
        }.bind(this))
    }
    render() {
        return (
            <select name="company" value={this.props.company || this.state.company}
                onChange={this.props.companyChanged}>
                {this.state.companys.map(function (item, i) {
                    return <option value={item._id.$oid} key={i}>{item.DepartmentName}</option>
                })}
            </select>
        )
    }
}
////////////////////////////////////////////////////
//////////////////DepartmentDropDownList/////////////////////
///////////////////////////////////////////////////
class DropDownListIterate extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <React.Fragment>
                {this.props.departments.map(function (item, i) {
                    //是否当前层的最后一个节点
                    var isEnd = this.props.departments.length == i + 1;
                    //当前层的子元素个数
                    var subCount = item.Department.length;
                    var downLineHide = isEnd && subCount > 0;
                    var collapse = false;
                    if (item.Collapse) collapse = true;
                    var select = false;
                    if (item.Select) select = true;
                    var unselect = false;
                    if (item.UnSelect) unselect = true;
                    virtualCollapse = false;
                    if (item.virtualCollapse) virtualCollapse = true;
                    return (
                        <React.Fragment key={i}>
                            <DropDownLine
                                department={item}
                                subCount={subCount}
                                topLayerCount={this.props.topLayerCount}
                                isEnd={isEnd}
                                downLineHide={this.props.downLineHide || downLineHide}
                                totalLayer={this.props.departments.length}
                                index={i}
                                layer={this.props.layer}
                                collapse={collapse}
                                virtualCollapse={virtualCollapse}
                                select={select}
                                unselect={unselect}
                                layerAbsolute={this.props.layerAbsolute + "-" + i}
                            />
                            <DropDownListIterate
                                departments={item.Department}
                                downLineHide={downLineHide}
                                topLayerCount={this.props.topLayerCount}
                                layer={this.props.layer + 1}
                                layerAbsolute={this.props.layerAbsolute + "-" + i}
                            />
                        </React.Fragment>
                    )
                }.bind(this))}
            </React.Fragment>
        )
    }
}
class DropDownLine extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var html = "";
        var layer = this.props.layer;
        for (var i = 0; i <= layer; i++) {
            var fonttype = "iconfont icon-delete1";
            if (this.props.virtualCollapse) fonttype = "iconfont icon-add1";
            if (layer == i) { //最后一个
                if (this.props.subCount > 0 && !this.props.virtualCollapse) {
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" select=' + this.props.select + ' node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' unselect=' + this.props.unselect + '> ' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"><span class="v_line"></span></div></div ></div>';
                } else {
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" select=' + this.props.select + ' node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' unselect=' + this.props.unselect + '>' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"></div></div></div>';
                }
            } else if (layer - 1 == i) { //倒数第二个
                if (this.props.subCount > 0) {
                    html += '<div class="node_wrap_btn"><div class="line_wrap h_wrap_flex"></div><div class="btn_wrap"><div class="line_wrap v_wrap_flex"><span class="v_line"></span></div><div class="btn"><i class="' + fonttype + '" node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' layer-absolute=' + this.props.layerAbsolute + '></i></div><div class="line_wrap v_wrap_flex">';
                    if (!this.props.isEnd) html += '<span class="v_line"></span>';
                    html += '</div></div><div class="line_wrap h_wrap_flex"><div class="h_line"></div></div></div>';
                } else {
                    html += '<div class="node_wrap_btn"><div class="line_wrap h_wrap_flex"></div><div class="btn_wrap_none"><div class="line_wrap v_wrap_flex"><span class="v_line"></span></div><div class="line_wrap v_wrap_flex">';
                    if (this.props.isEnd) {
                        html += '<span class="v_line_trans"></span>';
                    } else {
                        html += '<span class="v_line"></span>';
                    }
                    html += '</div></div><div class="line_wrap h_wrap_flex"><span class= "h_line"></span></div></div>';
                }
            } else {  //其他
                var topLayerCount = this.props.topLayerCount - 1;
                var regex = new RegExp("^1-" + topLayerCount + "-\\d$");
                if (i == 0 && regex.test(this.props.layerAbsolute)) {
                    html += '<div class="node_wrap_btn"><div class="line_wrap v_wrap_flex"></div></div>';
                } else {
                    if (i > 0 && i < layer && this.props.downLineHide) {  //结束尾线
                        html += '<div class="node_wrap_btn"><div class="line_wrap v_wrap_flex"></div></div>';
                    } else {
                        html += '<div class="node_wrap_btn"><div class="line_wrap v_wrap_flex"><span class="v_line"></span></div></div>';
                    }
                }
            }
        }

        return (
            <div className="ddl_line"
                style={{ display: this.props.collapse ? "none" : "block" }}
                sub-count={this.props.subCount}
                top-layer-count={this.props.topLayerCount}
                layer={layer}
                total-layer={this.props.totalLayer}
                layer-absolute={this.props.layerAbsolute}
                code={this.props.department.DepartmentCode}
                name={this.props.department.DepartmentName}
                isend={this.props.isEnd.toString()}
                index={this.props.index}
                collapse={this.props.collapse.toString()}
                select={this.props.select.toString()}
                unselect={this.props.unselect.toString()}
                down-hide={this.props.downLineHide.toString()}
                dangerouslySetInnerHTML={{ __html: html }}>

            </div>
        )
    }
}
class DepartmentDropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topLayerCount: 0,
            Select: false,
            DepartmentName: "",
            DepartmentCode: "",
            Department: []
        }
    }
    //工具，供外部使用
    getDepartmentNamesByCodes(codes) {
        var names = [];
        for (var i = 0; i < codes.length; i++) {
            if (codes[i] == this.state.DepartmentCode) {
                names.push(this.state.DepartmentName);
            } else {
                this.getDepartmentNamesInternal(codes[i], this.state.Department, names);
            }
        }
        return names;
    }
    getDepartmentNamesInternal(code, departmens, names) {
        for (var i = 0; i < departmens.length; i++) {
            if (departmens[i].DepartmentCode == code) {
                names.push(departmens[i].DepartmentName);
                return;
            }
            this.getDepartmentNamesInternal(code, departmens[i].Department, names);
        }
    }
    ddlClick(e) {
        if (e.target.nodeName.toLowerCase() == "i") {
            var name = e.target.getAttribute("node-name");
            var code = e.target.getAttribute("node-code");
            this.dataNodeIterate(this.state.Department, name, code, 1, "i");
            this.setState({ Department: this.state.Department });
        }
        if (e.target.nodeName.toLowerCase() == "div" && e.target.className == "node") {
            var name = e.target.getAttribute("node-name");
            var code = e.target.getAttribute("node-code");
            var unselect = e.target.getAttribute("unselect");
            if (unselect == "true") return;
            this.selectNode(name, code);
        }
        e.stopPropagation();
    }
    selectNode(name, code, single) {
        //顶层node被选中
        if (name == this.state.DepartmentName && code == this.state.DepartmentCode) {
            this.state.Select = !this.state.Select;
            if (this.props.type != "user") this.selectAll(this.state.Department, this.state.Select);
        } else {
            this.dataNodeIterate(this.state.Department, name, code, 1, "select");
        }
        this.setState({
            Select: this.state.Select,
            Department: this.state.Department
        }, function () {
            var codeArray = [];
            var nameArray = [];
            if (this.state.Select) {
                codeArray.push(this.state.DepartmentCode);
                nameArray.push(this.state.DepartmentName);
            }
            this.getSelectCode(codeArray, nameArray, this.state.Department);
            if (!single) this.props.onSelectNodeChanged(codeArray, nameArray);
        }.bind(this));
    }
    getSelectCode(codeArray, nameArray, departments) {
        for (var i = 0; i < departments.length; i++) {
            if (departments[i].Select) {
                codeArray.push(departments[i].DepartmentCode);
                nameArray.push(departments[i].DepartmentName);
            }
            this.getSelectCode(codeArray, nameArray, departments[i].Department);
        }
    }
    selectAll(departments, select) {
        for (var i = 0; i < departments.length; i++) {
            departments[i].UnSelect = select;
            departments[i].Select = false;
            this.selectAll(departments[i].Department, select);
        }
    }
    dataNodeIterate(departments, name, code, layer, type, clickLayer, collapse, select) {
        for (var i = 0; i < departments.length; i++) {
            if (clickLayer) {
                if (layer > clickLayer) {
                    if (type == "i") departments[i].Collapse = collapse;  //用于判断是否隐藏（子层）
                    if (type == "select" && this.props.type != "user") {
                        departments[i].UnSelect = select;  //用于判断是否选中（子层）
                        departments[i].Select = false;  //（父元素选中了，子层不选中）
                    }
                } else {
                    clickLayer = null;
                }
            }
            if (departments[i].DepartmentCode == code) {
                if (type == "i") {
                    //departments[i].Collapse = !departments[i].Collapse;  //用于判断是否隐藏(当前层)
                    departments[i].virtualCollapse = !departments[i].virtualCollapse; //用于修改页面(当前层按钮样式，只有一个)
                }
                if (type == "select") {
                    departments[i].Select = !departments[i].Select; //(当前层)
                }
                clickLayer = layer;
            }
            this.dataNodeIterate(departments[i].Department,
                name,
                code,
                layer + 1,
                type,
                clickLayer,
                departments[i].Collapse || departments[i].virtualCollapse,
                departments[i].Select || departments[i].UnSelect);
        }
    }
    componentDidMount() {
        this.getData(this.props.id);
    }
    getData(id, success) {
        if (!id) return;
        http.get(urls.department.getDepartmentUrl + "/" + id, function (data) {
            if (data.code == 0) {
                this.setState({
                    topLayerCount: data.result.Department.length,
                    Select: false,
                    DepartmentName: data.result.DepartmentName,
                    DepartmentCode: data.result.DepartmentCode,
                    Department: data.result.Department
                });
            }
            if (success) success(data);
        }.bind(this));
    }
    render() {
        return (
            <div className="ddl" style={{ display: this.props.departmentShow ? "block" : "none" }}
                onClick={this.ddlClick.bind(this)}>
                {this.state.DepartmentCode ?
                    <div className="ddl_line"
                        layer={0}
                        layer-absolute={"0-0"}
                        code={this.state.DepartmentCode}
                        name={this.state.DepartmentName}
                        index={0}>
                        <div className="node_wrap">
                            <div className="node_main">
                                <div className="line_wrap v_wrap"></div>
                                <div className="node"
                                    node-name={this.state.DepartmentName}
                                    node-code={this.state.DepartmentCode}
                                    select={this.state.Select.toString()}
                                >{this.state.DepartmentName}</div>
                                <div className="line_wrap v_wrap">
                                    <span className="v_line"></span>
                                </div>
                            </div>
                        </div>
                    </div> : null
                }
                <DropDownListIterate
                    departments={this.state.Department}
                    topLayerCount={this.state.topLayerCount}
                    layerAbsolute="1"
                    layer={1} />
            </div>
        );
    }
}
class DepartmentDropDownListWrap extends React.Component {
    constructor(props) {
        super(props);

    }
    groupInputFocus(e) {
        this.refs.group_input.focus();
    }
    delNode(e) {
        var index = parseInt(e.target.id);
        var nameArray = this.props.nameArray;
        var codeArray = this.props.codeArray;
        this.refs.ddl.selectNode(nameArray[index], codeArray[index], true);
        codeArray.splice(index, 1);
        nameArray.splice(index, 1);
        this.props.onSelectNodeChanged(codeArray, nameArray);
        e.stopPropagation();
        return false;
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.props.onSelectNodeChanged(codeArray, nameArray);
    }
    //反选，吧input的内容反映到结构中
    selectNode(names, codes, b) {
        this.refs.ddl.selectNode(names, codes, b);
    }
    //初始化方法,油company初始化完成之后，或者company发生改变之后调用
    getData(companyId, success) {
        this.refs.ddl.getData(companyId, success);
    }
    //工具方法，根据codes获取names
    getDepartmentNamesByCodes(codeArray) {
        return this.refs.ddl.getDepartmentNamesByCodes(codeArray);
    }
    render() {
        return (
            <React.Fragment>
                <div className="ddl_input_con"
                    tag="open_ddl"
                    onClick={this.groupInputFocus.bind(this)}>
                    {this.props.codeArray.map(function (item, i) {
                        return (
                            <div className="ddl_item"
                                key={i}
                                name={this.props.nameArray[i]}
                                code={item}
                                tag="open_ddl">
                                <span className="ddl_text" tag="open_ddl">{this.props.nameArray[i]}</span>
                                <i className="iconfont icon-del" id={i} onClick={this.delNode.bind(this)}></i>
                            </div>)
                    }.bind(this))}
                    <input type="text"
                        name="group_input"
                        id="group_input"
                        ref="group_input"
                        tag="open_ddl"
                        className="ddl_input" />
                </div>
                <DepartmentDropDownList
                    type="user"
                    ref="ddl"
                    selected={this.props.codeArray}
                    departmentShow={this.props.departmentShow}
                    onSelectNodeChanged={this.onSelectNodeChanged.bind(this)} />
            </React.Fragment>
        )
    }
}