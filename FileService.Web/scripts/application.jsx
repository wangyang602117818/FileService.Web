﻿class ApplicationData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{ width: "45%" }}>
                <thead>
                    <tr>
                        <th width="40%">ApplicationName</th>
                        <th width="20%">Action</th>
                        <th width="40%">CreateTime</th>
                    </tr>
                </thead>
                <ApplicationList data={this.props.data}
                    onAppNameClick={this.props.onAppNameClick}
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
                        <td colSpan='10'>... no data ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <ApplicationItem application={item} key={i}
                                onAppNameClick={this.props.onAppNameClick}
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
                <td className="link" onClick={this.props.onAppNameClick}>
                    <b dangerouslySetInnerHTML={{ __html: this.props.application.ApplicationName }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.application.Action }}></td>
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
                                    value="Delete"
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
            deleteToggle: false,
            deleteName: "",
            pageIndex: 1,
            pageSize: localStorage.application_pageSize || 10,
            pageCount: 1,
            filter: "",
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
        http.post(urls.application.updateUrl, obj, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        });
    }
    deleteItem(e) {
        var id = this.state.deleteName;
        if (window.confirm(" Delete ?")) {
            var that = this;
            http.get(urls.application.deleteUrl + "?applicationName=" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                    that.setState({ deleteShow: false });
                }
                else {
                    alert(data.message);
                }
            });
        }
    }
    onDeleteShow(e) {
        if (this.state.deleteToggle) {
            this.setState({ deleteToggle: false });
        } else {
            this.setState({ deleteToggle: true });
        }
    }
    onAppNameClick(e) {
        var appName = e.target.innerText;
        var action = "";
        if (e.target.nodeName.toLowerCase() == "b") {
            action = e.target.parentElement.nextElementSibling.innerText;
        } else if (e.target.nodeName.toLowerCase() == "span") {
            appName = e.target.parentElement.innerText;
            action = e.target.parentElement.parentElement.nextElementSibling.innerText;
        } else {
            action = e.target.nextElementSibling.innerText;
        }
        this.refs.addApplication.onAppNameClick(appName, action);
        this.setState({ deleteShow: true, deleteName: appName });
    }
    render() {
        return (
            <div className="main">
                <h1>Application</h1>
                <ConfigToolBar section={this.props.section} onSectionChange={this.props.onSectionChange} />
                <TitleArrow title="All Applications"
                    show={this.state.applicationShow}
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
                <ApplicationData data={this.state.data.result}
                    onAppNameClick={this.onAppNameClick.bind(this)}
                    deleteItem={this.deleteItem.bind(this)} />
                <TitleArrow title="Update Application"
                    show={this.state.applicationShow}
                    onShowChange={this.onApplicationShow.bind(this)} />
                <AddApplication show={this.state.applicationShow} addApplication={this.addApplication.bind(this)} ref="addApplication" />
                {this.state.deleteShow ?
                    <TitleArrow
                        title={"Delete This Application(" + this.state.deleteName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={this.onDeleteShow.bind(this)} /> : null}
                {this.state.deleteShow ?
                    <DeleteApplication
                        show={this.state.deleteToggle}
                        deleteItem={this.deleteItem.bind(this)} /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Application.prototype[item] = CommonUsePagination[item];