class PassWordInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            text: ""
        }
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "background:rgba(102,102,102,1)";
    }
    passwordOk() {
        if (trim(this.state.password).length > 0) {
            this.props.checkPassword(this.state.password, function (data) {
                if (data.code != 0) this.setState({ text: culture.invalid_password });
            }.bind(this));
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
                    size="10"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })} />
                    <font color="red">{this.state.text}</font>
                </div>
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
class SharedInit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                window.location.href = urls.shared.sharedFile + "/" + id;
            }
        }
    }
    checkPassword(password, success) {
        http.get(urls.shared.checkPassWord + "/" + this.state.id + "?password=" + password, function (data) {
            success(data);
            if (data.code == 0) {
                setCookieNonExday("shared_password_" + this.state.id, password);
                window.location.href = urls.shared.sharedFile + "/" + this.state.id;
            }
        }.bind(this))
    }
    render() {
        return (
            <this.state.component
                sharedid={this.state.id}
                checkPassword={this.checkPassword.bind(this)} />
        );
    }
}

ReactDOM.render(
    <SharedInit />,
    document.getElementById('shared_init')
);