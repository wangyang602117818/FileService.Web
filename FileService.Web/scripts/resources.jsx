class ResourcesData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th width="18%">{culture.fileId}</th>
                        <th width="28%">{culture.fileName}</th>
                        <th width="7%">{culture.size}</th>
                        <th width="14%">{culture.uploadDate}</th>
                        <th width="10%">{culture.from}</th>
                        <th width="6%">{culture.owner}</th>
                        <th width="5%">{culture.type}</th>
                        <th width="4%">{culture.view}</th>
                        <th width="4%">{culture.dol}</th>
                        <th width="4%">{culture.del}</th>
                    </tr>
                </thead>
                <ResourcesList data={this.props.data}
                    deleteItem={this.props.deleteItem}
                    onIdClick={this.props.onIdClick} />
            </table>
        );
    }
}
class ResourcesList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var that = this;
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
                            <ResourceItem resource={item} key={i}
                                deleteItem={that.props.deleteItem}
                                onIdClick={that.props.onIdClick} />
                        )
                    })}
                </tbody>
            );
        }
    }
}
class ResourceItem extends React.Component {
    constructor(props) {
        super(props);
    }
    preView(e) {
        var id = e.target.id;
        window.open(urls.preview + "?" + id, "_blank");
    }
    download(e) {
        var id = e.target.id;
        window.location.href = urls.downloadUrl + "/" + id;
    }
    render() {
        return (
            <tr>
                <td className="link"
                    data-type={this.props.resource.FileType.removeHTML()}
                    data-filename={this.props.resource.FileName.removeHTML()}
                    data-fileid={this.props.resource._id.$oid.removeHTML()}
                    data-owner={this.props.resource.Owner.removeHTML()}
                    onClick={this.props.onIdClick}>
                    <b
                        data-type={this.props.resource.FileType.removeHTML()}
                        data-filename={this.props.resource.FileName.removeHTML()}
                        data-fileid={this.props.resource._id.$oid.removeHTML()}
                        data-owner={this.props.resource.Owner.removeHTML()}
                        dangerouslySetInnerHTML={{ __html: this.props.resource._id.$oid }}>
                    </b>
                </td>
                <td title={this.props.resource.FileName.removeHTML()}>
                    <i className={"iconfont " + getIconNameByFileName(this.props.resource.FileName.removeHTML())}></i>&nbsp;
                    <span dangerouslySetInnerHTML={{ __html: this.props.resource.FileName.getFileName(15) }}>
                    </span>
                </td>
                <td>{convertFileSize(this.props.resource.Length)}</td>
                <td>{parseBsonTime(this.props.resource.CreateTime)}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.From || culture.unknow }}></td>
                <td>{this.props.resource.Owner}</td>
                <td dangerouslySetInnerHTML={{ __html: this.props.resource.FileType }}></td>
                <td>
                    <i className="iconfont icon-view"
                        onClick={this.preView.bind(this)} id={"id=" + this.props.resource._id.$oid + "&filetype=" + this.props.resource.FileType + "&filename=" + this.props.resource.FileName.removeHTML()}>
                    </i>
                </td>
                <td>
                    <i className="iconfont icon-download" onClick={this.download.bind(this)} id={this.props.resource._id.$oid}></i>
                </td>
                <td>
                    <i className="iconfont icon-del" onClick={this.props.deleteItem} id={this.props.resource._id.$oid}></i>
                </td>
            </tr>
        )
    }
}
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
        }
    }
    getCompany() {
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
            } else {
                this.setState({ companyCode: "", companyName: "", companyData: [], departments: [] });
                this.refs.userDropDownListWrap.emptyData();
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
                    if (data.code == 0) this.setState({ btn_msg: culture.save_success, btn_disabled: true });
                }.bind(this));
        }
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
                    disabled={this.props.owner == userName ? this.state.btn_disabled : true}
                    onClick={this.onSaveAccess.bind(this)}
                    className="button" />
            </div>
        )
    }
}
class Resources extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageShow: localStorage.resource ? eval(localStorage.resource) : true,
            imageShow: eval(localStorage.image_show) ? true : false,
            videoShow: eval(localStorage.video_show) ? true : false,
            attachmentShow: eval(localStorage.attachment_show) ? true : false,
            ///////////
            subFileShow: false,
            subFileToggle: true,
            subFileArray: [],
            fileId: "",
            fileName: "",
            innerFileName: "",
            owner: "",
            subComponent: null,
            ////////////
            accessToggle: true,
            access: [],
            departments: [],
            pageIndex: 1,
            pageSize: localStorage.handler_pageSize || 10,
            pageCount: 1,
            filter: "",
            data: { code: 0, message: "", count: 0, result: [] }
        }
        this.url = urls.resources.getUrl;
        this.storagePageShowKey = "resource";
        this.storagePageSizeKey = "handler_pageSize";
    }
    onImageShow() {
        if (this.state.imageShow) {
            this.setState({ imageShow: false });
            localStorage.image_show = false;
        } else {
            this.setState({ imageShow: true });
            localStorage.image_show = true;
        }
    }
    onVideoShow() {
        if (this.state.videoShow) {
            this.setState({ videoShow: false });
            localStorage.video_show = false;
        } else {
            this.setState({ videoShow: true });
            localStorage.video_show = true;
        }
    }
    onAttachmentShow() {
        if (this.state.attachmentShow) {
            this.setState({ attachmentShow: false });
            localStorage.attachment_show = false;
        } else {
            this.setState({ attachmentShow: true });
            localStorage.attachment_show = true;
        }
    }
    onSubFileShow() {
        if (this.state.subFileToggle) {
            this.setState({ subFileToggle: false });
        } else {
            this.setState({ subFileToggle: true });
        }
    }
    onChangeAccessShow() {
        if (this.state.accessToggle) {
            this.setState({ accessToggle: false });
        } else {
            this.setState({ accessToggle: true });
        }
    }
    deleteItem(e) {
        var id = e.target.id;
        if (window.confirm(" " + culture.delete + " ?")) {
            var that = this;
            http.get(urls.deleteUrl + "?id=" + id, function (data) {
                if (data.code == 0) {
                    that.getData();
                }
                else {
                    alert(data.message);
                }
            });
        }
    }
    imageUpload(input, thumbnails, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadImageUrl, {
            images: input,
            output: thumbnails.length > 0 ? JSON.stringify(thumbnails) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    videoUpload(input, videos, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadVideoUrl, {
            videos: input,
            output: videos.length > 0 ? JSON.stringify(videos) : null,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    attachmentUpload(input, access, success, process) {
        var that = this;
        http.post(urls.resources.uploadAttachmentUrl, {
            attachments: input,
            access: access.length > 0 ? JSON.stringify(access) : null,
        }, function (data) {
            if (data.code == 0) that.getData();
            success(data);
        }, process);
    }
    onIdClick(e) {
        var fileId = "",
            fileType = "",
            innerFileName = "",
            fileName = "",
            owner = "",
            subComponent = null;
        if (e.target.nodeName.toLowerCase() == "span") {
            fileId = e.target.parentElement.getAttribute("data-fileid");
            fileName = e.target.parentElement.getAttribute("data-filename");
            fileType = e.target.parentElement.getAttribute("data-type");
            owner = e.target.parentElement.getAttribute("data-owner");
        } else {
            fileId = e.target.getAttribute("data-fileid");
            fileName = e.target.getAttribute("data-filename");
            fileType = e.target.getAttribute("data-type");
            owner = e.target.getAttribute("data-owner");
        }
        innerFileName = fileName;
        this.state.subFileArray = [];
        switch (fileType) {
            case "image":
                this.getThumbnail(fileId);
                fileName = culture.thumbnails + "(" + fileName + ")";
                subComponent = ThumbnailData;
                break;
            case "video":
                this.getM3u8(fileId);
                fileName = culture.m3u8List + "(" + fileName + ")";
                subComponent = M3u8Data;
                break;
            case "attachment":
                this.getSubFile(fileId);
                var fileExt = fileName.getFileExtension().toLowerCase();
                if (fileExt == ".zip" || fileExt == ".rar") {
                    subComponent = ZipFileData;
                } else {
                    subComponent = SubFileData;
                }
                fileName = culture.fileList + "(" + fileName + ")";
                break;
        }
        var access = this.getFileAccess(fileId);
        var departments = this.getAllCompany();
        this.setState({
            fileName: fileName,
            innerFileName: innerFileName,
            owner: owner,
            fileId: fileId,
            subFileShow: true,
            subComponent: subComponent,
            access: access,
            departments: departments
        }, function () {
            this.refs.updateAccess.getCompany();
        });
    }
    getFileAccess(fileId) {
        if (fileId.length != 24) return;
        var access = [];
        http.getSync(urls.resources.getAccessUrl + "/" + fileId, function (data) {
            if (data.code == 0) access = data.result;
        }.bind(this));
        return access;
    }
    getAllCompany() {
        var departments = [];
        http.getSync(urls.department.getAllDepartment, function (data) {
            if (data.code == 0) departments = data.result;
        }.bind(this));
        return departments;
    }
    getThumbnail(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getThumbnailMetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) this.state.subFileArray = data.result;
            this.setState({ subFileArray: this.state.subFileArray });
        }.bind(this));
    }
    getM3u8(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getM3u8MetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) this.state.subFileArray = data.result;
            this.setState({ subFileArray: this.state.subFileArray });
        }.bind(this));
    }
    getSubFile(fileId) {
        if (fileId.length != 24) return;
        http.get(urls.resources.getSubFileMetadataUrl + "/" + fileId, function (data) {
            if (data.code == 0) {
                this.state.subFileArray = data.result;
            }
            this.setState({ subFileArray: this.state.subFileArray });
        }.bind(this));
    }
    onSaveAccess(companyCode, companyName, codeArray, nameArray, authority, realCodes, userArray, success) {
        var update = false;
        for (var i = 0; i < this.state.access.length; i++) {
            if (this.state.access[i].Company == companyCode) {
                update = true;
                //替换
                this.state.access.splice(i, 1, {
                    Company: companyCode,
                    CompanyDisplay: companyName,
                    DepartmentCodes: codeArray,
                    DepartmentDisplay: nameArray,
                    Authority: authority,
                    AccessCodes: realCodes,
                    AccessUsers: userArray
                });
            }
        }
        if (!update) {
            this.state.access.push({
                Company: companyCode,
                CompanyDisplay: companyName,
                DepartmentCodes: codeArray,
                DepartmentDisplay: nameArray,
                Authority: authority,
                AccessCodes: realCodes,
                AccessUsers: userArray
            });
        }
        http.postJson(urls.resources.updateAccessUrl, { fileId: this.state.fileId, access: this.state.access }, function (data) {
            if (data.code == 0) {
                this.setState({ access: this.state.access });
            } else {
                alert(data.message);
            }
            if (success) success(data);
        }.bind(this))
    }
    delAccess(e) {
        var id = e.target.parentElement.id;
        var name = e.target.parentElement.getAttribute("data-name");
        var code = e.target.parentElement.getAttribute("data-code");
        this.state.access.splice(id, 1);
        this.setState({ access: this.state.access });
        e.stopPropagation();
    }
    render() {
        return (
            <div className="main">
                <h1>{culture.resources}</h1>
                <TitleArrow title={culture.all + culture.resources}
                    show={this.state.pageShow}
                    count={this.state.data.count}
                    onShowChange={this.onPageShow.bind(this)} />
                <Pagination show={this.state.pageShow}
                    pageIndex={this.state.pageIndex}
                    pageSize={this.state.pageSize}
                    pageCount={this.state.pageCount}
                    filter={this.state.filter}
                    onInput={this.onInput.bind(this)}
                    onKeyPress={this.onKeyPress.bind(this)}
                    lastPage={this.lastPage.bind(this)}
                    nextPage={this.nextPage.bind(this)} />
                <ResourcesData data={this.state.data.result}
                    deleteItem={this.deleteItem.bind(this)}
                    onIdClick={this.onIdClick.bind(this)} />
                <TitleArrow title={culture.add + culture.image}
                    show={this.state.imageShow}
                    onShowChange={this.onImageShow.bind(this)} />
                <AddImage show={this.state.imageShow}
                    imageUpload={this.imageUpload.bind(this)} />
                <TitleArrow title={culture.add + culture.video}
                    show={this.state.videoShow}
                    onShowChange={this.onVideoShow.bind(this)} />
                <AddVideo show={this.state.videoShow}
                    videoUpload={this.videoUpload.bind(this)} />
                <TitleArrow title={culture.add + culture.attachment}
                    show={this.state.attachmentShow}
                    onShowChange={this.onAttachmentShow.bind(this)} />
                <AddAttachment show={this.state.attachmentShow}
                    attachmentUpload={this.attachmentUpload.bind(this)} />
                {this.state.subFileShow ?
                    <TitleArrow title={this.state.fileName}
                        show={this.state.subFileToggle}
                        onShowChange={this.onSubFileShow.bind(this)} /> : null
                }
                {this.state.subFileShow ?
                    <this.state.subComponent
                        show={this.state.subFileToggle}
                        data={this.state.subFileArray}
                        fileId={this.state.fileId}
                        fileName={this.state.fileName}
                    /> : null
                }
                {this.state.subFileShow ?
                    <TitleArrow title={culture.change_access + "(" + this.state.innerFileName + ")"}
                        show={this.state.accessToggle}
                        onShowChange={this.onChangeAccessShow.bind(this)} /> : null
                }
                {this.state.subFileShow ?
                    <UpdateAccess show={this.state.accessToggle}
                        ref="updateAccess"
                        owner={this.state.owner}
                        departments={this.state.departments}
                        access={this.state.access}
                        delAccess={this.delAccess.bind(this)}
                        onSaveAccess={this.onSaveAccess.bind(this)}
                    /> : null
                }

            </div>
        );
    }
}
for (var item in CommonUsePagination) Resources.prototype[item] = CommonUsePagination[item];
//Object.assign(Resources.prototype, CommonUsePagination);