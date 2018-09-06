class Logo extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="login_row margin_top">
                <img src={urls.logoUrl} />
            </div>
        );
    }
}
class LoginName extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="login_row margin_top">
                <div className="name">
                    {culture.username}:
               </div>
                <div className="value">
                    <input type="text" name="username"
                        value={this.props.value}
                        onChange={this.props.nameChanged}
                        onKeyPress={this.props.onKeypressName} /> <font color="red">*</font>
                </div>
            </div>
        );
    }
}
class LoginValue extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="login_row">
                <div className="name">
                    {culture.password}:
                </div>
                <div className="value">
                    <input type="password" name="pwd"
                        value={this.props.value}
                        onChange={this.props.passWordChangd}
                        onKeyPress={this.props.onKeypressPassWord} /> <font color="red">*</font>
                </div>
            </div>
        );
    }
}
class LoginButton extends React.Component {
    constructor(props) {
        super(props);

    }
    onfocus() {
        this.refs.button.focus();
    }
    render() {
        return (
            <div className="login_row">
                <input type="button" ref="loginBtn"
                    value={culture.login}
                    ref="button"
                    className="loginBtn"
                    onClick={this.props.onClick} />
            </div>
        );
    }
}
class Tips extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="tips">
                {this.props.message}
            </div>
        );
    }
}
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            message: ""
        }
    }
    nameChanged(e) {
        this.setState({ username: e.target.value });
    }
    passWordChangd(e) {
        this.setState({ password: e.target.value });
    }
    onKeypressName(e) {
        if (e.key.toLowerCase() == "enter") { this.onClick(); }
    }
    onKeypressPassWord(e) {
        if (e.key.toLowerCase() == "enter") { this.onClick(); }
    }
    onClick(e) {
        if (!this.state.username) { this.setState({ message: culture.username_required }); return; }
        if (!this.state.password) { this.setState({ message: culture.password_required }); return; }
        var that = this;
        http.post(window.location.href, this.state, function (data) {
            var url = "";
            switch (data.code) {
                case 0:
                    window.location.href = urls.homeUrl;
                    break;
                case 1:
                    window.location.href = data.result;
                    break;
                default:
                    that.setState({ message: culture.login_fault });
            }
        });
    }

    render() {
        return (
            <div className="login" >
                <Logo />
                {this.state.message ?
                    <Tips message={this.state.message} /> : null}
                <LoginName value={this.state.username}
                    nameChanged={this.nameChanged.bind(this)}
                    onKeypressName={this.onKeypressName.bind(this)} />
                <LoginValue value={this.state.password}
                    passWordChangd={this.passWordChangd.bind(this)}
                    onKeypressPassWord={this.onKeypressPassWord.bind(this)} />
                <LoginButton onClick={this.onClick.bind(this)} ref="button" />
            </div>
        );
    }
}
ReactDOM.render(
    <Login />,
    document.getElementById('login')
);