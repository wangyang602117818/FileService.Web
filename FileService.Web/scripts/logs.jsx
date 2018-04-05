class LogData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{width:"80%"}}>
                <thead>
                    <tr>
                        <td width="15%">AppName</td>
                        <td width="25%">FileId/TaskId</td>
                        <td width="18%">Content</td>
                        <td width="10%">User</td>
                        <td width="12%">Ip</td>
                        <td width="20%">CreateTime</td>
                    </tr>
                </thead>
                <LogList data={this.props.data} />
            </table>
        );
    }
}
class LogList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var that = this;
        if (this.props.data.length == 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan='10'>... no data ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <LogItem log={item} key={i} />
                        )
                    })}
                </tbody>
            );
        }
    }
}
class LogItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.AppName }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.FileId }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.Content }}></td>
                <td>{this.props.log.UserName}</td>
                <td>{this.props.log.UserIp}</td>
                <td>{parseBsonTime(this.props.log.CreateTime)}</td>
            </tr>
        )
    }
}
class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: eval(localStorage.log) ? true : false,
            pageIndex: 1,
            pageSize: localStorage.log_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.log.getUrl;
        this.storagePageShowKey = "log";
        this.storagePageSizeKey = "log_pageSize";
    }
    render() {
        return (
            <div className="main">
                <h1>Logs</h1>
                <TitleArrow title="All Logs" show={this.state.pageShow}
                            count={this.state.data.count}
                            onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                            pageIndex={this.state.pageIndex}
                            pageSize={this.state.pageSize}
                            pageCount={this.state.pageCount}
                            filter={this.state.filter}
                            onInput={this.onInput.bind(this)}
                            onKeyPress={this.onKeyPress.bind(this)}
                            lastPage={this.lastPage.bind(this)}
                            nextPage={this.nextPage.bind(this)} />
                <LogData data={this.state.data.result} show={this.state.pageShow} />
            </div>
        );
    }
}
for (var item in CommonUsePagination) Logs.prototype[item] = CommonUsePagination[item];
