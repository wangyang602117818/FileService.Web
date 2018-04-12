class TasksData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table table_task">
                <thead>
                    <tr>
                        <th width="15%">FileId</th>
                        <th width="24%">FileName</th>
                        <th width="8%">Handler</th>
                        <th width="9%">State</th>
                        <th width="6%">Percent</th>
                        <th width="15%">CreateTime</th>
                        <th width="15%">CompletedTime</th>
                        <th width="4%">View</th>
                        <th width="4%">ReDo</th>
                    </tr>
                </thead>
                <TaskList data={this.props.data} getData={this.props.getData} onNameClick={this.props.onNameClick} />
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
                        <td colSpan='10'>... no data ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <TaskItem task={item} key={i} getData={that.props.getData} onNameClick={that.props.onNameClick} />
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
                    onClick={this.props.onNameClick}
                    id={this.props.task._id.$oid}><b>{this.props.task.FileId.$oid}</b></td>
                <td title={this.props.task.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.task.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.FileName.getFileName(10) }}></span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.task.HandlerId }}></td>
                <td title={this.props.task.Output.Flag} >
                    <span className={"state " + this.props.task.StateDesc.removeHTML()}></span>
                    {'\u00A0'}
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.StateDesc }}></span>
                </td>
                <td>{this.props.task.Percent}%</td>
                <td>{parseBsonTime(this.props.task.CreateTime)}</td>
                <td>{parseBsonTime(this.props.task.CompletedTime)}</td>
                <td>
                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                        id={"id=" + this.props.task.FileId.$oid + "&filetype=" + this.props.task.Type.removeHTML() + "&filename=" + this.props.task.FileName.removeHTML() + "#" + this.props.task.Output._id.$oid}></i>
                </td>
                <td>
                    {this.props.task.State == 2 || this.props.task.State == 4 || this.props.task.State==-1 ?
                        <i className="iconfont icon-redo" onClick={this.redo.bind(this)}
                            id={"id=" + this.props.task._id.$oid + "&type=" + this.props.task.Type}></i> :
                        null}
                </td>
            </tr>
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
    onNameClick(e) {
        var that = this;
        var id = e.target.id || e.target.parentElement.id;
        var name = "";
        if (e.target.nodeName.toLowerCase() == "b") {
            name = e.target.parentElement.nextElementSibling.title;
        } else {
            name = e.target.nextElementSibling.title;
        }
        this.setState({ taskShow: true, taskToggle: true, updateFileName: name }, function () {
            that.refs.update_task.getTaskById(id);
        });
    }
    updateImage(obj) {
        var that = this;
        http.post(urls.tasks.updateImageUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    updateVideo(obj) {
        var that = this;
        http.post(urls.tasks.updateVideoUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    updateAttachment(obj) {
        var that = this;
        http.post(urls.tasks.updateAttachmentUrl, obj, function (data) {
            if (data.code == 0) { that.getData(); that.setState({ taskShow: false }) } else { alert(data.message); }
        });
    }
    render() {
        return (
            <div className="main">
                <h1>Tasks</h1>
                <TitleArrow title="All Tasks" show={this.state.pageShow}
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
                    onNameClick={this.onNameClick.bind(this)} />
                {this.state.taskShow ?
                    <TitleArrow title={"Update Task (" + this.state.updateFileName + ")"}
                        show={this.state.taskToggle}
                        onShowChange={this.onTaskShow.bind(this)} /> : null}
                {this.state.taskShow ?
                    <TasksUpdate show={this.state.taskToggle} ref="update_task"
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
