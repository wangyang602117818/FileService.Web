class ConfigData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{ width: "50%" }}>
                <thead>
                    <tr>
                        <th width="20%">{culture.extension}</th>
                        <th width="20%">{culture.type}</th>
                        <th width="20%">{culture.action}</th>
                        <th width="40%">{culture.createTime}</th>
                    </tr>
                </thead>
                <ConfigList data={this.props.data}
                    onExtensionClick={this.props.onExtensionClick}
                    deleteItem={this.props.deleteItem} />
            </table>
        );
    }
}
class ConfigList extends React.Component {
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
                            <ConfigItem config={item} key={i}
                                onExtensionClick={this.props.onExtensionClick}
                                deleteItem={that.props.deleteItem} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class ConfigItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td className="link" onClick={this.props.onExtensionClick}><b dangerouslySetInnerHTML={{ __html: this.props.config.Extension }}></b></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.config.Type }}></td>
                <td dangerouslySetInnerHTML={{ __html: this.props.config.Action }}></td>
                <td>{parseBsonTime(this.props.config.CreateTime)}</td>
            </tr>
        )
    }
}
class ConfigToolBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="config_toolbar">
                <div className={this.props.section == "application" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="application">{culture.application}</div>
                <div className={this.props.section == "config" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange} id="config">{culture.config}</div>
            </div>
        )
    }
}
class DeleteConfig extends React.Component {
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
                                    onClick={this.props.deleteConfig.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class Config extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.config ? eval(localStorage.config) : true,
            configShow: localStorage.config_add ? eval(localStorage.config_add) : true,
            deleteShow: false,
            deleteToggle: false,
            deleteName: "",
            pageIndex: 1,
            pageSize: localStorage.config_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.config.getUrl;
        this.storagePageShowKey = "config";
        this.storagePageSizeKey = "config_pageSize";
    }
    onConfigShow() {
        if (this.state.configShow) {
            this.setState({ configShow: false });
            localStorage.config_add = false;
        } else {
            this.setState({ configShow: true });
            localStorage.config_add = true;
        }
    }
    addConfig(obj, success) {
        var that = this;
        http.post(urls.config.updateUrl, obj, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        });
    }
    deleteItem(e) {
        var id = this.state.deleteName;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.config.deleteUrl + "?extension=" + id, function (data) {
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
    onExtensionClick(e) {
        var extension = e.target.innerText;
        var type = "";
        var action = "";
        if (e.target.nodeName.toLowerCase() == "b") {
            type = e.target.parentElement.nextElementSibling.innerText;
            action = e.target.parentElement.nextElementSibling.nextElementSibling.innerText;
        } else if (e.target.nodeName.toLowerCase() == "span") {
            extension = e.target.parentElement.innerText;
            type = e.target.parentElement.parentElement.nextElementSibling.innerText;
            action = e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.innerText;
        } else {
            type = e.target.nextElementSibling.innerText;
            action = e.target.nextElementSibling.nextElementSibling.innerText;
        }
        this.refs.addconfig.onExtensionClick(extension, type, action);
        this.setState({ deleteShow: true, deleteName: extension });
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.config}</h1>
                <ConfigToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.config}
                    show={this.state.configShow}
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
                <ConfigData data={this.state.data.result}
                    onExtensionClick={this.onExtensionClick.bind(this)} />
                <TitleArrow title={culture.update + culture.config}
                    show={this.state.configShow}
                    onShowChange={this.onConfigShow.bind(this)} />
                <AddConfig
                    show={this.state.configShow}
                    addConfig={this.addConfig.bind(this)}
                    ref="addconfig" />
                {this.state.deleteShow ?
                    <TitleArrow
                        title={culture.delete + culture.config + "(" + this.state.deleteName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={this.onDeleteShow.bind(this)} /> : null}
                {this.state.deleteShow ?
                    <DeleteConfig
                        show={this.state.deleteToggle}
                        deleteConfig={this.deleteItem.bind(this)} /> : null}
            </div>
        );
    }
}
for (var item in CommonUsePagination) Config.prototype[item] = CommonUsePagination[item];

class ConfigContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            section: "config"
        }
    }
    onSectionChange(e) {
        var value = e.target.id.toLowerCase();
        this.setState({ section: value });
    }
    onRefreshChange(value) {
        this.refs.config.onRefreshChange(value);
    }
    render() {
        if (this.state.section == "config") {
            return <Config ref="config"
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
