class PreviewBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.fileId) {
            return (
                <div className="background">
                    {this.props.isOrigin ?
                        <img src={(this.props.convert ? urls.downloadConvertUrl : urls.downloadUrl) + "/" + this.props.fileId} />
                        :
                        <img src={urls.thumbnailUrl + "/" + this.props.fileId} />
                    }
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
            isOrigin: false
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var convert = document.getElementById("convert").value == "true" ? true : false;
        this.setState({ convert: convert });
        var that = this;
        http.get(urls.imageListUrl + "/" + fileId, function (data) {
            if (data.code == 0) that.dataSetChange(data.result);
        });
    }
    render() {
        return (
            <div>
                <PreviewTitle
                    tabs={this.state.tabs}
                    onItemClick={this.onItemClick.bind(this)} />
                <PreviewBody fileId={this.state.fileId}
                    isOrigin={this.state.isOrigin}
                    convert={this.state.convert} />
            </div>
        );
    }
}
for (var item in PreviewCommon) Preview.prototype[item] = PreviewCommon[item];  //添加公用方法

ReactDOM.render(
    <Preview />,
    document.getElementById('preview')
);