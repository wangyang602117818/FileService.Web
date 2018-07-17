////////////////////////////////////////////////////
//////////////////CompanyDropDownList/////////////////////
///////////////////////////////////////////////////
class CompanyDropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companyId: "",
            companyCode: "",
            companys: [],
        }
    }
    getCompanyIdByCode(code) {
        for (var i = 0; i < this.state.companys.length; i++) {
            if (this.state.companys[i].DepartmentCode == code) {
                return this.state.companys[i]._id.$oid;
            }
        }
    }
    getCompanyNameByCode(code) {
        for (var i = 0; i < this.state.companys.length; i++) {
            if (this.state.companys[i].DepartmentCode == code) {
                return this.state.companys[i].DepartmentName;
            }
        }
    }
    componentDidMount() {
        this.getData();
    }
    getData() {
        http.get(urls.department.getAllDepartment, function (data) {
            if (data.code == 0) {
                var companys = [];
                for (var i = 0; i < data.result.length; i++) {
                    var exists = false;
                    for (var j = 0; j < this.props.existsCompany.length; j++) {
                        if (this.props.existsCompany[j].companyCode == data.result[i].DepartmentCode) exists = true;
                    }
                    if (!exists) companys.push(data.result[i]);
                }
                this.setState({ companys: companys });
                if (companys.length > 0) {
                    this.setState({
                        companyId: companys[0]._id.$oid,
                        companyCode: companys[0].DepartmentCode
                    });
                    if (this.props.afterCompanyInit) this.props.afterCompanyInit(
                        companys[0]._id.$oid,
                        companys[0].DepartmentCode,
                        companys[0].DepartmentName);
                } else {
                    this.setState({ companyId: "", companyCode: "" });
                    if (this.props.afterCompanyInit) this.props.afterCompanyInit("", "", "");
                }
            }
        }.bind(this))
    }
    render() {
        return (
            <select name="company" value={this.props.companyCode || this.state.companyCode}
                onChange={this.props.companyChanged.bind(this)}>
                {this.state.companys.map(function (item, i) {
                    return <option value={item.DepartmentCode} key={i}>{item.DepartmentName}</option>
                }.bind(this))}
            </select>
        )
    }
}
////////////////////////////////////////////////////
//////////////////DepartmentDropDownList/////////////////////
///////////////////////////////////////////////////
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
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" select=' + this.props.select + ' node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' layer-absolute=' + this.props.layerAbsolute + ' focus=' + this.props.focus.toString() + '> ' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"><span class="v_line"></span></div></div ></div>';
                } else {
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" select=' + this.props.select + ' node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' layer-absolute=' + this.props.layerAbsolute + ' focus=' + this.props.focus.toString() + '>' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"></div></div></div>';
                }
            } else if (layer - 1 == i) { //倒数第二个
                if (this.props.subCount > 0) {
                    html += '<div class="node_wrap_btn"><div class="line_wrap h_wrap_flex"></div><div class="btn_wrap"><div class="line_wrap v_wrap_flex"><span class="v_line"></span></div><div class="btn"><i class="' + fonttype + '" node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' layer-absolute=' + this.props.layerAbsolute + ' layer=' + this.props.layer + '></i></div><div class="line_wrap v_wrap_flex">';
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
                focus={this.props.focus.toString()}
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
            departments: [],
            selectedDepartments: []
        }
    }
    //工具，供外部使用
    getDepartmentNamesByCodes(codes) {
        var names = [];
        for (var i = 0; i < codes.length; i++) {
            var code = codes[i];
            for (var j = 0; j < this.state.departments.length; j++) {
                if (code == this.state.departments[j].DepartmentCode) {
                    names.push(this.state.departments[j].DepartmentName);
                }
            }
        }
        return names;
    }
    getAbsoluteLayer(code) {
        for (var i = 0; i < this.state.departments.length; i++) {
            if (code == this.state.departments[i].DepartmentCode)
                return {
                    LayerAbsolute: this.state.departments[i].LayerAbsolute,
                    Layer: this.state.departments[i].Layer
                };
        }
    }
    getSubDepartmentSingle(absoluteLayer) {
        var codes = [];
        var regex = new RegExp("^" + absoluteLayer + ".+");
        for (var i = 0; i < this.state.departments.length; i++) {
            if (regex.test(this.state.departments[i].LayerAbsolute)) {
                codes.push(this.state.departments[i].DepartmentCode);
            }
        }
        return codes;
    }
    getSupDepartmentSingle(absoluteLayer, layer) {//*
        var codes = [];
        //var newLayer = absoluteLayer.substring(0, absoluteLayer.lastIndexOf("-"));
        for (var i = 0; i < this.state.departments.length; i++) {
            var regex = new RegExp("^" + this.state.departments[i].LayerAbsolute + ".+");
            if (regex.test(absoluteLayer) && this.state.departments[i].Layer < layer) {
                codes.push(this.state.departments[i].DepartmentCode);
            }
        }
        return codes;
    }
    //工具，供外部使用,获取不重复的下级部门列表
    getSubDepartments(codes) {
        var newCodes = [];
        for (var i = 0; i < codes.length; i++) {
            if (newCodes.indexOf(codes[i]) == -1) newCodes.push(codes[i]);
            var absoluteLayer = this.getAbsoluteLayer(codes[i]).LayerAbsolute;
            var obj_code = this.getSubDepartmentSingle(absoluteLayer);
            for (var k = 0; k < obj_code.length; k++) {
                if (newCodes.indexOf(obj_code[k]) == -1) newCodes.push(obj_code[k]);
            }
        }
        return newCodes;
    }
    //工具，供外部使用,获取不重复的上级级部门列表 *
    getSupDepartments(codes) {
        var newCodes = [];
        for (var i = 0; i < codes.length; i++) {
            if (newCodes.indexOf(codes[i]) == -1) newCodes.push(codes[i]);
            var obj = this.getAbsoluteLayer(codes[i]);
            var absoluteLayer = obj.LayerAbsolute;
            var layer = obj.Layer;
            var obj_code = this.getSupDepartmentSingle(absoluteLayer, layer);
            for (var k = 0; k < obj_code.length; k++) {
                if (newCodes.indexOf(obj_code[k]) == -1) newCodes.push(obj_code[k]);
            }
        }
        return newCodes;
    }
    ddlClick(e) {
        var name = e.target.getAttribute("node-name");
        var code = e.target.getAttribute("node-code");
        var layer = e.target.getAttribute("layer");
        var absoluteLayer = e.target.getAttribute("layer-absolute");
        if (e.target.nodeName.toLowerCase() == "i") {
            var regex = new RegExp("^" + absoluteLayer + ".+");
            var virtualCollapse = null;
            var collapseLayer = null;  //内部折叠层
            for (var i = 0; i < this.state.departments.length; i++) {
                if (this.state.departments[i].LayerAbsolute == absoluteLayer) {  //当前点击的行
                    this.state.departments[i].VirtualCollapse = !this.state.departments[i].VirtualCollapse;
                    virtualCollapse = this.state.departments[i].VirtualCollapse;
                }
                //当前点击行的子节点
                if (regex.test(this.state.departments[i].LayerAbsolute)) {
                    //保证折叠内部的折叠不会随父节点一起打开
                    if (collapseLayer && new RegExp("^" + collapseLayer + ".+").test(this.state.departments[i].LayerAbsolute)) {
                        continue;
                    }
                    if (virtualCollapse == true) {  //折叠
                        this.state.departments[i].Collapse = true;
                    } else {  //展开
                        //遇到当前的dept是折叠的
                        if (this.state.departments[i].VirtualCollapse == true) {
                            collapseLayer = this.state.departments[i].LayerAbsolute;
                        } else {
                            collapseLayer = null;
                        }
                        this.state.departments[i].Collapse = false;
                    }
                }
            }
            this.setState({ departments: this.state.departments });
        }
        if (e.target.nodeName.toLowerCase() == "div" && e.target.className == "node") {
            this.clickNode(code);
        }
        e.stopPropagation();
    }
    clickNode(code) {
        var departmentCodes = [];
        var departmentNames = [];
        for (var i = 0; i < this.state.departments.length; i++) {
            if (this.state.departments[i].DepartmentCode == code) {
                this.state.departments[i].Select = !this.state.departments[i].Select;
            }
            if (this.state.departments[i].Select) {
                departmentCodes.push(this.state.departments[i].DepartmentCode);
                departmentNames.push(this.state.departments[i].DepartmentName);
            }
        }
        this.setState({ departments: this.state.departments });
        this.selectNode(departmentCodes, departmentNames);
    }
    selectNode(codes, names) {
        this.props.onSelectNodeChanged(codes, names);
    }
    //反选，input的内容反映到结构中,只需要传codes，会自动调用父组件的onSelectNodeChanged方法来初始化父组件状态
    unSelectNode(codes) {
        if (!codes) return;
        var departmentCodes = [];
        var departmentNames = [];
        for (var i = 0; i < this.state.departments.length; i++) {
            this.state.departments[i].Select = false;
            if (codes.indexOf(this.state.departments[i].DepartmentCode) > -1) {
                this.state.departments[i].Select = true;
                departmentCodes.push(this.state.departments[i].DepartmentCode);
                departmentNames.push(this.state.departments[i].DepartmentName);
            }
        }
        this.setState({ departments: this.state.departments });
        this.selectNode(departmentCodes, departmentNames);
    }
    //小键盘的方向键向下
    onKeyDown() {
        if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        var hasFocus = false;
        for (var i = 0; i < this.state.departments.length; i++) {
            if (this.state.departments[i].Focus) hasFocus = true;
        }
        if (hasFocus) {
            for (var i = 0; i < this.state.departments.length; i++) {
                if (this.state.departments[i].Focus == true) {
                    if (this.state.departments[i + 1]) {
                        this.state.departments[i].Focus = false;
                        this.state.departments[i + 1].Focus = true;
                    }
                    break;
                }
            }
        } else {
            this.state.departments[0].Focus = true;
        }
        this.setState({ departments: this.state.departments }, this.keyMoveAfter);
    }
    //小键盘的方向键向上
    onKeyUp() {
        if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        for (var i = 0; i < this.state.departments.length; i++) {
            if (this.state.departments[i].Focus == true) {
                this.state.departments[i].Focus = false;
                if (this.state.departments[i - 1]) {
                    this.state.departments[i - 1].Focus = true;
                } else {
                    this.state.departments[0].Focus = true;
                }
                break;
            }
        }
        this.setState({ departments: this.state.departments }, this.keyMoveAfter);
    }
    keyMoveAfter(e) {
        var ddl_department_con = document.getElementsByClassName("ddl_department_con")[0];
        var con_height = ddl_department_con.offsetHeight;
        var ddl_lines = ddl_department_con.getElementsByClassName("ddl_line");
        for (var i = 0; i < ddl_lines.length; i++) {
            if (ddl_lines[i].getAttribute("focus") == "true") {
                var virtualheight = ddl_lines[i].offsetTop - ddl_department_con.scrollTop + ddl_lines[i].clientHeight + 4;
                if (virtualheight >= ddl_department_con.clientHeight) {  //到底了
                    ddl_department_con.scrollTop = ddl_department_con.scrollTop + ddl_lines[i].clientHeight + 2;
                }
                var virtualmargintop = ddl_lines[i].offsetTop - ddl_department_con.scrollTop - 2;
                if (virtualmargintop <= 0) { //到顶了
                    ddl_department_con.scrollTop = ddl_department_con.scrollTop - ddl_lines[i].clientHeight - 2;
                }
            }
        }
    }
    onKeyEnter(e) {
        if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        for (var i = 0; i < this.state.departments.length; i++) {
            //if (this.state.users[i].Select == true) continue;
            if (this.state.departments[i].Focus == true) {
                //this.state.departments[i].Focus = false;
                //if (this.state.departments[i + 1]) {
                //    this.state.departments[i + 1].Focus = true;
                //}
                var department = this.state.departments[i].DepartmentCode;
                this.clickNode(department);
                break;
            }
        }
    }
    getData(companyId, success) {
        if (!companyId) return;
        http.get(urls.department.getDepartmentUrl + "/" + companyId, function (data) {
            if (data.code == 0) {
                var departments = this.assembleData(data.result);
                this.setState({ departments: departments });
            }
            if (success) success();
        }.bind(this));
    }
    assembleData(result) {
        var virtualData = [];
        var topLayerCount = result.Department.length;
        virtualData.push({
            DepartmentName: result.DepartmentName,
            DepartmentCode: result.DepartmentCode,
            Select: false,
            Collapse: false,
            VirtualCollapse: false,
            Focus: false,
            TopLayerCount: topLayerCount,
            SubCount: result.Department.length,
            Layer: 0,
            TotalLayer: 1,
            LayerAbsolute: "1-",
            IsEnd: false,
            DownLineHide: false,
            index: 0
        });
        this.assembleDataInternal(virtualData, result.Department, 1, "1", false, topLayerCount);
        return virtualData;
    }
    assembleDataInternal(virtualData, departments, layer, layerAbsolute, downLineHide, topLayerCount) {
        for (var i = 0; i < departments.length; i++) {
            //是否当前层的最后一个节点
            var isEnd = departments.length == i + 1;
            //当前层的子元素个数
            var subCount = departments[i].Department.length;
            var downLineHideInner = isEnd && subCount > 0;
            var downLineH = downLineHide || downLineHideInner;

            virtualData.push({
                DepartmentName: departments[i].DepartmentName,
                DepartmentCode: departments[i].DepartmentCode,
                Select: false,
                Collapse: false,
                VirtualCollapse: false,
                Focus: false,
                TopLayerCount: topLayerCount,
                SubCount: subCount,
                Layer: layer,
                TotalLayer: departments.length,
                LayerAbsolute: layerAbsolute + "-" + i,
                IsEnd: isEnd,
                DownLineHide: downLineH,
                Index: i
            });
            this.assembleDataInternal(virtualData,
                departments[i].Department,
                layer + 1,
                layerAbsolute + "-" + i,
                downLineH,
                topLayerCount);
        }
    }
    render() {
        return (
            <div className="ddl ddl_department_con"
                style={{ display: "none" }}
                onClick={this.ddlClick.bind(this)}
            >
                {this.state.departments.map(function (item, i) {
                    return (<DropDownLine
                        key={i}
                        department={item}
                        subCount={item.SubCount}
                        topLayerCount={item.TopLayerCount}
                        isEnd={item.IsEnd}
                        downLineHide={item.DownLineHide}
                        totalLayer={item.TotalLayer}
                        index={item.Index}
                        layer={item.Layer}
                        collapse={item.Collapse}
                        virtualCollapse={item.VirtualCollapse}
                        select={item.Select}
                        focus={item.Focus}
                        layerAbsolute={item.LayerAbsolute}
                    />)
                })}
            </div>
        )
    }
}
class DepartmentDropDownListWrap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            department_authority: "0"
        }
    }
    departmentAuthorityChange(e) {
        var id = e.target.getAttribute("index");
        this.state.department_authority = id;
        this.setState({ department_authority: this.state.department_authority });
        //实际权限组
        var realCodes = this.getRealCodeArray(this.props.codeArray);
        if (this.props.onRealNodeChanged)
            this.props.onRealNodeChanged(realCodes, this.state.department_authority);
    }
    getRealCodeArray(codes) {
        var authorityId = this.state.department_authority;
        switch (authorityId) {
            case "0":
                return codes;
            case "1":
                return this.getSubDepartments(codes);
            case "2":
                return this.getSupDepartments(codes);
        }
    }
    groupInputFocus(e) {
        this.refs.group_input.focus();
    }
    delNode(e) {
        var code = e.target.getAttribute("code");
        this.refs.departmentDdl.clickNode(code);
        e.stopPropagation();
        return false;
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.props.onSelectNodeChanged(codeArray, nameArray, this.state.department_authority);
        //实际权限组
        var realCodes = this.getRealCodeArray(codeArray);
        if (this.props.onRealNodeChanged)
            this.props.onRealNodeChanged(realCodes, this.state.department_authority);
    }
    //反选，吧input的内容反映到结构中
    unSelectNode(codes) {
        this.refs.departmentDdl.unSelectNode(codes);
    }
    //初始化方法,油company初始化完成之后，或者company发生改变之后调用
    getData(companyId, successs) {
        this.refs.departmentDdl.getData(companyId, successs);
    }
    //工具方法，根据codes获取names
    getDepartmentNamesByCodes(codeArray) {
        return this.refs.departmentDdl.getDepartmentNamesByCodes(codeArray);
    }
    //工具方法，获取下级部门的codes列表
    getSubDepartments(codeArray) {
        return this.refs.departmentDdl.getSubDepartments(codeArray);
    }
    //工具方法，获取上级级部门的codes列表
    getSupDepartments(codeArray) {
        return this.refs.departmentDdl.getSupDepartments(codeArray);
    }
    onKbPress(e) {
        if (e.keyCode == 40) {//down
            this.refs.departmentDdl.onKeyDown();
        }
        if (e.keyCode == 38) {  //up
            this.refs.departmentDdl.onKeyUp();
        }
        if (e.keyCode == 13) {//enter
            this.refs.group_input.click();
            this.refs.departmentDdl.onKeyEnter(e);
        }
    }
    render() {
        return (
            <React.Fragment>
                <div className="ddl_input_con"
                    tag="open_department_ddl"
                    onClick={this.groupInputFocus.bind(this)}>
                    {this.props.codeArray.map(function (item, i) {
                        return (
                            <div className="ddl_item"
                                key={i}
                                name={this.props.nameArray[i]}
                                code={item}
                                tag="open_department_ddl">
                                <span className="ddl_text" tag="open_department_ddl">{this.props.nameArray[i]}</span>
                                <i className="iconfont icon-del"
                                    id={i}
                                    code={item}
                                    onClick={this.delNode.bind(this)}></i>
                            </div>)
                    }.bind(this))}
                    <input type="text"
                        name="group_input"
                        id="group_input"
                        ref="group_input"
                        tag="open_department_ddl"
                        onKeyDown={this.onKbPress.bind(this)}
                        className="ddl_input" />
                </div>
                {this.props.department_bar ?
                    <div className="department_bar">&nbsp;
                    {culture.authority_type}:
                    <span className={this.state.department_authority == "0" ? "department_bar_item current" : "department_bar_item"} index="0"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.only_current}</span>
                        <span className={this.state.department_authority == "1" ? "department_bar_item current" : "department_bar_item"} index="1"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.current_and_sub}</span>
                        <span className={this.state.department_authority == "2" ? "department_bar_item current" : "department_bar_item"} index="2"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.current_and_sup}</span>
                    </div> : null}
                <DepartmentDropDownList
                    ref="departmentDdl"
                    departmentShow={this.props.departmentShow}
                    getDepartmentNamesByCodes={this.getDepartmentNamesByCodes.bind(this)}
                    onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}

                />
            </React.Fragment>
        )
    }
}
////////////////////////////////////////////////////
//////////////////UserDropDownList/////////////////////
///////////////////////////////////////////////////
class UserDropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            pageEnd: false,
            selectedUsers: []
        }
        this.companyId = "";
        this.pageIndex = 1;
        this.pageSize = 15;
        this.filter = "";

    }
    onInput() {
        this.setState({ users: [], pageEnd: false });
    }
    //由外部调用
    getData(companyId) {
        if (this.companyId == "") {
            this.companyId = companyId;
        } else {
            if (this.companyId !== companyId) {
                this.companyId = companyId;
                this.pageIndex = 1;
                this.filter = "";
                this.setState({ users: [], pageEnd: false, selectedUsers: [] })
            }
        }
        var url = urls.user.getCompanyUsersUrl + "?company=" + companyId + "&pageIndex=" + this.pageIndex + "&pageSize=" + this.pageSize + "&filter=" + this.filter;
        this.getDataInternal(url);
    }
    getDataInternal(url) {
        http.get(url, function (data) {
            setKeyWord(data, this.filter);
            if (data.code == 0) {
                data.result.map(function (item, i) {
                    if (this.state.selectedUsers.indexOf(item.UserName.removeHTML()) > -1) item.Select = true;
                    this.state.users.push(item);
                }.bind(this))
                this.setState({ users: this.state.users });
                if (data.result.length < this.pageSize) {
                    this.state.pageEnd = true;
                    this.setState({ pageEnd: this.state.pageEnd })
                }
            }
        }.bind(this))
    }
    ddlClick(e) {
        if (e.target.className.toLowerCase() == "user_item_line") {
            var user = e.target.getAttribute("data-name");
            this.selectNode(user);
        }
        e.stopPropagation();
        return false;
    }
    selectNode(user) {
        var selected = false;
        for (var i = 0; i < this.state.selectedUsers.length; i++) {
            if (this.state.selectedUsers[i] == user) {
                selected = true;
                this.state.selectedUsers.splice(i, 1);
                break;
            }
        }
        if (!selected) {
            this.state.selectedUsers.push(user);
        }
        for (var i = 0; i < this.state.users.length; i++) {
            if (this.state.users[i].UserName.removeHTML() == user) {
                this.state.users[i].Select = !this.state.users[i].Select;
            }
        }
        this.setState({ users: this.state.users, selectedUsers: this.state.selectedUsers });
        this.props.onSelectUserChange(this.state.selectedUsers);
    }
    onScroll(e) {
        var target = e.target;
        var scrollHeight = target.scrollHeight;  //总高度
        var scrollTop = target.scrollTop;  //距离上边高度
        var divHeight = target.clientHeight;  //div总高度
        var scrollBottom = scrollHeight - scrollTop - divHeight;

        if (scrollBottom <= 0 && !this.state.pageEnd) {
            this.pageIndex = this.pageIndex + 1;
            this.getData(this.companyId);
        }
    }
    //小键盘的方向键向下
    onKeyDown() {
        if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
        var hasFocus = false;
        for (var i = 0; i < this.state.users.length; i++) {
            if (this.state.users[i].Focus) hasFocus = true;
        }
        if (hasFocus) {
            for (var i = 0; i < this.state.users.length; i++) {
                if (this.state.users[i].Focus == true) {
                    if (this.state.users[i + 1]) {
                        this.state.users[i].Focus = false;
                        this.state.users[i + 1].Focus = true;
                    }
                    break;
                }
            }
        } else {
            this.state.users[0].Focus = true;
        }
        this.setState({ users: this.state.users }, this.keyMoveAfter);
    }
    //小键盘的方向键向上
    onKeyUp() {
        if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
        for (var i = 0; i < this.state.users.length; i++) {
            if (this.state.users[i].Focus == true) {
                this.state.users[i].Focus = false;
                if (this.state.users[i - 1]) {
                    this.state.users[i - 1].Focus = true;
                } else {
                    this.state.users[0].Focus = true;
                }
                break;
            }
        }
        this.setState({ users: this.state.users }, this.keyMoveAfter);
    }
    keyMoveAfter(e) {
        var ddl_user_con = document.getElementsByClassName("ddl_user_con")[0];
        var con_height = ddl_user_con.offsetHeight;
        var ddl_users = ddl_user_con.getElementsByClassName("user_item_line");
        for (var i = 0; i < ddl_users.length; i++) {
            if (ddl_users[i].getAttribute("focus") == "true") {
                var virtualheight = ddl_users[i].offsetTop - ddl_user_con.scrollTop + ddl_users[i].clientHeight + 4;
                if (virtualheight >= ddl_user_con.clientHeight) {  //到底了
                    ddl_user_con.scrollTop = ddl_user_con.scrollTop + ddl_users[i].clientHeight + 2;
                }
                var virtualmargintop = ddl_users[i].offsetTop - ddl_user_con.scrollTop - 2;
                if (virtualmargintop <= 0) { //到顶了
                    ddl_user_con.scrollTop = ddl_user_con.scrollTop - ddl_users[i].clientHeight - 2;
                }
            }
        }
    }
    //
    onKeyEnter(e) {
        if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
        for (var i = 0; i < this.state.users.length; i++) {
            //if (this.state.users[i].Select == true) continue;
            if (this.state.users[i].Focus == true) {
                //this.state.users[i].Focus = false;
                //if (this.state.users[i + 1]) {
                //    this.state.users[i + 1].Focus = true;
                //}
                var user = this.state.users[i].UserName.removeHTML();
                this.selectNode(user);
                break;
            }
        }
    }
    render() {
        return (
            <div className="ddl ddl_user_con"
                style={{ display: this.props.userShow ? "block" : "none" }}
                onClick={this.ddlClick.bind(this)}
                onScroll={this.onScroll.bind(this)}
            >
                {this.state.users.map(function (item, i) {
                    var select = item.Select ? true : false;
                    var focus = item.Focus ? true : false;
                    return (<div className="user_item_line"
                        key={i}
                        select={select.toString()}
                        focus={focus.toString()}
                        dangerouslySetInnerHTML={{ __html: item.UserName }}
                        data-name={item.UserName.removeHTML()}></div>)
                })}
                {this.state.pageEnd ? <div className="page_end">{culture.end}</div> : null}

            </div>
        );
    }
}
class UserDropDownListWrap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",

        }
        this.companyId = null;
        this.timeInterval = null;
    }
    groupInputFocus(e) {
        this.refs.user_input.focus();
    }
    getData(companyId) {
        this.refs.userDdl.getData(companyId);
        this.companyId = companyId;
    }
    onSelectUserChange(users) {
        this.props.onSelectUserChange(users);
        this.refs.user_input.focus();
    }
    delNode(e) {
        var index = e.target.id;
        var users = this.props.userArray;
        var user = users[index];
        this.refs.userDdl.selectNode(user);
        e.stopPropagation();
        return false;
    }
    onUserInput(e) {
        if (this.timeInterval) window.clearInterval(this.timeInterval);
        var value = e.target.value;
        this.setState({ inputValue: value });
        this.timeInterval = window.setTimeout(function () {
            this.refs.userDdl.pageIndex = 1;
            this.refs.userDdl.filter = value;
            this.refs.userDdl.onInput();
            this.refs.userDdl.getData(this.companyId, value);
        }.bind(this), 200);
    }
    onKbPress(e) {
        if (e.keyCode == 40) {//down
            this.refs.userDdl.onKeyDown();
        }
        if (e.keyCode == 38) {  //up
            this.refs.userDdl.onKeyUp();
        }
        if (e.keyCode == 13) {//enter
            this.refs.user_input.click();
            this.refs.userDdl.onKeyEnter(e);
        }
    }
    render() {
        return (
            <React.Fragment>
                <div className="ddl_input_con ddl_user"
                    tag="open_user_ddl"
                    onClick={this.groupInputFocus.bind(this)}>
                    {this.props.userArray.map(function (item, i) {
                        return (
                            <div className="ddl_item"
                                key={i}
                                code={item}
                                tag="open_user_ddl">
                                <span className="ddl_text" tag="open_user_ddl">{item}</span>
                                <i className="iconfont icon-del" id={i} onClick={this.delNode.bind(this)}></i>
                            </div>)
                    }.bind(this))}
                    <input type="text"
                        name="user_input"
                        id="user_input"
                        ref="user_input"
                        tag="open_user_ddl"
                        value={this.state.inputValue}
                        onKeyDown={this.onKbPress.bind(this)}
                        onChange={this.onUserInput.bind(this)}
                        className="ddl_input" />
                </div>
                <UserDropDownList ref="userDdl"
                    userShow={this.props.userShow}
                    onSelectUserChange={this.onSelectUserChange.bind(this)} />
            </React.Fragment>
        )
    }
}