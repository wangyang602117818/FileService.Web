class ConvertImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convert: {
                format: 0,
                flag: "",
                model: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                imageQuality: 0
            },
            convertTitle: {
                formatName: culture.default,
                flag: "",
                modelName: culture.scale,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                imageQuality: 0
            },
            button_disabled: true
        }
    }
    formatChange(e) {
        var formatId = e.target.value;
        var formatName = "";
        for (var i = 0; i < e.target.length; i++) {
            if (formatId == e.target[i].value) {
                formatName = e.target[i].text;
                break;
            }
        }
        this.state.convert.format = formatId;
        this.state.convertTitle.formatName = formatName;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    flagChange(e) {
        this.state.convert.flag = e.target.value;
        this.state.convertTitle.flag = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    modelChange(e) {
        var modelId = e.target.value;
        var modelName = "";
        for (var i = 0; i < e.target.length; i++) {
            if (modelId == e.target[i].value) {
                modelName = e.target[i].text;
                break;
            }
        }
        this.state.convert.model = modelId;
        this.state.convertTitle.modelName = modelName;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    xChange(e) {
        this.state.convert.x = e.target.value;
        this.state.convertTitle.x = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    yChange(e) {
        this.state.convert.y = e.target.value;
        this.state.convertTitle.y = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    widthChange(e) {
        this.state.convert.width = e.target.value;
        this.state.convertTitle.width = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    heightChange(e) {
        this.state.convert.height = e.target.value;
        this.state.convertTitle.height = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        }, function () { this.checkAvailable(); });
    }
    imageQualityChange(e) {
        this.state.convert.imageQuality = e.target.value;
        this.state.convertTitle.imageQuality = e.target.value;
        this.setState({
            convert: this.state.convert,
            convertTitle: this.state.convertTitle
        });
    }
    checkAvailable() {
        if (this.state.convert.flag.length > 0) {
            if (this.state.convert.model == "0") { //缩放
                this.state.convert.x = 0;
                this.state.convert.y = 0;
                this.state.convertTitle.x = 0;
                this.state.convertTitle.y = 0;
                this.setState({
                    button_disabled: false,
                    convert: this.state.convert,
                    convertTitle: this.state.convertTitle
                });
            }
            if (this.state.convert.model == "1") {  //剪切
                if (this.state.convert.width > 0 && this.state.convert.height > 0) {
                    this.setState({ button_disabled: false });
                } else {
                    this.setState({ button_disabled: true });
                }
            }
            if (this.state.convert.model == "2") { //按宽度
                this.state.convert.x = 0;
                this.state.convert.y = 0;
                this.state.convertTitle.x = 0;
                this.state.convertTitle.y = 0;
                this.state.convert.height = 0;
                this.state.convertTitle.height = 0;
                if (this.state.convert.width > 0) {
                    this.setState({ button_disabled: false });
                } else {
                    this.setState({ button_disabled: true });
                }
                this.setState({
                    convert: this.state.convert,
                    convertTitle: this.state.convertTitle
                });
            }
            if (this.state.convert.model == "3") { //按高度
                this.state.convert.x = 0;
                this.state.convert.y = 0;
                this.state.convertTitle.x = 0;
                this.state.convertTitle.y = 0;
                this.state.convert.width = 0;
                this.state.convertTitle.width = 0;
                if (this.state.convert.height > 0) {
                    this.setState({ button_disabled: false });
                } else {
                    this.setState({ button_disabled: true });
                }
                this.setState({
                    convert: this.state.convert,
                    convertTitle: this.state.convertTitle
                });
            }
        } else {
            this.setState({ button_disabled: true });
        }
    }
    Ok(e) {
        if (this.state.convert.flag) {
            this.props.imageOk(this.state.convert, this.state.convertTitle);
            this.setState({
                button_disabled: true
            })
        }
    }
    render() {
        return (
            <table className="table_modify" style={{ width: "100%", marginTop: "0", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td>{culture.outputFormat}:</td>
                        <td colSpan="3">
                            <select name="format"
                                value={this.state.convert.format}
                                onChange={this.formatChange.bind(this)}>
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
                            <input type="text"
                                name="flag"
                                maxLength="20"
                                value={this.state.convert.flag}
                                onChange={this.flagChange.bind(this)} /><font color="red">*</font>
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.convertModel}:</td>
                        <td>
                            <select name="model"
                                value={this.state.convert.model}
                                onChange={this.modelChange.bind(this)}>
                                <option value="0">{culture.scale}</option>
                                <option value="1">{culture.cut}</option>
                                <option value="2">{culture.by_width}</option>
                                <option value="3">{culture.by_height}</option>

                            </select>
                        </td>
                        <td colSpan="2">
                            x:<input type="text" name="x" style={{ width: "35px" }}
                                value={this.state.convert.x}
                                disabled={this.state.convert.model == "1" ? false : true}
                                onChange={this.xChange.bind(this)} />px
                            {'\u00A0'}
                            y:<input type="text" name="y" style={{ width: "35px" }}
                                value={this.state.convert.y}
                                disabled={this.state.convert.model == "1" ? false : true}
                                onChange={this.yChange.bind(this)} />px
                        </td>
                    </tr>
                    <tr>
                        <td width="15%">{culture.width}:</td>
                        <td width="35%"><input type="text" name="width"
                            style={{ width: "60px" }}
                            value={this.state.convert.width}
                            disabled={(this.state.convert.model == "3") ? true : false}
                            onChange={this.widthChange.bind(this)} />px</td>
                        <td width="20%">{culture.height}:</td>
                        <td width="30%"><input type="text" name="height"
                            style={{ width: "60px" }}
                            value={this.state.convert.height}
                            disabled={(this.state.convert.model == "2") ? true : false}
                            onChange={this.heightChange.bind(this)} />px</td>
                    </tr>
                    <tr>
                        <td>{culture.image_quality}</td>
                        <td colSpan="3">
                            <input type="radio" value="0" name="imageQuality" id="high"
                                onChange={this.imageQualityChange.bind(this)}
                                checked={this.state.convert.imageQuality == "0" ? true : false} /><label htmlFor="high">{culture.high}</label>
                            {'\u00A0'}
                            {'\u00A0'}
                            {'\u00A0'}
                            {'\u00A0'}
                            <input type="radio" value="1" name="imageQuality" id="medium"
                                onChange={this.imageQualityChange.bind(this)}
                                checked={this.state.convert.imageQuality == "1" ? true : false} /><label htmlFor="medium">{culture.medium}</label>
                            {'\u00A0'}
                            {'\u00A0'}
                            {'\u00A0'}
                            {'\u00A0'}
                            <input type="radio" value="2" name="imageQuality" id="low"
                                onChange={this.imageQualityChange.bind(this)}
                                checked={this.state.convert.imageQuality == "2" ? true : false} /><label htmlFor="low">{culture.low}</label>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center" }}>
                            <input type="button"
                                value={culture.ok}
                                className="sub_button"
                                onClick={this.Ok.bind(this)}
                                disabled={this.state.button_disabled} />
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
class AccessAuthority extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companyCode: "",    //company默认值
            companyName: "",    //显示值
            companyData: [],   //company数据

            departments: [],    //department数据
            codeArray: [],      //department默认值
            nameArray: [],      //显示值
            realCodes: [],     //真实的code列表
            department_authority: "0",

            userArray: []
        }
    }
    addCompanyData(code, name) {
        this.state.companyData.push({ name: name, code: code });
        if (this.state.companyData.length == 1) {
            this.setState({ companyCode: code, companyName: name });
            this.getDepartment(code);
            this.refs.userDropDownListWrap.getData(code);
        }
        this.setState({ companyData: this.state.companyData });
    }
    componentDidMount() {
        http.get(urls.department.getAllDepartment, function (data) {
            var companyData = [];
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    companyData.push({ code: data.result[i].DepartmentCode, name: data.result[i].DepartmentName });
                }
            }
            if (companyData.length > 0) {
                this.setState({
                    companyCode: companyData[0].code,
                    companyName: companyData[0].name,
                    companyData: companyData
                }, function () {
                    this.getDepartment(companyData[0].code);
                    this.refs.userDropDownListWrap.getData(companyData[0].code);
                });

            }
        }.bind(this));
    }
    getDepartment(code) {
        if (!code) return;
        http.get(urls.department.getDepartmentUrl + "?code=" + code, function (data) {
            if (data.code == 0) {
                var departments = assembleDepartmentData(data.result);
                for (var i = 0; i < departments.length; i++) {
                    if (this.state.codeArray.indexOf(departments[i].DepartmentCode) > -1) departments[i].Select = true;
                }
                this.setState({ departments: departments });
            }
        }.bind(this));
    }
    departmentAuthorityChange(id) {
        this.setState({ department_authority: id });
    }
    onCompanyChange(e) {
        var companyCode = e.target.value, companyName = "";
        for (var i = 0; i < this.state.companyData.length; i++) {
            if (this.state.companyData[i].code == companyCode) companyName = this.state.companyData[i].name;
        }
        this.setState({
            companyCode: companyCode,
            companyName: companyName,
            codeArray: [],
            nameArray: [],
            realCodeArray: [],
            userArray: []
        }, function () {
            this.getDepartment(companyCode);
            this.refs.userDropDownListWrap.getData(companyCode);
        });
    }
    //当用户选取了部门之后触发 参数是选取的数组和当前权限类型
    onSelectNodeChanged(codeArray, nameArray) {
        this.setState({ codeArray: codeArray, nameArray: nameArray, });
    }
    //当用户选取了部门或者点击了权限类型之后触发，参数是要真是需要验证的code列表和当前权限类型
    onRealNodeChanged(codeArray) {
        this.setState({ realCodes: codeArray });
    }
    dataChanged(departments) {
        this.setState({ departments: departments });
    }
    //当用户选取了人员触发
    onSelectUserChange(users) {
        this.setState({ userArray: users });
    }
    Ok() {
        if (this.state.companyCode) {
            this.props.accessOk(
                this.state.companyCode,
                this.state.companyName,
                this.state.department_authority,
                this.state.codeArray,
                this.state.nameArray,
                this.state.realCodes,
                this.state.userArray, function () {
                    for (var i = 0; i < this.state.companyData.length; i++) {
                        if (this.state.companyData[i].code == this.state.companyCode) {
                            this.state.companyData.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({ codeArray: [], nameArray: [], realCodes: [], userArray: [] });
                    if (this.state.companyData.length > 0) {
                        this.setState({
                            companyCode: this.state.companyData[0].code,
                            companyName: this.state.companyData[0].name,
                            companyData: this.state.companyData
                        }, function () {
                            this.getDepartment(this.state.companyData[0].code);
                            this.refs.userDropDownListWrap.getData(this.state.companyData[0].code);
                        }.bind(this));
                    } else {
                        this.setState({ companyCode: "", companyName: "", companyData: [], departments: [] });
                        this.refs.userDropDownListWrap.emptyData();
                    }
                }.bind(this));
        }
    }
    render() {
        return (
            <table style={{ width: "100%", marginTop: "0", borderCollapse: "collapse" }}>
                <tbody>
                    <tr>
                        <td width="13%">{culture.company}:</td>
                        <td width="77%">
                            <CompanyDropDownList
                                data={this.state.companyData}
                                default={this.state.companyCode}
                                onChange={this.onCompanyChange.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.department}:</td>
                        <td>
                            <DepartmentDropDownListWrap
                                data={this.state.departments}
                                default={this.state.codeArray}
                                dataChanged={this.dataChanged.bind(this)}
                                department_bar={true}
                                department_authority={this.state.department_authority}
                                onSelectNodeChanged={this.onSelectNodeChanged.bind(this)}
                                onRealNodeChanged={this.onRealNodeChanged.bind(this)}
                                departmentAuthorityChange={this.departmentAuthorityChange.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>{culture.user}:</td>
                        <td>
                            <UserDropDownListWrap
                                ref="userDropDownListWrap"
                                userArray={this.state.userArray}
                                onSelectUserChange={this.onSelectUserChange.bind(this)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center" }}>
                            <input type="button" value={culture.ok} className="sub_button" onClick={this.Ok.bind(this)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
class AddImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            convertShow: false,
            accessShow: false,
            errorMsg: "",
            buttonValue: culture.upload,
            buttonDisabled: false,
            thumbnails: [],
            thumbnailsDisplay: [],
            accesses: [],
            expiredDay: 0
        }
    }
    showConvert(e) {
        this.state.convertShow ? this.setState({ convertShow: false }) : this.setState({ convertShow: true });
    }
    showAccess(e) {
        this.state.accessShow ? this.setState({ accessShow: false }) : this.setState({ accessShow: true });
    }
    imageOk(convert, convertTitle) {
        this.state.thumbnails.push({
            format: convert.format,
            flag: convert.flag,
            model: convert.model,
            x: convert.x,
            y: convert.y,
            width: convert.width,
            height: convert.height,
            imageQuality: convert.imageQuality
        });
        this.state.thumbnailsDisplay.push({
            format: convertTitle.formatName,
            flag: convertTitle.flag,
            model: convertTitle.modelName,
            x: convertTitle.x,
            y: convertTitle.y,
            width: convertTitle.width,
            height: convertTitle.height,
            imageQuality: convert.imageQuality
        });
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    accessOk(companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray, success) {
        this.state.accesses.push({ companyCode, companyName, authority, codeArray, nameArray, realCodes, userArray });
        this.setState({ accesses: this.state.accesses }, success);
    }
    delImage(e) {
        var id = e.target.parentElement.id;
        this.state.thumbnails.splice(id, 1);
        this.state.thumbnailsDisplay.splice(id, 1);
        this.setState({
            thumbnails: this.state.thumbnails,
            thumbnailsDisplay: this.state.thumbnailsDisplay
        });
    }
    delAccess(e) {
        var id = e.target.parentElement.id;
        var name = e.target.parentElement.getAttribute("data-name");
        var code = e.target.parentElement.getAttribute("data-code");
        this.state.accesses.splice(id, 1);
        this.setState({
            accesses: this.state.accesses,
        }, function () {
            this.refs.accessAuthority.addCompanyData(code, name);
        }.bind(this));
        e.stopPropagation();
    }
    clickAccess(e) {
        var id = e.target.parentElement.getAttribute("data-id");
        var code = e.target.parentElement.getAttribute("data-code");
        var name = e.target.parentElement.getAttribute("data-name");
        var json = JSON.parse(e.target.parentElement.getAttribute("title"));

        var nameArray = json.nameArray;
        var codeArray = json.codeArray;
        var userArray = json.userArray;
    }
    fileChanged(e) {
        this.input = e.target;
        this.setState({ errorMsg: "" });
    }
    upload() {
        var that = this;
        if (this.input && this.input.files.length > 0) {
            this.setState({ buttonDisabled: true });
            var access = [];
            for (var i = 0; i < this.state.accesses.length; i++) {
                access.push({
                    company: this.state.accesses[i].companyCode,
                    companyDisplay: this.state.accesses[i].companyName,
                    departmentCodes: this.state.accesses[i].codeArray,
                    departmentDisplay: this.state.accesses[i].nameArray,
                    authority: this.state.accesses[i].authority,
                    accessCodes: this.state.accesses[i].realCodes,
                    accessUsers: this.state.accesses[i].userArray
                })
            }
            this.props.imageUpload(this.input, this.state.thumbnails, access, this.state.expiredDay, function (data) {
                if (data.code == 0) {
                    that.input.value = "";
                    that.setState({ buttonValue: culture.upload, buttonDisabled: false });
                } else {
                    that.setState({ errorMsg: " " + data.message, buttonValue: culture.upload, buttonDisabled: false });
                }
            }, function (loaded, total) {
                var precent = ((loaded / total) * 100).toFixed() + "%";
                that.setState({ buttonValue: precent });
            });
        } else {
            this.setState({
                errorMsg: culture.no_file_select
            })
        }
    }
    render() {
        return (
            <div className={this.props.show ? "show" : "hidden"}>
                <table className="table_modify">
                    <tbody>
                        <tr>
                            <td>{culture.image}:</td>
                            <td colSpan="2"><input type="file" multiple name="image" accept="image/*" onChange={this.fileChanged.bind(this)} /></td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td width="15%">{culture.convert}:</td>
                            <td width="75%">
                                {
                                    this.state.thumbnails.map(function (item, i) {
                                        return (
                                            <span className="convert_flag"
                                                title={JSON.stringify(this.state.thumbnailsDisplay[i])} key={i} id={i}>
                                                <span className="flag_txt">{item.flag}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delImage.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%"
                                className="link td"
                                onClick={this.showConvert.bind(this)}>
                                {this.state.convertShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.convertShow ?
                                    <ConvertImage imageOk={this.imageOk.bind(this)} />
                                    : null}
                            </td>
                        </tr>
                        <tr style={{ height: "35px" }}>
                            <td>{culture.access_authority}:</td>
                            <td>
                                {
                                    this.state.accesses.map(function (item, i) {
                                        return (
                                            <span className="convert_flag"
                                                title={JSON.stringify(item)}
                                                key={i}
                                                id={i}
                                                data-code={item.companyCode}
                                                data-name={item.companyName}
                                            >
                                                <span className="flag_txt" onClick={this.clickAccess.bind(this)}>{item.companyName}</span>
                                                <span className="flag_txt flag_del"
                                                    onClick={this.delAccess.bind(this)}>×</span>
                                            </span>
                                        );
                                    }.bind(this))
                                }
                            </td>
                            <td width="10%" className="link"
                                onClick={this.showAccess.bind(this)}>
                                {this.state.accessShow ?
                                    <i className="iconfont icon-delete"></i> :
                                    <i className="iconfont icon-add"></i>
                                }
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="4">
                                {this.state.accessShow ? <AccessAuthority
                                    ref="accessAuthority"
                                    accessOk={this.accessOk.bind(this)} /> : null}
                            </td>
                        </tr>
                        <tr>
                            <td>{culture.expired_date}:</td>
                            <td colSpan="2">
                                <input type="number" name="expiredDay" style={{ width: "50px" }} value={this.state.expiredDay} onChange={e => { this.setState({ expiredDay: e.target.value }) }} />{'\u00A0'}{'\u00A0'}{culture.day}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3"><input type="button"
                                name="btnImg"
                                className="button"
                                value={this.state.buttonValue}
                                disabled={this.state.buttonDisabled}
                                onClick={this.upload.bind(this)} /> <font color="red">{this.state.errorMsg}</font></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}