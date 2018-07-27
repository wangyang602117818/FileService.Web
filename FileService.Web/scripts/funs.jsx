﻿var authCode = "3c9deb1f8f6e";
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
        xhr.send(formData);
    },
    postJson: function (url, data, success) {
        var xhr = new XMLHttpRequest();
        xhr.open("post", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("AuthCode", authCode);
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
        xhr.open('get', url);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.send();
    },
    getFile: function (url, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(target.responseText);
        };
        if (error) xhr.onerror = error;
        xhr.open('get', url);
        xhr.setRequestHeader("AuthCode", authCode);
        xhr.send();
    }
};
var appDomain = "/";
var urls = {
    logoUrl: appDomain + "image/logo.png",
    homeUrl: appDomain + "admin/index",
    logOutUrl: appDomain + "admin/logout",
    preview: appDomain + "admin/preview",
    previewConvert: appDomain + "admin/previewconvert",
    deleteUrl: appDomain + "admin/delete",
    downloadUrl: appDomain + "download/get",
    downloadConvertUrl: appDomain + "download/getconvert",
    downloadZipInnerUrl: appDomain + "download/getzipinnerfile",
    downloadRarInnerUrl: appDomain + "download/getrarinnerfile",
    thumbnailUrl: appDomain + "download/thumbnail",
    m3u8Url: appDomain + "download/m3u8pure",
    videoCpUrl: appDomain + "download/videocapture",
    videoCpUploadUrl: appDomain + "upload/videocapture",
    videoCpDelUrl: appDomain + "data/deletevideocapture",
    videoListUrl: appDomain + "data/getvideolist",
    imageListUrl: appDomain + "data/getimagelist",
    redoUrl: appDomain + "admin/redo",
    emptyUrl: appDomain + "admin/empty",
    getHexCodeUrl: appDomain + "admin/gethexcode",
    overview: {
        recentUrl: appDomain + "admin/getcountrecentmonth",
        totalUrl: appDomain + "admin/gettotalcount",
        countByAppName: appDomain + "admin/getfilesbyappname"
    },
    log: {
        getUrl: appDomain + "admin/getlogs"
    },
    handlers: {
        getUrl: appDomain + "admin/gethandlers"
    },
    tasks: {
        getUrl: appDomain + "admin/gettasks",
        getByIdUrl: appDomain + "admin/gettaskbyid",
        updateImageUrl: appDomain + "admin/updateimagetask",
        updateVideoUrl: appDomain + "admin/updatevideotask",
        updateAttachmentUrl: appDomain + "admin/updateattachmenttask",
        getAllHandlersUrl: appDomain + "admin/getallhandlers"
    },
    resources: {
        getUrl: appDomain + "admin/getfiles",
        getAccessUrl: appDomain + "data/getfileaccess",
        getThumbnailMetadataUrl: appDomain + "admin/getthumbnailmetadata",
        getSubFileMetadataUrl: appDomain + "admin/getsubfilemetadata",
        getM3u8MetadataUrl: appDomain + "admin/getm3u8metadata",
        uploadImageUrl: appDomain + "upload/image",
        uploadVideoUrl: appDomain + "upload/video",
        uploadAttachmentUrl: appDomain + "upload/attachment",
    },
    config: {
        getUrl: appDomain + "admin/getconfigs",
        getConfigUrl: appDomain + "admin/getconfig",
        updateUrl: appDomain + "admin/updateconfig",
        deleteUrl: appDomain + "admin/deleteconfig",
    },
    application: {
        getUrl: appDomain + "admin/getapplications",
        getapplicationUrl: appDomain + "admin/getapplication",
        getApplicationByAuthCodeUrl: appDomain + "admin/getapplicationbyauthcode",
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
    }
}
//随机数
function selectFrom(lowerValue, upperValue) {
    var choices = upperValue - lowerValue + 1;
    return Math.floor(Math.random() * choices + lowerValue);
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
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
    return date.getFullYear() + "-" + monthFormat(date.getMonth() + 1, 2) + "-" + monthFormat(date.getDate(), 2) + " " + monthFormat(date.getHours(), 2) + ":" + monthFormat(date.getMinutes(), 2) + ":" + monthFormat(date.getSeconds(), 2);
}
function monthFormat(month, len) {
    if (len == 1) return month;
    if (len == 2) return month.toString().length == 1 ? "0" + month : month;
    if (len == 0) return "";
    return month;
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
function convertFileSize(value) {
    var size = parseInt(value) / 1024;
    if (size > 1024) {
        size = size / 1024;
        if (size > 1024) {
            size = size / 1024;
            return size.toFixed(2) + " GB";
        } else {
            return size.toFixed(2) + " MB";
        }
    } else {
        return size.toFixed(2) + " KB";
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
function formatMonth(month) {
    return month.toString().length == 1 ? "0" + month : month;
}
function ConvertHandlerState(value) {
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
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
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
            return "icon-image";
        case ".mp4":
        case ".avi":
        case ".wmv":
            return "icon-video";
        case ".pdf":
            return "icon-pdf";
        case ".txt":
            return "icon-text";
        default:
            return "icon-attachment";
    }
}
function getEchartOptionLine(data) {
    return {
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
        legend: {
            right: 'right',
            top: 10,
            itemWidth: 35,
            itemHeight: 12,
            data: [{
                name: culture.resources,
                icon: "roundRect"
            }, {
                name: culture.tasks,
                icon: "roundRect"
            }]
        },
        grid: {
            left: "5%",
            top: "10%",
            bottom: "15%",
            right: "17%",
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
            name: culture.resources,
            type: 'line',
            showSymbol: false,
            symbol: "circle",
            lineStyle: {
                normal: {
                    color: "#C35C00",
                    width: 1
                }
            },
            itemStyle: {
                normal: {
                    color: "#C35C00",
                }
            },
            smooth: false,
            data: []
        }, {
            name: culture.tasks,
            type: 'line',
            showSymbol: false,
            symbol: "circle",
            lineStyle: {
                normal: {
                    color: "#E1301E",
                    width: 1
                }
            },
            itemStyle: {
                normal: {
                    color: "#E1301E"
                }
            },
            smooth: false,
            data: []
        }]
    };
}
function getEchartOptionBar(xData, yData) {
    return {
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
        grid: {
            left: "5%",
            top: "10%",
            bottom: "15%",
            right: "5%",
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
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: "top"
                    }
                },
                barWidth: '30%',
                data: yData,
                itemStyle: {
                    normal: {
                        color: function (params) {
                            var colorList = ["#C35C00", "#E1301E", "#968c6d", "#ffb600", "#602020", "#6d6e71", "#db536a", "#dc6900"];
                            return colorList[params.dataIndex % colorList.length];
                        },
                        opacity: 0.6
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
function matchKeyWord(word) {
    return '<span class="search_word">' + word + '</span>';
}

//function orgChart() {
//    var orgChart = document.getElementsByClassName("orgChart")[0];
//    var topLi = orgChart.children[0].children[0];
//    var tableHtml = getChildNode(topLi);
//    var e = document.createElement('div');
//    e.innerHTML = tableHtml;
//    orgChart.appendChild(e.firstChild);
//}
//function getChildNode(topLi) {
//    var tableHtml = '<table class="pc" cellSpacing="0" cellPadding="0" border="0"><tbody>';
//    var dataNode = topLi.children[0],
//        childNodeLiArray = topLi.children.length == 1 ?
//            [] :
//            topLi.children[1].children;
//    if (childNodeLiArray.length == 0) {
//        return tableHtml + "<tr><td>" + dataNode.outerHTML + "</td></tr></tbody></table>";
//    } else {
//        var topHtml = '<tr><td colSpan="' + childNodeLiArray.length * 2 + '">' + dataNode.outerHTML + "</td></tr>";
//        var lineHtml = '<tr><td colSpan="' + childNodeLiArray.length * 2 + '"><span class="line_down">&nbsp;</span></td>',
//            orgLineHtml = "<tr class=\"org_line\">", orgDataHtml = "<tr>";
//        if (childNodeLiArray.length == 1) {
//            orgLineHtml += '<td class="trans_right">&nbsp;</td>';
//            orgLineHtml += '<td class="oleft">&nbsp;</td>';
//        } else {
//            for (var i = 0; i < childNodeLiArray.length * 2; i++) {
//                if (i == 0) { //第一行
//                    orgLineHtml += '<td class="trans_right">&nbsp;</td>';
//                } else {
//                    if (i + 1 == childNodeLiArray.length * 2) {  //最后一行
//                        orgLineHtml += '<td class="trans_left">&nbsp;</td>';
//                    } else {
//                        if (i == childNodeLiArray.length * 2 - 2) {
//                            orgLineHtml += '<td class="otop oright">&nbsp;</td>';
//                        } else {
//                            if (i % 2 == 1) orgLineHtml += '<td class="otop oleft">&nbsp;</td>';
//                            if (i % 2 == 0) orgLineHtml += '<td class="otop trans_right">&nbsp;</td>';
//                        }
//                    }
//                }
//            }
//        }
//        for (var i = 0; i < childNodeLiArray.length; i++) {
//            var subHtml = getChildNode(childNodeLiArray[i]);
//            orgDataHtml += '<td colSpan="2">' + subHtml + '</td>';
//        }
//        orgLineHtml += '</tr>';
//        lineHtml += '</tr>';
//        orgDataHtml += '</tr>';
//        return tableHtml + topHtml + lineHtml + orgLineHtml + orgDataHtml + "</tbody></table>";
//    }
//}

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
    return this.substring(dot, this.length);
}