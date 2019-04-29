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
                        <th width="12%">{culture.machineName}</th>
                        <th width="10%">{culture.state}</th>
                        <td width="10%">{culture.type}</td>
                        <th width="8%">{culture.total_task_count}</th>
                        <th width="15%">{culture.startTime}</th>
                        <th width="15%">{culture.endTime}</th>
                        <th width="15%">{culture.createTime}</th>
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
                        data-handlerid={this.props.handler.HandlerId.removeHTML()}
                        data-machine={this.props.handler.MachineName}
                        data-api={this.props.handler.SaveFileApi}
                        data-type={this.props.handler.SaveFileType}
                        data-path={this.props.handler.SaveFilePath}
                        onClick={this.props.onIdClick}
                        dangerouslySetInnerHTML={{ __html: this.props.handler.HandlerId }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.handler.MachineName }}></td>
                <td>
                    <span className={"state " + convertHandlerState(this.props.handler.State)}></span>{'\u00A0'}
                    {convertHandlerState(this.props.handler.State)}
                </td>
                <td>{this.props.handler.SaveFileType}</td>
                <td>{this.props.handler.Total}</td>
                <td title={parseBsonTime(this.props.handler.StartTime)}>{parseBsonTimeNoneSecond(this.props.handler.StartTime)}</td>
                <td title={parseBsonTime(this.props.handler.EndTime)}>{parseBsonTimeNoneSecond(this.props.handler.EndTime)}</td>
                <td title={parseBsonTime(this.props.handler.CreateTime)}>{parseBsonTimeNoneSecond(this.props.handler.CreateTime)}</td>
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
                            <th width="15%">{culture.handler}</th>
                            <th width="15%">{culture.type}</th>
                            <th width="35%">{culture.api}</th>
                            <th width="35%">{culture.path}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.props.handlerId}</td>
                            <td>{this.props.type}</td>
                            <td>{this.props.api}</td>
                            <td>{this.props.path}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
//class MonitorList extends React.Component {
//    constructor(props) {
//        super(props);
//    }
//    render() {
//        if (this.props.data.length == 0) {
//            return (
//                <tbody>
//                    <tr>
//                        <td colSpan='10'>... {culture.no_data} ...</td>
//                    </tr>
//                </tbody>
//            )
//        } else {
//            return (
//                <tbody>
//                    {this.props.data.map(function (item, i) {
//                        return (
//                            <tr key={i}>
//                                <td>{i + 1}</td>
//                                <td>{item.Machine}</td>
//                                <td>{parseBsonTime(item.MonitorTime)}</td>
//                                <td>{item.Message}</td>
//                            </tr>
//                        )
//                    }.bind(this))}
//                </tbody>
//            );
//        }
//    }
//}
class Handlers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.handler ? eval(localStorage.handler) : true,
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 10,
            handlerId: "",
            machine: "",
            api: "",
            type:"",
            path: "",
            machineShow: false,
            machineToggle: true,
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
        var handlerId = e.target.id;
        var that = this;
        if (window.confirm(" Empty ?")) {
            http.get(urls.emptyUrl + "?handlerId=" + handlerId, function (data) {
                if (data.code == 0) {
                    that.getData();
                } else {
                    alert(data.message);
                }
            });
        }
    }
    onIdClick(e) {
        var handlerId = e.target.dataset.handlerid || e.target.parentElement.dataset.handlerid;
        var machine = e.target.dataset.machine || e.target.parentElement.dataset.machine;
        var api = e.target.dataset.api || e.target.parentElement.dataset.api;
        var path = e.target.dataset.path || e.target.parentElement.dataset.path;
        var type = e.target.dataset.type || e.target.parentElement.dataset.type;
        this.setState({ machineShow: true, handlerId: handlerId, machine: machine, type: type, api: api, path: path });
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
                {this.state.machineShow ?
                    <TitleArrow title={culture.servers + culture.state + "(" + this.state.machine + ")"}
                        show={this.state.machineToggle}
                        onShowChange={e => { this.setState({ machineToggle: !this.state.machineToggle }) }} /> : null
                }
                {this.state.machineShow ?
                    <MonitorData show={this.state.machineToggle} handlerId={this.state.handlerId} type={this.state.type} api={this.state.api} path={this.state.path} /> : null
                }

            </div>
        );
    }
}
for (var item in CommonUsePagination) Handlers.prototype[item] = CommonUsePagination[item];
//Object.assign(Handlers.prototype, CommonUsePagination);