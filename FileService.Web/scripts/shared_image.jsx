class SharedBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.fileId) {
            return (
                <div className="background">
                    <img src={urls.downloadUrl + "/" + this.props.fileId} />
                </div>
            );
        } else {
            return null;
        }
    }
}
class SharedImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId: "",
        }
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "";
        var fileId = document.getElementById("fileId").value;
        this.setState({ fileId: fileId });
    }
    render() {
        return (
            <div>
                <PreviewTitle tabs={[]} />
                <SharedBody fileId={this.state.fileId} />
            </div>
        );
    }
}
class PassWordInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: ""
        }
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "background:rgba(102,102,102,1)";
    }
    passwordOk() {
        if (trim(this.state.password).length > 0) {
            this.props.checkPassword(this.state.password);
        }
    }
    render() {
        return (
            <div className="password_input_wrap">
                <div className="password_input_title">{culture.please_input_shared_password}</div>
                <div className="password_input_txt">{culture.password}:{'\u00A0'}</div>
                <div className="password_input">{'\u00A0'}<input type="text"
                    name="password"
                    id="password"
                    size="15"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })} /></div>
                <div className="password_input_btn">
                    <input type="button"
                        name="btn"
                        value={culture.ok}
                        onClick={this.passwordOk.bind(this)} />
                </div>
            </div>
        );
    }
}
class SharedComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            component: PassWordInput
        };
    }
    componentDidMount() {
        var id = document.getElementById("id").value;
        var expired = document.getElementById("expired").value.toLowerCase();
        var hasPassword = document.getElementById("hasPassword").value.toLowerCase();
        var cookie_password = getCookie("shared_password_" + id);

        this.setState({ id: id });
        if (expired == "true") {
            this.setState({ component: SharedExpired });
        } else {
            if (hasPassword == "true" && cookie_password.length == 0) {
                this.setState({ component: PassWordInput });
            } else {
                this.setState({ component: SharedImage });
            }
        }
    }
    checkPassword(password) {
        http.get(urls.shared.checkPassWord + "/" + this.state.id + "?password=" + password, function (data) {
            if (data.code == 0) {
                setCookieNonExday("shared_password_" + this.state.id, password);
                this.setState({ component: SharedImage });
            }
        }.bind(this))
    }
    render() {
        return (
            <this.state.component sharedid={this.state.id} checkPassword={this.checkPassword.bind(this)} />
        );
    }
}
ReactDOM.render(
    <SharedComponent />,
    document.getElementById('shared')
);