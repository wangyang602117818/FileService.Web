
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
class SharedComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            component: null
        };
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
            
        }
    }

    render() {
        return (
            <this.state.component sharedid={this.state.id}/>
        );
    }
}
ReactDOM.render(
    <SharedComponent />,
    document.getElementById('shared')
);