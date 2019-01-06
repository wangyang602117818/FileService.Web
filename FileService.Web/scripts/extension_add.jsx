class UpdateExtension extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            extension: "",
            type: "",
            contentType: "",
            action: "allow",
            description: "",
            message: ""
        };
    }
    updateExtension(e) {
        if (this.state.extension && this.state.type && this.state.contentType && this.state.action) {
            this.props.updateExtension(this.state, function (data) {
                if (data.code != 0) this.setState({ message: data.message });
            }.bind(this));
        }
    }
    onIdClick(extension, type, contentType, description, action) {
        this.setState({
            extension: extension,
            type: type,
            contentType: contentType,
            description: description,
            action: action
        });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.extension}:</td>
                            <td colSpan="3"><input type="text"
                                name="extension"
                                value={this.state.extension}
                                onChange={e => this.setState({ extension: e.target.value })} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.type}:</td>
                            <td>
                                <select name="type"
                                    value={this.state.type}
                                    onChange={e => this.setState({ type: e.target.value })}>
                                    <option value=""></option>
                                    <option value="image">{culture.image}</option>
                                    <option value="video">{culture.video}</option>
                                    <option value="audio">{culture.audio}</option>
                                    <option value="office">{culture.office}</option>
                                    <option value="pdf">{culture.pdf}</option>
                                    <option value="text">{culture.text}</option>
                                    <option value="attachment">{culture.attachment}</option>
                                </select><font color="red">*</font>
                            </td>
                            <td>{culture.description}:</td>
                            <td>
                                <input type="text"
                                    size="10"
                                    name="description"
                                    onChange={e => this.setState({ description: e.target.value })}
                                    value={this.state.description} />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.contentType}:</td>
                            <td colSpan="3">
                                <input type="text"
                                    size="25"
                                    name="contentType"
                                    onChange={e => this.setState({ contentType: e.target.value })}
                                    value={this.state.contentType} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td colSpan="3">
                                <select name="action"
                                    value={this.state.action}
                                    onChange={e => this.setState({ action: e.target.value })}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <input type="button" value={culture.update}
                                    className="button"
                                    onClick={this.updateExtension.bind(this)} />
                                <font color="red">{" " + this.state.message}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
class AddExtension extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            extension: "",
            type: "",
            contentType: "",
            action: "allow",
            description: "",
            message: ""
        };
    }
    addExtension(e) {
        var that = this;
        if (this.state.extension && this.state.type && this.state.contentType && this.state.action) {
            this.props.addExtension(this.state, function (data) {
                if (data.code == 0) {
                    that.setState({ extension: "", message: "" });
                } else {
                    that.setState({ message: data.message });
                }
            });
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "35%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.extension}:</td>
                            <td colSpan="3"><input type="text"
                                name="extension"
                                value={this.state.extension}
                                onChange={e => this.setState({ extension: e.target.value })} />
                                <font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.type}:</td>
                            <td>
                                <select name="type"
                                    value={this.state.type}
                                    onChange={e => this.setState({ type: e.target.value })}>
                                    <option value=""></option>
                                    <option value="image">{culture.image}</option>
                                    <option value="video">{culture.video}</option>
                                    <option value="audio">{culture.audio}</option>
                                    <option value="office">{culture.office}</option>
                                    <option value="pdf">{culture.pdf}</option>
                                    <option value="text">{culture.text}</option>
                                    <option value="attachment">{culture.attachment}</option>
                                </select><font color="red">*</font>
                            </td>
                            <td>{culture.description}:</td>
                            <td>
                                <input type="text"
                                    size="10"
                                    name="description"
                                    onChange={e => this.setState({ description: e.target.value })}
                                    value={this.state.description} />
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.contentType}:</td>
                            <td colSpan="3">
                                <input type="text"
                                    size="25"
                                    name="contentType"
                                    onChange={e => this.setState({ contentType: e.target.value })}
                                    value={this.state.contentType} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td colSpan="3">
                                <select name="action"
                                    value={this.state.action}
                                    onChange={e => this.setState({ action: e.target.value })}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <input type="button" value={culture.add}
                                    className="button"
                                    onClick={this.addExtension.bind(this)} />
                                <font color="red">{" " + this.state.message}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}