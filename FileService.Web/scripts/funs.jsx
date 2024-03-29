﻿var userName = document.getElementById("userName").value;
var role = document.getElementById("role").value;
var appPath = document.getElementById("appPath").value;
var authCode = document.getElementById("authCode").value;
var appName = document.getElementById("appName").value;
var apiType = document.getElementById("apiType").value;
var imageExtensions = [];
var videoExtensions = [];
var officeExtensions = [];
var compressExtensions = [".rar", ".zip"];
var extensions = [];
var application = [];
var keywords = [
    "_id.$oid",
    "FileId.$oid",
    "HandlerId",
    "MachineName",
    "FileName",
    "StateDesc",
    "Type",
    "From",
    "FileType",
    "AppName",
    "Content",
    "FileId",
    "Extension",
    "Action",
    "ApplicationName",
    "UserName",
    "Role",
    "DepartmentName",
    "DepartmentCode"];
var http = {
    post: function (url, data, success, progress, error) {
        var formData = new FormData();
        for (var item in data) {
            if (!data[item]) continue;
            if (data[item].nodeName && data[item].nodeName.toLowerCase() === "input") {
                for (var i = 0; i < data[item].files.length; i++) {
                    formData.append(item.toLowerCase(), data[item].files[i]);
                }
            } else {
                if (data[item] instanceof Array) {
                    for (var i = 0; i < data[item].length; i++) {
                        formData.append(item.toLowerCase(), data[item][i]);
                    }
                } else {
                    formData.append(item.toLowerCase(), data[item]);
                }
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            if (progress) progress(event.loaded, event.total);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('post', url);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.setRequestHeader("ApiType", apiType);
        xhr.send(formData);
    },
    postJson: function (url, data, success) {
        var xhr = new XMLHttpRequest();
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.setRequestHeader("ApiType", apiType);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
                if (success) success(json);
            }
        }
        var data = JSON.stringify(data);
        xhr.send(data);
    },
    get: function (url, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(JSON.parse(target.responseText));
        };
        if (error) xhr.onerror = error;
        url = assemblyUrl(url);
        xhr.open('get', url);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.setRequestHeader("ApiType", apiType);
        xhr.send();
    },
    getSync: function (url, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(JSON.parse(target.responseText));
        };
        if (error) xhr.onerror = error;
        url = assemblyUrl(url);
        xhr.open('get', url, false);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.setRequestHeader("ApiType", apiType);
        xhr.send();
    },
    getFile: function (url, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(target.responseText);
        };
        if (error) xhr.onerror = error;
        url = assemblyUrl(url);
        xhr.open('get', url);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.setRequestHeader("ApiType", apiType);
        xhr.send();
    },
};
var colorList = ["#C35C00", "#E1301E", "#968c6d", "#ffb600", "#602020", "#6d6e71", "#db536a", "#dc6900"];
var appDomain = appPath == "/" ? "/" : appPath + "/";
var baseUrl = window.location.protocol + "//" + window.location.host + appDomain;
var urls = {
    logoUrl: appDomain + "image/PwC-logo.svg",
    loginUrl: appDomain + "admin/login",
    homeUrl: appDomain + "admin/index",
    logOutUrl: appDomain + "admin/logout",
    preview: appDomain + "admin/preview",
    previewConvert: appDomain + "admin/previewconvert",
    removeUrl: appDomain + "admin/remove",
    removeFilesUrl: appDomain + "admin/removes",
    removeAppFilesUrl: appDomain + "admin/removeappfiles",
    deleteFileUrl: appDomain + "admin/delete",
    deleteFilesUrl: appDomain + "admin/deletefiles",
    restoreFileUrl: appDomain + "admin/restore",
    restoreFilesUrl: appDomain + "admin/restorefiles",
    deleteAppFilesUrl: appDomain + "admin/deleteappfiles",
    restoreAppFilesUrl: appDomain + "admin/restoreappfiles",
    downloadUrl: appDomain + "download/get",
    downloadConvertUrl: appDomain + "download/getconvert",
    downloadHistoryUrl: appDomain + "download/gethistory",
    downloadZipInnerUrl: appDomain + "download/getzipinnerfile",
    downloadRarInnerUrl: appDomain + "download/getrarinnerfile",
    thumbnailUrl: appDomain + "download/thumbnail",
    m3u8Url: appDomain + "download/m3u8",
    m3u8MultiStreamUrl: appDomain + "download/m3u8multistream",
    videoCpUrl: appDomain + "download/videocapture",
    videoCpUploadUrl: appDomain + "upload/videocapture",
    videoCpDelUrl: appDomain + "data/deletevideocapture",
    videoListUrl: appDomain + "data/getvideolist",
    imageListUrl: appDomain + "data/getimagelist",
    redoUrl: appDomain + "admin/redo",
    emptyTaskCountUrl: appDomain + "admin/emptytaskcount",
    getHexCodeUrl: appDomain + "admin/gethexcode",
    getObjectIdUrl: appDomain + "data/getobjectid",
    getFileIconUrl: appDomain + "admin/getfileicon",
    getFileIconBigUrl: appDomain + "admin/getfileiconbig",
    serverStateUrl: appDomain + "server/serverstatus",
    tsTimeUrl: appDomain + "admin/gettstime",
    replaceFileUrl: appDomain + "upload/replacefile",
    getFileHistorysUrl: appDomain + "admin/getfilehistorys",
    overview: {
        recentUrl: appDomain + "admin/getcountrecentmonth",
        totalUrl: appDomain + "admin/gettotalcount",
        filesTaskCountByAppNameUrl: appDomain + "admin/getfilestaskcountbyappname",  //总数

        getDownloadsRecentMonthUrl: appDomain + "admin/getdownloadsrecentmonth",
        getDownloadsByAppNameUrl: appDomain + "admin/getdownloadsbyappname",
        getTaskCountByAppNameUrl: appDomain + "admin/gettaskcountbyappname",
        getFilesCountByAppNameUrl: appDomain + "admin/getfilescountbyappname"
    },
    log: {
        getUrl: appDomain + "admin/getlogs"
    },
    handlers: {
        getUrl: appDomain + "admin/gethandlers",
        getCacheFilesUrl: appDomain + "server/getcachefiles",
        deleteHandlerCacheFilesUrl: appDomain + "server/deletehandlercachefiles",
        deleteAllCacheFilesUrl: appDomain + "server/deleteallcachefiles"
    },
    tasks: {
        getUrl: appDomain + "admin/gettasks",
        getByIdUrl: appDomain + "admin/gettaskbyid",
        updateHandler: appDomain + "admin/updatehandler",
        updateImageUrl: appDomain + "admin/updateimagetask",
        updateVideoUrl: appDomain + "admin/updatevideotask",
        updateAttachmentUrl: appDomain + "admin/updateattachmenttask",
        getAllHandlersUrl: appDomain + "admin/getallhandlers",
        addVideoTaskUrl: appDomain + "admin/addvideotask",
        addThumbnailTaskUrl: appDomain + "admin/addthumbnailtask",
        deleteCacheFileUrl: appDomain + "admin/deletecachefile"
    },
    resources: {
        getUrl: appDomain + "admin/getfiles",
        getDeleteUrl: appDomain + "admin/getdeletefiles",
        getAccessUrl: appDomain + "data/getfileaccess",
        updateAccessUrl: appDomain + "data/updateFileAccess",
        getThumbnailMetadataUrl: appDomain + "admin/getthumbnailmetadata",
        getSubFileMetadataUrl: appDomain + "admin/getsubfilemetadata",
        getM3u8MetadataUrl: appDomain + "admin/getm3u8metadata",
        uploadImageUrl: appDomain + "upload/image",
        uploadVideoUrl: appDomain + "upload/video",
        uploadAttachmentUrl: appDomain + "upload/attachment",
        deleteThumbnailUrl: appDomain + "admin/deletethumbnail",
        deleteM3u8Url: appDomain + "admin/deletem3u8"
    },
    extension: {
        getUrl: appDomain + "admin/getextensions",
        getExtensionUrl: appDomain + "admin/getextension",
        addExtensionUrl: appDomain + "admin/addextension",
        updateExtensionUrl: appDomain + "admin/updateextension",
        deleteUrl: appDomain + "admin/deleteextension",
        getExtensionsByTypeUrl: appDomain + "admin/getextensionsbytype",
        getAllExtensionUrl: appDomain + "admin/getallextensions"
    },
    application: {
        getUrl: appDomain + "admin/getapplications",
        getapplicationUrl: appDomain + "admin/getapplication",
        getAllApplicationUrl: appDomain + "admin/getallapplications",
        getApplicationByAuthCodeUrl: appDomain + "admin/getapplicationbyauthcode",
        addUrl: appDomain + "admin/addapplication",
        updateUrl: appDomain + "admin/updateapplication",
        deleteUrl: appDomain + "admin/deleteapplication"
    },
    user: {
        getUrl: appDomain + "admin/getusers",
        getCompanyUsersUrl: appDomain + "admin/getcompanyusers",
        addUserUrl: appDomain + "admin/adduser",
        getUserUrl: appDomain + "admin/getuser",
        updateUserUrl: appDomain + "admin/updateuser",
        deleteUserUrl: appDomain + "admin/deleteuser"
    },
    department: {
        getUrl: appDomain + "admin/getdepartments",
        addTopDepartment: appDomain + "admin/addtopdepartment",
        deleteTopDepartment: appDomain + "admin/deletetopdepartment",
        updateDepartmentUrl: appDomain + "admin/updatedepartment",
        getDepartmentUrl: appDomain + "admin/getdepartment",
        getAllDepartment: appDomain + "admin/getalldepartment",
        changeOrder: appDomain + "admin/departmentchangeorder",
        getDepartmentSelect: appDomain + "admin/getdepartmentselect",
    },
    shared: {
        addshared: appDomain + "admin/addshared",
        getShared: appDomain + "admin/getallshared",
        disabledShared: appDomain + "admin/disabledshared",
        enableShared: appDomain + "admin/enableshared",
        checkPassWord: appDomain + "shared/checkpassword",
        sharedFile: appDomain + "shared/f"
    }
}
function reMapArray(array, len) {
    var new_array = [];
    for (var i = 0; i < array.length; i += len) {
        if (i % len == 0) {
            new_array.push(array.slice(i, i + len));
        }
    }
    while (new_array[new_array.length - 1].length < len) {
        new_array[new_array.length - 1].push(null);
    }
    return new_array;
}
function assemblyUrl(url) {
    if (url.indexOf("?") > -1) {
        url = url + "&r=" + selectFrom(1000, 1000000);
    } else {
        url = url + "?r=" + selectFrom(1000, 1000000);
    }
    return url;
}
//随机数
function selectFrom(lowerValue, upperValue) {
    var choices = upperValue - lowerValue + 1;
    return Math.floor(Math.random() * choices + lowerValue);
}
function setCookie(cname, cvalue, exdays) {
    var cookies = cname + "=" + cvalue + ";path=/";
    if (exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        cookies += ";expires=" + d.toGMTString();
    }
    document.cookie = cookies;
}
function setCookieNonExday(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
    }
    return "";
}
function getDate(value) {
    var date = new Date(0);
    date.setMilliseconds(value);
    return date.getFullYear() + "-" + formatMonth((date.getMonth() + 1)) + "-" + formatMonth(date.getDate());
}
function getCurrentDateTime() {
    var date = new Date();
    return date.getFullYear() + "-" + formatMonth(date.getMonth() + 1) + "-" + formatMonth(date.getDate()) + " " + formatMonth(date.getHours()) + ":" + formatMonth(date.getMinutes()) + ":" + formatMonth(date.getSeconds());
}
function parseBsonTime(value) {
    if (!value) {
        return "";
    } else {
        value = value.$date;
    }
    var date = new Date(0);
    date.setMilliseconds(value);
    return date.getFullYear() + "-" + formatMonth((date.getMonth() + 1)) + "-" + formatMonth(date.getDate()) + " " + formatMonth(date.getHours()) + ":" + formatMonth(date.getMinutes()) + ":" + formatMonth(date.getSeconds());
}
function parseBsonTimeNoneSecond(value) {
    if (!value) {
        return "";
    } else {
        value = value.$date;
    }
    var date = new Date(0);
    date.setMilliseconds(value);
    return date.getFullYear() + "-" + formatMonth((date.getMonth() + 1)) + "-" + formatMonth(date.getDate()) + " " + formatMonth(date.getHours()) + ":" + formatMonth(date.getMinutes());
}
function dateAddDay(dateStr, day) {
    var date = new Date(dateStr);
    date.setDate(date.getDate() + day);
    return date.getFullYear() + "-" + formatMonth(date.getMonth() + 1) + "-" + formatMonth(date.getDate()) + " " + formatMonth(date.getHours()) + ":" + formatMonth(date.getMinutes()) + ":" + formatMonth(date.getSeconds());
}
function convertFileSize(value) {
    var size = parseInt(value) / 1024;
    if (size > 1024) {
        size = size / 1024;
        if (size > 1024) {
            size = size / 1024;
            return size.toFixed(2) + "GB";
        } else {
            return size.toFixed(2) + "MB";
        }
    } else {
        return size.toFixed(2) + "KB";
    }
}
function convertTime(seconds) {
    seconds = parseInt(seconds);
    if (seconds < 60) return "00:" + "00:" + seconds;
    var minuts = parseInt(seconds / 60);
    if (minuts < 60) {
        var seconds = parseInt(seconds % 60);
        return "00:" + formatMonth(minuts) + ":" + formatMonth(seconds);
    } else {
        var h = parseInt(seconds / 3600);
        minuts = parseInt((seconds - (h * 3600)) / 60);
        seconds = parseInt((seconds - (h * 3600)) % 60);
        return formatMonth(h) + ":" + formatMonth(minuts) + ":" + formatMonth(seconds);
    }
}
function convertDay(seconds) {
    if (seconds > 86400) {
        var day = parseInt(seconds / 86400);
        return day + "d " + convertTime(seconds - 86400 * day);
    } else {
        return "0d " + convertTime(seconds);
    }
}
function formatMonth(month) {
    return month.toString().length == 1 ? "0" + month : month;
}
function convertHandlerState(value) {
    switch (value) {
        case 0:
            return "idle";
            break;
        case 1:
            return "running";
            break;
        case -1:
            return "offline";
            break;
    }
}
function convertMongoServerType(state) {
    switch (state) {
        case 0:
        case 5:
            return "startup";
        case 1:
            return "primary";
        case 2:
            return "secondary";
        case 7:
            return "arbiter";
        case 8:
            return "down";
        default:
            return "unknown";
    }
}
function convertMongoServerState(state, health) {
    if (state == 0 || state == 5) return "startup";
    if (health == 1) return "running";
    if (health == 0) return "offline";
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function getReturnUrl(name) {
    var index = window.location.search.indexOf(name);
    var returnUrl = window.location.search.substring(index + name.length + 1);
    return returnUrl;
}
function trim(str, char) {
    var reTag = new RegExp("^" + ('\\' + char || ' ') + "+|" + (char || ' ') + "+$", "gi");
    return str.replace(reTag, "");
}
function trimEnd(str, char) {
    var reTag = new RegExp(('\\' + char || ' ') + "+$", "gi");
    return str.replace(reTag, "");
}
function trimStart(str, char) {
    var reTag = new RegExp("^" + ('\\' + char || ' ') + "+", "gi");
    return str.replace(reTag, "");
}
function getIconNameByFileName(filename) {
    switch (filename.getFileExtension().toLowerCase()) {
        case ".doc":
        case ".docx":
            return "icon-word";
        case ".xls":
        case ".xlsx":
            return "icon-excel";
        case ".ppt":
        case ".pptx":
            return "icon-ppt";
        case ".jpg":
        case ".png":
        case ".gif":
        case ".bmp":
        case ".jpeg":
        case ".pic":
        case ".ico":
        case ".tif":
        case ".svg":
            return "icon-image";
        case ".mp4":
        case ".avi":
        case ".wmv":
        case ".mov":
        case ".mkv":
        case ".flv":
        case ".rm":
        case ".rmvb":
            return "icon-video";
        case ".mp3":
            return "icon-audio";
        case ".pdf":
            return "icon-pdf";
        case ".txt":
        case ".html":
        case ".htm":
        case ".css":
            return "icon-text";
        case ".odg":
        case ".ods":
        case ".odp":
        case ".odf":
        case ".odt":
            return "icon-libreoffice";
        case ".wps":
        case ".dps":
        case ".et":
            return "icon-wps";
        default:
            return "icon-attachment";
    }
}
function getEchartOptionLine(data, title, grid_left, legendData) {
    return {
        color: colorList,
        animation: false,
        axisPointer: {
            show: true,
            snap: true,
            label: {
                show: true,
                backgroundColor: "#000"
            },
            lineStyle: {
                type: "dotted",
            }
        },
        title: {
            text: title,
            textStyle: {
                color: "#484848",
                fontSize: 12,
                align: 'center'
            },
            top: "10px"
        },
        legend: {
            top: 10,
            itemWidth: 25,
            itemHeight: 8,
            data: legendData,
            textStyle: {
                fontSize: 11
            }
        },
        grid: {
            left: grid_left,
            top: "20%",
            bottom: "15%",
            right: "0%",
        },
        xAxis: {
            data: data,
            axisLine: {
                lineStyle: {
                    color: "#484848",
                    opacity: 0.6
                }
            },
            axisTick: {
                alignWithLabel: true
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: "dashed",
                    color: "#e4e4e4"
                }
            }
        },
        yAxis: {
            axisLine: {
                lineStyle: {
                    color: "#484848",
                    opacity: 0.6
                }
            },
            minInterval: 3,
            axisTick: {
                show: false
            },
            axisLabel: {
                showMinLabel: false
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: "dashed",
                    color: "#e4e4e4"
                }
            }
        },
        series: [{
            type: 'line',
            showSymbol: false,
            symbol: "circle",
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            smooth: false,
            data: []
        }, {
            type: 'line',
            showSymbol: false,
            symbol: "circle",
            lineStyle: {
                normal: {
                    width: 1
                }
            },
            smooth: false,
            data: []
        }]
    };
}
function getEchartOptionBar(xData, files, tasks, title) {
    return {
        color: colorList,
        animation: false,
        axisPointer: {
            show: true,
            snap: true,
            label: {
                show: true,
                backgroundColor: "#000"
            },
            lineStyle: {
                type: "dotted",
            }
        },
        title: {
            text: title,
            textStyle: {
                color: "#484848",
                fontSize: 12,
                align: 'center'
            },
            top: "10px"
        },
        grid: {
            left: "3%",
            top: "20%",
            bottom: "15%",
            right: "0%",
        },
        legend: {
            top: 10,
            itemWidth: 25,
            itemHeight: 8,
            data: [{
                name: culture.resource_count,
                icon: "roundRect"
            }, {
                name: culture.task_count,
                icon: "roundRect"
            }],
            textStyle: {
                fontSize: 11
            }
        },
        xAxis: {
            type: 'category',
            data: xData,
            axisTick: {
                alignWithLabel: true
            },
            axisLine: {
                lineStyle: {
                    color: "#484848",
                    opacity: 0.6
                }
            },
        },
        yAxis: {
            type: 'value',
            minInterval: 3,
            axisLine: {
                lineStyle: {
                    color: "#484848",
                    opacity: 0.6
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                showMinLabel: false
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: "dashed",
                    color: "#e4e4e4"
                }
            }
        },
        series: [
            {
                name: culture.resource_count,
                type: 'bar',
                barGap: 0,
                label: {
                    normal: {
                        show: true,
                        position: "top"
                    }
                },
                barWidth: '15%',
                data: files,
                itemStyle: {
                    normal: {
                        //color: function (params) {
                        //    var colorList = ["#C35C00", "#E1301E", "#968c6d", "#ffb600", "#602020", "#6d6e71", "#db536a", "#dc6900"];
                        //    return colorList[params.dataIndex % colorList.length];
                        //},
                        //color: "#E1301E",
                        opacity: 0.7
                    }
                }
            },
            {
                name: culture.task_count,
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: "top"
                    }
                },
                barWidth: '15%',
                data: tasks,
                itemStyle: {
                    normal: {
                        //color: function (params) {
                        //    var colorList = ["#C35C00", "#E1301E", "#968c6d", "#ffb600", "#602020", "#6d6e71", "#db536a", "#dc6900"];
                        //    return colorList[params.dataIndex % colorList.length];
                        //},
                        //color: "#C35C00",
                        opacity: 0.7
                    }
                }
            }
        ]
    }
}
function setKeyWord(result, filter) {
    if (result.result && result.result.length > 0 && filter) {
        for (var i = 0; i < result.result.length; i++) {
            var doc = result.result[i];
            for (var k = 0; k < keywords.length; k++) {
                var keyword = keywords[k];
                if (keyword.indexOf(".") > -1) {
                    var keywordArray = keyword.split(".");
                    if (doc[keywordArray[0]] && doc[keywordArray[0]][keywordArray[1]]) {
                        doc[keywordArray[0]][keywordArray[1]] = doc[keywordArray[0]][keywordArray[1]].replace(new RegExp("" + trim(filter) + "", "ig"), this.matchKeyWord);
                    }
                } else {
                    if (doc[keyword] && typeof doc[keyword] == "string") {
                        doc[keyword] = doc[keyword].replace(new RegExp("" + trim(filter) + "", "ig"), matchKeyWord);
                    }
                }
            }
        }
    }
}
function setExpired(result) {
    for (var i = 0; i < result.length; i++) {
        if (result[i].ExpiredTime) {
            if (parseBsonTime(result[i].ExpiredTime) <= parseBsonTime(result[i].CreateTime)) {
                result[i].Expired = true;
            }
        }
    }
}
function matchKeyWord(word) {
    return '<span class="search_word">' + word + '</span>';
}
//装配department数据data结构,{ DepartmentName: "", DepartmentCode: "", Department: [{DepartmentName: "", DepartmentCode: ""}] }
//把一个嵌套的结构变成一个数据的扁平的结构
function assembleDepartmentData(data) {
    var virtualData = [];
    var topLayerCount = data.Department.length;
    virtualData.push({
        DepartmentName: data.DepartmentName,
        DepartmentCode: data.DepartmentCode,
        Select: false,
        Collapse: false,
        VirtualCollapse: false,
        Focus: false,
        TopLayerCount: topLayerCount,
        SubCount: data.Department.length,
        Layer: 0,
        TotalLayer: 1,
        LayerAbsolute: "1-",
        IsEnd: false,
        DownLineHide: false,
        index: 0
    });
    assembleDepartmentDataInternal(virtualData, data.Department, 1, "1", false, topLayerCount);
    return virtualData;
}
function assembleDepartmentDataInternal(virtualData, departments, layer, layerAbsolute, downLineHide, topLayerCount) {
    for (var i = 0; i < departments.length; i++) {
        //是否当前层的最后一个节点
        var isEnd = departments.length == i + 1;
        //当前层的子元素个数
        var subCount = departments[i].Department.length;
        var downLineHideInner = isEnd && subCount > 0;
        var downLineH = downLineHide || downLineHideInner;
        virtualData.push({
            DepartmentName: departments[i].DepartmentName,
            DepartmentCode: departments[i].DepartmentCode,
            Select: false,
            Collapse: false,
            VirtualCollapse: false,
            Focus: false,
            TopLayerCount: topLayerCount,
            SubCount: subCount,
            Layer: layer,
            TotalLayer: departments.length,
            LayerAbsolute: layerAbsolute + "-" + i,
            IsEnd: isEnd,
            DownLineHide: downLineH,
            Index: i
        });
        assembleDepartmentDataInternal(virtualData,
            departments[i].Department,
            layer + 1,
            layerAbsolute + "-" + i,
            downLineH,
            topLayerCount);
    }
}
function getAgent(agent) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent)) {
        return "Mobile";
    } else {
        return "PC";
    }
}
function getQuality(quality) {
    switch (quality) {
        case 0:
            return culture.original;
        case 1:
            return culture.lower;
        case 2:
            return culture.medium;
        case 3:
            return culture.bad;
    }
}
function getExtensions() {
    if (!userName) return;
    http.get(urls.extension.getAllExtensionUrl, function (data) {
        if (data.code == 0) {
            extensions = data.result;
            for (var i = 0; i < data.result.length; i++) {
                if (data.result[i].Type == "image") imageExtensions.push(data.result[i].Extension);
                if (data.result[i].Type == "video") videoExtensions.push(data.result[i].Extension);
                if (data.result[i].Type == "office") officeExtensions.push(data.result[i].Extension);
            }
        }
    });
}
function getApplications() {
    if (!userName) return;
    http.getSync(urls.application.getAllApplicationUrl, function (data) {
        if (data.code == 0) {
            application = data.result;
        }
    });
}
function getMachineNameByPath(path) {
    var regex = /\\\\(.+?)\\/i;
    var result = path.match(regex);
    return result[1];
}
Array.prototype.sortAndUnique = function () {
    this.sort(); //先排序
    var res = [this[0]];
    for (var i = 1; i < this.length; i++) {
        if (this[i] !== res[res.length - 1]) {
            res.push(this[i]);
        }
    }
    return res;
}
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
String.prototype.removeHTML = function () {
    var reTag = /<(?:.|\s)*?>/g;
    return this.replace(reTag, "");
}
String.prototype.getFileName = function (length) {
    if (this.indexOf("<span class=\"search_word\">") > -1) {
        var startIndex = this.indexOf("<span class=\"search_word\">"),
            endIndex = this.indexOf("</span>"),
            startPos = startIndex - length / 2,
            endPos = endIndex + 7 + length / 2;
        if (startPos < 0) endPos = endPos + Math.abs(startPos);
        var newfilename = this.substring(startPos, endPos);
        if (this.length > newfilename.length) return newfilename + "...";
        return newfilename;
    } else {
        var len = 0;
        for (var i = 0; i < this.length; i++) {
            if (i == length) break;
            /^[\u4E00-\u9FA5]+$/.test(this[i]) ? len += 1 : len += 2;
        }
        if (this.length > len) return this.substring(0, len) + "...";
        return this.substring(0, len);
    }
}
String.prototype.getFileExtension = function () {
    var dot = this.lastIndexOf(".");
    if (dot == -1) return ".unknown";
    return this.substring(dot, this.length).toLowerCase();
}
getApplications();
getExtensions();