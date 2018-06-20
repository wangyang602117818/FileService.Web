class TitleTxt extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title_inner">
                {this.props.title}
            </div>
        );
    }
}
class TitleArrow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title_arrow">
                <span className="title_txt" onClick={this.props.onShowChange}>
                    <i className={this.props.show ? "iconfont icon-down" : "iconfont icon-right"}></i>{this.props.title} {this.props.count > 0 ? "(" + this.props.count + ")" : ""}
                </span>
            </div>
        );
    }
}
class Pagination extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "pagenation show" : "pagenation hidden"}>
                <div className="page">
                    {culture.page}:
                    {'\u00A0'}
                    <input type="text" name="pageIndex" value={this.props.pageIndex} maxLength="4"
                        className="pageIndex"
                        onChange={this.props.onInput}
                        onKeyPress={this.props.onKeyPress} />
                    {" " + culture.of}{'\u00A0'}
                    {this.props.pageCount}
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}
                    <i className="iconfont icon-last" title={culture.last_page} onClick={this.props.lastPage}></i>
                    {'\u00A0'}
                    <i className="iconfont icon-next" title={culture.next_page} onClick={this.props.nextPage}></i>

                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    {culture.filter}:
                    <input type="text" name="filter"
                        size="25"
                        value={this.props.filter}
                        className="filter"
                        onChange={this.props.onInput}
                        onKeyPress={this.props.onKeyPress} />
                </div>
                <div className="size">
                    {culture.page_size_up} :
                    <input type="text" name="pageSize" value={this.props.pageSize} className="pageSize" maxLength="3"
                        onChange={this.props.onInput}
                        onKeyPress={this.props.onKeyPress} />
                </div>
            </div>
        );
    }
}
var CommonUsePagination = {
    componentDidMount() {
        this.getData();
        this.getDataInterval(this.props.refresh);
    },
    componentWillUnmount() {
        window.clearInterval(this.interval);
    },
    onRefreshChange(value) {
        window.clearInterval(this.interval);
        this.getDataInterval(value);
    },
    getDataInterval(value) {
        var numb = parseInt(value);
        if (numb > 0) {
            this.interval = window.setInterval(this.getData.bind(this), numb * 1000);
        } else {
            window.clearInterval(this.interval);
        }
    },
    getData() {
        localStorage.update_time = getCurrentDateTime();
        var that = this;
        var url = this.url + "?pageindex=" + this.state.pageIndex + "&pagesize=" + this.state.pageSize + "&filter=" + this.state.filter;
        http.get(url, function (result) {
            that.setKeyWord(result);
            that.setState({ data: result, pageCount: Math.ceil(result.count / that.state.pageSize) || 1 });
        });
    },
    setKeyWord(result) {
        if (result.result && result.result.length > 0 && this.state.filter) {
            for (var i = 0; i < result.result.length; i++) {
                var doc = result.result[i];
                for (var k = 0; k < keywords.length; k++) {
                    var keyword = keywords[k];
                    if (keyword.indexOf(".") > -1) {
                        var keywordArray = keyword.split(".");
                        if (doc[keywordArray[0]] && doc[keywordArray[0]][keywordArray[1]]) {
                            doc[keywordArray[0]][keywordArray[1]] = doc[keywordArray[0]][keywordArray[1]].replace(new RegExp("" + trim(this.state.filter) + "", "ig"), this.matchKeyWord);
                        }
                    } else {
                        if (doc[keyword] && typeof doc[keyword] == "string") {
                            doc[keyword] = doc[keyword].replace(new RegExp("" + trim(this.state.filter) + "", "ig"), this.matchKeyWord);
                        }
                    }
                }
            }
        }
    },
    matchKeyWord(word) {
        return '<span class="search_word">' + word + '</span>';
    },
    onPageShow(e) {
        if (this.state.pageShow) {
            this.setState({ pageShow: false });
            localStorage.setItem(this.storagePageShowKey, false);
        } else {
            this.setState({ pageShow: true });
            localStorage.setItem(this.storagePageShowKey, true);
        }
    },
    onInput(e) {   //键盘输入事件
        var value = e.target.value;
        if (e.target.name == "pageIndex" || e.target.name == "pageSize") {
            var numb = parseInt(value);
            if (!numb) numb = "";
            if (e.target.name == "pageIndex") this.setState({ pageIndex: numb });
            if (e.target.name == "pageSize") {
                this.setState({ pageSize: numb });
            }
        }
        if (e.target.name == "filter") this.setState({ filter: value });
    },
    onKeyPress(e) {  //过滤栏所有的enter事件
        if (e.key.toLowerCase() == "enter") {
            if (this.state.pageIndex > this.state.pageCount) {
                this.state.pageIndex = this.state.pageCount;
            }
            if (e.target.name == "filter") this.state.pageIndex = 1;
            if (e.target.name == "pageSize") {
                localStorage.setItem(this.storagePageSizeKey, e.target.value);
                this.state.pageIndex = 1;
            }
            this.getData();
        }
    },
    lastPage(e) {
        if (this.state.pageIndex <= 1) return;
        this.state.pageIndex--;
        this.getData();
    },
    nextPage(e) {
        if (this.state.pageIndex >= this.state.pageCount) return;
        this.state.pageIndex++;
        this.getData();
    }
}
////////////////////////////////////////////////////
//////////////////DropDownList/////////////////////
///////////////////////////////////////////////////

class DropDownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topLayerCount: 0,
            DepartmentName: "",
            DepartmentCode: "",
            Department: []
        }
    }
    groupChecked(name, code) {

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
            this.dataNodeIterate(this.state.Department, name, code, 1, "select");
            this.setState({ Department: this.state.Department });
        }
    }
    dataNodeIterate(departments, name, code, layer, type, clickLayer) {
        for (var i = 0; i < departments.length; i++) {
            if (clickLayer) {
                if (layer > clickLayer) {
                    if (type == "i") departments[i].Collapse = !departments[i].Collapse;  //用于判断是否隐藏
                    if (type == "select") departments[i].Select = !departments[i].Select;  //用于判断是否选中
                } else {
                    clickLayer = null;
                }
            }
            if (departments[i].DepartmentCode == code) {
                if (type == "i") {
                    //departments[i].Collapse = !departments[i].Collapse;  //用于判断是否隐藏
                    departments[i].virtualCollapse = !departments[i].virtualCollapse; //用于修改页面
                }
                if (type == "select") {
                    departments[i].Select = !departments[i].Select;
                }
                clickLayer = layer;
            }
            this.dataNodeIterate(departments[i].Department, name, code, layer + 1, type, clickLayer);
        }
    }
    componentDidMount() {
        http.get(urls.department.getDepartmentUrl + "/" + this.props.id, function (data) {
            if (data.code == 0) {
                this.setState({
                    topLayerCount: data.result.Department.length,
                    DepartmentName: data.result.DepartmentName,
                    DepartmentCode: data.result.DepartmentCode,
                    Department: data.result.Department
                });
            }
        }.bind(this));
    }
    render() {
        return (
            <div className="ddl" onClick={this.ddlClick.bind(this)}>
                {this.state.DepartmentCode ?
                    <div className="ddl_line"
                        layer={0}>
                        <div className="node_wrap">
                            <div className="node_main">
                                <div className="line_wrap v_wrap"></div>
                                <div className="node"
                                    node-name={this.state.DepartmentName}
                                    node-code={this.state.DepartmentCode}
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
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' > ' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"><span class="v_line"></span></div></div ></div>';
                } else {
                    html += '<div class="node_wrap"><div class="node_main"><div class="line_wrap v_wrap"></div><div class="node" node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' >' + this.props.department.DepartmentName + '</div><div class="line_wrap v_wrap"></div></div></div>';
                }
            } else if (layer - 1 == i) { //倒数第二个
                if (this.props.subCount > 0) {
                    html += '<div class="node_wrap_btn"><div class="line_wrap h_wrap_flex"></div><div class="btn_wrap"><div class="line_wrap v_wrap_flex"><span class="v_line"></span></div><div class="btn"><i class="' + fonttype+'" node-name=' + this.props.department.DepartmentName + ' node-code=' + this.props.department.DepartmentCode + ' layer-absolute=' + this.props.layerAbsolute + '></i></div><div class="line_wrap v_wrap_flex">';
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
                down-hide={this.props.downLineHide.toString()}
                dangerouslySetInnerHTML={{ __html: html }}>


            </div>
        )
    }
}


ReactDOM.render(
    <DropDownList id="5b0e18c6c4180813fc692aa3" />,
    document.getElementById('index')
);