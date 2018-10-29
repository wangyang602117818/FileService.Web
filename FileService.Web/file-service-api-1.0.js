function FileClient(authCode, remoteUrl) {
    this.authCode = authCode;
    this.remoteUrl = remoteUrl;
    this.fromApi = true;
    this.apiType = "javascript";

    this.uploadImage = function (file, imageConvert, userAccess, success, progress, error, userName) {
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
        this.setXhrHeaders(xhr, userName);
        xhr.send(formData);
    };
    this.uploadVideo = function (file, videoConvert, userAccess, success, progress, error, userName) {
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
        this.setXhrHeaders(xhr, userName);
        xhr.send(formData);
    };
    this.uploadAttachment = function (file, userAccess, success, progress, error, userName) {
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
        this.setXhrHeaders(xhr, userName);
        xhr.send(formData);
    };
    this.uploadVideoCapture = function (fileId, file, success, progress, error, userName) {
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
    };
    this.deleteVideoCapture = function (captureFileId, success, progress, error, userName) {
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
    };
    this.getFileUrl = function (fileId) {
        return this.remoteUrl + "/download/get/" + fileId;
    };
    this.getM3u8Url = function (m3u8FileId) {
        return this.remoteUrl + "/download/m3u8/" + m3u8FileId;
    };
    this.getM3u8MultiStreamUrl = function (fileId) {
        return this.remoteUrl + "/download/m3u8multistream/" + fileId;
    };
    this.getThumbnailUrl = function (thumbId) {
        return this.remoteUrl + "/download/thumbnail/" + thumbId;
    };
    this.getThumbnailFromSourceIdUrl = function (fileId) {
        return this.remoteUrl + "/download/getthumbnail/" + fileId;
    };
    this.getTsUrl = function (tsId) {
        return this.remoteUrl + "/download/ts/" + tsId;
    };
    this.getVideoCaptureUrl = function (videoCpId) {
        return this.remoteUrl + "/download/videocapture/" + videoCpId;
    };
    this.getFileState = function (fileId, success, progress, error, userName) {
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
    };
    this.getVideoCaptureIds = function (fileId, success, progress, error, userName) {
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
    };
    this.getFormData = function (name, file, convert, access) {
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
    };
    this.setXhrHeaders = function (xhr, userName) {
        xhr.setRequestHeader("AuthCode", this.authCode);
        xhr.setRequestHeader("FromApi", true);
        xhr.setRequestHeader("ApiType", this.apiType);
        if (userName) xhr.setRequestHeader("UserName", userName);
    }
}