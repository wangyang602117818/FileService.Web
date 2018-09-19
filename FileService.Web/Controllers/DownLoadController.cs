using FileService.Business;
using FileService.Util;
using FileService.Web.Filters;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class DownLoadController : Controller
    {
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        M3u8 m3u8 = new M3u8();
        Ts ts = new Ts();
        Thumbnail thumbnail = new Thumbnail();
        VideoCapture videoCapture = new VideoCapture();
        FilesWrap filesWrap = new FilesWrap();
        Download download = new Download();
        static string m3u8Template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "template.m3u8");
        [AppAuthorizeDefault]
        public ActionResult Get(string id)
        {
            ObjectId fileWrapId = ObjectId.Parse(id);
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (filesWrap == null) return File(new MemoryStream(), "application/octet-stream");
            if (!download.AddedInOneMinute(Request.Headers["AppName"], fileWrapId, Request.Headers["UserName"] ?? User.Identity.Name))
            {
                download.AddDownload(fileWrapId, Request.Headers["AppName"], Request.Headers["UserName"] ?? User.Identity.Name);
                filesWrap.AddDownloads(fileWrapId);
            }
            ObjectId fileId = fileWrap["FileId"].AsObjectId;
            string fileName = fileWrap["FileName"].AsString;
            if (fileId == ObjectId.Empty)
            {
                string tempFilePath = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + fileWrap["CreateTime"].ToUniversalTime().ToString("yyyyMMdd") + "\\" + fileName;
                FileStream fileStream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read);
                return File(fileStream, fileWrap["ContentType"].AsString, fileName);
            }
            else
            {
                GridFSDownloadStream stream = mongoFile.DownLoad(fileWrap["FileId"].AsObjectId);
                return File(stream, fileWrap["ContentType"].AsString, fileName);
            }
        }
        [AppAuthorizeDefault]
        public ActionResult GetConvert(string id)
        {
            GridFSDownloadStream stream = mongoFileConvert.DownLoad(ObjectId.Parse(id));
            ObjectId fileWrapId = stream.FileInfo.Metadata["SourceId"].AsObjectId;
            if (!download.AddedInOneMinute(Request.Headers["AppName"], fileWrapId, Request.Headers["UserName"] ?? User.Identity.Name))
            {
                filesWrap.AddDownloads(fileWrapId);
                download.AddDownload(fileWrapId, Request.Headers["AppName"], Request.Headers["UserName"] ?? User.Identity.Name);
            }
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        public ActionResult GetZipInnerFile(string id, string fileName)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
            ObjectId fileId = fileWrap["FileId"].AsObjectId;
            GridFSDownloadStream stream = mongoFile.DownLoadSeekable(fileId);
            Stream file = stream.GetFileInZip(fileName);
            return File(file, "application/octet-stream", fileName);
        }
        public ActionResult GetRarInnerFile(string id, string fileName)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
            ObjectId fileId = fileWrap["FileId"].AsObjectId;
            GridFSDownloadStream stream = mongoFile.DownLoadSeekable(fileId);
            Stream file = stream.GetFileInRar(fileName);
            return File(file, "application/octet-stream", fileName);
        }
        public ActionResult Thumbnail(string id)
        {
            BsonDocument thumb = thumbnail.FindOne(ObjectId.Parse(id));
            return File(thumb["File"].AsByteArray, ImageExtention.GetContentType(thumb["FileName"].AsString), thumb["FileName"].AsString);
        }
        public ActionResult M3u8Pure(string id)
        {
            BsonDocument document = m3u8.FindOne(ObjectId.Parse(id));
            string baseUrl = Request.Url.Scheme + "://" + Request.Url.Authority + Request.ApplicationPath;
            string fileStr = Regex.Replace(document["File"].AsString, "(\\w+).ts", (match) =>
            {
                return baseUrl.TrimEnd('/') + "/download/ts/" + match.Groups[1].Value;
            });
            return File(Encoding.UTF8.GetBytes(fileStr), "application/x-mpegURL", document["FileName"].AsString);
        }
        public ActionResult M3u8(string id)
        {
            if (id.StartsWith("t")) return Ts(id.TrimStart('t'));
            BsonDocument document = m3u8.FindOne(ObjectId.Parse(id));
            document["File"] = Regex.Replace(document["File"].AsString, "(\\w+).ts", (match) =>
             {
                 return "t" + match.Groups[1].Value;
             });
            return File(Encoding.UTF8.GetBytes(document["File"].AsString), "application/x-mpegURL", document["FileName"].AsString);
        }
        public ActionResult M3u8MultiStream(string id)
        {
            if (id.StartsWith("m")) return M3u8(id.TrimStart('m'));
            if (id.StartsWith("t")) return Ts(id.TrimStart('t'));
            string m3u8File = m3u8Template;
            var list = m3u8.FindBySourceIdAndSort(ObjectId.Parse(id)).ToList();
            for (var i = 0; i < 4; i++)
            {
                var r = list.Where(s => s["Quality"].AsInt32 >= i).FirstOrDefault();
                BsonDocument item = r == null ? list[list.Count - 1] : r;
                m3u8File = m3u8File.Replace("{level-" + i + "}", "m" + item["_id"].ToString());
            }
            return File(Encoding.UTF8.GetBytes(m3u8File), "application/x-mpegURL", list[0]["FileName"].ToString());
        }
        public ActionResult Ts(string id)
        {
            BsonDocument document = ts.FindOne(ObjectId.Parse(id));
            return File(document["File"].AsByteArray, "video/vnd.dlna.mpeg-tts", document["_id"].ToString() + ".ts");
        }
        public ActionResult VideoCapture(string id)
        {
            BsonDocument document = videoCapture.FindOne(ObjectId.Parse(id));
            return File(document["File"].AsByteArray, ImageExtention.GetContentType(document["FileName"].AsString), document["FileName"].AsString);
        }
    }
}
