using FileService.Business;
using FileService.Model;
using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class BaseController : Controller
    {
        protected Log log = new Log();
        protected Regex regex = new Regex(@"\\(\w+)\\$");
        protected Converter converter = new Converter();
        protected Task task = new Task();
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
        protected FilePreviewMobile filePreviewMobile = new FilePreviewMobile();
        protected Shared shared = new Shared();
        protected Download download = new Download();
        protected Application application = new Application();
        protected Extension extension = new Extension();
        string imagePath = AppDomain.CurrentDomain.BaseDirectory + "image\\";
        public BaseController()
        {
            ViewBag.appName = AppSettings.appName;
            ViewBag.authCode = AppSettings.authCode;
            ViewBag.apiType = AppSettings.apiType;
            ViewBag.appPath = System.Web.HttpContext.Current.Request.ApplicationPath;
        }
        protected ActionResult GetSourceFile(ObjectId id, string contentType, string fileName)
        {
            GridFSDownloadStream stream = mongoFile.DownLoad(id);
            return File(stream, contentType, fileName);
        }
        protected ActionResult GetConvertFile(ObjectId id)
        {
            GridFSDownloadStream stream = mongoFileConvert.DownLoad(id);
            return File(stream, stream.FileInfo.Metadata["ContentType"].AsString, stream.FileInfo.Filename);
        }
        protected ActionResult GetThumbnailInner(ObjectId id, string fileName)
        {
            BsonDocument thumb = thumbnail.FindOne(id);
            if (thumb == null)
            {
                return File(new MemoryStream(), "image/jpg");
            }
            else
            {
                if (thumb.Contains("ExpiredTime") && (thumb["CreateTime"].ToUniversalTime() >= thumb["ExpiredTime"].ToUniversalTime()))
                {
                    return GetFileExpired();
                }
                return File(thumb["File"].AsByteArray, ImageExtention.GetContentType(thumb["File"].AsByteArray), fileName);
            }
        }
        protected string GetTempFilePath(BsonDocument task)
        {
            return task["Folder"].ToString() + "\\" + task["FileId"].ToString() + Path.GetExtension(task["FileName"].ToString());
        }
        protected string GetTempFilePath(string folder, string fileId, string fileName)
        {
            return folder + "\\" + fileId + Path.GetExtension(fileName);
        }
        protected ActionResult GetFilePreview(string id, BsonDocument filePreview)
        {
            if (id == "ffffffffffffffffffffffff") return GetFileExpired();
            string ext = Path.GetExtension(Request.Url.AbsolutePath).ToLower();
            string type = extension.GetTypeByExtension(ext).ToLower();
            if (filePreview == null)
            {
                switch (type)
                {
                    case "text":
                    case "video":
                    case "image":
                    case "attachment":
                    case "audio":
                    case "pdf":
                        return File(System.IO.File.ReadAllBytes(imagePath + type + ".png"), "image/png", type + ".png");
                    case "office":
                        if (ext == ".doc" || ext == ".docx")
                            return File(System.IO.File.ReadAllBytes(imagePath + "word.png"), "image/png", "word.png");
                        if (ext == ".xls" || ext == ".xlsx")
                            return File(System.IO.File.ReadAllBytes(imagePath + "excel.png"), "image/png", "excel.png");
                        if (ext == ".ppt" || ext == ".pptx")
                            return File(System.IO.File.ReadAllBytes(imagePath + "ppt.png"), "image/png", "ppt.png");
                        if (new string[] { ".odg", ".ods", ".odp", ".odf", ".odt" }.Contains(ext))
                            return File(System.IO.File.ReadAllBytes(imagePath + "libreoffice.png"), "image/png", "libreoffice.png");
                        if (new string[] { ".wps", ".dps", ".et" }.Contains(ext))
                            return File(System.IO.File.ReadAllBytes(imagePath + "wps.png"), "image/png", "wps.png");
                        return File(System.IO.File.ReadAllBytes(imagePath + "attachment.png"), "image/png", "attachment.png");
                    default:
                        return File(System.IO.File.ReadAllBytes(imagePath + "attachment.png"), "image/png", "attachment.png");
                }
            }
            string contentType = Extension.GetContentType(Path.GetExtension(filePreview["FileName"].AsString.ToLower()).ToLower());
            return File(filePreview["File"].AsByteArray, contentType, filePreview["FileName"].AsString);
        }
        protected ActionResult GetFileExpired()
        {
            return File(System.IO.File.ReadAllBytes(imagePath + "forbidden.png"), "image/png", "forbidden.png");
        }
        protected bool SaveFile(string saveFileType, string saveFilePath, string saveFileApi, string fileName, HttpPostedFileBase file, ref List<FileResponse> response)
        {
            saveFilePath = saveFilePath + DateTime.Now.ToString("yyyyMMdd") + "\\";
            if (saveFileType == "path")
            {
                if (!Directory.Exists(saveFilePath)) Directory.CreateDirectory(saveFilePath);
                file.SaveAs(saveFilePath + fileName);
            }
            else
            {
                Dictionary<string, string> header = new Dictionary<string, string>();
                header.Add("path", saveFilePath);
                UploadTransforModel<string> result = JsonConvert.DeserializeObject<UploadTransforModel<string>>(new HttpRequestHelper().PostFile(saveFileApi + "/home/savefile", "file", fileName, file.InputStream, null, header));
                if (result.code != 0)
                {
                    response.Add(new FileResponse()
                    {
                        FileId = ObjectId.Empty.ToString(),
                        FileName = file.FileName,
                        SubFiles = new List<SubFileItem>()
                    });
                    return false;
                }
            }
            return true;
        }
        protected int DeleteCacheFiles(BsonDocument handler)
        {
            string handlerId = handler["HandlerId"].AsString;
            string saveFileType = handler["SaveFileType"].AsString;
            string saveFilePath = handler["SaveFilePath"].AsString;
            string saveFileApi = handler["SaveFileApi"].AsString;
            IEnumerable<BsonDocument> list = task.FindCacheFiles(handlerId);
            List<string> notDeletePaths = new List<string>();
            foreach (BsonDocument bson in list)
            {
                notDeletePaths.Add(saveFilePath + GetTempFilePath(bson));
            }
            if (saveFileType == "path")
            {
                return ServerState.DeleteAllCacheFiles(saveFilePath, notDeletePaths);
            }
            else
            {
                Dictionary<string, string> header = new Dictionary<string, string>();
                header.Add("path", saveFilePath);
                string result = new HttpRequestHelper().Post(saveFileApi + "/home/deletecachefiles", new { notdeletepaths = notDeletePaths }, header);
                UploadTransforModel<int> resultModel = JsonConvert.DeserializeObject<UploadTransforModel<int>>(result);
                return resultModel.result;
            }
        }
        protected bool CheckFileExists(string relativePath, string handlerId)
        {
            BsonDocument handler = converter.GetHandler(handlerId);
            string saveFileType = handler["SaveFileType"].AsString;
            string saveFilePath = handler["SaveFilePath"].AsString;
            string saveFileApi = handler["SaveFileApi"].AsString;
            string fullPath = saveFilePath + relativePath;
            if (saveFileType == "path")
            {
                if (System.IO.File.Exists(fullPath)) return true;
            }
            else
            {
                Dictionary<string, string> header = new Dictionary<string, string>();
                header.Add("path", saveFilePath);
                string result = new HttpRequestHelper().Post(saveFileApi + "/home/checkfileexists", new { relativePath = relativePath }, header);
                UploadTransforModel<bool> resultModel = JsonConvert.DeserializeObject<UploadTransforModel<bool>>(result);
                return resultModel.result;
            }
            return false;
        }
        protected bool DeleteCacheFile(string relativePath, string handlerId)
        {
            BsonDocument handler = converter.GetHandler(handlerId);
            string saveFileType = handler["SaveFileType"].AsString;
            string saveFilePath = handler["SaveFilePath"].AsString;
            string saveFileApi = handler["SaveFileApi"].AsString;
            string fullPath = saveFilePath + relativePath;
            if (saveFileType == "path")
            {
                if (System.IO.File.Exists(fullPath)) System.IO.File.Delete(fullPath);
                return true;
            }
            else
            {
                Dictionary<string, string> header = new Dictionary<string, string>();
                header.Add("path", saveFilePath);
                string result = new HttpRequestHelper().Post(saveFileApi + "/home/deletecachefile", new { relativePath = relativePath }, header);
                UploadTransforModel<bool> resultModel = JsonConvert.DeserializeObject<UploadTransforModel<bool>>(result);
                return resultModel.result;
            }
        }
        protected Stream GetCacheFile(string relativePath)
        {
            IEnumerable<BsonDocument> handlers = converter.FindAll();
            foreach (BsonDocument handler in handlers)
            {
                string saveFileType = handler["SaveFileType"].AsString;
                string saveFilePath = handler["SaveFilePath"].AsString;
                string saveFileApi = handler["SaveFileApi"].AsString;
                string fullPath = saveFilePath + relativePath;
                if (saveFileType == "path")
                {
                    if (System.IO.File.Exists(fullPath)) return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                }
                else
                {
                    Dictionary<string, string> header = new Dictionary<string, string>();
                    header.Add("path", saveFilePath);
                    DownloadFileItem downloadFileItem = new HttpRequestHelper().GetFile(saveFileApi + "/home/getcachefile?relativePath=" + relativePath, header);
                    if (!string.IsNullOrEmpty(downloadFileItem.FileName))
                        return downloadFileItem.FileStream;
                }
            }
            return new MemoryStream();
        }
        protected bool CheckFileAndHandler(string method, string fileName, Stream stream, ref string contentType, ref string fileType, ref string handlerId, ref string machineName, ref string saveFileType, ref string saveFilePath, ref string saveFileApi, ref ObjectId saveFileId, ref string saveFileName, ref List<FileResponse> response)
        {
            string ext = fileName.GetFileExt().ToLower();
            switch (method)
            {
                case "image":
                    if (!extension.CheckFileExtensionImage(ext, ref contentType, ref fileType) || ImageExtention.GetImageType(stream) == "")
                    {
                        response.Add(new FileResponse()
                        {
                            FileId = ObjectId.Empty.ToString(),
                            FileName = fileName,
                            Message = "image type not allowed",
                            SubFiles = new List<SubFileItem>()
                        });
                        Log4Net.InfoLog("image type not allowed");
                        return false;
                    }
                    break;
                case "video":
                    if (!extension.CheckFileExtensionVideo(ext, ref contentType, ref fileType))
                    {
                        response.Add(new FileResponse()
                        {
                            FileId = ObjectId.Empty.ToString(),
                            FileName = fileName,
                            Message = "video type not allowed",
                            SubFiles = new List<SubFileItem>()
                        });
                        Log4Net.InfoLog("video type not allowed");
                        return false;
                    }
                    break;
                case "attachment":
                    if (!extension.CheckFileExtension(ext, ref contentType, ref fileType))
                    {
                        response.Add(new FileResponse()
                        {
                            FileId = ObjectId.Empty.ToString(),
                            FileName = fileName,
                            Message = "attachment type not allowed",
                        });
                        Log4Net.InfoLog("attachment type not allowed");
                        return false;
                    }
                    break;
            }
            BsonDocument handler = converter.GetHandlerId();
            if (handler == null)
            {
                response.Add(new FileResponse()
                {
                    FileId = ObjectId.Empty.ToString(),
                    FileName = fileName,
                    Message = "no handler",
                    SubFiles = new List<SubFileItem>()
                });
                Log4Net.InfoLog("handler not exists");
                return false;
            }
            handlerId = handler["HandlerId"].ToString();
            machineName = handler["MachineName"].ToString();
            saveFileType = handler["SaveFileType"].ToString();
            saveFilePath = handler["SaveFilePath"].ToString();
            saveFileApi = handler["SaveFileApi"].ToString();
            if (saveFileId == ObjectId.Empty) saveFileId = ObjectId.GenerateNewId();
            if (string.IsNullOrEmpty(saveFileName)) saveFileName = saveFileId.ToString() + ext;
            stream.Position = 0;
            return true;
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
                Request.Headers["UserCode"] ?? User.Identity.Name,
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
            ObjectId.TryParse(id, out ObjectId newId);
            return newId;
        }
        protected void AddDownload(ObjectId fileWrapId)
        {
            string appName = Request.Headers["AppName"] ?? "";
            if (!download.AddedInOneMinute(appName, fileWrapId, Request.Headers["UserCode"] ?? User.Identity.Name))
            {
                download.AddDownload(fileWrapId,
                    appName,
                    Request.Headers["UserCode"] ?? User.Identity.Name,
                    Request.Headers["UserIp"] ?? Request.UserHostAddress,
                    Request.Headers["UserAgent"] ?? Request.UserAgent);
                filesWrap.AddDownloads(fileWrapId);
            }
        }
        protected void InsertTask(string handlerId, string machineName, ObjectId fileId, string fileName, string type, string from, BsonDocument outPut, BsonArray access, string owner)
        {
            converter.AddCount(handlerId, 1);
            ObjectId taskId = ObjectId.GenerateNewId();
            task.Insert(taskId, fileId, DateTime.Now.ToString("yyyyMMdd"), fileName,
                type, from, outPut, access, owner, handlerId, 0, TaskStateEnum.wait, 0);
            SendQueue(machineName, type, "Task", taskId);
        }
        protected void UpdateTask(ObjectId id, string handlerId, string machineName, string fileName, string type, int percent, TaskStateEnum state)
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
            SendQueue(machineName, type, "Task", id);
        }
        protected void SendQueue(string machineName, string type, string collectionName, ObjectId collectionId)
        {
            //添加队列
            MsQueue<TaskMessage> msQueue = new MsQueue<TaskMessage>(AppSettings.remoteQueue.Replace("{machineName}", machineName));
            TaskMessage taskMessage = new TaskMessage()
            {
                Type = type,
                CollectionName = "Task",
                CollectionId = collectionId.ToString()
            };
            msQueue.SendMessage(taskMessage, "task", true);
            Log4Net.InfoLog("add queue:" + collectionId.ToString());
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
        protected bool RemoveFile(string id)
        {
            Log(id, "RemoveFile");
            ObjectId fileWrapId = ObjectId.Parse(id);
            task.RemoveByFileId(fileWrapId);
            filesWrap.Remove(fileWrapId);
            return true;
        }
        protected bool RemoveFiles(IEnumerable<string> ids)
        {
            IEnumerable<ObjectId> fileWrapIds = ids.Select(id => ObjectId.Parse(id));
            task.RemoveByFileIds(fileWrapIds);
            filesWrap.Removes(fileWrapIds);
            return true;
        }
        protected void RestoreFile(string id)
        {
            Log(id, "RestoreFile");
            ObjectId fileWrapId = ObjectId.Parse(id);
            task.RestoreByFileId(fileWrapId);
            filesWrap.Restore(fileWrapId);
        }
        protected bool DeleteFile(string id)
        {
            Log(id, "DeleteFile");
            ObjectId fileWrapId = ObjectId.Parse(id);
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            if (fileWrap == null) return false;
            //删除 thumbnail
            if (fileWrap["FileType"] == "image" && fileWrap.Contains("Thumbnail"))
            {
                List<ObjectId> thumbnailIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Thumbnail"].AsBsonArray) thumbnailIds.Add(d["FileId"].AsObjectId);
                thumbnail.DeleteByIds(fileWrap["From"].AsString, fileWrapId, thumbnailIds);
            }
            //删除 video 相关
            if (fileWrap["FileType"] == "video" && fileWrap.Contains("Videos"))
            {
                List<ObjectId> m3u8Ids = new List<ObjectId>();
                List<ObjectId> videoCpIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray)
                {
                    ObjectId fileId = d["_id"].AsObjectId;
                    if (d["Format"].AsInt32 == 0) m3u8Ids.Add(fileId);
                };
                IEnumerable<BsonDocument> m3u8s = m3u8.FindByIds(m3u8Ids);
                foreach (BsonDocument m3u8 in m3u8s)
                {
                    List<ObjectId> tsIds = m3u8["File"].AsString.GetTsIds();
                    ts.DeleteByIds(m3u8["From"].AsString, m3u8["_id"].AsObjectId, tsIds);
                }
                foreach (BsonDocument bson in fileWrap["VideoCpIds"].AsBsonArray) videoCpIds.Add(bson["FileId"].AsObjectId);
                m3u8.DeleteMany(m3u8Ids);
                videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrapId, videoCpIds);
            }
            //删除 attachment 相关
            if (fileWrap["FileType"] == "office" || fileWrap["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in fileWrap["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
                if (fileWrap.Contains("VideoCpIds"))
                {
                    videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrapId, fileWrap["VideoCpIds"].AsBsonArray.Select(s => s["_id"].AsObjectId));
                }
            }
            //如果源文件没有被引用，则删除
            if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            {
                ObjectId fId = fileWrap["FileId"].AsObjectId;
                mongoFile.Delete(fId);
                //删除转换的小图标
                filePreview.DeleteOne(fId);
                //删除转换的大图标
                filePreviewMobile.DeleteOne(fId);
            }
            //删除历史记录
            if (fileWrap.Contains("History"))
            {
                foreach (BsonDocument bson in fileWrap["History"].AsBsonArray)
                {
                    ObjectId fileId = bson["FileId"].AsObjectId;
                    mongoFile.Delete(fileId);
                    //删除转换的小图标
                    filePreview.DeleteOne(fileId);
                    //删除转换的大图标
                    filePreviewMobile.DeleteOne(fileId);
                }
            }
            //删除缓存文件
            IEnumerable<BsonDocument> tasks = task.FindCacheFiles(fileWrapId);
            foreach (BsonDocument task in tasks)
            {
                string relativePath = GetTempFilePath(task);
                string handlerId = task["HandlerId"].ToString();
                DeleteCacheFile(relativePath, handlerId);
            }
            //删除共享信息
            shared.DeleteShared(fileWrapId);
            task.DeleteByFileId(fileWrapId);
            filesWrap.DeleteOne(fileWrapId);
            return true;
        }
        protected void DeleteSubFiles(BsonDocument fileWrap)
        {
            //删除 thumbnail
            if (fileWrap["FileType"] == "image" && fileWrap.Contains("Thumbnail"))
            {
                List<ObjectId> thumbnailIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Thumbnail"].AsBsonArray) thumbnailIds.Add(d["_id"].AsObjectId);
                thumbnail.DeleteMany(thumbnailIds);
            }
            //删除 video 相关
            if (fileWrap["FileType"] == "video" && fileWrap.Contains("Videos"))
            {
                List<ObjectId> m3u8Ids = new List<ObjectId>();
                List<ObjectId> videoCpIds = new List<ObjectId>();
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray)
                {
                    ObjectId fileId = d["_id"].AsObjectId;
                    if (d["Format"].AsInt32 == 0) m3u8Ids.Add(fileId);
                }
                IEnumerable<BsonDocument> m3u8s = m3u8.FindByIds(m3u8Ids);
                foreach (BsonDocument m3u8 in m3u8s)
                {
                    List<ObjectId> tsIds = m3u8["File"].AsString.GetTsIds();
                    ts.DeleteByIds(m3u8["From"].AsString, m3u8["_id"].AsObjectId, tsIds);
                }
                foreach (BsonDocument bson in fileWrap["VideoCpIds"].AsBsonArray) videoCpIds.Add(bson["FileId"].AsObjectId);
                m3u8.DeleteMany(m3u8Ids);
                videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrap["_id"].AsObjectId, videoCpIds);
            }
            // 删除 attachment 相关
            if (fileWrap["FileType"] == "office" || fileWrap["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in fileWrap["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
                if (fileWrap.Contains("VideoCpIds"))
                {
                    videoCapture.DeleteByIds(fileWrap["From"].AsString, fileWrap["_id"].AsObjectId, fileWrap["VideoCpIds"].AsBsonArray.Select(s => s["_id"].AsObjectId));
                }
            }
            //如果源文件没有被引用，则删除转换的大图标和小图标
            //if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            //{
            //    ObjectId fId = fileWrap["FileId"].AsObjectId;
            //    //删除转换的小图标
            //    filePreview.DeleteOne(fId);
            //    //删除转换的大图标
            //    filePreviewMobile.DeleteOne(fId);
            //}
        }
    }
}