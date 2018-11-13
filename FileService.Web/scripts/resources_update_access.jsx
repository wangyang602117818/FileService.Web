class UpdateAccess extends React.Component {
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

            userArray: [],

            btn_msg: culture.save,
            btn_disabled: false,

            btn_empty_msg: culture.empty_access,
            btn_empty_disabled: false
        }
    }
    getCompany() {
        http.get(urls.department.getAllDepartment, function (data) {
            var companyData = [];
            if (data.code == 0) {
                for (var i = 0; i < data.result.length; i++) {
                    companyData.push({
                        code: data.result[i].DepartmentCode,
                        name: data.result[i].DepartmentName
                    });
                }
            }
            this.refs.userDropDownListWrap.emptyData();
            if (companyData.length > 0) {
                this.setState({
                    companyCode: companyData[0].code,
                    companyName: companyData[0].name,
                    companyData: companyData
                }, function () {
                    this.getDepartment(companyData[0].code);
                    this.refs.userDropDownListWrap.getData(companyData[0].code);
                });
            } else {
                this.setState({ companyCode: "", companyName: "", companyData: [], departments: [] });
            }
            this.setState({ codeArray: [], nameArray: [], realCodes: [], department_authority: "0", userArray: [], btn_msg: culture.save, btn_disabled: false });
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
    clickAccess(e) {
        this.refs.userDropDownListWrap.emptyData();
        var title = JSON.parse(e.target.parentElement.getAttribute("title"));
        this.setState({
            companyCode: title.Company,
            companyName: title.CompanyDisplay,
            codeArray: title.DepartmentCodes,
            nameArray: title.DepartmentDisplay,
            department_authority: title.Authority,
            realCodes: title.AccessCodes,
            userArray: title.AccessUsers,
            btn_msg: culture.save,
            btn_disabled: false
        }, function () {
            this.getDepartment(title.Company);
            this.refs.userDropDownListWrap.getData(title.Company);
        });
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
    dataChanged(departments) {
        this.setState({ departments: departments });
    }
    onSelectNodeChanged(codeArray, nameArray) {
        this.setState({ codeArray: codeArray, nameArray: nameArray, });
    }
    onRealNodeChanged(codeArray) {
        this.setState({ realCodes: codeArray });
    }
    departmentAuthorityChange(id) {
        this.setState({ department_authority: id });
    }
    onSelectUserChange(users) {
        this.setState({ userArray: users });
    }
    onSaveAccess(e) {
        if (this.state.companyCode) {
            this.props.onSaveAccess(
                this.state.companyCode,
                this.state.companyName,
                this.state.codeArray,
                this.state.nameArray,
                this.state.department_authority,
                this.state.realCodes,
                this.state.userArray, function (data) {
                    if (data.code == 0) {
                        this.setState({
                            btn_msg: culture.save_success,
                            btn_disabled: true,
                            btn_empty_msg: culture.empty_access,
                            btn_empty_disabled: false
                        });
                    }
                }.bind(this));
        }
    }
    emptyAccess(e) {
        this.props.emptyAccess(e, function (data) {
            if (data.code == 0) {
                this.setState({
                    btn_msg: culture.save,
                    btn_disabled: false,
                    btn_empty_msg: culture.save_success,
                    btn_empty_disabled: true
                });
            }
        }.bind(this));
    }
    render() {
        return (
            <div className={this.props.show ? "update_access_con show" : "update_access_con hidden"}>
                <div className="update_access_item">
                    <div style={{ width: "12%" }}>{culture.access_authority}: </div>
                    {
                        this.props.access.map(function (item, i) {
                            return (
                                <span className="convert_flag"
                                    title={JSON.stringify(item)}
                                    key={i}
                                    id={i}
                                    data-code={item.Company}
                                    data-name={item.CompanyDisplay}
                                >
                                    <span className="flag_txt" onClick={this.clickAccess.bind(this)}>{item.CompanyDisplay}</span>
                                    <span className="flag_txt flag_del" onClick={this.props.delAccess.bind(this)}>×</span>
                                </span>
                            );
                        }.bind(this))
                    }
                </div>
                <table className="table_general">
                    <tbody>
                        <tr>
                            <td width="12%">{culture.company}:</td>
                            <td width="88%">
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
                    </tbody>
                </table>
                <br />
                <input type="button" value={this.state.btn_msg}
                    disabled={this.state.btn_disabled}
                    onClick={this.onSaveAccess.bind(this)}
                    className="button" />{'\u00A0'}{'\u00A0'}
                <input type="button" value={this.state.btn_empty_msg}
                    onClick={this.emptyAccess.bind(this)}
                    disabled={this.state.btn_empty_disabled}
                    className="button" />
            </div>
        )
    }
}