var PreviewCommon = {
    dataSetChange(dataList) {
        var currentItem = window.location.href.split("#")[1] || "";
        var fileId = "";
        var isOrigin = false;
        if (currentItem) {
            for (var i = 0; i < dataList.length; i++) {
                if (dataList[i]._id == currentItem) {
                    dataList[i].current = true;
                    fileId = dataList[i]._id;
                    if (i == 0) isOrigin = true;
                }
            }
        } else {
            dataList[0].current = true;
            fileId = dataList[0]._id;
            isOrigin = true;
        }
        this.setState({
            tabs: dataList,
            fileId: fileId,
            isOrigin: isOrigin
        });
    },
    onItemClick(e) {
        var id = e.target.id;
        for (var i = 0; i < this.state.tabs.length; i++) {
            if (this.state.tabs[i]._id == id) {
                this.state.tabs[i].current = true;
                i == 0 ? this.state.isOrigin = true : this.state.isOrigin = false;
            } else {
                this.state.tabs[i].current = false;
            }
        }
        this.setState({
            tabs: this.state.tabs,
            fileId: id,
            isOrigin: this.state.isOrigin
        });
        if (this.state.isOrigin) {
            window.history.replaceState({}, "", window.location.href.split("#")[0]);
        } else {
            window.history.replaceState({}, "", "#" + id);
        }
        //video
        var video = document.getElementsByClassName("hlsplayer")[0];
        if (video && id && !this.state.isOrigin) {
            video.src = "";
            video.getElementsByTagName("source")[0].src = urls.m3u8Url + "/" + id;
            hlsplayer();
        }
    }
}
class PreviewTitleItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.selected) {
            return (<div className="title_item current" title={this.props.id} id={this.props.id} onClick={this.props.onItemClick}>{this.props.tag}</div>);
        } else {
            return (
                <div className="title_item" title={this.props.id} id={this.props.id} onClick={this.props.onItemClick}>{this.props.tag}</div>);
        }
    }
}
class PreviewTitle extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="title">
                {
                    this.props.tabs.map(function (item, i) {
                        return <PreviewTitleItem id={item._id} tag={item.tag} selected={item.current} key={i} onItemClick={this.props.onItemClick} />
                    }.bind(this))
                }
            </div>
        );
    }
}