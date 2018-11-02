class PreviewBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="background">
                {this.props.isOrigin ?
                    <VideoOrigin fileId={this.props.fileId} />
                    :
                    <VideoM3u8 fileId={this.props.fileId} />
                }
                <VideoCpBtn onCpClick={this.props.onCpClick} />
                <VideoCpList videoCps={this.props.videoCps} onCpDel={this.props.onCpDel} />
            </div>
        );
    }
}
class VideoCpBtn extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="videocp_cmd">
                <input type="button" name="videoCp" id="videoCp" value="VideoCP" style={{ padding: "2px 4px" }} onClick={this.props.onCpClick} />
            </div>
        )
    }
}
class VideoCpList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="video_cp">
                {this.props.videoCps.map(function (item, i) {
                    return <VideoCpItem fileId={item} key={i} onCpDel={this.props.onCpDel} />
                }.bind(this))}
            </div>
        )
    }
}
class VideoCpItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="image_item">
                <img src={urls.videoCpUrl + "/" + this.props.fileId} />
                <div className="videocp_del" id={this.props.fileId} onClick={this.props.onCpDel}>×</div>
            </div >
        )
    }
}
class VideoOrigin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convert: false,
            deleted: false,
        }
    }
    componentDidMount() {
        var convert = document.getElementById("convert").value == "true" ? true : false;
        var deleted = document.getElementById("deleted").value == "true" ? true : false;
        this.setState({ convert: convert, deleted: deleted })
    }
    render() {
        var url = (this.props.convert ? urls.downloadConvertUrl : urls.downloadUrl) + "/" + this.props.fileId;
        if (this.state.deleted) url = url + "?deleted=true";
        return (
            <video controls="controls" width="900" height="600">
                {this.props.fileId ?
                    <source src={url} />
                    :
                    null
                }
            </video>
        );
    }
}
class VideoM3u8 extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        hlsplayer();
    }
    render() {
        return (
            <video controls="controls" width="900" height="600" className="hlsplayer">
                {this.props.fileId ?
                    <source src={urls.m3u8Url + "/" + this.props.fileId} />
                    :
                    null
                }
            </video>
        );
    }
}
class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: [],
            videoCps: [],
            fileId: "",
            isOrigin: true
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var that = this;
        http.get(urls.videoListUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                that.dataSetChange(data.result.videolist);
                that.setState({ videoCps: data.result.videocps });
            }
        });
    }
    onCpClick(e) {
        var orgFileId = this.state.tabs[0]._id;
        var video = e.target.parentElement.previousSibling;
        var canvas = document.createElement("canvas");
        canvas.width = video.videoWidth * 1;
        canvas.height = video.videoHeight * 1;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        var img = document.createElement("img");
        img.src = canvas.toDataURL('images/png');
        var that = this;
        http.post(urls.videoCpUploadUrl,
            {
                FileId: orgFileId,
                FileBase64: img.src
            }, function (data) {
                if (data.code == 0) {
                    that.state.videoCps.push(data.result);
                    that.setState({ videoCps: that.state.videoCps });
                }
            })
    }
    onCpDel(e) {
        var cpId = e.target.id;
        var that = this;
        http.get(urls.videoCpDelUrl + "?id=" + cpId
            , function (data) {
                if (data.code == 0) {
                    that.state.videoCps.remove(cpId);
                    that.setState({ videoCps: that.state.videoCps });
                }
            })
    }
    render() {
        return (
            <div>
                <PreviewTitle
                    tabs={this.state.tabs}
                    onItemClick={this.onItemClick.bind(this)} />
                <PreviewBody fileId={this.state.fileId}
                    isOrigin={this.state.isOrigin}
                    videoCps={this.state.videoCps}
                    onCpClick={this.onCpClick.bind(this)}
                    onCpDel={this.onCpDel.bind(this)} />
            </div>
        );
    }
}
for (var item in PreviewCommon) Preview.prototype[item] = PreviewCommon[item];  //添加公用方法

ReactDOM.render(
    <Preview />,
    document.getElementById('preview')
);