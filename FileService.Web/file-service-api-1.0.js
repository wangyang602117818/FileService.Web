function FileClient(authCode, remoteUrl) {
    this.authCode = authCode;
    this.remoteUrl = remoteUrl;
    this.fromApi = true;
    this.apiType = "javascript";

    this.uploadImage = function (file, userData, imageConvert, userAccesses, success, progress, error) {
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        if (file instanceof FileList) {
            for (var i = 0; i < file.length; i++) formData.append("images", file[i]);
        } else if (file instanceof File) {
            formData.append("images", file);
        } else {
            console.log("not a file...");
            return;
        }
        if (imageConvert instanceof Array) {
            formData.append("output", JSON.stringify(imageConvert));
        } else {
            formData.append("output", JSON.stringify([imageConvert]));
        }
        if (userAccesses instanceof Array) {
            formData.append("access", JSON.stringify(userAccesses));
        } else {
            formData.append("access", JSON.stringify([userAccesses]));
        }
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
        xhr.open('post', this.remoteUrl + "/upload/image");
        xhr.setRequestHeader("AuthCode", this.authCode);
        xhr.setRequestHeader("FromApi", true);
        xhr.setRequestHeader("ApiType", this.apiType);
        if (userData) {
            if (userData.UserName || userData.userName) xhr.setRequestHeader("UserName", userData.UserName || userData.userName);
            if (userData.UserAgent || userData.userAgent) xhr.setRequestHeader("UserAgent", userData.UserAgent || userData.userAgent);
            if (userData.UserIp || userData.userIp) xhr.setRequestHeader("UserIp", userData.UserIp || userData.userIp);
        }
        xhr.send(formData);
    };
    this.uploadVideo = function (file, userData, videoConvert, userAccesses) {

    };
    this.uploadAttachment = function (file, userData, userAccesses) {

    };
    this.uploadVideoCapture = function (fileId, file, userData) {

    };
    this.deleteVideoCapture = function (captureFileId) {

    };
    this.downloadFile = function (fileId, userData) {

    };
    this.downloadM3u8 = function (m3u8FileId, userData) {

    };
    this.downloadM3u8MultiStream = function (fileId, userData) {

    };
    this.downloadThumbnail = function (thumbId, userData) {

    };
    this.downloadTs = function (tsId, userData) {

    };
    this.downloadVideoCapture = function (videoCpId, userData) {

    };
    this.getFileState = function (fileId) {

    };
    this.getVideoCaptureIds = function (fileId) {

    }
}