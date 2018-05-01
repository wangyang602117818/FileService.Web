using FileService.Web.Models;
using FileService.Business;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
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
        public ActionResult Get(string id)
        {
            GridFSDownloadStream stream = mongoFile.DownLoad(ObjectId.Parse(id));
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        public ActionResult GetConvert(string id)
        {
            GridFSDownloadStream stream = mongoFileConvert.DownLoad(ObjectId.Parse(id));
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        public ActionResult Thumbnail(string id)
        {
            BsonDocument thumb = thumbnail.FindOne(ObjectId.Parse(id));
            return File(thumb["File"].AsByteArray, ImageExtention.GetContentType(thumb["FileName"].AsString), thumb["FileName"].AsString);
        }
        public ActionResult M3u8(string id)
        {
            BsonDocument document = m3u8.FindOne(ObjectId.Parse(id));
            string baseUrl = Request.Url.Scheme + "://" + Request.Url.Authority + Request.ApplicationPath;
            string fileStr = Regex.Replace(document["File"].AsString, "(\\w+).ts", (match) =>
            {
                return baseUrl.TrimEnd('/') + "/download/ts/" + match.Groups[1].Value;
            });
            return File(Encoding.UTF8.GetBytes(fileStr), "application/x-mpegURL", document["FileName"].AsString);
        }
        public ActionResult M3u8Pure(string id)
        {
            if (id.StartsWith("t")) return Ts(id.TrimStart('t'));
            BsonDocument document = m3u8.FindOne(ObjectId.Parse(id));
            document["File"] = Regex.Replace(document["File"].AsString, "(\\w+).ts", (match) =>
             {
                 return "t" + match.Groups[1].Value;
             });
            return File(Encoding.UTF8.GetBytes(document["File"].AsString), "application/x-mpegURL", document["FileName"].AsString);
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
