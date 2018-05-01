var appName = "FileServiceApi";
var keywords = ["HandlerId",
    "MachineName",
    "FileName",
    "StateDesc",
    "Type",
    "filename",
    "metadata.From",
    "metadata.FileType",
    "AppName",
    "Content",
    "FileId",
    "Extension",
    "Action",
    "ApplicationName",
    "UserName",
    "Role"];
var http = {
    post: function (url, data, success, progress, error) {
        var formData = new FormData();
        formData.append("AppName", appName);
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
        xhr.send(formData);
    },
    get: function (url, success, error) {
        if (url.indexOf("?") == -1) {
            url = url + "?appName=" + appName;
        } else {
            if (url.toLowerCase().indexOf("appname") == -1) url = url + "&appName=" + appName;
        }
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(JSON.parse(target.responseText));
        };
        if (error) xhr.onerror = error;
        xhr.open('get', url);
        xhr.send();
    },
    getFile: function (url, success, error) {
        if (url.indexOf("?") == -1) {
            url = url + "?appName=" + appName;
        } else {
            if (url.toLowerCase().indexOf("appname") == -1) url = url + "&appName=" + appName;
        }
        var xhr = new XMLHttpRequest();
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            success(target.responseText);
        };
        if (error) xhr.onerror = error;
        xhr.open('get', url);
        xhr.send();
    }
};
var appDomain = "/";
var urls = {
    logoUrl: appDomain + "image/logo.png",
    homeUrl: appDomain + "admin/index",
    logOutUrl: appDomain + "admin/logout",
    preview: appDomain + "admin/preview",
    previewConvert: appDomain +"admin/previewconvert",
    deleteUrl: appDomain + "admin/delete",
    downloadUrl: appDomain + "download/get",
    downloadConvertUrl: appDomain +"download/getconvert",
    thumbnailUrl: appDomain + "download/thumbnail",
    m3u8Url: appDomain + "download/m3u8pure",
    videoCpUrl: appDomain + "download/videocapture",
    videoCpUploadUrl: appDomain + "upload/videocapture",
    videoCpDelUrl: appDomain + "data/deletevideocapture",
    videoListUrl: appDomain + "data/getvideolist",
    imageListUrl: appDomain + "data/getimagelist",
    redoUrl: appDomain + "admin/redo",
    emptyUrl: appDomain + "admin/empty",
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
        getThumbnailMetadataUrl: appDomain + "admin/getthumbnailmetadata",
        getSubFileMetadataUrl: appDomain + "admin/getsubfilemetadata",
        getM3u8MetadataUrl: appDomain + "admin/getm3u8metadata",
        uploadImageUrl: appDomain + "upload/image",
        uploadVideoUrl: appDomain + "upload/video",
        uploadAttachmentUrl: appDomain + "upload/attachment",
    },
    config: {
        getUrl: appDomain + "admin/getconfigs",
        updateUrl: appDomain + "admin/updateconfig",
        deleteUrl: appDomain + "admin/deleteconfig",
    },
    application: {
        getUrl: appDomain + "admin/getapplications",
        updateUrl: appDomain + "admin/updateapplication",
        deleteUrl: appDomain + "admin/deleteapplication"
    },
    user: {
        getUrl: appDomain + "admin/getusers",
        addUserUrl: appDomain + "admin/adduser",
        getUserUrl: appDomain + "admin/getuser",
        updateUserUrl: appDomain + "admin/updateuser",
        deleteUserUrl: appDomain + "admin/deleteuser"
    }
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
                name: "resource",
                icon: "roundRect"
            }, {
                name: "task",
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
            name: "resource",
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
            name: "task",
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