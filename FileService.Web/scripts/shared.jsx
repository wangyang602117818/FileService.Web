var fileId = document.getElementById("fileId").value;
var convertId = document.getElementById("subFileId").value;
var fileType = document.getElementById("fileType").value;

var pdf_word = appDomain + "pdfview/pdf.worker.js";
var DEFAULT_URL = (fileType == "office") ? urls.downloadConvertUrl + "/" + convertId : urls.downloadUrl + "/" + fileId;

class SharedImageBody extends React.Component {
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
                <SharedImageBody fileId={this.state.fileId} />
            </div>
        );
    }
}
class SharedVideoBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.m3u8Id) {
            return (
                <div className="background">
                    <video controls="controls" width="900" height="600" className="hlsplayer">
                        <source src={urls.m3u8Url + "/" + this.props.m3u8Id} />
                    </video>
                </div>
            );
        } else {
            return (
                <div className="background">
                    <video controls="controls" width="900" height="600">
                        <source src={urls.downloadUrl + "/" + this.props.fileId} />
                    </video>
                </div>
            )
        }
    }
}
class SharedVideo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId: "",
            m3u8Id: "",
        }
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "";
        var fileId = document.getElementById("fileId").value;
        var m3u8Id = this.getM3u8Id(fileId);
        this.setState({ fileId: fileId, m3u8Id: m3u8Id }, function () { hlsplayer(); });
    }
    getM3u8Id(fileId) {
        var m3u8Id = "";
        http.getSync(urls.resources.getM3u8MetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0 && data.result.length > 0) {
                m3u8Id = data.result[0]._id.$oid;
            }
        }.bind(this));
        return m3u8Id;
    }
    render() {
        return (
            <div>
                <PreviewTitle tabs={[]} />
                <SharedVideoBody fileId={this.state.fileId} m3u8Id={this.state.m3u8Id} />
            </div>
        );
    }
}
class SharedPdf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
        //document.getElementsByTagName("body")[0].style = "";

    }
    componentWillUnmount() {
        //document.getElementById("pdfview").remove();
        //document.getElementById("pdf").remove();
    }
    componentWillMount() {
        http.getFile(appDomain + "pdfview/template.html", function (data) {
            var ele = document.createElement("div");
            ele.innerHTML = data;
            document.getElementsByTagName("body")[0].appendChild(ele.firstChild);

            var script_viewer = document.createElement('script');
            script_viewer.src = appDomain + 'pdfview/viewer.js';
            document.getElementsByTagName("body")[0].appendChild(script_viewer);

            var script_pdf = document.createElement('script');
            script_pdf.src = appDomain + 'pdfview/pdf.js';
            document.getElementsByTagName("body")[0].appendChild(script_pdf);

        });
    }
    render() {
        return <div></div>;
    }
}
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
                    size="15"
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
        var fileType = document.getElementById("fileType").value;

        var cookie_password = getCookie("shared_password_" + id);
        this.setState({ id: id });
        if (expired == "true") {
            this.setState({ component: SharedExpired });
        } else {
            if (hasPassword == "true" && cookie_password.length == 0) {
                this.setState({ component: PassWordInput });
            } else {
                switch (fileType) {
                    case "image":
                        this.setState({ component: SharedImage });
                        break;
                    case "video":
                        this.setState({ component: SharedVideo });
                        break;
                    case "pdf":
                    case "office":
                        this.setState({ component: SharedPdf });
                        break;
                }
            }
        }
    }
    checkPassword(password, success) {
        http.get(urls.shared.checkPassWord + "/" + this.state.id + "?password=" + password, function (data) {
            if (data.code == 0) {
                setCookieNonExday("shared_password_" + this.state.id, password);
                this.setState({ component: SharedImage });
            }
            success(data);
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