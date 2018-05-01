var fileId = document.getElementById("fileId").value;
var convert = document.getElementById("convert").value;
var DEFAULT_URL = "";
if (convert == "true") {
    DEFAULT_URL = urls.downloadConvertUrl + "/" + fileId;
} else {
    DEFAULT_URL = urls.downloadUrl + "/" + fileId;
}

var pdf_word = appDomain + "pdfview/pdf.worker.min.js";
