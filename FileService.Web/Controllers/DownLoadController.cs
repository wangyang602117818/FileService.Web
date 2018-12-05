using FileService.Business;
using FileService.Util;
using FileService.Web.Filters;
using FileService.Web.Models;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class DownLoadController : BaseController
    {
        static string m3u8Template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "scripts\\template.m3u8");
        protected TsTime tsTime = new TsTime();
        [AppAuthorizeDefault]
        public ActionResult Get(string id, bool deleted = false)
        {
            ObjectId fileWrapId = GetObjectIdFromId(id);
            if (fileWrapId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument fileWrap = deleted ? filesWrap.FindOne(fileWrapId) : filesWrap.FindOneNotDelete(fileWrapId);
            if (fileWrap == null) return File(new MemoryStream(), "application/octet-stream");
            AddDownload(fileWrapId);
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
                return GetSourceFile(fileId, fileWrap["ContentType"].AsString);
            }
        }
        [AppAuthorizeDefault]
        public ActionResult GetConvert(string id)
        {
            ObjectId fId = GetObjectIdFromId(id);
            if (fId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            GridFSDownloadStream stream = mongoFileConvert.DownLoad(fId);
            ObjectId fileWrapId = stream.FileInfo.Metadata["Id"].AsObjectId;
            AddDownload(fileWrapId);
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        public ActionResult GetHistory(string id)
        {
            ObjectId fId = GetObjectIdFromId(id);
            if (fId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            GridFSDownloadStream stream = mongoFile.DownLoad(fId);
            return File(stream, "application/octet-stream", stream.FileInfo.Filename);
        }
        public ActionResult GetZipInnerFile(string id, string fileName)
        {
            ObjectId fId = GetObjectIdFromId(id);
            if (fId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument fileWrap = filesWrap.FindOne(fId);
            ObjectId fileId = fileWrap["FileId"].AsObjectId;
            GridFSDownloadStream stream = mongoFile.DownLoadSeekable(fileId);
            Stream file = stream.GetFileInZip(fileName);
            return File(file, "application/octet-stream", fileName);
        }
        public ActionResult GetRarInnerFile(string id, string fileName)
        {
            ObjectId fId = GetObjectIdFromId(id);
            if (fId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument fileWrap = filesWrap.FindOne(fId);
            ObjectId fileId = fileWrap["FileId"].AsObjectId;
            GridFSDownloadStream stream = mongoFile.DownLoadSeekable(fileId);
            Stream file = stream.GetFileInRar(fileName);
            return File(file, "application/octet-stream", fileName);
        }
        public ActionResult Thumbnail(string id)
        {
            ObjectId thumbId = GetObjectIdFromId(id);
            if (thumbId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument thumb = thumbnail.FindOne(thumbId);
            if (thumb == null)
            {
                return File(new MemoryStream(), "application/octet-stream");
            }
            else
            {
                return File(thumb["File"].AsByteArray, ImageExtention.GetContentType(thumb["FileName"].AsString), thumb["FileName"].AsString);
            }
        }
        public ActionResult GetThumbnail(string id)
        {
            ObjectId fileWrapId = GetObjectIdFromId(id);
            if (fileWrapId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (fileWrap == null) return File(new MemoryStream(), "application/octet-stream");
            BsonValue thumbnail = null;
            if (fileWrap.Contains("Thumbnail") && fileWrap["Thumbnail"].AsBsonArray.FirstOrDefault() != null)
            {
                thumbnail = fileWrap["Thumbnail"].AsBsonArray.FirstOrDefault();
            }
            //没有缩略图
            if (thumbnail == null)
            {
                return GetSourceFile(fileWrap["FileId"].AsObjectId, fileWrap["ContentType"].AsString);
            }
            else
            {
                return Thumbnail(thumbnail["_id"].ToString());
            }
        }
        public ActionResult GetThumbnailByTag(string id, string flag)
        {
            ObjectId fileWrapId = GetObjectIdFromId(id);
            if (fileWrapId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (fileWrap == null) return File(new MemoryStream(), "application/octet-stream");
            BsonValue thumbnail = null;
            if (fileWrap.Contains("Thumbnail") && fileWrap["Thumbnail"].AsBsonArray.FirstOrDefault() != null)
            {
                thumbnail = fileWrap["Thumbnail"].AsBsonArray.Where(sel => sel["Flag"].AsString == flag).FirstOrDefault();
            }
            //没有缩略图
            if (thumbnail == null)
            {
                return GetSourceFile(fileWrap["FileId"].AsObjectId, fileWrap["ContentType"].AsString);
            }
            else
            {
                return Thumbnail(thumbnail["_id"].ToString());
            }
        }
        public ActionResult M3u8Pure(string id)
        {
            ObjectId m3u8Id = GetObjectIdFromId(id);
            if (m3u8Id == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument document = m3u8.FindOne(m3u8Id);
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
            ObjectId m3u8Id = GetObjectIdFromId(id);
            if (m3u8Id == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument document = m3u8.FindOne(m3u8Id);
            if (document == null)
            {
                return File(new MemoryStream(), "application/octet-stream");
            }
            else
            {
                int tsLastTime = 0;
                string userName = Request.Headers["UserName"] ?? User.Identity.Name;
                if (!string.IsNullOrEmpty(userName))
                {
                    tsLastTime = tsTime.GetTsTime(document["From"].AsString, m3u8Id, userName);
                }
                document["File"] = Regex.Replace(document["File"].AsString, "(\\w+).ts", (match) =>
                {
                    return "t" + match.Groups[1].Value;
                });
                Response.AddHeader("TsTime", tsLastTime.ToString());
                return File(Encoding.UTF8.GetBytes(document["File"].AsString), "application/x-mpegURL", document["FileName"].AsString);
            }
        }
        public ActionResult M3u8MultiStream(string id)
        {
            if (id.StartsWith("m")) return M3u8(id.TrimStart('m'));
            if (id.StartsWith("t")) return Ts(id.TrimStart('t'));
            string m3u8File = m3u8Template;
            ObjectId newId = GetObjectIdFromId(id);
            if (newId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            var list = m3u8.FindBySourceIdAndSort(newId).ToList();
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
            ObjectId newId = GetObjectIdFromId(id);
            if (newId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument document = ts.FindOne(newId);
            if (document == null)
            {
                return File(new MemoryStream(), "application/octet-stream");
            }
            else
            {
                //string tstime = Request.Headers["TsTime"];
                //string userName = Request.Headers["UserName"] ?? User.Identity.Name;
                //int currTsTime = string.IsNullOrEmpty(tstime) ? 0 : int.Parse(tstime);
                //if (currTsTime > 0 && !string.IsNullOrEmpty(userName))
                //{
                //    tsTime.UpdateByUserName(document["From"].AsString, document["SourceId"].AsObjectId, document["SourceName"].AsString, userName, currTsTime);
                //}
                return File(document["File"].AsByteArray, "video/vnd.dlna.mpeg-tts", document["_id"].ToString() + ".ts");
            }
        }
        public ActionResult VideoCapture(string id)
        {
            ObjectId newId = GetObjectIdFromId(id);
            if (newId == ObjectId.Empty) return File(new MemoryStream(), "application/octet-stream");
            BsonDocument document = videoCapture.FindOne(newId);
            return File(document["File"].AsByteArray, ImageExtention.GetContentType(document["FileName"].AsString), document["FileName"].AsString);
        }

        public ActionResult M(string id)
        {
            BsonDocument bson = m3u8.FindOne(ObjectId.Parse(id));
            
            string m3u8Str = bson["File"].AsString;

            List<ObjectId> tsIds = m3u8Str.GetTsIds();
            return new ResponseModel<List<ObjectId>>(ErrorCode.success, tsIds);
        }
    }
}
