using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class BaseController : Controller
    {
        protected Log log = new Log();
        protected Regex regex = new Regex(@"\\(\w+)\\$");
        protected Converter converter = new Converter();
        protected Task task = new Task();
        protected Queue queue = new Queue();
        protected Department department = new Department();
        protected FilesWrap filesWrap = new FilesWrap();
        protected Thumbnail thumbnail = new Thumbnail();
        protected M3u8 m3u8 = new M3u8();
        protected Ts ts = new Ts();
        protected VideoCapture videoCapture = new VideoCapture();
        protected FilesConvert filesConvert = new FilesConvert();
        protected MongoFile mongoFile = new MongoFile();
        protected MongoFileConvert mongoFileConvert = new MongoFileConvert();
        protected FilePreview filePreview = new FilePreview();
        protected FilePreviewBig filePreviewBig = new FilePreviewBig();
        protected Shared shared = new Shared();
        protected Download download = new Download();
        protected Application application = new Application();
        public BaseController()
        {
            ViewBag.appName = AppSettings.appName;
            ViewBag.authCode = AppSettings.authCode;
            ViewBag.apiType = AppSettings.apiType;
            ViewBag.appPath = System.Web.HttpContext.Current.Request.ApplicationPath;
        }
        protected ActionResult GetSourceFile(ObjectId id, string contentType)
        {
            GridFSDownloadStream stream = mongoFile.DownLoad(id);
            return File(stream, contentType, stream.FileInfo.Filename);
        }
        protected ActionResult GetConvertFile(ObjectId id)
        {
            GridFSDownloadStream stream = mongoFileConvert.DownLoad(id);
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        protected void Log(string fileId, string content)
        {
            var authCode = Request.Headers["AuthCode"];
            var appName = Request.Headers["AppName"];
            if (string.IsNullOrEmpty(appName) && !string.IsNullOrEmpty(authCode))
            {
                appName = new Application().FindByAuthCode(authCode)["ApplicationName"].AsString;
            }
            log.Insert(appName,
                fileId,
                content,
                Request.Headers["UserName"] ?? User.Identity.Name,
                Request.Headers["ApiType"] ?? "",
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
        protected void LogInRecord(string content, string userName)
        {
            var authCode = Request.Headers["AuthCode"];
            var appName = Request.Headers["AppName"];
            if (string.IsNullOrEmpty(appName) && !string.IsNullOrEmpty(authCode))
            {
                appName = new Application().FindByAuthCode(authCode)["ApplicationName"].AsString;
            }
            log.Insert(appName,
                "-",
                content,
                userName,
                Request.Headers["ApiType"] ?? "",
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
        }
        protected ObjectId GetObjectIdFromId(string id)
        {
            ObjectId newId = ObjectId.Empty;
            ObjectId.TryParse(id, out newId);
            return newId;
        }
        protected void AddDownload(ObjectId fileWrapId)
        {
            if (!download.AddedInOneMinute(Request.Headers["AppName"], fileWrapId, Request.Headers["UserName"] ?? User.Identity.Name))
            {
                download.AddDownload(fileWrapId, Request.Headers["AppName"],
                    Request.Headers["UserName"] ?? User.Identity.Name,
                    Request.Headers["UserIp"] ?? Request.UserHostAddress,
                    Request.Headers["UserAgent"] ?? Request.UserAgent);
                filesWrap.AddDownloads(fileWrapId);
            }
        }
        protected void InsertTask(string handlerId, ObjectId fileId, string fileName, string type, string from, BsonDocument outPut, BsonArray access, string owner)
        {
            converter.AddCount(handlerId, 1);
            ObjectId taskId = ObjectId.GenerateNewId();
            task.Insert(taskId, fileId, DateTime.Now.ToString("yyyyMMdd"), fileName,
                type, from, outPut, access, owner, handlerId, 0, TaskStateEnum.wait, 0);
            //添加队列
            queue.Insert(handlerId, type, "Task", taskId, false, new BsonDocument());
        }
        protected void UpdateTask(ObjectId id, string handlerId, string fileName, string type, int percent, TaskStateEnum state)
        {
            converter.AddCount(handlerId, 1);
            BsonDocument item = new BsonDocument()
            {
                {"Folder",DateTime.Now.ToString("yyyyMMdd") },
                {"FileName",fileName },
                {"ProcessCount",0 },
                {"State",state },
                {"StateDesc",state.ToString() },
                {"Percent",percent }
            };
            task.Update(id, item);
            queue.Insert(handlerId, type, "Task", id, false, new BsonDocument());
        }
        protected void ConvertAccess(List<AccessModel> accessList)
        {
            foreach (AccessModel accessModel in accessList)
            {
                string companyName = "";
                List<string> departmentDisplay = new List<string>() { };
                accessModel.Authority = "0";
                accessModel.AccessCodes = accessModel.DepartmentCodes;
                department.GetNamesByCodes(accessModel.Company, accessModel.DepartmentCodes, out companyName, out departmentDisplay);
                accessModel.CompanyDisplay = companyName;
                accessModel.DepartmentDisplay = departmentDisplay.ToArray();
            }
        }
        protected void RemoveFile(string id)
        {
            ObjectId fileWrapId = ObjectId.Parse(id);
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (filesWrap == null) return;
            task.RemoveByFileId(fileWrapId);
            filesWrap.Remove(fileWrapId);
        }
        protected bool DeleteFile(string id)
        {
            ObjectId fileWrapId = ObjectId.Parse(id);
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (fileWrap == null) return false;
            //删除 thumbnail
            if (fileWrap["FileType"] == "image")
            {
                List<ObjectId> thumbnailIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Thumbnail"].AsBsonArray) thumbnailIds.Add(d["_id"].AsObjectId);
                thumbnail.DeleteMany(thumbnailIds);
            }
            //删除 video 相关
            if (fileWrap["FileType"] == "video")
            {
                List<ObjectId> m3u8Ids = new List<ObjectId>();
                List<ObjectId> subVideos = new List<ObjectId>();
                List<ObjectId> videoCpIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray)
                {
                    ObjectId fileId = d["_id"].AsObjectId;
                    if (d["Format"].AsInt32 == 0)
                    {
                        m3u8Ids.Add(fileId);
                    }
                    else
                    {
                        if (filesConvert.FindOne(fileId) != null) mongoFileConvert.Delete(fileId);
                    }
                };
                foreach (BsonObjectId oId in fileWrap["VideoCpIds"].AsBsonArray) videoCpIds.Add(oId.AsObjectId);
                m3u8.DeleteMany(m3u8Ids);
                ts.DeleteBySourceId(fileWrap["From"].AsString, m3u8Ids);
                videoCapture.DeleteByIds(fileWrap["From"].AsString, videoCpIds);
            }
            //删除 attachment 相关
            if (fileWrap["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in fileWrap["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
                if (fileWrap.Contains("VideoCpIds"))
                {
                    videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrap["VideoCpIds"].AsBsonArray.Select(s => s.AsObjectId));
                }
            }
            //如果源文件没有被引用，则删除
            if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            {
                ObjectId fId = fileWrap["FileId"].AsObjectId;
                mongoFile.Delete(fId);
            }
            //删除缓存文件
            IEnumerable<BsonDocument> tasks = task.FindCacheFiles(fileWrapId);
            foreach (BsonDocument task in tasks)
            {
                string fullPath = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + task["Folder"].ToString() + "\\" + task["FileName"].ToString();
                if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
            }
            //删除转换的小图标
            filePreview.DeleteOne(fileWrapId);
            //删除转换的大图标
            filePreviewBig.DeleteOne(fileWrapId);
            //删除共享信息
            shared.DeleteShared(fileWrapId);
            task.DeleteByFileId(fileWrapId);
            filesWrap.DeleteOne(fileWrapId);
            return true;
        }
        protected void DeleteSubFiles(BsonDocument fileWrap)
        {
            //删除 thumbnail
            if (fileWrap["FileType"] == "image")
            {
                List<ObjectId> thumbnailIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Thumbnail"].AsBsonArray) thumbnailIds.Add(d["_id"].AsObjectId);
                thumbnail.DeleteMany(thumbnailIds);
            }
            //删除 video 相关
            if (fileWrap["FileType"] == "video")
            {
                List<ObjectId> m3u8Ids = new List<ObjectId>();
                List<ObjectId> subVideos = new List<ObjectId>();
                List<ObjectId> videoCpIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray)
                {
                    ObjectId fileId = d["_id"].AsObjectId;
                    if (d["Format"].AsInt32 == 0)
                    {
                        m3u8Ids.Add(fileId);
                    }
                    else
                    {
                        if (filesConvert.FindOne(fileId) != null) mongoFileConvert.Delete(fileId);
                    }
                }
                foreach (BsonObjectId oId in fileWrap["VideoCpIds"].AsBsonArray) videoCpIds.Add(oId.AsObjectId);

                m3u8.DeleteMany(m3u8Ids);
                ts.DeleteBySourceId(fileWrap["From"].AsString, m3u8Ids);
                videoCapture.DeleteByIds(fileWrap["From"].AsString, videoCpIds);
            }
            // 删除 attachment 相关
            if (fileWrap["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in fileWrap["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
                if (fileWrap.Contains("VideoCpIds"))
                {
                    videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrap["VideoCpIds"].AsBsonArray.Select(s => s.AsObjectId));
                }
            }
            //如果源文件没有被引用，则删除
            //if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            //{
            //    ObjectId fId = fileWrap["FileId"].AsObjectId;
            //    mongoFile.Delete(fId);
            //}
            //删除转换的小图标
            filePreview.DeleteOne(fileWrap["_id"].AsObjectId);
            //删除转换的大图标
            filePreviewBig.DeleteOne(fileWrap["_id"].AsObjectId);

        }
    }
}