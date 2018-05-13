class UserData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table table_user">
                <thead>
                    <tr>
                        <th width="20%">{culture.username}</th>
                        <th width="30%">{culture.password}</th>
                        <th width="20%">{culture.role}</th>
                        <th width="30%">{culture.createTime}</th>
                    </tr>
                </thead>
                <UserList data={this.props.data} onNameClick={this.props.onNameClick} />
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
                            <UserItem user={item} key={i} onNameClick={this.props.onNameClick} />
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
                <td className="link" onClick={this.props.onNameClick}>
                    <b dangerouslySetInnerHTML={{ __html: this.props.user.UserName }}></b>
                </td>
                <td>******</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.user.Role }}></td>
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
                                <input type="button" value={culture.delete} className="button" onClick={this.props.deleteUser.bind(this)} />
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
    onNameClick(e) {
        var name = e.target.innerText;
        var role = "";
        if (e.target.nodeName.toLowerCase() == "b") {
            role = e.target.parentElement.nextElementSibling.nextElementSibling.innerText;
        } else if (e.target.nodeName.toLowerCase() == "span") {
            name = e.target.parentElement.innerText;
            role = e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.innerText;
        } else {
            role = e.target.nextElementSibling.nextElementSibling.innerText;
        }
        this.refs.add_user.changeState(name, role);
        this.setState({ deleteShow: true, deleteName: name });
    }
    addUser(obj, success) {
        var that = this;
        http.post(urls.user.addUserUrl, obj, function (data) {
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
                <h1>{culture.user}</h1>
                <TitleArrow title={culture.all + culture.user} show={this.state.pageShow}
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
                    onNameClick={this.onNameClick.bind(this)} />
                <TitleArrow title={culture.add + culture.user}
                    show={this.state.userShow}
                    onShowChange={this.onUserShow.bind(this)} />
                <AddUser show={this.state.userShow}
                    addUser={this.addUser.bind(this)}
                    ref="add_user" />
                {this.state.deleteShow ?
                    <TitleArrow title={culture.delete + culture.user +"(" + this.state.deleteName + ")"}
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
//Object.assign(User.prototype, CommonUsePagination);
