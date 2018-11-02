class PreviewBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="background">
                <div className="background_text">{this.props.text}</div>
            </div>
        );
    }
}
class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: [],
            fileId: "",
            text: "",
            isOrigin: false,
            deleted: false,
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var convert = document.getElementById("convert").value == "true" ? true : false;
        var deleted = document.getElementById("deleted").value == "true" ? true : false;
        var array = [];
        array.push({ _id: fileId, tag: "origin", current: false });
        this.dataSetChange(array);
        var url = (convert ? urls.downloadConvertUrl : urls.downloadUrl) + "/" + fileId;
        if (deleted) url = url + "?deleted=true";
        http.getFile(url, function (data) {
            this.setState({ text: data });
        }.bind(this));
    }
    render() {
        return (
            <div>
                <PreviewTitle
                    tabs={this.state.tabs}
                    onItemClick={this.onItemClick.bind(this)} />
                <PreviewBody text={this.state.text} isOrigin={this.state.isOrigin} />
            </div>
        );
    }
}
for (var item in PreviewCommon) Preview.prototype[item] = PreviewCommon[item];  //添加公用方法
ReactDOM.render(
    <Preview />,
    document.getElementById('preview')
);