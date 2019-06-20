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
                <td title={culture.empty_task_count}><i className="iconfont icon-empty" onClick={this.props.empty} id={this.props.handler.HandlerId}></i></td>
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
                            <th width="10%">{culture.handler}</th>
                            <th width="10%">{culture.type}</th>
                            <th width="10%">{culture.cacheFiles}</th>
                            <th width="25%">{culture.api}</th>
                            <th width="40%">{culture.path}</th>
                            <th width="5%" title={culture.empty_cache_file}>{culture.empty}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.props.handlerId}</td>
                            <td>{this.props.type}</td>
                            <td>{this.props.cacheFiles}</td>
                            <td>{this.props.api}</td>
                            <td>{this.props.path}</td>
                            <td title={culture.empty_cache_file}><i className="iconfont icon-empty" onClick={this.props.emptyCacheFile} ></i></td>
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
            type: "",
            path: "",
            cacheFiles: "",
            machineShow: false,
            machineToggle: true,
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            rightTips: culture.empty_cache_file,
            rightTipsDisabled: false,
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.handlers.getUrl;
        this.storagePageShowKey = "handler";
        this.storagePageSizeKey = "handler_pageSize";
    }
    empty(e) {
        var handlerId = e.target.id;
        var that = this;
        if (window.confirm(culture.empty_task_count + "?")) {
            http.get(urls.emptyTaskCountUrl + "?handlerId=" + handlerId, function (data) {
                if (data.code == 0) {
                    that.getData();
                } else {
                    alert(data.message);
                }
            });
        }
    }
    emptyCacheFile(e) {
        if (window.confirm(culture.empty_cache_file + "?")) {
            http.get(urls.handlers.deleteHandlerCacheFilesUrl + "?handlerId=" + this.state.handlerId, function (data) {
                if (data.code == 0) {
                    this.getCacheData(
                        this.state.handlerId,
                        this.state.machine,
                        this.state.api,
                        this.state.path,
                        this.state.type);
                }
            }.bind(this));
        }
    }
    onIdClick(e) {
        var handlerId = e.target.dataset.handlerid || e.target.parentElement.dataset.handlerid;
        var machine = e.target.dataset.machine || e.target.parentElement.dataset.machine;
        var api = e.target.dataset.api || e.target.parentElement.dataset.api;
        var path = e.target.dataset.path || e.target.parentElement.dataset.path;
        var type = e.target.dataset.type || e.target.parentElement.dataset.type;
        this.getCacheData(handlerId, machine, api, path, type);
    }
    getCacheData(handlerId, machine, api, path, type) {
        http.get(urls.handlers.getCacheFilesUrl + "?handlerId=" + handlerId, function (data) {
            if (data.code == 0) {
                this.setState({
                    machineShow: true,
                    handlerId: handlerId,
                    machine: machine,
                    type: type,
                    api: api,
                    path: path,
                    cacheFiles: data.result
                });
            }
        }.bind(this));
    }
    onRightTipsClick(e) {
        if (this.state.rightTipsDisabled == true) return;
        if (window.confirm(" " + culture.empty_cache_file + " ?")) {
            this.setState({ rightTipsDisabled: true, rightTips: culture.deleting + "..." });
            http.get(urls.handlers.deleteAllCacheFilesUrl, function (data) {
                if (data.code == 0) {
                    this.getData();
                    this.setState({ rightTips: culture.delete + culture.file + "(" + data.result + ")" });
                    setTimeout(() => {
                        this.setState({
                            rightTipsDisabled: false,
                            rightTips: culture.empty_cache_file
                        })
                    }, 2000);
                } else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.handlers}</h1>
                <TitleArrow title={culture.all + culture.handlers} show={this.state.pageShow}
                    rightTips={this.state.rightTips}
                    rightTipsClick={this.onRightTipsClick.bind(this)}
                    rightTipsDisabled={this.state.rightTipsDisabled}
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
                    <MonitorData show={this.state.machineToggle}
                        handlerId={this.state.handlerId}
                        type={this.state.type}
                        api={this.state.api}
                        path={this.state.path}
                        cacheFiles={this.state.cacheFiles}
                        emptyCacheFile={this.emptyCacheFile.bind(this)}
                    /> : null
                }

            </div>
        );
    }
}
for (var item in CommonUsePagination) Handlers.prototype[item] = CommonUsePagination[item];
//Object.assign(Handlers.prototype, CommonUsePagination);