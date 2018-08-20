class SharedImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId: "",
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        this.setState({ fileId: fileId });
    }
    render() {
        return (
            <div>
                <PreviewTitle tabs={[]} />
                {this.state.fileId ?
                    <div className="background">
                        <img src={urls.downloadUrl + "/" + this.state.fileId} />
                    </div> : null
                }
            </div>
        );
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
                {this.state.m3u8Id ?
                    <div className="background">
                        <video controls="controls" width="900" height="600" className="hlsplayer">
                            <source src={urls.m3u8Url + "/" + this.state.m3u8Id} />
                        </video>
                    </div> :
                    <div className="background">
                        <video controls="controls" width="900" height="600">
                            <source src={urls.downloadUrl + "/" + this.state.fileId} />
                        </video>
                    </div>
                }
            </div>
        );
    }
}
class SharedText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        http.getFile(urls.downloadUrl + "/" + fileId, function (data) {
            this.setState({ text: data });
        }.bind(this));
    }
    render() {
        return (
            <div>
                <PreviewTitle tabs={[]} />
                <div className="background">
                    <div className="background_text">{this.state.text}</div>
                </div>
            </div>
        );
    }
}
class SharedDefault extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileId:"",
            fileName: ""
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var fileName = document.getElementById("fileName").value;
        this.setState({ fileId: fileId, fileName: fileName })
    }
    render() {
        return (
            <div>
                <PreviewTitle tabs={[]} />
                <div className="background">
                    <a href={urls.downloadUrl + "/" + this.state.fileId} style={{ color:"#fff" }}>{this.state.fileName}</a>
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
            component: null
        };
    }
    componentDidMount() {
        document.getElementsByTagName("body")[0].style = "";
    }
    componentWillMount() {
        var id = document.getElementById("id").value;
        var fileType = document.getElementById("fileType").value;
        switch (fileType) {
            case "image":
                this.setState({ component: SharedImage });
                break;
            case "video":
                this.setState({ component: SharedVideo });
                break;
            case "text":
                this.setState({ component: SharedText });
                break;
            default:
                this.setState({ component: SharedDefault });
                break;
        }
    }

    render() {
        return (
            <this.state.component sharedid={this.state.id} />
        );
    }
}
ReactDOM.render(
    <SharedComponent />,
    document.getElementById('shared')
);