class OverViewTotal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentMonth: localStorage.overview_recentMonth || 1
        };
    }
    componentDidMount(e) {
        this.myChart = echarts.init(document.getElementById('echart_main'));
    }
    onRecentMonthChange(e) {
        if (this.state.recentMonth == e.target.id) return;
        this.setState({ recentMonth: e.target.id }, function () {
            this.getRecentData();
        });
        localStorage.overview_recentMonth = e.target.id;
    }
    getData() {
        this.getRecentData();
    }
    getRecentData() {
        var that = this;
        var xData = [];
        var dataFiles = {}, dataFilesArray = [];
        var dataTasks = {}, dataTasksArray = [];
        http.get(urls.overview.recentUrl + "?month=" + this.state.recentMonth, function (data) {
            if (data.code == 0) {
                for (var i = 0; i < data.result.files.length; i++) {
                    xData.push(data.result.files[i]._id);
                    dataFiles[data.result.files[i]._id] = data.result.files[i].count;
                }
                for (var i = 0; i < data.result.tasks.length; i++) {
                    xData.push(data.result.tasks[i]._id);
                    dataTasks[data.result.tasks[i]._id] = data.result.tasks[i].count;
                }
                xData = xData.sortAndUnique();
                for (var i = 0; i < xData.length; i++) {
                    if (!dataFiles[xData[i]]) dataFiles[xData[i]] = 0;
                    if (!dataTasks[xData[i]]) dataTasks[xData[i]] = 0;
                }
                for (var key in dataFiles) dataFilesArray.push([key, dataFiles[key]]);
                for (var key in dataTasks) dataTasksArray.push([key, dataTasks[key]]);
                dataFilesArray.sort(function (a, b) {
                    if (a[0] < b[0]) return -1;
                    if (a[0] > b[0]) return 1;
                    return 0;
                });
                dataTasksArray.sort(function (a, b) {
                    if (a[0] < b[0]) return -1;
                    if (a[0] > b[0]) return 1;
                    return 0;
                });
                that.myChart.setOption(getEchartOptionLine(xData));
                that.myChart.setOption({
                    series: [{
                        type: 'line',
                        data: dataFilesArray
                    }, {
                        type: 'line',
                        data: dataTasksArray
                    }]
                });
            }
        });
    }
    render() {
        return (
            <div className={this.props.show ? "overview_con show" : "overview_con hidden"}>
                <TitleTxt title={culture.count_by_date} />
                <div className="echart_main" id="echart_main"></div>
                <div className="echart_split"></div>
                <div className="echart_option">
                    <div className="echart_option_con">
                        <span id="1"
                            className={this.state.recentMonth == "1" ? "current" : ""}
                            onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 1 {culture.month}</span>
                        <span id="12"
                            className={this.state.recentMonth == "12" ? "current" : ""}
                            onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 1 {culture.year}</span>
                        <span id="3"
                              className={this.state.recentMonth == "3" ? "current" : ""}
                              onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 3 {culture.month}</span>
                        <span id="24"
                              className={this.state.recentMonth == "24" ? "current" : ""}
                              onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 2 {culture.year}</span>
                        <span id="6"
                              className={this.state.recentMonth == "6" ? "current" : ""}
                              onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 6 {culture.month}</span>
                        <span id="36"
                              className={this.state.recentMonth == "36" ? "current" : ""}
                              onClick={this.onRecentMonthChange.bind(this)}>{culture.last} 3 {culture.year}</span>
                    </div>
                </div>
            </div>
        );
    }
}
class CountTotal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Handlers: 0,
            Tasks: 0,
            ResourcesImage: 0,
            ResourcesVideo: 0,
            ResourcesAttachment: 0,
        }
    }
    componentDidMount() {
        this.myChart = echarts.init(document.getElementById('echart_count_appname'));
        window.onresize = function () {
            this.myChart.resize();
        }.bind(this)
    }
    getData() {
        this.getTotalCount();
        this.getByAppCount();
    }
    getTotalCount() {
        var that = this;
        http.get(urls.overview.totalUrl, function (data) {
            if (data.code == 0) {
                that.setState({
                    Handlers: data.result.Handlers,
                    Tasks: data.result.Tasks
                });
                for (var i = 0; i < data.result.Resources.length; i++) {
                    if (data.result.Resources[i]._id == "attachment") that.setState({ ResourcesAttachment: data.result.Resources[i].count });
                    if (data.result.Resources[i]._id == "video") that.setState({ ResourcesVideo: data.result.Resources[i].count });
                    if (data.result.Resources[i]._id == "image") that.setState({ ResourcesImage: data.result.Resources[i].count });
                }
            }
        });
    }
    getByAppCount() {
        var that = this;
        http.get(urls.overview.filesTaskCountByAppNameUrl, function (data) {
            if (data.code == 0) {
                var xData = [];
                var files = [];
                var tasks = [];
                for (var i = 0; i < data.result.length; i++) {
                    xData.push(data.result[i]._id);
                    files.push(data.result[i].files);
                    tasks.push(data.result[i].tasks);
                }
                that.myChart.setOption(getEchartOptionBar(xData, files, tasks, culture.resource_task_count_by_appname));
            }
        });
    }
    render() {
        return (
            <div className={this.props.show ? "overview_con show" : "overview_con hidden"}>
                <TitleTxt title={culture.count_by_app} />
                <div className="echart_main" id="echart_count_appname" style={{ height: "240px", width:"100%" }}>
                </div>
                <TitleTxt title={culture.totals} />
                <div className="totals">
                    <table className="table_general" style={{width:"40%"}}>
                        <thead>
                            <tr>
                                <td>{culture.handlers}</td>
                                <td>{culture.tasks}</td>
                                <td>{culture.resources}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{this.state.Handlers}</td>
                                <td>{this.state.Tasks}</td>
                                <td>{this.state.ResourcesAttachment + this.state.ResourcesImage + this.state.ResourcesVideo}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <TitleTxt title={culture.resources} />
                <div className="totals">
                    <table className="table_general" style={{width:"30%"}}>
                        <thead>
                            <tr>
                                <td>{culture.image}</td>
                                <td>{culture.video}</td>
                                <td>{culture.attachment}</td>
                                <td>{culture.total}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{this.state.ResourcesImage}</td>
                                <td>{this.state.ResourcesVideo}</td>
                                <td>{this.state.ResourcesAttachment}</td>
                                <td>{this.state.ResourcesImage + this.state.ResourcesVideo + this.state.ResourcesAttachment}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
class Overview extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.overview_show) localStorage.overview_show = true;
        if (!localStorage.total_show) localStorage.total_show = true;
        if (!localStorage.log_show) localStorage.log_show = true;
        this.state = {
            overviewShow: eval(localStorage.overview_show) ? true : false,
            totalShow: eval(localStorage.total_show) ? true : false,
            logShow: eval(localStorage.log_show) ? true : false,
        }
    }
    componentDidMount() {
        this.refs.overViewTotal.getData();
        this.refs.countTotal.getData();
        this.getDataInterval(this.props.refresh);
    }
    componentWillUnmount() {
        window.clearInterval(this.interval);
    }
    getDataInterval(value) {
        var that = this;
        var numb = parseInt(value);
        if (numb > 0) {
            this.interval = window.setInterval(function () {
                that.refs.overViewTotal.getData();
                that.refs.countTotal.getData();
                localStorage.update_time = getCurrentDateTime();
            }
            , numb * 1000);
        } else {
            window.clearInterval(this.interval);
        }
    }
    onRefreshChange(value) {
        window.clearInterval(this.interval);
        this.getDataInterval(value);
    }
    onOverviewShow(e) {
        if (this.state.overviewShow) {
            this.setState({ overviewShow: false });
            localStorage.overview_show = false;
        } else {
            this.setState({ overviewShow: true });
            localStorage.overview_show = true;
        }
    }
    onCountTotalShow(e) {
        if (this.state.totalShow) {
            this.setState({ totalShow: false });
            localStorage.total_show = false;
        } else {
            this.setState({ totalShow: true });
            localStorage.total_show = true;
        }
    }
    onLogShow(e) {
        if (this.state.logShow) {
            this.setState({ logShow: false });
            localStorage.log_show = false;
        } else {
            this.setState({ logShow: true });
            localStorage.log_show = true;
        }
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.overview}</h1>
                <TitleArrow title={culture.overview}
                            show={this.state.overviewShow}
                            onShowChange={this.onOverviewShow.bind(this)} />
                <OverViewTotal ref="overViewTotal" show={this.state.overviewShow} />
                <TitleArrow title={culture.totals}
                            show={this.state.totalShow} 
                            onShowChange={this.onCountTotalShow.bind(this)}/>
                <CountTotal ref="countTotal" show={this.state.totalShow}/>
            </div>
        )
    }
}