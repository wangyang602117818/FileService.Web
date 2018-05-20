class Top extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            role: ""
        }
    }
    logOut(e) {
        window.location.href = urls.logOutUrl;
    }
    changeCulture(e) {
        if (current_culture == "en-US") {
            setCookie("culture", "zh-CN", 365);
        } else {
            setCookie("culture", "en-US", 365);
        }
        window.location.reload();
    }
    componentDidMount() {
        var userName = document.getElementById("userName").value;
        var role = document.getElementById("role").value;
        this.setState({ name: userName, role: role });
    }
    render() {
        return (
            <div className="top">
                <div className="logo">
                    <img src={urls.logoUrl} />
                </div>
                <div className="user">
                    <span className="user_tip">{culture.user}:</span>
                    <span className="user_txt"> {this.state.name} | {this.state.role} </span>
                    <span className="lang btn" onClick={this.changeCulture}>{culture.lang}</span>
                    <span className="logout btn" onClick={this.logOut}>{culture.login_out}</span>
                </div>
            </div>
        );
    }
}
class Menu extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="menu">
                <ul>
                    <li>
                        <a className={this.props.style == "overview" ? "current" : ""}
                            onClick={this.props.menuClick}
                            id="overview">{culture.overview}</a>
                    </li>
                    <li>
                        <a className={this.props.style == "handlers" ? "current" : ""}
                            onClick={this.props.menuClick}
                            id="handlers">{culture.handlers}</a>
                    </li>
                    <li>
                        <a className={this.props.style == "tasks" ? "current" : ""}
                            onClick={this.props.menuClick}
                            id="tasks">{culture.tasks}</a>
                    </li>
                    <li>
                        <a className={this.props.style == "resources" ? "current" : ""}
                            onClick={this.props.menuClick}
                            id="resources">{culture.resources}</a>
                    </li>
                    <li>
                        <a className={this.props.style == "logs" ? "current" : ""}
                            onClick={this.props.menuClick}
                            id="logs">{culture.logs}</a>
                    </li>
                    {typeof (Config) === "undefined" ? null :
                        <li>
                            <a className={this.props.style == "config" ? "current" : ""}
                                onClick={this.props.menuClick}
                                id="config">{culture.configs}</a>
                        </li>
                    }
                    {typeof (User) === "undefined" ? null :
                        <li>
                            <a className={this.props.style == "users" ? "current" : ""}
                                onClick={this.props.menuClick}
                                id="users">{culture.users}</a>
                        </li>
                    }
                </ul>
            </div>
        );
    }
}
class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            update_time: getCurrentDateTime()
        };
    }
    componentDidMount() {
        this.interval = window.setInterval(this.refreshText.bind(this), 1000);
    }
    refreshText() {
        this.setState({ update_time: localStorage.update_time });
    }
    componentWillUnmount() {
        window.clearInterval(this.interval);
    }
    render() {
        return (
            <div className="footer">
                {culture.update}:
                <select name="update" defaultValue={this.props.refresh} onChange={this.props.onRefreshChange}>
                    <option value="5">{culture.every} 5 {culture.seconds}</option>
                    <option value="15">{culture.every} 15 {culture.seconds}</option>
                    <option value="30">{culture.every} 30 {culture.seconds}</option>
                    <option value="300">{culture.every} 5 {culture.minutes}</option>
                    <option value="0">{culture.never}</option>
                </select>
                <div className="update_time">{culture.last_update}: {this.state.update_time}</div>
            </div>
        );
    }
}
class Container extends React.Component {
    constructor(props) {
        super(props);
        var menuValue = window.location.href.split("#")[1] || "overview";
        this.state = {
            menuStyle: menuValue,
            component: this.getComponent(menuValue),
            refresh: localStorage.refresh || 15          //刷新间隔
        }
    }
    getComponent(menu) {
        var component = null;
        switch (menu) {
            case "overview":
                component = Overview;
                break;
            case "handlers":
                component = Handlers;
                break;
            case "tasks":
                component = Tasks;
                break;
            case "resources":
                component = Resources;
                break;
            case "logs":
                component = Logs;
                break;
            case "config":
                component = typeof (ConfigContainer) === "undefined" ? Overview : ConfigContainer;
                break;
            case "users":
                component = typeof (UserContainer) === "undefined" ? Overview : UserContainer;
                break;
            default:
                component = Overview;
                break;
        }
        return component;
    }
    menuClick(e) {
        e.preventDefault();
        var value = e.target.id;
        if (this.state.menuStyle == value) return;
        var component = this.getComponent(value);
        this.setState({ menuStyle: value, component: component });
        window.history.replaceState({}, "", "#" + value);
    }
    onRefreshChange(e) {
        localStorage.refresh = e.target.value;
        this.setState({ refresh: e.target.value });
        this.refs.main.onRefreshChange(e.target.value);
    }
    render() {
        return (
            <div className="container">
                <Top />
                <Menu style={this.state.menuStyle}
                    menuClick={this.menuClick.bind(this)} />
                <this.state.component ref="main" refresh={this.state.refresh} />
                <Footer onRefreshChange={this.onRefreshChange.bind(this)}
                    refresh={this.state.refresh} />
            </div>
        );
    }
}
ReactDOM.render(
    <Container />,
    document.getElementById('index')
);