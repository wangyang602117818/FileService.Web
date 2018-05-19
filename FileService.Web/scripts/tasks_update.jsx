class ImageUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            fileId: "",
            thumbnailId: "",
            handler: "",
            format: 0,
            flag: "",
            model: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    }
    changeState(obj) {
        this.setState(obj);
    }
    handlerChange(e) {
        this.setState({ handler: e.target.value });
    }
    formatChange(e) {
        this.setState({ format: e.target.value });
    }
    flagChange(e) {
        this.setState({ flag: e.target.value });
    }
    modelChange(e) {
        this.setState({ model: e.target.value });
    }
    xChange(e) {
        this.setState({ x: e.target.value });
    }
    yChange(e) {
        this.setState({ y: e.target.value });
    }
    widthChange(e) {
        this.setState({ width: e.target.value });
    }
    heightChange(e) {
        this.setState({ height: e.target.value });
    }
    updateImage() {
        if (this.state.flag)
            this.props.updateImage(this.state);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "50%" }}>
                    <tbody>
                        <tr>
                            <td>{culture.handler}:</td>
                            <td>
                                <select name="handler" value={this.state.handler} onChange={this.handlerChange.bind(this)}>
                                    {this.props.handlers.map(function (item, i) {
                                        return <option value={item} key={i}>{item}</option>
                                    })}
                                </select>
                            </td>
                            <td>{culture.outputFormat}:</td>
                            <td>
                                <select name="format" value={this.state.format} onChange={this.formatChange.bind(this)}>
                                    <option value="0">{culture.default}</option>
                                    <option value="1">Jpeg</option>
                                    <option value="2">Png</option>
                                    <option value="3">Gif</option>
                                    <option value="4">Bmp</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.flag}:</td>
                            <td colSpan="3">
                                <input type="text" name="flag" maxLength="20" value={this.state.flag} onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.model}:</td>
                            <td>
                                <select name="model" value={this.state.model} onChange={this.modelChange.bind(this)}>
                                    <option value="0">{culture.scale}</option>
                                    <option value="1">{culture.cut}</option>
                                    <option value="2">{culture.by_width}</option>
                                    <option value="3">{culture.by_height}</option>
                                </select>
                            </td>
                            <td colSpan="2">
                                top:<input type="text"
                                    name="x"
                                    style={{ width: "35px" }}
                                    value={this.state.model == "1" ? this.state.x : "0"}
                                    disabled={this.state.model == "1" ? false : true}
                                    onChange={this.xChange.bind(this)} />px{'\u00A0'}
                                left:<input type="text" name="y" style={{ width: "35px" }}
                                    value={this.state.model == "1" ? this.state.y : "0"}
                                    disabled={this.state.model == "1" ? false : true}
                                    onChange={this.yChange.bind(this)} />px
                        </td>
                        </tr>
                        <tr>
                            <td width="15%">{culture.width}:</td>
                            <td width="35%"><input type="text"
                                name="width"
                                style={{ width: "60px" }}
                                disabled={this.state.model == "3" ? true : false}
                                value={this.state.width}
                                onChange={this.widthChange.bind(this)} />px</td>
                            <td width="20%">{culture.height}:</td>
                            <td width="30%"><input type="text"
                                name="height"
                                disabled={this.state.model == "2" ? true : false}
                                style={{ width: "60px" }}
                                value={this.state.height}
                                onChange={this.heightChange.bind(this)} />px</td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                <input type="button" name="btnImg" className="button" value={culture.update} onClick={this.updateImage.bind(this)} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class VideoUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            fileId: "",
            m3u8Id: "",
            handler: "",
            format: 0,
            quality: 0,
            flag: ""
        }
    }
    changeState(obj) {
        this.setState(obj);
    }
    qualityChange(e) {
        this.setState({ quality: e.target.value });
    }
    flagChange(e) {
        this.setState({ flag: e.target.value });
    }
    handlerChange(e) {
        this.setState({ handler: e.target.value });
    }
    updateVideo() {
        if (this.state.flag)
            this.props.updateVideo(this.state);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "50%" }}>
                    <tbody>
                        <tr>
                            <td width="15%">{culture.handler}:</td>
                            <td width="25%">
                                <select name="handler" value={this.state.handler} onChange={this.handlerChange.bind(this)}>
                                    {this.props.handlers.map(function (item, i) {
                                        return <option value={item} key={i}>{item}</option>
                                    })}
                                </select>
                            </td>
                            <td width="20%">{culture.outputFormat}:</td>
                            <td width="40%">
                                <select name="format" value={this.state.format}>
                                    <option value="0">M3u8</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.quality}:</td>
                            <td colSpan="3">
                                <select name="quality" value={this.state.quality} onChange={this.qualityChange.bind(this)}>
                                    <option value="0">{culture.original}</option>
                                    <option value="1">{culture.lower}</option>
                                    <option value="2">{culture.medium}</option>
                                    <option value="3">{culture.bad}</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.flag}:</td>
                            <td colSpan="3">
                                <input type="text" name="flag" value={this.state.flag} onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4"><input type="button" name="Update" className="button" value={culture.update} onClick={this.updateVideo.bind(this)} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class AttachmentUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            fileId: "",
            subFileId:"",
            handler: "",
            format: 10,
            flag: ""
        }
    }
    changeState(obj) {
        this.setState(obj);
    }
    handlerChange(e) {
        this.setState({ handler: e.target.value });
    }
    flagChange(e) {
        this.setState({ flag: e.target.value });
    }
    updateAttachment() {
        if (this.state.flag)
            this.props.updateAttachment(this.state);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "50%" }}>
                    <tbody>
                        <tr>
                            <td width="15%">{culture.handler}:</td>
                            <td width="75%">
                                <select name="handler" value={this.state.handler} onChange={this.handlerChange.bind(this)}>
                                    {this.props.handlers.map(function (item, i) {
                                        return <option value={item} key={i}>{item}</option>
                                    })}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.flag}:</td>
                            <td colSpan="3">
                                <input type="text" name="flag" value={this.state.flag} onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4"><input type="button" name="Update" className="button" value={culture.update} onClick={this.updateAttachment.bind(this)} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class TasksUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            component: null,
            handlers: [],
        };
    }
    componentDidMount() {
        var result = [], that = this;
        http.get(urls.tasks.getAllHandlersUrl, function (data) {
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) result.push(data.result[i].HandlerId);
                that.setState({ handlers: result });
            }
        });
    }
    getTaskById(id) {
        var that = this;
        http.get(urls.tasks.getByIdUrl + "/" + id, function (data) {
            if (data.code == 0) {
                if (data.result.Type == "image") {
                    that.setState({
                        component: ImageUpdate
                    }, function () {
                        that.refs.updatemodule.changeState({
                            id: id,
                            fileId: data.result.FileId.$oid,
                            thumbnailId: data.result.Output._id.$oid,
                            handler: data.result.HandlerId,
                            format: data.result.Output.Format,
                            flag: data.result.Output.Flag,
                            model: data.result.Output.Model,
                            x: data.result.Output.X,
                            y: data.result.Output.Y,
                            width: data.result.Output.Width,
                            height: data.result.Output.Height
                        });
                    });
                }
                if (data.result.Type == "video") {
                    that.setState({
                        component: VideoUpdate
                    }, function () {
                        that.refs.updatemodule.changeState({
                            id: id,
                            fileId: data.result.FileId.$oid,
                            m3u8Id: data.result.Output._id.$oid,
                            handler: data.result.HandlerId,
                            format: data.result.Output.Format,
                            flag: data.result.Output.Flag,
                            quality: data.result.Output.Quality
                        });
                    });
                }
                if (data.result.Type == "attachment") {
                    that.setState({
                        component: AttachmentUpdate
                    }, function () {
                        that.refs.updatemodule.changeState({
                            id: id,
                            fileId: data.result.FileId.$oid,
                            subFileId: data.result.Output._id.$oid,
                            handler: data.result.HandlerId,
                            format: data.result.Output.Format,
                            flag: data.result.Output.Flag
                        });
                    });
                }
            }
        });
    }
    render() {
        return this.state.component ? <this.state.component show={this.props.show}
            ref="updatemodule"
            updateImage={this.props.updateImage}
            updateVideo={this.props.updateVideo}
            updateAttachment={this.props.updateAttachment}
            handlers={this.state.handlers}
        /> : null;
    }
}