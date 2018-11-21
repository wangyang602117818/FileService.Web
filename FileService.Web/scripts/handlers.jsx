class HandlerData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="10%">{culture.handlerId}</th>
                        <th width="15%">{culture.machineName}</th>
                        <th width="10%">{culture.total_task_count}</th>
                        <th width="10%">{culture.state}</th>
                        <th width="14%">{culture.monitorMachine}</th>
                        <th width="12%">{culture.startTime}</th>
                        <th width="12%">{culture.endTime}</th>
                        <th width="12%">{culture.createTime}</th>
                        <th width="5%">{culture.empty}</th>
                    </tr>
                </thead>
                <HandlerList data={this.props.data} empty={this.props.empty} onIdClick={this.props.onIdClick} />
            </table>
        );
    }
}
class HandlerList extends React.Component {
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
                            <HandlerItem handler={item} key={i} empty={that.props.empty} onIdClick={this.props.onIdClick} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class HandlerItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td>
                    <b className="link"
                        id={this.props.handler.HandlerId.removeHTML()}
                        onClick={this.props.onIdClick}
                        dangerouslySetInnerHTML={{ __html: this.props.handler.HandlerId }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.handler.MachineName }}></td>
                <td>{this.props.handler.Total}</td>
                <td>
                    <span className={"state " + convertHandlerState(this.props.handler.State)}></span>{'\u00A0'}
                    {convertHandlerState(this.props.handler.State)}
                </td>
                <td>
                    {this.props.handler.MonitorStateList.map(function (item, i) {
                        var className = "flag_txt";
                        if (item.Message != "success") className += " error";
                        return (
                            <span className="flag_table" key={i} title={getMachineNameByPath(item.MachinePath)}>
                                <span className={className}
                                    id={getMachineNameByPath(item.MachinePath)}>
                                    {getMachineNameByPath(item.MachinePath).substring(0, 4) + "..."}
                                </span>
                            </span>
                        )
                    })}
                </td>
                <td>{parseBsonTime(this.props.handler.StartTime)}</td>
                <td>{parseBsonTime(this.props.handler.EndTime)}</td>
                <td>{parseBsonTime(this.props.handler.CreateTime)}</td>
                <td><i className="iconfont icon-empty" onClick={this.props.empty} id={this.props.handler.HandlerId}></i></td>
            </tr>
        )
    }
}
class MonitorData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="5%">{culture.id}</th>
                            <th width="20%">{culture.monitorPath}</th>
                            <th width="15%">{culture.monitorTime}</th>
                            <th width="60%">{culture.monitorState}</th>
                        </tr>
                    </thead>
                    <MonitorList data={this.props.data} />
                </table>
            </div>
        )
    }
}
class MonitorList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
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
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{item.MachinePath}</td>
                                <td>{parseBsonTime(item.MonitorTime)}</td>
                                <td>{item.Message}</td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class Handlers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.handler ? eval(localStorage.handler) : true,
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 10,
            monitor: "",
            monitorShow: false,
            monitorToggle: true,
            monitorList: [],
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.handlers.getUrl;
        this.storagePageShowKey = "handler";
        this.storagePageSizeKey = "handler_pageSize";
    }
    empty(e) {
        var id = e.target.id;
        var that = this;
        if (window.confirm(" Empty ?")) {
            http.get(urls.emptyUrl + "?handlerId=" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                } else {
                    alert(data.message);
                }
            });
        }
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        for (var i = 0; i < this.state.data.result.length; i++) {
            if (this.state.data.result[i].HandlerId == id) {
                this.setState({ monitorShow: true, monitor: id, monitorList: this.state.data.result[i].MonitorStateList });
                break;
            }
        }
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.handlers}</h1>
                <TitleArrow title={culture.all + culture.handlers} show={this.state.pageShow}
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
                <HandlerData data={this.state.data.result}
                    empty={this.empty.bind(this)}
                    onIdClick={this.onIdClick.bind(this)} />
                {this.state.monitorShow ?
                    <TitleArrow title={culture.monitorList + "(" + this.state.monitor + ")"}
                        show={this.state.monitorToggle}
                        onShowChange={e => { this.setState({ monitorToggle: !this.state.monitorToggle }) }} /> : null
                }
                {this.state.monitorShow ?
                    <MonitorData show={this.state.monitorToggle} data={this.state.monitorList} /> : null
                }

            </div>
        );
    }
}
for (var item in CommonUsePagination) Handlers.prototype[item] = CommonUsePagination[item];
//Object.assign(Handlers.prototype, CommonUsePagination);