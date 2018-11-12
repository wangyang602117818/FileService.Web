class AddApplication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applicationName: "",
            authCode: "",
            action: "allow",
            thumbnails: [],
            thumbnailsDisplay: [],
            videos: [],
            videosDisplay: [],
            imageConvertShow: false,
            videoConvertShow: false,
            message: ""
        };
    }
    componentDidMount() {
        this.getHexCode();
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ authCode: data.result });
            }
        }.bind(this));
    }
    addApplication(e) {
        var that = this;
        if (this.state.applicationName && this.state.authCode && this.state.action) {
            this.props.addApplication({
                applicationName: this.state.applicationName,
                authCode: this.state.authCode,
                action: this.state.action,
                thumbnails: this.state.thumbnails,
                thumbnailsDisplay: this.state.thumbnailsDisplay,
                videos: this.state.videos,
                videosDisplay: this.state.videosDisplay
            }, function (data) {
                if (data.code == 0) {
                    that.setState({ applicationName: "", action: "allow" });
                } else {
                    that.setState({ message: data.message });
                }
            });
        }
    }
    delImage(e) {
        var id = e.target.parentElement.id;
        this.state.thumbnails.splice(id, 1);
        this.state.thumbnailsDisplay.splice(id, 1);
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    imageOk(convert, convertDisplay) {
        this.state.thumbnails.push({
            format: convert.format,
            flag: convert.flag,
            model: convert.model,
            x: convert.x,
            y: convert.y,
            width: convert.width,
            height: convert.height,
        });
        this.state.thumbnailsDisplay.push({
            format: convertDisplay.formatName,
            flag: convertDisplay.flag,
            model: convertDisplay.modelName,
            x: convertDisplay.x,
            y: convertDisplay.y,
            width: convertDisplay.width,
            height: convertDisplay.height,
        });
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    videoOk(convert, convertDisplay) {
        this.state.videos.push({
            format: convert.format,
            quality: convert.quality,
            flag: convert.flag
        });
        this.state.videosDisplay.push({
            format: convertDisplay.format,
            quality: convertDisplay.quality,
            flag: convertDisplay.flag
        });
        this.setState({ videos: this.state.videos, videosDisplay: this.state.videosDisplay });
    }
    delVideo(e) {
        var id = e.target.parentElement.id;
        this.state.videos.splice(id, 1);
        this.state.videosDisplay.splice(id, 1);
        this.setState({
            videos: this.state.videos,
            videosDisplay: this.state.videosDisplay
        });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "40%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.applicationName}:</td>
                            <td colSpan="2"><input type="text"
                                name="applicationName"
                                value={this.state.applicationName}
                                onChange={e => this.setState({ applicationName: e.target.value })} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.auth_code}:</td>
                            <td colSpan="2"><input type="text" name="authCode"
                                value={this.state.authCode}
                                onChange={e => this.setState({ authCode: e.target.value })}
                                size="15" />
                                <font color="red">*</font>&nbsp;
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td colSpan="2">
                                <select name="action" value={this.state.action} onChange={e => this.setState({ action: e.target.value })}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td width="25%">{culture.image_convert}:</td>
                            <td width="65%">
                                {
                                    this.state.thumbnails.map(function (item, i) {
                                        return (
                                            <span className="convert_flag"
                                                title={JSON.stringify(this.state.thumbnailsDisplay[i])} key={i} id={i}>
                                                <span className="flag_txt">{item.flag}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delImage.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%"
                                className="link tdCenter"
                                onClick={e => { this.setState({ imageConvertShow: !this.state.imageConvertShow }) }}>
                                {this.state.imageConvertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.imageConvertShow ?
                                    <ConvertImage imageOk={this.imageOk.bind(this)} />
                                    : null}
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.video_convert}:</td>
                            <td>
                                {
                                    this.state.videos.map(function (item, i) {
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(this.state.videosDisplay[i])} key={i} id={i}>
                                                <span className="flag_txt">{item.flag}</span>
                                                <span className="flag_txt flag_del" onClick={this.delVideo.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link tdCenter"
                                onClick={e => { this.setState({ videoConvertShow: !this.state.videoConvertShow }) }}>
                                {this.state.convertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.videoConvertShow ? <ConvertVideo videoOk={this.videoOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3"><input type="button"
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
class UpdateApplication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applicationName: "",
            authCode: "",
            action: "allow",
            thumbnails: [],
            thumbnailsDisplay: [],
            videos: [],
            videosDisplay: [],
            imageConvertShow: false,
            videoConvertShow: false,
            message: ""
        };
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/12", function (data) {
            if (data.code == 0) {
                this.setState({ authCode: data.result });
            }
        }.bind(this));
    }
    onIdClick(appName, authCode, action, thumbnails, thumbnailsDisplay, videos, videosDisplay) {
        this.setState({
            applicationName: appName,
            authCode: authCode,
            action: action,
            thumbnails: thumbnails,
            thumbnailsDisplay: thumbnailsDisplay,
            videos: videos,
            videosDisplay: videosDisplay
        });
    }
    updateApplication() {
        if (this.state.applicationName && this.state.authCode && this.state.action) {
            this.props.updateApplication(this.state, function (data) {
                if (data.code != 0) this.setState({ message: data.message });
            }.bind(this));
        }
    }
    delImage(e) {
        var id = e.target.parentElement.id;
        this.state.thumbnails.splice(id, 1);
        this.state.thumbnailsDisplay.splice(id, 1);
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    imageOk(convert, convertDisplay) {
        this.state.thumbnails.push({
            format: convert.format,
            flag: convert.flag,
            model: convert.model,
            x: convert.x,
            y: convert.y,
            width: convert.width,
            height: convert.height,
        });
        this.state.thumbnailsDisplay.push({
            format: convertDisplay.formatName,
            flag: convertDisplay.flag,
            model: convertDisplay.modelName,
            x: convertDisplay.x,
            y: convertDisplay.y,
            width: convertDisplay.width,
            height: convertDisplay.height,
        });
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    videoOk(convert, convertDisplay) {
        this.state.videos.push({
            format: convert.format,
            quality: convert.quality,
            flag: convert.flag
        });
        this.state.videosDisplay.push({
            format: convertDisplay.format,
            quality: convertDisplay.quality,
            flag: convertDisplay.flag
        });
        this.setState({ videos: this.state.videos, videosDisplay: this.state.videosDisplay });
    }
    delVideo(e) {
        var id = e.target.parentElement.id;
        this.state.videos.splice(id, 1);
        this.state.videosDisplay.splice(id, 1);
        this.setState({
            videos: this.state.videos,
            videosDisplay: this.state.videosDisplay
        });
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "40%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.applicationName}:</td>
                            <td colSpan="2"><input type="text"
                                name="applicationName"
                                value={this.state.applicationName}
                                onChange={e => this.setState({ applicationName: e.target.value })} /><font color="red">*</font></td>
                        </tr>
                        <tr>
                            <td>{culture.auth_code}:</td>
                            <td colSpan="2"><input type="text" name="authCode"
                                value={this.state.authCode}
                                onChange={e => this.setState({ authCode: e.target.value })}
                                size="15" />
                                <font color="red">*</font>&nbsp;
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.action}:</td>
                            <td colSpan="2">
                                <select name="action" value={this.state.action} onChange={e => this.setState({ action: e.target.value })}>
                                    <option value="allow">allow</option>
                                    <option value="block">block</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td width="25%">{culture.image_convert}:</td>
                            <td width="65%">
                                {
                                    this.state.thumbnails.map(function (item, i) {
                                        var disp = this.state.thumbnailsDisplay[i];
                                        delete disp._id;
                                        return (
                                            <span className="convert_flag"
                                                title={JSON.stringify(disp)} key={i} id={i}>
                                                <span className="flag_txt">{item.flag || item.Flag}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delImage.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%"
                                className="link tdCenter"
                                onClick={e => { this.setState({ imageConvertShow: !this.state.imageConvertShow }) }}>
                                {this.state.imageConvertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.imageConvertShow ?
                                    <ConvertImage imageOk={this.imageOk.bind(this)} />
                                    : null}
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.video_convert}:</td>
                            <td>
                                {
                                    this.state.videos.map(function (item, i) {
                                        var disp = this.state.videosDisplay[i];
                                        delete disp._id;
                                        return (
                                            <span className="convert_flag" title={JSON.stringify(disp)} key={i} id={i}>
                                                <span className="flag_txt">{item.flag || item.Flag}</span>
                                                <span className="flag_txt flag_del" onClick={this.delVideo.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link tdCenter"
                                onClick={e => { this.setState({ videoConvertShow: !this.state.videoConvertShow }) }}>
                                {this.state.convertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                {this.state.videoConvertShow ? <ConvertVideo videoOk={this.videoOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3"><input type="button"
                                value={culture.update}
                                className="button"
                                onClick={this.updateApplication.bind(this)} /><font color="red">{" " + this.state.message}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}