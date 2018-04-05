class AddApplication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applicationName: "",
            action: "allow",
            message: ""
        };
    }
    nameChanged(e) {
        this.setState({ applicationName: e.target.value });
    }
    actionChanged(e) {
        this.setState({ action: e.target.value });
    }
    addApplication(e) {
        var that = this;
        if (this.state.applicationName && this.state.action) {
            this.props.addApplication(this.state, function (data) {
                if (data.code == 0) {
                    that.setState({ applicationName: "", action: "allow" });
                } else {
                    that.setState({ message: data.message });
                }
            });
        }
    }
    onAppNameClick(appName, action) {
        this.setState({ applicationName: appName, action: action });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden" }>
                <table className="table" style={{width:"30%"}}>
                    <tbody>
                        <tr>
                            <td className="tdCenter">ApplicationName:</td>
                            <td><input type="text" name="applicationName" value={this.state.applicationName} onChange={this.nameChanged.bind(this)} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td className="tdCenter">Action:</td>
                             <td>
                                <select name="action" value={this.state.action} onChange={this.actionChanged.bind(this)}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                         </tr>
                        <tr>
                             <td colSpan="2"><input type="button" value="Add" className="button" onClick={this.addApplication.bind(this) } /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}