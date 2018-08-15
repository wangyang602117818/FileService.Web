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
class Shared extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId: "",
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        this.setState({ fileId: fileId });
        var that = this;

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
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "background:rgba(102,102,102,1)";
    }
    render() {
        return (
            <div className="password_input_wrap">
                <div className="password_input_title">{culture.please_input_shared_password}</div>
                <div className="password_input_txt">{culture.password}:{'\u00A0'}</div>
                <div className="password_input">{'\u00A0'}<input type="text" name="password" id="password" size="15"/></div>
                <div className="password_input_btn">
                    <input type="button" name="btn" value={culture.ok} />
                </div>
            </div>
        );
    }
}
ReactDOM.render(
    <PassWordInput />,
    document.getElementById('shared')
);