class PreviewBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="background" style={{ color: "#fff" }}>
                {this.props.text}
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
            text: "File Converting...",
            isOrigin: false
        }
    }
    componentDidMount() {
        var fileId = document.getElementById("fileId").value;
        var array = [];
        array.push({ _id: fileId, tag: "origin", current: false });
        this.dataSetChange(array);
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