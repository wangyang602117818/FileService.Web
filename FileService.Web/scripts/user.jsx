class UserData extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {

    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <td width="19%">{culture.id}</td>
                        <th width="10%">{culture.username}</th>
                        <th width="10%">{culture.password}</th>
                        <td width="10%">{culture.company}</td>
                        <td width="20%">{culture.department}</td>
                        <th width="8%">{culture.role}</th>
                        <th width="8%">{culture.modified}</th>
                        <th width="15%">{culture.createTime}</th>
                    </tr>
                </thead>
                <UserList data={this.props.data} onIdClick={this.props.onIdClick} />
            </table>
        );
    }
}
class UserList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
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
                            <UserItem user={item} key={i} onIdClick={this.props.onIdClick} />
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class UserItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <tr>
                <td className="link"
                    id={this.props.user._id.$oid.removeHTML()}
                    onClick={this.props.onIdClick}
                >
                    <b id={this.props.user._id.$oid.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.user._id.$oid }}></b>
                </td>
                <td dangerouslySetInnerHTML={{ __html: this.props.user.UserName }}></td>
                <td>******</td>
                <td>{this.props.user.CompanyDisplay}</td>
                <td>{this.props.user.DepartmentDisplay ? this.props.user.DepartmentDisplay.toString() : ""}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.user.Role }}></td>
                <td>{this.props.user.Modified.toString()}</td>
                <td>{parseBsonTime(this.props.user.CreateTime)}</td>
            </tr>
        )
    }
}
class DeleteUser extends React.Component {
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
                                    onClick={this.props.deleteUser.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class User extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.user_add) localStorage.user_add = true;
        this.state = {
            pageShow: localStorage.user ? eval(localStorage.user) : true,
            userShow: localStorage.user_add ? eval(localStorage.user_add) : true,
            deleteShow: false,
            deleteToggle: false,
            deleteName: "",
            pageIndex: 1,
            pageSize: localStorage.user_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] },
        }
        this.url = urls.user.getUrl;
        this.storagePageShowKey = "user";
        this.storagePageSizeKey = "user_pageSize";
    }
    onUserShow(e) {
        if (this.state.userShow) {
            this.setState({ userShow: false });
            localStorage.user_add = false;
        } else {
            this.setState({ userShow: true });
            localStorage.user_add = true;
        }
    }
    onDeleteShow(e) {
        if (this.state.deleteToggle) {
            this.setState({ deleteToggle: false });
        } else {
            this.setState({ deleteToggle: true });
        }
    }
    onIdClick(e) {
        var id = e.target.id;
        if (e.target.nodeName.toLowerCase() == "span") id = e.target.parentElement.id;
        http.get(urls.user.getUserUrl + "/" + id, function (data) {
            if (data.code == 0) {
                this.refs.add_user.changeState(data.result.UserName, data.result.Role, data.result.Company, data.result.CompanyDisplay, data.result.Department, data.result.DepartmentDisplay);
                this.setState({ deleteShow: true, deleteName: data.result.UserName });
            }
        }.bind(this));
    }
    addUser(obj, success) {
        var that = this;
        http.postJson(urls.user.addUserUrl, obj, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        });
    }
    deleteUser(e) {
        var that = this;
        if (confirm(" " + culture.delete + " ?")) {
            http.get(urls.user.deleteUserUrl + "?userName=" + this.state.deleteName, function (data) {
                if (data.code == 0) {
                    that.getData();
                    that.setState({ deleteShow: false });
                }
            })
        }
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.user + culture.management}</h1>
                <UserToolBar section={this.props.section}
                    onSectionChange={this.props.onSectionChange} />
                <TitleArrow title={culture.all + culture.user}
                    show={this.state.pageShow}
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
                <UserData data={this.state.data.result}
                    onIdClick={this.onIdClick.bind(this)} />
                <TitleArrow title={culture.add + culture.user}
                    show={this.state.userShow}
                    onShowChange={this.onUserShow.bind(this)} />
                <AddUser show={this.state.userShow}
                    addUser={this.addUser.bind(this)}
                    ref="add_user" />
                {this.state.deleteShow ?
                    <TitleArrow title={culture.delete + culture.user + "(" + this.state.deleteName + ")"}
                        show={this.state.deleteToggle}
                        onShowChange={this.onDeleteShow.bind(this)} /> : null}
                {this.state.deleteShow ?
                    <DeleteUser show={this.state.deleteToggle}
                        deleteUser={this.deleteUser.bind(this)} /> : null}
            </div>
        )
    }
}
for (var item in CommonUsePagination) User.prototype[item] = CommonUsePagination[item];

class UserToolBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="config_toolbar">
                <div className={this.props.section == "department" ? "config_info select" : "config_info"}
                    onClick={this.props.onSectionChange}
                    id="department">{culture.company}
                </div>
                <div className={this.props.section == "user" ? "config_info select" : "config_info"}
                    onClick={this.props.onSectionChange}
                    id="user">{culture.user}
                </div>
            </div>
        )
    }
}
class UserContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            section: localStorage.storageUserSection || "user"
        }
    }
    onSectionChange(e) {
        var value = e.target.id.toLowerCase();
        localStorage.storageUserSection = value;
        this.setState({ section: value });
    }
    onRefreshChange(value) {
        this.refs.config.onRefreshChange(value);
    }
    render() {
        if (this.state.section == "user") {
            return <User ref="config"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        } else {
            return <Department ref="config"
                refresh={this.props.refresh}
                section={this.state.section}
                onSectionChange={this.onSectionChange.bind(this)} />
        }
    }
}
