class PreviewBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.fileId) {
            var url = (this.props.convert ? urls.downloadConvertUrl : urls.downloadUrl) + "/" + this.props.fileId;
            if (this.props.deleted) url = url + "?deleted=true";
            return (
                <div className="background">
                    <audio controls="controls">
                        <source src={url} type="audio/mpeg" />
                    </audio>
                </div>
            );
        } else {
            return null;
        }
    }
}
class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: [],
            fileId: "",
            convert: false,
            deleted: false,
            isOrigin: false
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var convert = document.getElementById("convert").value == "true" ? true : false;
        var deleted = document.getElementById("deleted").value == "true" ? true : false;
        var array = [];
        array.push({ _id: fileId, tag: "origin", current: false });
        this.dataSetChange(array);

        this.setState({ convert: convert, deleted: deleted, fileId: fileId});
    }
    render() {
        return (
            <div>
                <PreviewTitle
                    tabs={this.state.tabs}
                    onItemClick={this.onItemClick.bind(this)} />
                <PreviewBody fileId={this.state.fileId}
                    isOrigin={this.state.isOrigin}
                    deleted={this.state.deleted}
                    convert={this.state.convert}
                />
            </div>
        );
    }
}
for (var item in PreviewCommon) Preview.prototype[item] = PreviewCommon[item];  //添加公用方法

ReactDOM.render(
    <Preview />,
    document.getElementById('preview')
);