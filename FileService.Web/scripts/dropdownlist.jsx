class CompanyDropDownList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <select name="companyDDl"
                value={this.props.default}
                onChange={this.props.onChange.bind(this)}>
                {this.props.data.map(function (item, i) {
                    return <option value={item.code} key={i}>{item.name}</option>
                }.bind(this))}
            </select>
        );
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
class DepartmentDropDownListWrap extends React.Component {
    constructor(props) {
        super(props);
    }
    groupInputFocus(e) {
        this.refs.group_input.focus();
    }
    getDepartmentNameByCode(code) {
        for (var i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].DepartmentCode == code) return this.props.data[i].DepartmentName;
        }
    }
    getRealCodeArray(codes, authority) {
        switch (authority) {
            case "0":
                return codes;
            case "1":
                return this.getSubDepartments(codes);
            case "2":
                return this.getSupDepartments(codes);
        }
    }
    getAbsoluteLayer(code) {
        for (var i = 0; i < this.props.data.length; i++) {
            if (code == this.props.data[i].DepartmentCode)
                return {
                    LayerAbsolute: this.props.data[i].LayerAbsolute,
                    Layer: this.props.data[i].Layer
                };
        }
    }
    getSubDepartmentSingle(absoluteLayer) {
        var codes = [];
        var regex = new RegExp("^" + absoluteLayer + ".+");
        for (var i = 0; i < this.props.data.length; i++) {
            if (regex.test(this.props.data[i].LayerAbsolute)) {
                codes.push(this.props.data[i].DepartmentCode);
            }
        }
        return codes;
    }
    getSupDepartmentSingle(absoluteLayer, layer) {//*
        var codes = [];
        for (var i = 0; i < this.props.data.length; i++) {
            var regex = new RegExp("^" + this.props.data[i].LayerAbsolute + ".+");
            if (regex.test(absoluteLayer) && this.props.data[i].Layer < layer) {
                codes.push(this.props.data[i].DepartmentCode);
            }
        }
        return codes;
    }
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
    onKbPress(e) {
        if (e.keyCode == 40) {//down
            this.onKeyDown();
        }
        if (e.keyCode == 38) {  //up
            this.onKeyUp();
        }
        if (e.keyCode == 13) {//enter
            this.groupInputFocus();
            this.onKeyEnter(e);
        }
        if (e.keyCode == 8) {  //backspace
            this.onKeyDelete(e);
        }
    }
    //小键盘的方向键向下
    onKeyDown() {
        //if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        var hasFocus = false;
        for (var i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].Focus) hasFocus = true;
        }
        if (hasFocus) {
            for (var i = 0; i < this.props.data.length; i++) {
                if (this.props.data[i].Focus == true) {
                    if (this.props.data[i + 1]) {
                        this.props.data[i].Focus = false;
                        this.props.data[i + 1].Focus = true;
                    }
                    break;
                }
            }
        } else {
            this.props.data[0].Focus = true;
        }
        this.props.dataChanged(this.props.data);
        this.keyMoveAfter();
        //this.setState({ departments: this.props.data }, this.keyMoveAfter);
    }
    //小键盘的方向键向上
    onKeyUp() {
        //if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        for (var i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].Focus == true) {
                this.props.data[i].Focus = false;
                if (this.props.data[i - 1]) {
                    this.props.data[i - 1].Focus = true;
                } else {
                    this.props.data[0].Focus = true;
                }
                break;
            }
        }
        this.props.dataChanged(this.props.data);
        this.keyMoveAfter();
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
        //if (document.getElementsByClassName("ddl_department_con")[0].style.display == "none") return;
        for (var i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].Focus == true) {
                var department = this.props.data[i].DepartmentCode;
                this.clickNode(department);
                break;
            }
        }
    }
    onKeyDelete(e) {
        var code = this.props.default[this.props.default.length - 1];
        var index = e.target.selectionStart;
        if (code && index == 0) {
            this.clickNode(code);
        }
    }
    departmentAuthorityChange(e) {
        var id = e.target.getAttribute("index");
        //实际权限组
        var realCodes = this.getRealCodeArray(this.props.default, id);
        if (this.props.onRealNodeChanged) {
            this.props.onRealNodeChanged(realCodes);
        }
        this.props.departmentAuthorityChange(id);
    }
    deleteItem(e) {
        var code = e.target.getAttribute("code");
        this.clickNode(code);
        e.stopPropagation();
        return false;
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
            for (var i = 0; i < this.props.data.length; i++) {
                if (this.props.data[i].LayerAbsolute == absoluteLayer) {  //当前点击的行
                    this.props.data[i].VirtualCollapse = !this.props.data[i].VirtualCollapse;
                    virtualCollapse = this.props.data[i].VirtualCollapse;
                }
                //当前点击行的子节点
                if (regex.test(this.props.data[i].LayerAbsolute)) {
                    //保证折叠内部的折叠不会随父节点一起打开
                    if (collapseLayer && new RegExp("^" + collapseLayer + ".+").test(this.props.data[i].LayerAbsolute)) {
                        continue;
                    }
                    if (virtualCollapse == true) {  //折叠
                        this.props.data[i].Collapse = true;
                    } else {  //展开
                        //遇到当前的dept是折叠的
                        if (this.props.data[i].VirtualCollapse == true) {
                            collapseLayer = this.props.data[i].LayerAbsolute;
                        } else {
                            collapseLayer = null;
                        }
                        this.props.data[i].Collapse = false;
                    }
                }
            }
            this.props.dataChanged(this.props.data);
        }
        if (e.target.nodeName.toLowerCase() == "div" && e.target.className == "node") {
            this.clickNode(code);
        }
        e.stopPropagation();
    }
    clickNode(code) {
        var departmentCodes = [];
        var departmentNames = [];
        for (var i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].DepartmentCode == code) {
                this.props.data[i].Select = !this.props.data[i].Select;
            }
            if (this.props.data[i].Select) {
                departmentCodes.push(this.props.data[i].DepartmentCode);
                departmentNames.push(this.props.data[i].DepartmentName);
            }
        }
        this.props.dataChanged(this.props.data);
        this.selectNode(departmentCodes, departmentNames);
    }
    selectNode(codes, names) {
        this.props.onSelectNodeChanged(codes, names);
        var realCodes = this.getRealCodeArray(codes, this.props.department_authority);
        if (this.props.onRealNodeChanged) {
            this.props.onRealNodeChanged(realCodes);
        }
    }
    render() {
        return (
            <React.Fragment>
                <div className="ddl_input_con"
                    tag="open_department_ddl"
                    onClick={this.groupInputFocus.bind(this)}>
                    {this.props.default.map(function (item, i) {
                        var name = this.getDepartmentNameByCode(item);
                        return (
                            <div className="ddl_item"
                                key={i}
                                name={name}
                                code={item}
                                tag="open_department_ddl">
                                <span className="ddl_text" tag="open_department_ddl">{name}</span>
                                <i className="iconfont icon-del"
                                    id={i}
                                    code={item}
                                    onClick={this.deleteItem.bind(this)}></i>
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
                    <span className={this.props.department_authority == "0" ? "department_bar_item current" : "department_bar_item"} index="0"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.only_current}</span>
                        <span className={this.props.department_authority == "1" ? "department_bar_item current" : "department_bar_item"} index="1"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.current_and_sub}</span>
                        <span className={this.props.department_authority == "2" ? "department_bar_item current" : "department_bar_item"} index="2"
                            onClick={this.departmentAuthorityChange.bind(this)}>{culture.current_and_sup}</span>
                    </div> : null}
                <DepartmentDropDownList
                    ref="departmentDdl"
                    data={this.props.data}
                    ddlClick={this.ddlClick.bind(this)}
                />
            </React.Fragment>
        )
    }
}
class DepartmentDropDownList extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var ddl_department_con = $(".ddl_department_con");
        ddl_department_con.width(ddl_department_con.width() + 24);
    }
    render() {
        return (
            <div className="ddl ddl_department_con"
                style={{ display: "none" }}
                onClick={this.props.ddlClick.bind(this)}>
                {this.props.data.map(function (item, i) {
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
////////////////////////////////////////////////////
//////////////////UserDropDownList/////////////////////
///////////////////////////////////////////////////
class UserDropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            pageEnd: false,
            //selectedUsers: this.props.selectedUsers || []
        }
        this.companyCode = "";
        this.pageIndex = 1;
        this.pageSize = 15;
        this.filter = "";

    }
    onInput() {
        this.setState({ users: [], pageEnd: false });
    }
    //由外部调用
    getData(companyCode) {
        if (this.companyCode == "") {
            this.companyCode = companyCode;
        } else {
            if (this.companyCode !== companyCode) {
                this.companyCode = companyCode;
                this.pageIndex = 1;
                this.filter = "";
                this.setState({ users: [], pageEnd: false })
            }
        }
        var url = urls.user.getCompanyUsersUrl + "?company=" + companyCode + "&pageIndex=" + this.pageIndex + "&pageSize=" + this.pageSize + "&filter=" + this.filter;
        this.getDataInternal(url);
    }
    getDataInternal(url) {
        http.get(url, function (data) {
            setKeyWord(data, this.filter);
            if (data.code == 0) {
                data.result.map(function (item, i) {
                    if (this.props.userArray.indexOf(item.UserName.removeHTML()) > -1) item.Select = true;
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
        for (var i = 0; i < this.props.userArray.length; i++) {
            if (this.props.userArray[i] == user) {
                selected = true;
                this.props.userArray.splice(i, 1);
                break;
            }
        }
        if (!selected) {
            this.props.userArray.push(user);
        }
        for (var i = 0; i < this.state.users.length; i++) {
            if (this.state.users[i].UserName.removeHTML() == user) {
                this.state.users[i].Select = !this.state.users[i].Select;
            }
        }
        this.setState({ users: this.state.users });
        this.props.onSelectUserChange(this.props.userArray);
    }
    onScroll(e) {
        var target = e.target;
        var scrollHeight = target.scrollHeight;  //总高度
        var scrollTop = target.scrollTop;  //距离上边高度
        var divHeight = target.clientHeight;  //div总高度
        var scrollBottom = scrollHeight - scrollTop - divHeight;

        if (scrollBottom <= 0 && !this.state.pageEnd) {
            this.pageIndex = this.pageIndex + 1;
            this.getData(this.companyCode);
        }
    }
    //小键盘的方向键向下
    onKeyDown() {
        //if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
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
        //if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
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
    onKeyEnter(e) {
        //if (document.getElementsByClassName("ddl_user_con")[0].style.display == "none") return;
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
    onKeyDelete(e) {
        var code = this.props.userArray[this.props.userArray.length - 1];
        var index = e.target.selectionStart;
        if (code && index == 0) {
            this.selectNode(code);
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
        this.companyCode = null;
        this.timeInterval = null;
    }
    emptyData() {
        this.refs.userDdl.onInput();
    }
    groupInputFocus(e) {
        this.refs.user_input.focus();
    }
    getData(companyCode) {
        this.refs.userDdl.getData(companyCode);
        this.companyCode = companyCode;
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
            this.refs.userDdl.getData(this.companyCode, value);
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
        if (e.keyCode == 8) {
            this.refs.userDdl.onKeyDelete(e);
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
                    userArray={this.props.userArray}
                    onSelectUserChange={this.onSelectUserChange.bind(this)} />
            </React.Fragment>
        )
    }
}