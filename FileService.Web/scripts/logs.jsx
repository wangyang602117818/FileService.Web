class LogData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <td width="15%">{culture.id}</td>
                        <td width="10%">{culture.from}</td>
                        <td width="18%">{culture.fileId}/{culture.taskId}</td>
                        <td width="12%">{culture.content}</td>
                        <td width="9%">{culture.user}</td>
                        <td width="10%">Ip</td>
                        <td width="10%">{culture.user_agent}</td>
                        <td width="16%">{culture.createTime}</td>
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
                <td dangerouslySetInnerHTML={{ __html: this.props.log._id.$oid }}
                ></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.From }}
                    id={this.props.log.From.removeHTML()}>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.FileId }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.log.Content }}></td>
                <td>{this.props.log.UserName}</td>
                <td>{this.props.log.UserIp}</td>
                <td>{getAgent(this.props.UserAgent)}</td>
                <td>{parseBsonTime(this.props.log.CreateTime)}</td>
                
            </tr>
        )
    }
}
class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.log ? eval(localStorage.log) : true,
            pageIndex: 1,
            pageSize: localStorage.log_pageSize || 15,
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
                <h1>{culture.logs}</h1>
                <TitleArrow title={culture.all + culture.logs} show={this.state.pageShow}
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
