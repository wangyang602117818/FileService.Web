class ExtensionData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="20%">{culture.id}</th>
                        <th width="8%">{culture.extension}</th>
                        <th width="8%">{culture.type}</th>
                        <th width="24%">{culture.contentType}</th>
                        <th width="8%">{culture.action}</th>
                        <th width="14%">{culture.description}</th>
                        <th width="18%">{culture.createTime}</th>
                    </tr>
                </thead>
                <ExtensionList data={this.props.data}
                    onIdClick={this.props.onIdClick}
                    deleteItem={this.props.deleteItem} />
            </table>
        );
    }
}
class ExtensionList extends React.Component {
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
                            <ExtensionItem extension={item} key={i}
                                onIdClick={this.props.onIdClick}
                                deleteItem={that.props.deleteItem} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class ExtensionItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td>
                    <b className="link"
                        onClick={this.props.onIdClick}
                        id={this.props.extension._id.$oid.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.extension._id.$oid }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.extension.Extension }}>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.extension.Type }}></td>
                <td title={this.props.extension.ContentType}>{this.props.extension.ContentType.getFileName(20)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.extension.Action }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.extension.Description }}></td>
                <td>{parseBsonTime(this.props.extension.CreateTime)}</td>
            </tr>
        )
    }
}
class DeleteExtension extends React.Component {
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
                                    onClick={this.props.deleteExtension.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class Extension extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.extension ? eval(localStorage.extension) : true,
            extensionShow: localStorage.extension_add ? eval(localStorage.extension_add) : true,
            deleteShow: false,
            deleteToggle: true,
            deleteName: "",
            deleteId: "",
            updateShow: false,
            updateToggle: true,
            pageIndex: 1,
            pageSize: localStorage.extension_pageSize || 10,
            pageCount: 1,
            filter: "",
            startTime: "",
            endTime: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.extension.getUrl;
        this.storagePageShowKey = "extension";
        this.storagePageSizeKey = "extension_pageSize";
    }
    onExtensionShow() {
        if (this.state.extensionShow) {
            this.setState({ extensionShow: false });
            localStorage.extension_add = false;
        } else {
            this.setState({ extensionShow: true });
            localStorage.extension_add = true;
        }
    }
    addExtension(obj, success) {
        var that = this;
        http.postJson(urls.extension.addExtensionUrl, obj, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        });
    }
    updateExtension(obj, success) {
        obj.id = this.state.deleteId;
        http.postJson(urls.extension.updateExtensionUrl, obj, function (data) {
            if (data.code == 0) {
                this.getData();
                this.setState({ deleteShow: false, updateShow: false });
            }
            success(data);
        }.bind(this));
    }
    deleteItem(e) {
        var id = this.state.deleteId;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.extension.deleteUrl + "/" + id, function (data) {
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
        var id = e.target.id;
        if (e.target.nodeName.toLowerCase() == "span") id = e.target.parentElement.id;
        http.get(urls.extension.getExtensionUrl + "/" + id, function (data) {
            if (data.code == 0) {
                this.setState({
                    deleteShow: true,
                    updateShow: true,
                    deleteId: data.result._id.$oid,
                    deleteName: data.result.Extension
                }, function () {
                    this.refs.updateextension.onIdClick(data.result.Extension,
                        data.result.Type,
                        data.result.ContentType,
                        data.result.Description || "",
                        data.result.Action);
                }.bind(this));
            }
        }.bind(this));
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.extension}</h1>
                <ConfigToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.extension}
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
                <ExtensionData data={this.state.data.result}
                    onIdClick={this.onIdClick.bind(this)} />
                <TitleArrow title={culture.add + culture.extension}
                    show={this.state.extensionShow}
                    onShowChange={this.onExtensionShow.bind(this)} />
                <AddExtension
                    show={this.state.extensionShow}
                    addExtension={this.addExtension.bind(this)}
                    ref="addextension" />
                {this.state.updateShow ?
                    <TitleArrow title={culture.update + culture.extension + "(" + this.state.deleteName + ")"}
                        show={this.state.updateToggle}
                        onShowChange={e => this.setState({ updateToggle: !this.state.updateToggle })} /> : null
                }
                {this.state.updateShow ?
                    <UpdateExtension
                        show={this.state.updateToggle}
                        updateExtension={this.updateExtension.bind(this)}
                        ref="updateextension" /> : null
                }
                {this.state.deleteShow ?
                    <TitleArrow
                        title={culture.delete + culture.extension + "(" + this.state.deleteName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={e => this.setState({ deleteToggle: !this.state.deleteToggle })} /> : null}
                {this.state.deleteShow ?
                    <DeleteExtension
                        show={this.state.deleteToggle}
                        deleteExtension={this.deleteItem.bind(this)} /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Extension.prototype[item] = CommonUsePagination[item];

class ConfigToolBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="config_toolbar">
                <div className={this.props.section == "application" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="application">{culture.application}</div>
                <div className={this.props.section == "extension" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="extension">{culture.extension}</div>
            </div>
        )
    }
}
class ConfigContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            section: localStorage.storageExtensionSection || "extension"
        }
    }
    onSectionChange(e) {
        var value = e.target.id.toLowerCase();
        localStorage.storageExtensionSection = value;
        this.setState({ section: value });
    }
    onRefreshChange(value) {
        this.refs.config.onRefreshChange(value);
    }
    render() {
        if (this.state.section == "extension") {
            return <Extension ref="config"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        } else {
            return <Application ref="config"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        }
    }
}
