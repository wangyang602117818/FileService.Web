//////////////////////////////////////////////////////////////////////////////////////
///version:1.7.4
///author: wangyang
/////////////////////////////////////////////////////////////////////////////////////
function FileClient(authCode, remoteUrl) {
    this.authCode = authCode;
    this.remoteUrl = remoteUrl;
    this.fromApi = true;
    this.apiType = "javascript";
};
FileClient.prototype = {
    get: function (url, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) {
                var result = "";
                try {
                    result = JSON.parse(target.responseText);
                } catch (error) {
                    result = target.responseText;
                }
            } success(result);
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', url);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    uploadImageDefaultConvert: function (file, userAccess, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("images", file, null, userAccess);
        xhr.open('post', this.remoteUrl + "/upload/image");
        this.setXhrHeaders(xhr, userName, "true");
        xhr.send(formData);
    },
    uploadVideoDefaultConvert: function (file, userAccess, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("videos", file, null, userAccess);
        xhr.open('post', this.remoteUrl + "/upload/video");
        this.setXhrHeaders(xhr, userName, "true");
        xhr.send(formData);
    },
    uploadImage: function (file, imageConvert, userAccess, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("images", file, imageConvert, userAccess);
        xhr.open('post', this.remoteUrl + "/upload/image");
        this.setXhrHeaders(xhr, userName, "false");
        xhr.send(formData);
    },
    uploadVideo: function (file, videoConvert, userAccess, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("videos", file, videoConvert, userAccess);
        xhr.open('post', this.remoteUrl + "/upload/video");
        this.setXhrHeaders(xhr, userName, "false");
        xhr.send(formData);
    },
    uploadAttachment: function (file, userAccess, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("attachments", file, null, userAccess);
        xhr.open('post', this.remoteUrl + "/upload/attachment");
        this.setXhrHeaders(xhr, userName, "false");
        xhr.send(formData);
    },
    uploadVideoCapture: function (fileId, file, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        var formData = this.getFormData("videocps", file, null, null);
        formData.append("fileId", fileId);
        if (typeof file == "string") {
            xhr.open('post', this.remoteUrl + "/upload/videocapture");
        } else {
            xhr.open('post', this.remoteUrl + "/upload/videocapturestream");
        }
        this.setXhrHeaders(xhr, userName);
        xhr.send(formData);
    },
    deleteVideoCapture: function (captureFileId, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', this.remoteUrl + "/data/deletevideocapture/" + captureFileId);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getFileUrl: function (fileId) { return this.remoteUrl + "/download/get/" + fileId; },
    getFileConvertUrl: function (fileId) { return this.remoteUrl + "/download/getconvert/" + fileId; },
    removeFile: function (fileId, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', this.remoteUrl + "/data/remove/" + fileId);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getM3u8Url: function (m3u8FileId) {
        return this.remoteUrl + "/download/m3u8/" + m3u8FileId;
    },
    getM3u8MultiStreamUrl: function (fileId) {
        return this.remoteUrl + "/download/m3u8multistream/" + fileId;
    },
    getThumbnailUrl: function (thumbId) {
        return this.remoteUrl + "/download/thumbnail/" + thumbId;
    },
    getThumbnailFromSourceIdUrl: function (fileId) {
        return this.remoteUrl + "/download/getthumbnail/" + fileId;
    },
    getThumbnailFromSourceIdFlagUrl: function (fileId, flag) {
        return this.remoteUrl + "/download/getthumbnailbytag/" + fileId + "?flag=" + flag;
    },
    getImageFromThumbnailIdUrl: function (thumbId) {
        return this.remoteUrl + "/download/getimagefromthumbnailid/" + thumbId;
    },
    getVideoFromM3u8IdUrl: function (m3u8FileId) {
        return this.remoteUrl + "/download/getvideofromm3u8id/" + m3u8FileId;
    },
    getTsUrl: function (tsId) {
        return this.remoteUrl + "/download/ts/" + tsId;
    },
    getVideoCaptureUrl: function (videoCpId) {
        return this.remoteUrl + "/download/videocapture/" + videoCpId;
    },
    getFileIconUrl: function (fileIconId) {
        return this.remoteUrl + "/download/getfileicon/" + fileIconId + "/";
    },
    getFileIconMobileUrl: function (fileIconId) {
        return this.remoteUrl + "/download/getfileiconmobile/" + fileIconId + "/";
    },
    getFileState: function (fileId, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', this.remoteUrl + "/data/filestate/" + fileId);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getFileList: function (data, success, progress, error, userName) {
        var that = this;
        var xhr = new XMLHttpRequest();
        var url = this.remoteUrl + "/data/getfilelist/?";
        var params = "";
        if (data.fileType == "all") data.fileType = "";
        if (data.from) params = params += "&from=" + data.from;
        if (data.fileType) params = params += "&fileType=" + data.fileType;
        if (data.filter) params = params += "&filter=" + data.filter;
        if (data.pageIndex) params = params += "&pageIndex=" + data.pageIndex;
        if (data.pageSize) params = params += "&pageSize=" + data.pageSize;
        url += this.trimStart(params);
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(that.assembleData(JSON.parse(target.responseText)));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', url);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getSubFileState: function (subFileId, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', this.remoteUrl + "/data/subfilestate/" + subFileId);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getVideoCaptureIds: function (fileId, success, progress, error, userName) {
        var xhr = new XMLHttpRequest();
        xhr.upload.onprogress = function (event) {
            var precent = ((event.loaded / event.total) * 100).toFixed();
            if (progress) progress(precent);
        }
        xhr.onload = function (event) {
            var target = event.srcElement || event.target;
            if (success) success(JSON.parse(target.responseText));
        }
        xhr.onerror = function (event) {
            if (error) error(event);
        }
        xhr.open('get', this.remoteUrl + "/data/getvideocaptureids/" + fileId);
        this.setXhrHeaders(xhr, userName);
        xhr.send();
    },
    getFormData: function (name, file, convert, access) {
        var formData = new FormData();
        if (file instanceof FileList) {
            for (var i = 0; i < file.length; i++) formData.append(name, file[i]);
        } else if (file instanceof File) {
            formData.append(name, file);
        } else if (typeof file == "string") {
            formData.append("FileBase64", file);
        } else {
            console.log("not a file...");
            return;
        }
        if (convert) {
            if (convert instanceof Array) {
                formData.append("output", JSON.stringify(convert));
            } else {
                formData.append("output", JSON.stringify([convert]));
            }
        }
        if (access) {
            if (access instanceof Array) {
                formData.append("access", JSON.stringify(access));
            } else {
                formData.append("access", JSON.stringify([access]));
            }
        }
        return formData;
    },
    setXhrHeaders: function (xhr, userName, defaultConvert) {
        xhr.setRequestHeader("AuthCode", this.authCode);
        xhr.setRequestHeader("FromApi", true);
        xhr.setRequestHeader("ApiType", this.apiType);
        if (defaultConvert) xhr.setRequestHeader("DefaultConvert", defaultConvert);
        if (userName) xhr.setRequestHeader("UserName", userName);
    },
    parseBsonTime: function (value) {
        if (!value) {
            return "";
        } else {
            value = value.$date;
        }
        var date = new Date(0);
        date.setMilliseconds(value);
        return date.getFullYear() + "-" + formatMonth((date.getMonth() + 1)) + "-" + formatMonth(date.getDate()) + " " + formatMonth(date.getHours()) + ":" + formatMonth(date.getMinutes()) + ":" + formatMonth(date.getSeconds());
    },
    getTimestamp: function (value) {
        if (!value) {
            return "";
        } else {
            value = value.$date;
        }
        var date = new Date(0);
        date.setMilliseconds(value);
        return Date.parse(date) / 1000;
    },
    getFileExtension: function (fileName) {
        var dot = fileName.lastIndexOf(".");
        if (dot == -1) return ".unknown";
        return fileName.substring(dot, fileName.length).toLowerCase();
    },
    getFileName: function (fileName, length) {
        if (fileName.indexOf("<span class=\"search_word\">") > -1) {
            var startIndex = fileName.indexOf("<span class=\"search_word\">"),
                endIndex = fileName.indexOf("</span>"),
                startPos = startIndex - length / 2,
                endPos = endIndex + 7 + length / 2;
            if (startPos < 0) endPos = endPos + Math.abs(startPos);
            var newfilename = fileName.substring(startPos, endPos);
            if (fileName.length > newfilename.length) return newfilename + "...";
            return newfilename;
        } else {
            var len = 0;
            for (var i = 0; i < fileName.length; i++) {
                if (i == length) break;
                /^[\u4E00-\u9FA5]+$/.test(fileName[i]) ? len += 1 : len += 2;
            }
            if (fileName.length > len) return fileName.substring(0, len) + "...";
            return fileName.substring(0, len);
        }
    },
    ///internal
    assembleData: function (result) {
        if (result.code == 0) {
            for (var i = 0; i < result.result.length; i++) {
                var thumbnails = [], videos = [], videoCpIds = [], files = [];
                if (result.result[i].FileType == "image" && result.result[i].Thumbnail) {
                    for (var k = 0; k < result.result[i].Thumbnail.length; k++) {
                        thumbnails.push({
                            FileId: result.result[i].Thumbnail[k]._id.$oid,
                            Flag: result.result[i].Thumbnail[k].Flag
                        })
                    }
                    result.result[i].Thumbnail = thumbnails;
                }
                if (result.result[i].FileType == "video" && result.result[i].Videos) {
                    for (var k = 0; k < result.result[i].Videos.length; k++) {
                        videos.push({
                            FileId: result.result[i].Videos[k]._id.$oid,
                            Flag: result.result[i].Videos[k].Flag
                        })
                    }
                    for (var k = 0; k < result.result[i].VideoCpIds.length; k++) {
                        videoCpIds.push(result.result[i].VideoCpIds[k].$oid)
                    }
                    result.result[i].Videos = videos;
                    result.result[i].VideoCpIds = videoCpIds;
                }
                if (result.result[i].FileType == "office" || result.result[i].FileType == "attachment") {
                    if (result.result[i].Files) {
                        for (var k = 0; k < result.result[i].Files.length; k++) {
                            files.push({
                                FileId: result.result[i].Files[k]._id.$oid,
                                Flag: result.result[i].Files[k].Flag
                            })
                        }
                    }
                    result.result[i].Files = files;
                }
                var createTime = this.getTimestamp(result.result[i].CreateTime);
                var expiredTime = result.result[i].ExpiredTime ? this.getTimestamp(result.result[i].ExpiredTime) : 253402271999;
                var fileIconId = createTime >= expiredTime ? "ffffffffffffffffffffffff" : result.result[i].FileId.$oid;
                result.result[i].CreateTime = createTime;
                result.result[i].ExpiredTime = expiredTime;
                result.result[i].Id = result.result[i]._id.$oid;
                result.result[i].FileIconId = fileIconId + this.getFileExtension(result.result[i].FileName);
                delete result.result[i].FileId;
                delete result.result[i]._id;
                delete result.result[i].Access;
                delete result.result[i].Delete;
                delete result.result[i].DeleteTime;
            }
        }
        return result;
    },
    trimEnd: function (str) {
        return str.replace(/.{1}$/, "");
    },
    trimStart: function (str) {
        return str.replace(/^.{1}/, "");
    }
}