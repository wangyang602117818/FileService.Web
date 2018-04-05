class AddAttachment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: "",
            buttonValue: "Upload",
            buttonDisabled: false
        }
    }
    fileChanged(e) {
        this.input = e.target;
        this.setState({
            errorMsg: ""
        })
    }
    upload() {
        var that = this;
        if (this.input && this.input.files.length > 0) {
            this.setState({ buttonDisabled: true });
            this.props.attachmentUpload(this.input,
                function (data) {
                    if (data.code == 0) {
                        that.input.value = "";  //清空input框
                        that.setState({ buttonValue: "Upload", buttonDisabled: false });
                    } else {
                        that.setState({ errorMsg: " "+data.message, buttonValue: "Upload", buttonDisabled: false });
                    }
                }, function (loaded, total) {
                    var precent = ((loaded / total) * 100).toFixed();
                    that.setState({ buttonValue: precent + "%" });
                });
        } else {
            this.setState({
                errorMsg: " no file selected"
            });
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table_modify">
                    <tbody>
                        <tr>
                            <td width="15%">Attachment:</td>
                            <td width="85%"><input type="file" multiple name="video" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <input type="button" name="btnAttachment" className="button"
                                       value={this.state.buttonValue}
                                       onClick={this.upload.bind(this)}
                                       disabled={this.state.buttonDisabled} />
                                <font color="red">{this.state.errorMsg}</font>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}