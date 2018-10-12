using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
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
                Request.Headers["UserIp"] ?? Request.UserHostAddress,
                Request.Headers["UserAgent"] ?? Request.UserAgent);
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
            task.Insert(taskId, fileId,
                @"\\" + Environment.MachineName + "\\" + regex.Match(AppSettings.tempFileDir).Groups[1].Value + "\\" + DateTime.Now.ToString("yyyyMMdd") + "\\", fileName,
                type, from, outPut, access, owner, handlerId, 0, TaskStateEnum.wait, 0);
            //添加队列
            queue.Insert(handlerId, type, "Task", taskId, false, new BsonDocument());
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
            BsonDocument fileWrap = filesWrap.FindDelete(fileWrapId);
            if (filesWrap == null) return false;
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
                List<ObjectId> videoCpIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray) m3u8Ids.Add(d["_id"].AsObjectId);
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
            if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            {
                ObjectId fId = fileWrap["FileId"].AsObjectId;
                mongoFile.Delete(fId);
            }
            IEnumerable<BsonDocument> tasks = task.FindCacheFiles(fileWrapId);
            foreach (BsonDocument task in tasks)
            {
                var temp = task["TempFolder"].ToString().Substring(task["TempFolder"].ToString().TrimEnd('\\').LastIndexOf(@"\") + 1);
                string fullPath = AppDomain.CurrentDomain.BaseDirectory + AppSettings.tempFileDir + temp + task["FileName"].ToString();
                if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
            }
            filePreview.DeleteOne(fileWrapId);
            filePreviewBig.DeleteOne(fileWrapId);
            shared.DeleteShared(fileWrapId);
            task.DeleteByFileId(fileWrapId);
            filesWrap.DeleteOne(fileWrapId);
            return true;
        }
    }
}