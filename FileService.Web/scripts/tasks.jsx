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
                        <th width="8%">{culture.handler}</th>
                        <th width="8%">{culture.state}</th>
                        <th width="7%">{culture.percent}</th>
                        <td width="6%">{culture.process_count}</td>
                        <th width="14%">{culture.createTime}</th>
                        <th width="14%">{culture.completedTime}</th>
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
        var icon = this.props.task.FileExists ? "<i style='cursor:default;color:#484848' class=\"iconfont icon-c\"></i>" : "";
        return (
            <tr>
                <td>
                    <b className="link"
                        onClick={this.props.onIdClick}
                        id={this.props.task._id.$oid.removeHTML()}
                        data-name={this.props.task.FileName.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.task.FileId.$oid }}></b>
                </td>
                <td title={this.props.task.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.task.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.FileName.getFileName(10) }}
                        className="link"
                        onClick={this.preView.bind(this)}
                        id={"id=" + this.props.task.FileId.$oid + "&filename=" + this.props.task.FileName.removeHTML() + "#" + (this.props.task.Output._id ? this.props.task.Output._id.$oid : "")}></span>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.task.HandlerId + icon }}></td>
                <td title={this.props.task.Output._id ? this.props.task.Output.Flag : ""} >
                    <span className={"state " + this.props.task.StateDesc.removeHTML()}></span>
                    {'\u00A0'}
                    <span dangerouslySetInnerHTML={{ __html: this.props.task.StateDesc }}></span>
                </td>
                <td>{this.props.task.Percent}%</td>
                <td>{this.props.task.ProcessCount}</td>
                <td title={parseBsonTime(this.props.task.CreateTime)}>{parseBsonTimeNoneSecond(this.props.task.CreateTime)}</td>
                <td title={parseBsonTime(this.props.task.CompletedTime)}>{parseBsonTimeNoneSecond(this.props.task.CompletedTime)}</td>
                <td>
                    <i className="iconfont icon-view" onClick={this.preView.bind(this)}
                        id={"id=" + this.props.task.FileId.$oid + "&filename=" + this.props.task.FileName.removeHTML() + "#" + (this.props.task.Output._id ? this.props.task.Output._id.$oid : "")}></i>
                </td>
                <td>
                    {this.props.task.State == 2 || this.props.task.State == 4 || this.props.task.State == -100 ?
                        <i className="iconfont icon-redo" onClick={this.redo.bind(this)}
                            id={"id=" + this.props.task._id.$oid + "&type=" + this.props.task.Type}></i> :
                        null}
                </td>
            </tr >
        )
    }
}
class CacheFile extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <tbody>
                        <tr>
                            <td width="150px">{culture.cache_file_location}:</td>
                            <td width="">{this.props.cacheFullPath}</td>
                        </tr>
                        <tr>
                            <td>{culture.cache_file_status}:</td>
                            <td>{this.props.taskFileExists ? culture.exists : culture.deleted}</td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button" className="button" value={culture.empty_cache_file} disabled={!this.props.taskFileExists} onClick={this.props.deleteCacheFile} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
            cacheFileToggle: false,
            updateFileName: "",
            pageIndex: 1,
            pageSize: localStorage.task_pageSize || 10,
            pageCount: 1,
            from: localStorage.task_from || "",
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] },
            id: null,
            task: null,
            taskFileExists: false,
            cacheFullPath: "",
            state: localStorage.taskState || "",
            rightTips: culture.empty_cache_file,
            rightTipsDisabled: false
        };
        this.url = urls.tasks.getUrl;
        this.storagePageShowKey = "task";
        this.storagePageSizeKey = "task_pageSize";
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        var name = "";
        if (e.target.nodeName.toLowerCase() == "span") {
            name = e.target.parentElement.getAttribute("data-name");
        } else {
            name = e.target.getAttribute("data-name");
        }
        http.get(urls.tasks.getByIdUrl + "/" + id, function (data) {
            if (data.code == 0) {
                var fullPath = data.result.RelativePath;
                this.setState({
                    id: id,
                    task: data.result,
                    taskShow: true,
                    taskToggle: true,
                    cacheFileToggle: true,
                    updateFileName: name,
                    taskFileExists: data.result.FileExists,
                    cacheFullPath: fullPath
                }, function () {
                    this.refs.update_task.getTaskById(data.result);
                });
            }
        }.bind(this));
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
    deleteCacheFile() {
        if (window.confirm(" " + culture.empty_cache_file + " ?")) {
            if (this.state.id) {
                http.get(urls.tasks.deleteCacheFileUrl + "/" + this.state.id, function (data) {
                    if (data.code == 0) { this.getData(); this.setState({ taskShow: false }); } else { alert(data.message); }
                }.bind(this));
            }
        }
    }
    onRightTipsClick(e) {
        if (this.state.rightTipsDisabled == true) return;
        if (window.confirm(" " + culture.empty_cache_file + " ?")) {
            this.setState({ rightTipsDisabled: true, rightTips: culture.deleting + "..." });
            http.get(urls.tasks.deleteAllCacheFileUrl, function (data) {
                if (data.code == 0) {
                    this.getData();
                    this.setState({ rightTips: culture.delete + culture.file + "(" + data.count + ")" });
                    setTimeout(() => { this.setState({ rightTipsDisabled: false, rightTips: culture.empty_cache_file }) }, 2000);
                } else {
                    alert(data.message);
                }
            }.bind(this));
        }
    }
    onFromChange(e) {
        var from = e.target.value;
        this.setState({ from: from }, function () {
            localStorage.task_from = from;
            this.getData();
        }.bind(this));
    }
    onFilterClick(e) {
        var id = e.target.id;
        if (e.target.className.indexOf("current") != -1) return;
        this.setState({ state: id }, function () {
            localStorage.taskState = id;
            this.getData();
        }.bind(this));
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.tasks}</h1>
                <TitleArrow title={culture.all + culture.tasks}
                    type="task"
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    rightTips={this.state.rightTips}
                    rightTipsClick={this.onRightTipsClick.bind(this)}
                    rightTipsDisabled={this.state.rightTipsDisabled}
                    state={this.state.state}
                    onFilterClick={this.onFilterClick.bind(this)}
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
                    from={this.state.from}
                    onFromChange={this.onFromChange.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                <TasksData data={this.state.data.result}
                    getData={this.getData.bind(this)}
                    onIdClick={this.onIdClick.bind(this)} />
                {this.state.taskShow ?
                    <TitleArrow title={culture.update + culture.task + "(" + this.state.updateFileName + ")"}
                        show={this.state.taskToggle}
                        onShowChange={(e) => { this.setState({ taskToggle: !this.state.taskToggle }) }} /> : null}
                {this.state.taskShow ?
                    <TasksUpdate show={this.state.taskToggle} ref="update_task"
                        updateHandler={this.updateHandler.bind(this)}
                        updateImage={this.updateImage.bind(this)}
                        updateVideo={this.updateVideo.bind(this)}
                        updateAttachment={this.updateAttachment.bind(this)}
                    /> : null}
                {this.state.taskShow ?
                    <TitleArrow title={culture.cache_file + "(" + this.state.updateFileName + ")"}
                        show={this.state.cacheFileToggle}
                        onShowChange={(e) => { this.setState({ cacheFileToggle: !this.state.cacheFileToggle }) }} /> : null}
                {this.state.taskShow ?
                    <CacheFile show={this.state.cacheFileToggle}
                        taskFileExists={this.state.taskFileExists}
                        cacheFullPath={this.state.cacheFullPath}
                        deleteCacheFile={this.deleteCacheFile.bind(this)}
                    /> : null
                }
            </div>
        );
    }
}
for (var item in CommonUsePagination) Tasks.prototype[item] = CommonUsePagination[item];
//Object.assign(Tasks.prototype, CommonUsePagination);
