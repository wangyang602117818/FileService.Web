var fileId = document.getElementById("fileId").value;
var convert = document.getElementById("convert").value;
var deleted = document.getElementById("deleted").value;
var DEFAULT_URL = "";
if (convert == "true") {
    DEFAULT_URL = urls.downloadConvertUrl + "/" + fileId;
} else {
    DEFAULT_URL = urls.downloadUrl + "/" + fileId;
}
if (deleted == "true") {
    DEFAULT_URL = DEFAULT_URL + "?deleted=true";
}
var pdf_word = appDomain + "pdfview/pdf.worker.min.js";
