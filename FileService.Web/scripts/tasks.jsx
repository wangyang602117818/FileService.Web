class TasksData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table table_task">
                <thead>
                    <tr>
                        <th width="15%">{culture.fileId}</th>
                        <th width="20%">{culture.fileName}</th>
                        <th width="6%">{culture.handler}</th>
                        <th width="9%">{culture.state}</th>
                        <th width="4%">{culture.percent}</th>
                        <td width="6%">{culture.process_count}</td>
                        <th width="14%">{culture.createTime}</th>
                        <th width="14%">{culture.completedTime}</th>
                        <th width="4%">{culture.type}</th>
                        <th width="4%">{culture.view}</th>
                        <th width="4%">{culture.reDo}</th>
                    </tr>
                </thead>
                <TaskList data={this.props.data} getData={this.props.getData} onIdClick={this.props.onIdClick} />
            </table>
        );
    }
}
class TaskList extends React.Component {
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
                            <TaskItem task={item} key={i} getData={that.props.getData} onIdClick={that.props.onIdClick} />
                        )
                    })}
                </tbody>
            );
        }
    }
}
class TaskItem extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    redo(e) {
        var that = this;
        var id = e.target.id;
        if (window.confirm(" ReDo ?")) {
            http.get(urls.redoUrl + "?" + id, function (data) {
                if (data.code == 0) {
                    that.props.getData();
                } else {
                    alert(data.message);
                }
            });
        }
    }
    render() {
        return (
            <tr>
                <td className="link"
                    onClick={this.props.onIdClick}
                    id={this.props.task._id.$oid.removeHTML()}
                    data-name={this.props.task.FileName.removeHTML()}>
                    <b
                        id={this.props.task._id.$oid.removeHTML()}
                        data-name={this.props.task.FileName.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.task.FileId.$oid }}
                    ></b>
                </td>
                <td title={this.props.task.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.task.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.FileName.getFileName(10) }}></span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.task.HandlerId }}></td>
                <td title={this.props.task.Output._id ? this.props.task.Output.Flag : ""} >
                    <span className={"state " + this.props.task.StateDesc.removeHTML()}></span>
                    {'\u00A0'}
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.StateDesc }}></span>
                </td>
                <td>{this.props.task.Percent}%</td>
                <td>{this.props.task.ProcessCount}</td>
                <td>{parseBsonTime(this.props.task.CreateTime)}</td>
                <td>{parseBsonTime(this.props.task.CompletedTime)}</td>
                <td>{this.props.task.Output._id ? "C" : "S"}</td>
                <td>
                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                        id={"id=" + this.props.task.FileId.$oid+ "&filename=" + this.props.task.FileName.removeHTML() + "#" + (this.props.task.Output._id ? this.props.task.Output._id.$oid : "")}></i>
                </td>
                <td>
                    {this.props.task.State == 2 || this.props.task.State == 4 || this.props.task.State == -1 ?
                        <i className="iconfont icon-redo" onClick={this.redo.bind(this)}
                            id={"id=" + this.props.task._id.$oid + "&type=" + this.props.task.Type}></i> :
                        null}
                </td>
            </tr >
        )
    }
}
class Tasks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.task ? eval(localStorage.task) : true,
            taskShow: false,
            taskToggle: false,
            updateFileName: "",
            pageIndex: 1,
            pageSize: localStorage.task_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] }
        };
        this.url = urls.tasks.getUrl;
        this.storagePageShowKey = "task";
        this.storagePageSizeKey = "task_pageSize";
    }
    onTaskShow() {
        if (this.state.taskToggle) {
            this.setState({ taskToggle: false });
        } else {
            this.setState({ taskToggle: true });
        }
    }
    onIdClick(e) {
        var that = this;
        var id = e.target.id || e.target.parentElement.id;
        var name = "";
        if (e.target.nodeName.toLowerCase() == "span") {
            name = e.target.parentElement.getAttribute("data-name");
        } else {
            name = e.target.getAttribute("data-name");
        }
        this.setState({ taskShow: true, taskToggle: true, updateFileName: name }, function () {
            that.refs.update_task.getTaskById(id);
        });
    }
    updateHandler(obj) {
        var that = this;
        http.postJson(urls.tasks.updateHandler, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    updateImage(obj) {
        var that = this;
        http.postJson(urls.tasks.updateImageUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    updateVideo(obj) {
        var that = this;
        http.postJson(urls.tasks.updateVideoUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    updateAttachment(obj) {
        var that = this;
        http.postJson(urls.tasks.updateAttachmentUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.tasks}</h1>
                <TitleArrow title={culture.all + culture.tasks} show={this.state.pageShow}
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
                <TasksData data={this.state.data.result}
                    getData={this.getData.bind(this)}
                    onIdClick={this.onIdClick.bind(this)} />
                {this.state.taskShow ?
                    <TitleArrow title={culture.update + culture.task + "(" + this.state.updateFileName + ")"}
                        show={this.state.taskToggle}
                        onShowChange={this.onTaskShow.bind(this)} /> : null}
                {this.state.taskShow ?
                    <TasksUpdate show={this.state.taskToggle} ref="update_task"
                        updateHandler={this.updateHandler.bind(this)}
                        updateImage={this.updateImage.bind(this)}
                        updateVideo={this.updateVideo.bind(this)}
                        updateAttachment={this.updateAttachment.bind(this)}
                    /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Tasks.prototype[item] = CommonUsePagination[item];
//Object.assign(Tasks.prototype, CommonUsePagination);
