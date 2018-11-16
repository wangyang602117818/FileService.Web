class ApplicationData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <td width="19%">{culture.id}</td>
                        <th width="13%">{culture.applicationName}</th>
                        <th width="13%">{culture.auth_code}</th>
                        <th width="8%">{culture.action}</th>
                        <th width="16%">{culture.image_convert}</th>
                        <th width="16%">{culture.video_convert}</th>
                        <th width="15%">{culture.createTime}</th>
                    </tr>
                </thead>
                <ApplicationList data={this.props.data}
                    onIdClick={this.props.onIdClick}
                    deleteItem={this.props.deleteItem} />
            </table>
        );
    }
}
class ApplicationList extends React.Component {
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
                            <ApplicationItem application={item} key={i}
                                onIdClick={this.props.onIdClick}
                                deleteItem={that.props.deleteItem} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class ApplicationItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td>
                    <b className="link"
                        id={this.props.application._id.$oid.removeHTML()}
                        onClick={this.props.onIdClick}
                        dangerouslySetInnerHTML={{ __html: this.props.application._id.$oid }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.application.ApplicationName }}></td>
                <td>{this.props.application.AuthCode}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.application.Action }}></td>
                <td>
                    {
                        this.props.application.ThumbnailsDisplay.map(function (item, i) {
                            delete item._id;
                            return (
                                <span className="convert_flag"
                                    title={JSON.stringify(item)} key={i} id={i}>
                                    <span className="flag_txt">{item.flag || item.Flag}</span>
                                </span>
                            );
                        }.bind(this))
                    }
                </td>
                <td>
                    {
                        this.props.application.VideosDisplay.map(function (item, i) {
                            delete item._id;
                            return (
                                <span className="convert_flag"
                                    title={JSON.stringify(item)} key={i} id={i}>
                                    <span className="flag_txt">{item.flag || item.Flag}</span>
                                </span>
                            );
                        }.bind(this))
                    }
                </td>
                <td>{parseBsonTime(this.props.application.CreateTime)}</td>
            </tr>
        )
    }
}
class DeleteApplication extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ border: "0" }}>
                    <tbody>
                        <tr>
                            <td style={{ border: "0" }}>
                                <input type="button"
                                    value={culture.delete}
                                    className="button"
                                    onClick={this.props.deleteItem.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class Application extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.application) localStorage.application = true;
        this.state = {
            pageShow: eval(localStorage.application) ? true : false,
            applicationShow: eval(localStorage.application_add) ? true : false,
            deleteShow: false,
            deleteToggle: true,
            deleteName: "",
            deleteId: "",
            updateShow: false,
            updateToggle: true,
            pageIndex: 1,
            pageSize: localStorage.application_pageSize || 10,
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.application.getUrl;
        this.storagePageShowKey = "application";
        this.storagePageSizeKey = "application_pageSize";
    }
    onApplicationShow() {
        if (this.state.applicationShow) {
            this.setState({ applicationShow: false });
            localStorage.application_add = false;
        } else {
            this.setState({ applicationShow: true });
            localStorage.application_add = true;
        }
    }
    addApplication(obj, success) {
        var that = this;
        http.postJson(urls.application.addUrl, obj, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        });
    }
    updateApplication(obj, success) {
        obj.id = this.state.deleteId;
        http.postJson(urls.application.updateUrl, obj, function (data) {
            if (data.code == 0) {
                this.getData();
                this.setState({ deleteShow: false, updateShow: false });
            }
            success(data);
        }.bind(this))
    }
    deleteItem(e) {
        var id = this.state.deleteId;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.application.deleteUrl + "/" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                    that.setState({ deleteShow: false, updateShow: false });
                }
                else {
                    alert(data.message);
                }
            });
        }
    }
    onIdClick(e) {
        var id = e.target.id || e.target.parentElement.id;
        http.get(urls.application.getapplicationUrl + "?id=" + id, function (data) {
            if (data.code == 0) {
                this.setState({
                    deleteShow: true,
                    updateShow: true,
                    deleteId: data.result._id.$oid,
                    deleteName: data.result.ApplicationName
                }, function () {
                    this.refs.updateApplication.onIdClick(data.result.ApplicationName,
                        data.result.AuthCode,
                        data.result.Action,
                        data.result.Thumbnails || [],
                        data.result.ThumbnailsDisplay || [],
                        data.result.Videos || [],
                        data.result.VideosDisplay || []
                    );
                }.bind(this));
            }
        }.bind(this));
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.application}</h1>
                <ConfigToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.application}
                    show={this.state.pageShow}
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
                <ApplicationData data={this.state.data.result}
                    onIdClick={this.onIdClick.bind(this)}
                />
                <TitleArrow title={culture.add + culture.application}
                    show={this.state.applicationShow}
                    onShowChange={this.onApplicationShow.bind(this)} />
                <AddApplication show={this.state.applicationShow}
                    ref="addApplication"
                    addApplication={this.addApplication.bind(this)}
                />
                {this.state.updateShow ?
                    <TitleArrow
                        title={culture.update + culture.application + "(" + this.state.deleteName + ")"}
                        show={this.state.updateToggle}
                        onShowChange={e => this.setState({ updateToggle: !this.state.updateToggle })} /> : null}
                {this.state.updateShow ?
                    <UpdateApplication show={this.state.updateToggle}
                        ref="updateApplication"
                        updateApplication={this.updateApplication.bind(this)} /> : null}
                {this.state.deleteShow ?
                    <TitleArrow
                        title={culture.delete + culture.application + "(" + this.state.deleteName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={e => { this.setState({ deleteToggle: !this.state.deleteToggle }) }} /> : null}
                {this.state.deleteShow ?
                    <DeleteApplication
                        show={this.state.deleteToggle}
                        deleteItem={this.deleteItem.bind(this)} /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Application.prototype[item] = CommonUsePagination[item];