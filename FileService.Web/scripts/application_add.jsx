class AddApplication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applicationName: "",
            authCode: "",
            action: "allow",
            message: ""
        };
    }
    nameChanged(e) {
        this.setState({ applicationName: e.target.value });
    }
    codeChanged(e) {
        this.setState({ authCode: e.target.value });
    }
    actionChanged(e) {
        this.setState({ action: e.target.value });
    }
    addApplication(e) {
        var that = this;
        if (this.state.applicationName && this.state.authCode && this.state.action) {
            this.props.addApplication(this.state, function (data) {
                if (data.code == 0) {
                    that.setState({ applicationName: "", action: "allow" });
                } else {
                    that.setState({ message: data.message });
                }
            });
        }
    }
    onAppNameClick(appName, authCode, action) {
        this.setState({ applicationName: appName, authCode: authCode, action: action });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.applicationName}:</td>
                            <td><input type="text" name="applicationName" value={this.state.applicationName} onChange={this.nameChanged.bind(this)} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.auth_code}:</td>
                            <td><input type="text" name="authCode" value={this.state.authCode} onChange={this.codeChanged.bind(this)} size="15" /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td>
                                <select name="action" value={this.state.action} onChange={this.actionChanged.bind(this)}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2"><input type="button"
                                value={culture.add}
                                className="button"
                                onClick={this.addApplication.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}