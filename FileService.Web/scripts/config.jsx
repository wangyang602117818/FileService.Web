class ConfigData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table" style={{ width: "35%" }}>
                <thead>
                    <tr>
                        <th width="30%">Extension</th>
                        <th width="30%">Type</th>
                        <th width="20%">Action</th>
                        <th width="20%">Del</th>
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
                        <td colSpan='10'>... no data ...</td>
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
                <td><i className="iconfont icon-del" onClick={this.props.deleteItem} id={this.props.config.Extension}></i></td>
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
                <div className={this.props.section == "application" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange}>Application</div>
                <div className={this.props.section == "config" ? "config_info select" : "config_info"} onClick={this.props.onSectionChange}>Config</div>
            </div>
        )
    }
}
class Config extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.config) localStorage.config = true;
        this.state = {
            pageShow: eval(localStorage.config) ? true : false,
            configShow: eval(localStorage.config_add) ? true : false,
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
        var id = e.target.id;
        if (window.confirm(" Delete ?")) {
            var that = this;
            http.get(urls.config.deleteUrl + "?extension=" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                }
                else {
                    alert(data.message);
                }
            });
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
    }
    render() {
        return (
            <div className="main">
                <h1>Config</h1>
                <ConfigToolBar section={this.props.section} onSectionChange={this.props.onSectionChange} />
                <TitleArrow title="All Configs"
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
                    onExtensionClick={this.onExtensionClick.bind(this)}
                    deleteItem={this.deleteItem.bind(this)} />
                <TitleArrow title="Update Config"
                    show={this.state.configShow}
                    onShowChange={this.onConfigShow.bind(this)} />
                <AddConfig show={this.state.configShow} addConfig={this.addConfig.bind(this)} ref="addconfig" />
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
        var value = e.target.innerText.toLowerCase();
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
