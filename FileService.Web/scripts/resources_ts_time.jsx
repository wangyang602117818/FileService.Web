class TsTimeData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table" style={{ width: "70%" }}>
                    <thead>
                        <tr>
                            <th width="20%">{culture.id}</th>
                            <th width="25%">{culture.fileName}</th>
                            <th width="10%">{culture.username}</th>
                            <th width="10%">{culture.playtime + "(" + culture.seconds + ")"}</th>
                            <th width="15%">{culture.createTime}</th>
                        </tr>
                    </thead>
                    <TsTimeList data={this.props.data} />
                </table>
            </div>
        );
    }
}
class TsTimeList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (this.props.data.length == 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan='10'>... {culture.no_data} ...</td>
                    </tr>
                </tbody>
            )
        } else {
            return (
                <tbody>
                    {this.props.data.map(function (item, i) {
                        return (
                            <tr key={i}>
                                <td>{item.SourceId.$oid}</td>
                                <td>{item.SourceName}</td>
                                <td>{item.UserName}</td>
                                <td>{item.TsTime}</td>
                                <td>{parseBsonTime(item.CreateTime)}</td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            )
        }
    }
}
class TsTime extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <TsTimeData data={this.props.data} show={this.props.show} />
        )
    }
}