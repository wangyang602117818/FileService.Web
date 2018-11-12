class SharedFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table">
                    <thead>
                        <tr>
                            <th width="24%">{culture.fileName}</th>
                            <th width="26%">{culture.shared_link}</th>
                            <th width="6%">{culture.password}</th>
                            <th width="8%">{culture.date + "(" + culture.day + ")"}</th>
                            <th width="13%">{culture.expired_date}</th>
                            <th width="13%">{culture.createTime}</th>
                            <th width="5%">{culture.state}</th>
                            <td width="5%">{culture.disabled}</td>
                        </tr>
                    </thead>
                    <SharedFileList data={this.props.data} disableShared={this.props.disableShared} enableShared={this.props.enableShared} />
                </table>
                <AddShared sharedUrl={this.props.sharedUrl} shared={this.props.shared} />

            </div>
        );
    }
}
class SharedFileList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
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
                        var expiredDate = dateAddDay(parseBsonTime(item.CreateTime), item.ExpiredDay);
                        var currentDate = getCurrentDateTime();
                        return (
                            <tr key={i}>
                                <td title={item.FileName}>{item.FileName.getFileName(15)}</td>
                                <td>{item.SharedUrl}</td>
                                <td>{item.PassWord || "none"}</td>
                                <td>{item.ExpiredDay || "∞"}</td>
                                <td>{item.ExpiredDay == 0 ? "∞" : expiredDate}</td>
                                <td>{parseBsonTime(item.CreateTime)}</td>
                                <td>
                                    {
                                        (!item.Disabled && (currentDate < expiredDate || item.ExpiredDay==0)) ?
                                            <span className="state use_state" title={culture.used} />
                                            :
                                            <span className="state disabled_state" title={culture.disabled} />
                                    }
                                </td>
                                <td>
                                    {
                                        !item.Disabled ?
                                            <i className="iconfont icon-disable"
                                                id={item._id.$oid}
                                                onClick={this.props.disableShared.bind(this)}></i> : 
                                            <i className="iconfont icon-dui"
                                                id={item._id.$oid}
                                                onClick={this.props.enableShared.bind(this)}></i>
                                    }
                                </td>
                            </tr>
                        )
                    }.bind(this))}
                </tbody>
            );
        }
    }
}
class AddShared extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shared_type: "publish",
            expired_day: 0,
            password: "",

        }
    }
    sharedTypeChange(e) {
        this.setState({ shared_type: e.target.value });
        if (e.target.value == "encrypt") {
            this.getHexCode();
        } else {
            this.setState({ password: "" });
        }
    }
    getHexCode() {
        http.get(urls.getHexCodeUrl + "/4", function (data) {
            if (data.code == 0) {
                this.setState({ password: data.result });
            }
        }.bind(this));
    }
    shared() {
        if (this.state.shared_type == "encrypt" && trim(this.state.password).length <= 0) return;
        this.props.shared({
            sharedType: this.state.shared_type,
            passWord: this.state.password,
            expiredDay: this.state.expired_day
        });
    }
    render() {
        return (
            <table className="table_modify" style={{width:"70%"}}>
                <tbody>
                    <tr>
                        <td>{culture.shared_link}:</td>
                        <td colSpan="3">{this.props.sharedUrl}</td>
                    </tr>
                    <tr>
                        <td width="10%">{culture.shared_type}:</td>
                        <td width="20%">
                            <label htmlFor="publish">
                                <input type="radio"
                                    name="shared_type"
                                    id="publish"
                                    value="publish"
                                    checked={this.state.shared_type == 'publish'}
                                    onChange={this.sharedTypeChange.bind(this)} />{'\u00A0'}{culture.public}
                            </label>{'\u00A0'}{'\u00A0'}
                            <label htmlFor="encrypt">
                                <input type="radio"
                                    name="shared_type"
                                    id="encrypt"
                                    value="encrypt"
                                    checked={this.state.shared_type == 'encrypt'}
                                    onChange={this.sharedTypeChange.bind(this)}
                                />{'\u00A0'}{culture.encrypt}
                            </label>
                        </td>
                        <td width="10%">{culture.expired_date}:</td>
                        <td width="60%">
                            <select name="expired_day"
                                defaultValue={this.state.expired_day}
                                onChange={e => this.setState({ expired_day: e.target.value })}>
                                <option value="1">1{culture.day}</option>
                                <option value="7">7{culture.day}</option>
                                <option value="0">{culture.never_expire}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.password}:</td>
                        <td colSpan="3"><input type="text" name="password"
                            disabled={this.state.shared_type == 'publish'}
                            onChange={e => this.setState({ password: e.target.value })}
                            value={this.state.password} />
                            <font color="red">*</font>
                            {'\u00A0'}
                            {this.state.shared_type == 'encrypt' ?
                                <i className="iconfont icon-get"
                                    onClick={this.getHexCode.bind(this)}></i> : null
                            }
                        </td>
                    </tr>
                    <tr style={{ height: "40px" }}>
                        <td colSpan="4">
                            <input type="button" name="create" value={culture.create} className="button" onClick={this.shared.bind(this)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}