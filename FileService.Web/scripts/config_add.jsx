class AddConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            extension: "",
            type: "",
            action: "allow",
            message: ""
        };
    }
    extensionChanged(e) {
        this.setState({ extension: e.target.value });
    }
    typeChanged(e) {
        this.setState({ type: e.target.value });
    }
    actionChanged(e) {
        this.setState({ action: e.target.value });
    }
    addConfig(e) {
        var that = this;
        if (this.state.extension && this.state.type && this.state.action) {
            this.props.addConfig(this.state, function (data) {
                if (data.code == 0) {
                    that.setState({ extension: "", type: "", message: "" });
                } else {
                    that.setState({ message: data.message });
                }
            });
        }
    }
    onIdClick(extension, type, action) {
        this.setState({ extension: extension, type: type, action: action });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.extension}:</td>
                            <td><input type="text" name="extension"
                                value={this.state.extension}
                                onChange={this.extensionChanged.bind(this)} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.type}:</td>
                            <td>
                                <select name="type"
                                    value={this.state.type}
                                    onChange={this.typeChanged.bind(this)}>
                                    <option value=""></option>
                                    <option value="image">image</option>
                                    <option value="video">video</option>
                                    <option value="office">office</option>
                                    <option value="pdf">pdf</option>
                                    <option value="text">text</option>
                                    <option value="attachment">attachment</option>
                                </select><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td>
                                <select name="action"
                                    value={this.state.action}
                                    onChange={this.actionChanged.bind(this)}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button" value={culture.add}
                                    className="button"
                                    onClick={this.addConfig.bind(this)} />
                                    <font color="red">{" " + this.state.message}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}