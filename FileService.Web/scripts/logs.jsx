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
                        <td width="18%">{culture.fileId}/{culture.taskId}/{culture.id}</td>
                        <td width="12%">{culture.content}</td>
                        <td width="6%">{culture.user}</td>
                        <td width="8%">Api</td>
                        <td width="8%">Ip</td>
                        <td width="7%">{culture.user_agent}</td>
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
                <td>{this.props.log.ApiType||""}</td>
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
            startTime: "",
            endTime: "",
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
                <LogToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.logs} show={this.state.pageShow}
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
                <LogData data={this.state.data.result} show={this.state.pageShow} />
            </div>
        );
    }
}
for (var item in CommonUsePagination) Logs.prototype[item] = CommonUsePagination[item];

class LogToolBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="config_toolbar">
                <div className={this.props.section == "recycle" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="recycle">{culture.recycle_bin}</div>
                <div className={this.props.section == "log" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="log">{culture.log}</div>
            </div>
        )
    }
}
class LogContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            section: localStorage.storageLogSection || "log"
        }
    }
    onSectionChange(e) {
        var value = e.target.id.toLowerCase();
        localStorage.storageLogSection = value;
        this.setState({ section: value });
    }
    onRefreshChange(value) {
        this.refs.log.onRefreshChange(value);
    }
    render() {
        if (this.state.section == "log") {
            return <Logs ref="log"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        } else {
            return <FileRecycle ref="log"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        }
    }
}