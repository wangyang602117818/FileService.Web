class HandlerData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table table_handler">
                <thead>
                    <tr>
                        <th width="10%">{culture.handlerId}</th>
                        <th width="20%">{culture.machineName}</th>
                        <th width="10%">{culture.total_task_count}</th>
                        <th width="10%">{culture.state}</th>
                        <th width="15%">{culture.startTime}</th>
                        <th width="15%">{culture.endTime}</th>
                        <th width="15%">{culture.createTime}</th>
                        <th width="5%">{culture.empty}</th>
                    </tr>
                </thead>
                <HandlerList data={this.props.data} empty={this.props.empty} />
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
                            <HandlerItem handler={item} key={i} empty={that.props.empty} />
                        )
                    })}
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
                <td dangerouslySetInnerHTML={{ __html: this.props.handler.HandlerId }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.handler.MachineName }}></td>
                <td>{this.props.handler.Total}</td>
                <td>
                    <span className={"state " + ConvertHandlerState(this.props.handler.State)}></span>{'\u00A0'}
                    {ConvertHandlerState(this.props.handler.State)}
                </td>
                <td>{parseBsonTime(this.props.handler.StartTime)}</td>
                <td>{parseBsonTime(this.props.handler.EndTime)}</td>
                <td>{parseBsonTime(this.props.handler.CreateTime)}</td>
                <td><i className="iconfont icon-empty" onClick={this.props.empty} id={this.props.handler.HandlerId}></i></td>
            </tr>
        )
    }
}
class Handlers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.handler ? eval(localStorage.handler) : true,
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 10,
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
                <HandlerData data={this.state.data.result} empty={this.empty.bind(this)} />
            </div>
        );
    }
}
for (var item in CommonUsePagination) Handlers.prototype[item] = CommonUsePagination[item];
//Object.assign(Handlers.prototype, CommonUsePagination);