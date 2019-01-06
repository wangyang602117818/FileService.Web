class TitleTxt extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title_arrow">
                <div className="title_inner">
                    {this.props.title}
                </div>
            </div>
        );
    }
}
class TitleTxtRecentMonth extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title_arrow">
                <div className="title_inner">
                    {this.props.title}
                </div>
                <div className="right_month">
                    <span id="1"
                        className={this.props.recentMonth == "1" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 1 {culture.month}</span>
                    <span id="3"
                        className={this.props.recentMonth == "3" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 3 {culture.month}</span>
                    <span id="6"
                        className={this.props.recentMonth == "6" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 6 {culture.month}</span>
                    <span id="12"
                        className={this.props.recentMonth == "12" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 1 {culture.year}</span>
                    <span id="24"
                        className={this.props.recentMonth == "24" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 2 {culture.year}</span>
                    <span id="36"
                        className={this.props.recentMonth == "36" ? "current" : ""}
                        onClick={this.props.onRecentMonthChange.bind(this)}>{culture.last} 3 {culture.year}</span>
                </div>
            </div>
        );
    }
}
class TitleTxtRightTips extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title_arrow">
                <div className="title_inner">
                    {this.props.title}
                </div>
                <div className="right_tips_grid">
                    <span >{culture.handlers}:{this.props.handlers}</span>
                    <span >{culture.tasks}:{this.props.tasks}</span>
                    <span >{culture.resources}:{this.props.resourcesImage + this.props.resourcesVideo + this.props.resourcesAttachment}</span>
                    <span >{culture.downloads}:{this.props.downloads}</span>
                </div>
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
                <div className="right_tips"
                    disabled={this.props.rightTipsDisabled}
                    dangerouslySetInnerHTML={{ __html: this.props.rightTips }}
                    onClick={this.props.rightTipsClick}></div>
            </div>
        );
    }
}
class TitleArrowComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orderDisp: false
        }
    }
    orderNone(e) {
        this.setState({ orderDisp: false });
    }
    onOrderDisp(e) {
        this.setState({ orderDisp: true });
    }
    render() {
        return (
            <div className="title_arrow">
                <span className="title_txt" onClick={this.props.onShowChange}>
                    <i className={this.props.show ? "iconfont icon-down" : "iconfont icon-right"}></i>{this.props.title} {this.props.count > 0 ? "(" + this.props.count + ")" : ""}
                </span>
                <div className="right_component" onMouseLeave={this.orderNone.bind(this)}>
                    <div className="order_list"
                        style={{ display: this.state.orderDisp ? "inline-block" : "none" }}
                        onClick={this.props.onOrderChanged}>
                        <span order="FileName">{culture.fileName} {this.props.orderField == "FileName" ? "✔" : ""}</span>
                        <span order="Length">{culture.size} {this.props.orderField == "Length" ? "✔" : ""}</span>
                        {this.props.type == "file" ?
                            <span order="CreateTime">{culture.createTime} {this.props.orderField == "CreateTime" ? "✔" : ""}</span> :
                            <span order="DeleteTime">{culture.deleteTime} {this.props.orderField == "DeleteTime" ? "✔" : ""}</span>
                        }
                    </div>
                    <div className={this.props.fileType == "" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="">{culture.all}</div>

                    <div className={this.props.fileType == "video" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="video">{culture.video}</div>

                    <div className={this.props.fileType == "image" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="image">{culture.image}</div>

                    <div className={this.props.fileType == "audio" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="audio">{culture.audio}</div>

                    <div className={this.props.fileType == "office" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="office">{culture.office}</div>

                    <div className={this.props.fileType == "pdf" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="pdf">{culture.pdf}</div>

                    <div className={this.props.fileType == "text" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="text">{culture.text}</div>

                    <div className={this.props.fileType == "attachment" ? "filter_item current" : "filter_item"}
                        onClick={this.props.onFilterClick} id="attachment">{culture.attachment}</div>

                    {this.props.type == "file" ?
                        <i className="iconfont icon-download" title={this.props.type == "file" ? culture.download : culture.permanent_del}
                            onClick={this.props.downloadByIds}
                            style={{ display: this.props.delShow ? "inline-block" : "none" }} /> : null
                    }
                    {this.props.type == "file_recycle" ?
                        <i className="iconfont icon-restore"
                            onClick={this.props.restoreFiles}
                            style={{ display: this.props.delShow ? "inline-block" : "none" }}></i> : null
                    }
                    <i className="iconfont icon-del" title={culture.delete}
                        onClick={this.props.removeByIds}
                        style={{ display: this.props.delShow ? "inline-block" : "none" }} />
                    {this.props.listType == "list" ?
                        <i className='iconfont icon-listicon'
                            id='resource_list'
                            onMouseEnter={this.onOrderDisp.bind(this)}
                            onClick={this.props.onTipsClick.bind(this)}></i> :
                        <i className='iconfont icon-list'
                            id='resource_icon'
                            onMouseEnter={this.onOrderDisp.bind(this)}
                            onClick={this.props.onTipsClick.bind(this)}></i>}
                </div>
            </div>
        );
    }
}
class Pagination extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        datepicker();
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
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    {culture.from1}:{'\u00A0'}
                    <input type="text" className="datepicker" size="15"
                        name="starttime"
                        value={this.props.startTime}
                        date-lang={current_culture.toLocaleLowerCase()}
                        onChange={this.props.onInput}
                        onFocus={this.props.onInput}
                        onKeyPress={this.props.onKeyPress}
                        title={culture.createTime} />
                    {'\u00A0'}{'\u00A0'}{culture.to}:
                    <input type="text" className="datepicker" size="15"
                        name="endtime"
                        value={this.props.endTime}
                        date-lang={current_culture.toLocaleLowerCase()}
                        onChange={this.props.onInput}
                        onFocus={this.props.onInput}
                        onKeyPress={this.props.onKeyPress}
                        title={culture.createTime} />

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
        var url = this.url + "?pageindex=" + this.state.pageIndex + "&pagesize=" + this.state.pageSize + "&filter=" + this.state.filter + "&startTime=" + this.state.startTime + "&endTime=" + this.state.endTime;
        if (this.state.resourceFileType && this.state.resourceFileType.length > 0) url = url + "&fileType=" + this.state.resourceFileType;
        if (this.state.orderField) url = url + "&orderField=" + this.state.orderField;
        if (this.state.orderFieldType) url = url + "&orderFieldType=" + this.state.orderFieldType;
        http.get(url, function (result) {
            setKeyWord(result, that.state.filter);
            that.setState({ data: result, pageCount: Math.ceil(result.count / that.state.pageSize) || 1 });
        });
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
        if (e.target.name == "starttime") this.setState({ startTime: value || "" });
        if (e.target.name == "endtime") this.setState({ endTime: value || "" });
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
