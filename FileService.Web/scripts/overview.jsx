class OverViewTotal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentMonth: localStorage.overview_recentMonth || 1
        };
    }
    componentDidMount(e) {
        var myChartResource = document.getElementById('echart_app_resourcetask');
        var myChartDownload = document.getElementById('echart_app_alldownload');
        var myChartAppResource = document.getElementById('echart_app_resource');
        this.myChartResource = echarts.init(myChartResource);
        this.myChartDownload = echarts.init(myChartDownload);
        this.myChartAppResource = echarts.init(myChartAppResource);
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
    componentDidUpdate() {
        this.onWindowResize();
    }
    onWindowResize() {
        this.myChartResource.resize();
        this.myChartDownload.resize();
        this.myChartAppResource.resize();
    }
    onRecentMonthChange(e) {
        if (this.state.recentMonth == e.target.id) return;
        this.setState({ recentMonth: e.target.id }, function () {
            this.getData();
        });
        localStorage.overview_recentMonth = e.target.id;
    }
    getData() {
        this.getRecentData();
        this.getDownloadData();
        this.getResourceByAppName();
    }
    getRecentData() {
        var that = this;
        var xData = [];
        var dataFiles = {}, dataFilesArray = [];
        var dataTasks = {}, dataTasksArray = [];
        var legendData = [{
            name: culture.resource_count,
            icon: "roundRect"
        }, {
            name: culture.task_count,
            icon: "roundRect"
        }];
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
                that.myChartResource.setOption(getEchartOptionLine(xData, culture.resource_task_count_by_date, "5%", legendData));
                that.myChartResource.setOption({
                    series: [{
                        name: culture.resource_count,
                        type: 'line',
                        data: dataFilesArray
                    }, {
                        name: culture.task_count,
                        type: 'line',
                        data: dataTasksArray
                    }]
                });
            }
        });
    }
    getDownloadData() {
        var legendData = [{
            name: culture.downloads,
            icon: "roundRect"
        }];
        var that = this;
        var xData = [];
        var downloads = {}, downloadsArray = [];
        http.get(urls.overview.getDownloadsRecentMonthUrl + "?month=" + this.state.recentMonth, function (data) {
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    xData.push(data.result[i]._id);
                    downloads[data.result[i]._id] = data.result[i].count;
                }
                xData = xData.sortAndUnique();
                for (var i = 0; i < xData.length; i++) {
                    if (!downloads[xData[i]]) downloads[xData[i]] = 0;
                }
                for (var key in downloads) downloadsArray.push([key, downloads[key]]);
                downloadsArray.sort(function (a, b) {
                    if (a[0] < b[0]) return -1;
                    if (a[0] > b[0]) return 1;
                    return 0;
                });
                that.myChartDownload.setOption(getEchartOptionLine(xData, culture.download_count_by_date, "5%", legendData));
                that.myChartDownload.setOption({
                    series: [{
                        name: culture.downloads,
                        type: 'line',
                        data: downloadsArray
                    }]
                });
            }
        });
    }
    getResourceByAppName() {
        var appArray = [], xData = [], legendData = [], series = [];
        http.get(urls.overview.getFilesCountByAppNameUrl + "?month=" + this.state.recentMonth, function (data) {
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    xData.push(data.result[i]._id.date);
                    if (appArray.indexOf(data.result[i]._id.from) == -1) {
                        appArray.push(data.result[i]._id.from);
                        series.push({
                            name: data.result[i]._id.from,
                            type: 'line',
                            symbol: "circle",
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    width: 1
                                }
                            },
                            data: []
                        });
                        legendData.push({ name: data.result[i]._id.from, icon: "roundRect" });
                    }
                }
                for (var i = 0; i < data.result.length; i++) {
                    for (var j = 0; j < series.length; j++) {
                        if (data.result[i]._id.from == series[j].name) {
                            series[j].data.push([data.result[i]._id.date, data.result[i].count]);
                        } else {
                            series[j].data.push([data.result[i]._id.date, 0]);
                        }
                    }
                }
                xData = xData.sortAndUnique();

                this.myChartAppResource.setOption(getEchartOptionLine(xData, culture.resource_count_by_appname, "3%", legendData));
                this.myChartAppResource.setOption({ series: series });
            }
        }.bind(this));
    }
    render() {
        return (
            <div className={this.props.show ? "overview_con show" : "overview_con hidden"}>
                <TitleTxtRecentMonth title={culture.count_by_date}
                    recentMonth={this.state.recentMonth}
                    onRecentMonthChange={this.onRecentMonthChange.bind(this)} />
                <div className="echart_main_con">
                    <div className="echart_app_resourcetask" id="echart_app_resourcetask"></div>
                    <div className="echart_split"></div>
                    <div className="echart_app_alldownload" id="echart_app_alldownload"></div>
                </div>
                <br />
                <div className="echart_main_con">
                    <div className="echart_app_resource" id="echart_app_resource"></div>
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
            downloads: 0
        }
    }
    componentDidMount() {
        this.myChart = echarts.init(document.getElementById('echart_count_appname'));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
    componentDidUpdate() {
        this.onWindowResize();
    }
    onWindowResize() {
        this.myChart.resize();
    }
    getData() {
        this.getTotalCount();
        this.getByAppCount();
    }
    getTotalCount() {
        var that = this;
        http.get(urls.overview.totalUrl, function (data) {
            if (data.code == 0) {
                that.setState({ Handlers: data.result.Handlers, Tasks: data.result.Tasks, downloads: data.result.Downloads });
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
                <TitleTxtRightTips title={culture.count_by_app}
                    handlers={this.state.Handlers}
                    tasks={this.state.Tasks}
                    resourcesImage={this.state.ResourcesImage}
                    resourcesVideo={this.state.ResourcesVideo}
                    resourcesAttachment={this.state.ResourcesAttachment}
                    downloads={this.state.downloads} />
                <div className="echart_main" id="echart_count_appname" style={{ height: "240px", width: "100%" }}></div>
            </div>
        );
    }
}
class Servers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "",
            webServer: {},
            mongosServer: {},
            dataServer: []
        };
    }
    componentDidMount() {
        this.getData();
    }
    getData() {
        http.get(urls.serverStateUrl, function (data) {
            if (data.code == 0) {
                this.setState({
                    type: data.result.Type,
                    webServer: data.result.WebServer,
                    mongosServer: data.result.MongosServer,
                    dataServer: data.result.DataServer,
                });
            }
        }.bind(this))
    }
    render() {
        return (
            <div className={this.props.show ? "server_con show" : "server_con hidden"}>
                <TitleTxt title={culture.web_server} />
                <table className="table">
                    <tbody>
                        <tr>
                            <td width="20%">{culture.server_name}</td>
                            <td width="25%">{culture.os}</td>
                            <td width="10%">{culture.memory}</td>
                            <td width="19%">{culture.disk + "(" + culture.available + "/" + culture.total + ")"}</td>
                            <td width="13%">{culture.cacheFiles}</td>
                            <td width="13%">{culture.logFiles}</td>
                        </tr>
                        <tr>
                            <td >{this.state.webServer.ServerName}</td>
                            <td >{this.state.webServer.OS}</td>
                            <td >{this.state.webServer.MemoryTotal}G</td>
                            <td >{this.state.webServer.Disk}</td>
                            <td >{this.state.webServer.CacheFiles}</td>
                            <td >{this.state.webServer.LogFiles}</td>
                        </tr>
                    </tbody>
                </table>
                {this.state.type == "sharding" ?
                    <TitleTxt title={culture.route_server + "(mongos)"} /> : null}
                {this.state.type == "sharding" ?
                    <table className="table" style={{ width: "80%" }}>
                        <tbody>
                            <tr>
                                <td width="18%">{culture.server_name}</td>
                                <td width="14%">{culture.port}</td>
                                <td width="14%">{culture.version}</td>
                                <td width="12%">{culture.data}</td>
                                <td width="12%">{culture.type}</td>
                                <td width="15%">{culture.upTime}</td>
                                <td width="15%">{culture.state}</td>
                            </tr>
                            <tr>
                                <td>{this.state.mongosServer.ServerName}</td>
                                <td>{this.state.mongosServer.Port}</td>
                                <td>{this.state.mongosServer.Version}</td>
                                <td>{this.state.mongosServer.Data}</td>
                                <td>{this.state.mongosServer.Type}</td>
                                <td>{convertDay(this.state.mongosServer.UpTime)}</td>
                                <td><span className="state running"></span>{'\u00A0'}running</td>
                            </tr>
                        </tbody>
                    </table> : null}
                {(this.state.type == "replset" || this.state.type == "sharding") ?
                    <TitleTxt title={culture.data_server} /> : null}
                {this.state.type == "single" ?
                    <table className="table" style={{ width: "70%" }}>
                        <tbody>
                            <tr>
                                <td width="18%">{culture.server_name}</td>
                                <td width="14%">{culture.port}</td>
                                <td width="14%">{culture.version}</td>
                                <td width="12%">{culture.data}</td>
                                <td width="12%">{culture.type}</td>
                                <td width="20%">{culture.upTime}</td>
                                <td width="10%">{culture.state}</td>
                            </tr>
                            <tr>
                                <td>{this.state.dataServer.ServerName}</td>
                                <td>{this.state.dataServer.Port}</td>
                                <td>{this.state.dataServer.Version}</td>
                                <td>{this.state.dataServer.Data}</td>
                                <td>{this.state.dataServer.Type}</td>
                                <td>{convertDay(this.state.mongosServer.UpTime)}</td>
                                <td>
                                    <span className={"state " + convertMongoServerState(this.state.dataServer.State, this.state.dataServer.Health)}></span>{'\u00A0'}
                                    {convertMongoServerState(this.state.dataServer.State, this.state.dataServer.Health)}
                                </td>
                            </tr>
                        </tbody>
                    </table> :
                    <React.Fragment>
                        {this.state.dataServer.map(function (item, key) {
                            return (
                                <table className="table" style={{ width: "70%" }} key={key}>
                                    <thead>
                                        <tr>
                                            <td colSpan="10">{item.ReplSetName}</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td width="18%">{culture.server_name}</td>
                                            <td width="14%">{culture.port}</td>
                                            <td width="14%">{culture.version}</td>
                                            <td width="12%">{culture.data}</td>
                                            <td width="12%">{culture.type}</td>
                                            <td width="15%">{culture.upTime}</td>
                                            <td width="15%">{culture.state}</td>
                                        </tr>
                                        {item.Servers.map(function (server, index) {
                                            return (
                                                <tr key={index}>
                                                    <td>{server.ServerName}{'\u00A0'}{server.State == 1 ? <i className="iconfont icon-star" style={{ cursor: "default", color:"#484848" }} /> : ""}</td>
                                                    <td>{server.Port}</td>
                                                    <td>{server.Version}</td>
                                                    <td>{server.Data}</td>
                                                    <td>{convertMongoServerType(server.State)}</td>
                                                    <td>{convertDay(server.UpTime)}</td>
                                                    <td>
                                                        <span className={"state " + convertMongoServerState(server.State, server.Health)}></span>{'\u00A0'}
                                                        {convertMongoServerState(server.State, server.Health)}
                                                    </td>
                                                </tr>
                                            )
                                        }.bind(this))}
                                    </tbody>
                                </table>
                            )
                        }.bind(this))}
                    </React.Fragment>
                }
            </div>
        )
    }
}
class Overview extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.overview_show) localStorage.overview_show = true;
        if (!localStorage.total_show) localStorage.total_show = true;
        if (!localStorage.server_show) localStorage.server_show = true;
        this.state = {
            overviewShow: eval(localStorage.overview_show) ? true : false,
            totalShow: eval(localStorage.total_show) ? true : false,
            serverShow: eval(localStorage.server_show) ? true : false,
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
                that.refs.serverState.getData();
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
    onServerShow(e) {
        if (this.state.serverShow) {
            this.setState({ serverShow: false });
            localStorage.server_show = false;
        } else {
            this.setState({ serverShow: true });
            localStorage.server_show = true;
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
                    onShowChange={this.onCountTotalShow.bind(this)} />
                <CountTotal ref="countTotal" show={this.state.totalShow} />
                <TitleArrow title={culture.servers}
                    show={this.state.serverShow}
                    onShowChange={this.onServerShow.bind(this)} />
                <Servers ref="serverState"
                    show={this.state.serverShow} />
            </div>
        )
    }
}