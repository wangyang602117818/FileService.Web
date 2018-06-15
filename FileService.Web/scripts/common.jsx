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
            DepartmentName: "",
            DepartmentCode: "",
            Department: []
        }
    }
    componentDidMount() {
        http.get(urls.department.getDepartmentUrl + "/" + this.props.id, function (data) {
            if (data.code == 0) {
                this.setState({ department: data.result });
            }
        }.bind(this));
    }
    render() {
        return (
            <div className="ddl">
                {this.state.DepartmentCode ?
                    <div className="ddl_line">
                        <DDLDataNodeDown departmentName={this.state.DepartmentName}
                            departmentCode={this.state.DepartmentCode} />
                    </div> : null
                }
                {this.state.Department.map()}
                <div className="ddl_line">
                    <DDLButtonTriple />
                    <DDLDataNodeDown />
                </div>
                <div className="ddl_line">
                    <DDLOrgDown />
                    <DDLOrgDownRight />
                    <DDLDataNode />
                </div>
                <div className="ddl_line">
                    <DDLOrgDown />
                    <DDLOrgHalfDownRight />
                    <DDLDataNode />
                </div>
                <div className="ddl_line">
                    <DDLOrgHalfDownRight />
                    <DDLDataNode />
                </div>
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
            <div className="ddl_line">

            </div>
        )
    }
}
class DDLDataNodeDown extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="node_main">
                    <div className="line_wrap v_wrap"></div>
                    <div className="node">Tip</div>
                    <div className="line_wrap v_wrap"><span className="v_line"></span></div>
                </div>
            </div>
        )
    }
}
class DDLDataNode extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="node_main">
                    <div className="line_wrap v_wrap"></div>
                    <div className="node">Tip</div>
                    <div className="line_wrap v_wrap"></div>
                </div>
            </div>
        )
    }
}
class DDLButtonTriple extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="line_wrap h_wrap_flex"></div>
                <div className="btn_wrap">
                    <div className="line_wrap v_wrap_flex">
                        <span className="v_line"></span>
                    </div>
                    <div className="btn">
                        <DDLSvgButtonMinus />
                    </div>
                    <div className="line_wrap v_wrap_flex">
                        <span className="v_line"></span>
                    </div>
                </div>
                <div className="line_wrap h_wrap_flex">
                    <div className="h_line"></div>
                </div>
            </div>
        )
    }
}
class DDLOrgDown extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="line_wrap v_wrap_flex">
                    <span className="v_line"></span>
                </div>
            </div>
        )
    }
}
class DDLOrgDownRight extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="line_wrap h_wrap_flex"></div>
                <div className="btn_wrap_none">
                    <div className="line_wrap v_wrap_flex">
                        <span className="v_line"></span>
                    </div>
                </div>
                <div className="line_wrap h_wrap_flex">
                    <span className="h_line"></span>
                </div>
            </div>
        )
    }
}
class DDLOrgHalfDownRight extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="node_wrap">
                <div className="line_wrap h_wrap_flex"></div>
                <div className="btn_wrap_none">
                    <div className="line_wrap v_wrap_flex">
                        <span className="v_line"></span>
                    </div>
                    <div className="line_wrap v_wrap_flex">
                        <span className="v_line_trans"></span>
                    </div>
                </div>
                <div className="line_wrap h_wrap_flex">
                    <div className="h_line"></div>
                </div>
            </div>
        )
    }
}
class DDLSvgButtonMinus extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 12C236.31 12 12 236.3 12 512s224.31 500 500 500 500-224.3 500-500S787.69 12 512 12z m0 944.44C266.94 956.44 67.56 757.06 67.56 512S266.94 67.56 512 67.56 956.44 266.94 956.44 512 757.06 956.44 512 956.44z"></path><path d="M762 484.22H262a27.78 27.78 0 0 0 0 55.56h500a27.78 27.78 0 0 0 0-55.56z"></path></svg>
        )
    }
}
class DDLSvgButtonAdd extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 0C229.68 0 0 229.68 0 512s229.68 512 512 512 512-229.68 512-512S794.32 0 512 0z m0 967.11C261.06 967.11 56.89 762.94 56.89 512S261.06 56.89 512 56.89 967.11 261.06 967.11 512 762.94 967.11 512 967.11z"></path><path d="M768 483.56H540.44V256a28.44 28.44 0 1 0-56.89 0v227.56H256a28.44 28.44 0 1 0 0 56.89h227.56V768a28.44 28.44 0 1 0 56.89 0V540.44H768a28.44 28.44 0 0 0 0-56.89z" p-id="1591"></path></svg>
        )
    }
}
ReactDOM.render(
    <DropDownList id="5b0e18c6c4180813fc692aa3" />,
    document.getElementById('index')
);