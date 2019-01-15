using FileService.Business;
using FileService.Model;
using FileService.Util;
using FileService.Web.Filters;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace FileService.Web.Controllers
{
    public class AdminController : BaseController
    {
        User user = new User();
        TsTime tsTime = new TsTime();
        Files files = new Files();
        public ActionResult Index()
        {
            ViewBag.Name = User.Identity.Name;
            BsonDocument bsonUser = user.GetUser(User.Identity.Name);
            if (User.Identity.Name != "local")
            {
                if (bsonUser == null)
                {
                    FormsAuthentication.SignOut();
                    return RedirectToAction("login", "admin");
                }
                if (bsonUser["Modified"].AsBoolean == true)
                {
                    FormsAuthentication.SignOut();
                    bsonUser["Modified"] = false;
                    user.Replace(bsonUser);
                    return RedirectToAction("login", "admin");
                }
            }
            ViewBag.Role = User.Identity.Name == "local" ? "admin" : bsonUser["Role"].AsString;
            return View();
        }
        [AllowAnonymous]
        public ActionResult Login(string returnUrl = "")
        {
            ViewBag.AppPath = Request.ApplicationPath;
            if (User.Identity.IsAuthenticated)
            {
                if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                    && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
                {
                    return Redirect(returnUrl);
                }
                else
                {
                    return Redirect(Request.ApplicationPath + "/admin/index");
                }
            }
            else
            {
                return View();
            }
        }
        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login(UserLogin userLogin, string returnUrl = "")
        {
            BsonDocument bsonUser = new BsonDocument("Role", "admin");
            if (Request.IsLocal && userLogin.UserName == "local" && userLogin.PassWord == "123")
            {
            }
            else
            {
                bsonUser = user.Login(userLogin.UserName, userLogin.PassWord);
                if (bsonUser == null) return new ResponseModel<string>(ErrorCode.login_fault, "");
            }
            FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(
                1,
                userLogin.UserName,
                DateTime.Now,
                DateTime.MaxValue,
                true,
                bsonUser["Role"].AsString);
            HttpCookie userCookie = new HttpCookie(FormsAuthentication.FormsCookieName, FormsAuthentication.Encrypt(ticket));
            userCookie.Expires = DateTime.MaxValue;
            Response.Cookies.Add(userCookie);
            LogInRecord("Login", userLogin.UserName);
            if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                    && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
            {
                return new ResponseModel<string>(ErrorCode.redirect, returnUrl);
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
        }
        public ActionResult Logout()
        {
            LogInRecord("LogOut", User.Identity.Name);
            FormsAuthentication.SignOut();
            return RedirectToAction("login", "admin");
        }
        public ActionResult GetHandlers(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "StartTime", "desc" } };
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            IEnumerable<BsonDocument> result = converter.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, sorts, filter, new List<string>() { "HandlerId", "MachineName" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetTasks(int pageIndex = 1, int pageSize = 10, string from = "", string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            var userName = Request.Headers["UserName"] ?? User.Identity.Name;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            BsonDocument eqs = new BsonDocument("Delete", false);
            if (!string.IsNullOrEmpty(from)) eqs.Add("From", from);
            List<BsonDocument> result = task.GetPageList(pageIndex, pageSize, eqs, timeStart, timeEnd, sorts, filter, new List<string>() { "FileId", "FileName", "StateDesc", "HandlerId", "StateDesc", "Type" }, new List<string>() { }, out count, userName).ToList();
            foreach (BsonDocument bson in result)
            {
                string fullPath = GetTempFilePath(bson);
                if (System.IO.File.Exists(fullPath))
                {
                    bson.Add("FileExists", true);
                }
                else
                {
                    bson.Add("FileExists", false);
                }
                bson.Remove("Machine");
            }
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetFiles(int pageIndex = 1, int pageSize = 10, string from = "", string orderField = "CreateTime", string orderFieldType = "desc", string filter = "", string fileType = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            var userName = Request.Headers["UserName"] ?? User.Identity.Name;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            Dictionary<string, string> sorts = new Dictionary<string, string> { { orderField, orderFieldType } };
            BsonDocument eqs = new BsonDocument("Delete", false);
            if (!string.IsNullOrEmpty(fileType)) eqs.Add("FileType", fileType);
            if (!string.IsNullOrEmpty(from)) eqs.Add("From", from);
            IEnumerable<BsonDocument> result = filesWrap.GetPageList(pageIndex, pageSize, eqs, timeStart, timeEnd, sorts, filter, new List<string>() { "_id", "FileName", "From", "FileType" }, new List<string>() { }, out count, userName);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetDeleteFiles(int pageIndex = 1, int pageSize = 10, string from = "", string orderField = "DeleteTime", string orderFieldType = "desc", string filter = "", string fileType = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            var userName = Request.Headers["UserName"] ?? User.Identity.Name;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            Dictionary<string, string> sorts = new Dictionary<string, string> { { orderField, orderFieldType } };
            BsonDocument eqs = new BsonDocument("Delete", true);
            if (!string.IsNullOrEmpty(fileType)) eqs.Add("FileType", fileType);
            if (!string.IsNullOrEmpty(from)) eqs.Add("From", from);
            IEnumerable<BsonDocument> result = filesWrap.GetPageList(pageIndex, pageSize, eqs, timeStart, timeEnd, sorts, filter, new List<string>() { "_id", "FileName", "From", "FileType" }, new List<string>() { }, out count, userName);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetConvertFiles(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "uploadDate", "desc" } };
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            IEnumerable<BsonDocument> result = filesConvert.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, sorts, filter, new List<string>() { "filename", "metadata.From", "metadata.FileType" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetFileHistorys(string id)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
            if (fileWrap == null || !fileWrap.Contains("History") || fileWrap["History"].AsBsonArray.Count == 0) return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, new List<BsonDocument>());
            BsonArray historyArray = fileWrap["History"].AsBsonArray;
            List<BsonDocument> history = files.GetByIds(historyArray.Select(s => s["FileId"].AsObjectId)).ToList();
            foreach (BsonDocument bson in history)
            {
                ObjectId fileId = bson["_id"].AsObjectId;
                bson.Add("ReplaceTime", historyArray.Where(s => s["FileId"].AsObjectId == fileId).First().AsBsonDocument["CreateTime"]);
            }
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, history);
        }
        [OutputCache(Duration = 60 * 20, VaryByParam = "id")]
        public ActionResult GetFileIcon(string id)
        {
            BsonDocument file = filePreview.FindOne(ObjectId.Parse(id.Split('.')[0]));
            return GetFilePreview(id, file);
        }
        [OutputCache(Duration = 60 * 20, VaryByParam = "id")]
        public ActionResult GetFileIconMobile(string id)
        {
            BsonDocument file = filePreviewMobile.FindOne(ObjectId.Parse(id.Split('.')[0]));
            return GetFilePreview(id, file);
        }
        public ActionResult GetAllShared(string fileId)
        {
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, shared.GetShared(ObjectId.Parse(fileId)));
        }
        public ActionResult AddShared(SharedModel sharedModel)
        {
            sharedModel.CreateTime = DateTime.Now;
            string id = sharedModel.SharedUrl.Substring(sharedModel.SharedUrl.LastIndexOf('/') + 1, 24);
            ObjectId fileId = ObjectId.Parse(sharedModel.FileId);
            BsonDocument shareBson = sharedModel.ToBsonDocument();
            shareBson.Add("_id", ObjectId.Parse(id));
            shareBson["FileId"] = fileId;
            Log(sharedModel.FileId, "AddShared");
            shared.Insert(shareBson);
            return new ResponseModel<bool>(ErrorCode.success, true);
        }
        public ActionResult DisabledShared(string id)
        {
            Log(id, "DisabledShared");
            if (shared.DisabledShared(ObjectId.Parse(id), true))
            {
                return new ResponseModel<bool>(ErrorCode.success, true);
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        public ActionResult EnableShared(string id)
        {
            Log(id, "EnableShared");
            if (shared.DisabledShared(ObjectId.Parse(id), false))
            {
                return new ResponseModel<bool>(ErrorCode.success, true);
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        public ActionResult GetThumbnailMetadata(string id)
        {
            ObjectId fileWrapId = ObjectId.Parse(id);
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            IEnumerable<ObjectId> thumbnailIds = fileWrap["Thumbnail"].AsBsonArray.Select(s => s["_id"].AsObjectId);
            IEnumerable<BsonDocument> thumbs = thumbnail.FindByIds(fileWrap["From"].ToString(), thumbnailIds);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, thumbs);
        }
        public ActionResult GetM3u8Metadata(string id)
        {
            int cp = filesWrap.FindOne(ObjectId.Parse(id))["VideoCpIds"].AsBsonArray.Count;
            IEnumerable<BsonDocument> m3u8s = m3u8.FindBySourceId(ObjectId.Parse(id)).Select(sel => sel.Add("Cp", cp));
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, m3u8s);
        }
        public ActionResult GetSubFileMetadata(string id)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
            List<BsonDocument> result = new List<BsonDocument>();
            if (fileWrap == null) return new ResponseModel<List<BsonDocument>>(ErrorCode.success, result);
            if (!fileWrap.Contains("Files"))
            {
                return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
            }
            string fileExt = Path.GetExtension(fileWrap["FileName"].AsString).ToLower();
            if (fileExt == ".zip" || fileExt == ".rar")
            {
                BsonArray bsonArray = fileWrap["Files"].AsBsonArray;
                return new ResponseModel<BsonArray>(ErrorCode.success, bsonArray);
            }
            foreach (BsonDocument doc in fileWrap["Files"].AsBsonArray)
            {
                if (doc.Contains("_id") && doc["_id"].AsObjectId != ObjectId.Empty)
                {
                    result.Add(filesConvert.FindOne(doc["_id"].AsObjectId));
                }
            }
            return new ResponseModel<List<BsonDocument>>(ErrorCode.success, result);
        }
        public ActionResult Preview(string id, string fileName, bool deleted = false)
        {
            string fileType = extension.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            ViewBag.id = id;
            ViewBag.convert = "false";
            ViewBag.deleted = deleted.ToString().ToLower();
            ViewBag.fileType = fileType;
            if (fileType == "office")
            {
                ViewBag.Convert = "true";
                BsonDocument bson = deleted ? filesWrap.FindOne(ObjectId.Parse(id)) : filesWrap.FindOneNotDelete(ObjectId.Parse(id));
                ViewBag.id = bson.Contains("Files") ? bson["Files"].AsBsonArray[0]["_id"].ToString() : ObjectId.Empty.ToString();
            }
            ViewBag.template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "pdfview/template.html");
            ViewBag.FileName = fileName;
            return View();
        }
        public ActionResult PreviewConvert(string id, string fileName)
        {
            string fileType = extension.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            ViewBag.id = id;
            ViewBag.convert = "true";
            ViewBag.fileType = fileType;
            ViewBag.FileName = fileName;
            ViewBag.template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "pdfview/template.html");
            return View("Preview");
        }
        public ActionResult GetCountRecentMonth(int month)
        {
            BsonDocument result = new BsonDocument();
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = filesWrap.GetCountByRecentMonth(startDateTime);
            result.Add("files", new BsonArray(fileResult));
            IEnumerable<BsonDocument> taskResult = task.GetCountByRecentMonth(startDateTime);
            result.Add("tasks", new BsonArray(taskResult));
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult GetFilesCountByAppName(int month)
        {
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = filesWrap.GetCountByAppName(startDateTime);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, fileResult);
        }
        public ActionResult GetTaskCountByAppName(int month)
        {
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = task.GetCountByAppName(startDateTime);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, fileResult);
        }
        public ActionResult GetDownloadsRecentMonth(int month)
        {
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = download.GetCountByRecentMonth(startDateTime);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, fileResult);
        }
        public ActionResult GetDownloadsByAppName(int month)
        {
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = download.GetDownloadsByAppName(startDateTime);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, fileResult);
        }
        public ActionResult GetTotalCount()
        {
            BsonDocument result = new BsonDocument();
            result.Add("Handlers", converter.Count());
            result.Add("Tasks", task.Count());
            result.Add("Resources", new BsonArray(filesWrap.GetFilesByType()));
            result.Add("Downloads", download.Count());
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult GetFilesTaskCountByAppName()
        {
            List<BsonDocument> files = filesWrap.GetFilesByAppName().ToList();
            IEnumerable<BsonDocument> tasks = task.GetFilesByAppName();
            foreach (BsonDocument file in files)
            {
                var appName = file["_id"].ToString();
                BsonDocument task = tasks.Where(t => t["_id"].ToString() == appName).FirstOrDefault();
                if (task != null)
                {
                    file.Add(new BsonElement("tasks", task["tasks"]));
                }
                else
                {
                    file.Add(new BsonElement("tasks", 0));
                }
            }
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, files);
        }
        public ActionResult GetHexCode(int id)
        {
            return new ResponseModel<string>(ErrorCode.success, new Random().RandomCodeHex(id));
        }
        public ActionResult GetExtensionsByType(string type)
        {
            IEnumerable<string> result = extension.FindByType(type).Select(s => s["Extension"].ToString());
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, result);
        }
        public ActionResult GetLogs(int pageIndex = 1, int pageSize = 10, string from = "", string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            BsonDocument eqs = null;
            if (!string.IsNullOrEmpty(from)) eqs = new BsonDocument("From", from);
            IEnumerable<BsonDocument> result = log.GetPageList(pageIndex, pageSize, eqs, timeStart, timeEnd, sorts, filter, new List<string>() { "_id", "AppName", "Content", "FileId" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetTsTime(TsTimeModel tsTimeModel)
        {
            IEnumerable<ObjectId> oIds = tsTimeModel.Ids.Select(sel => ObjectId.Parse(sel));
            IEnumerable<BsonDocument> result = tsTime.GetListLastMonth(oIds, tsTimeModel.Month);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
        }
        public ActionResult GetExtensions(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            IEnumerable<BsonDocument> result = extension.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, null, filter, new List<string>() { "_id", "Extension", "Description", "Type", "Action" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetAllExtensions()
        {
            IEnumerable<BsonDocument> result = extension.FindAll();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, result.Count());
        }
        public ActionResult GetAllApplications()
        {
            IEnumerable<BsonDocument> result = application.FindApplications();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, result.Count());
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetExtension(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, extension.FindOne(ObjectId.Parse(id)));
        }
        [Authorize(Roles = "admin,management")]
        [HttpPost]
        public ActionResult AddExtension(AddExtensionModel addExtension)
        {
            BsonDocument extensionBson = extension.GetByExtension(addExtension.Extension.ToLower());
            if (extensionBson != null) return new ResponseModel<string>(ErrorCode.record_exist, "");
            BsonDocument bson = addExtension.ToBsonDocument();
            bson.Add("CreateTime", DateTime.Now);
            extension.Insert(bson);
            Log("-", "AddExtension");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin,management")]
        [HttpPost]
        public ActionResult UpdateExtension(UpdateExtensionModel updateextension)
        {
            BsonDocument bson = updateextension.ToBsonDocument();
            BsonDocument extensionBson = extension.GetByExtension(updateextension.Extension.ToLower());
            if (extensionBson != null && extensionBson["_id"].ToString() != updateextension.Id) return new ResponseModel<string>(ErrorCode.record_exist, "");
            if (extension.Update(ObjectId.Parse(updateextension.Id), bson))
            {
                Log(updateextension.Id, "UpdateExtension");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult DeleteExtension(string id)
        {
            if (extension.DeleteOne(ObjectId.Parse(id)))
            {
                Log(id, "DeleteExtension");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplications(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            IEnumerable<BsonDocument> result = application.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, sorts, filter, new List<string>() { "_id", "ApplicationName", "Action" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplication(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, application.FindOne(ObjectId.Parse(id)));
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplicationByAuthCode(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, application.FindByAuthCode(id));
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult AddApplication(AddApplicationModel addApplication)
        {
            BsonDocument appBson = application.FindByAppName(addApplication.ApplicationName);
            if (appBson != null) return new ResponseModel<string>(ErrorCode.record_exist, "");
            application.AddApplication(addApplication.ToBsonDocument());
            Log("-", "AddApplication");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult UpdateApplication(UpdateApplicationModel updateApplication)
        {
            BsonDocument bson = updateApplication.ToBsonDocument();
            bson.Add("UpdateTime", DateTime.Now);
            BsonDocument appBson = application.FindByAppName(updateApplication.ApplicationName);
            if (appBson != null && appBson["_id"].ToString() != updateApplication.Id) return new ResponseModel<string>(ErrorCode.record_exist, "");
            if (application.Update(ObjectId.Parse(updateApplication.Id), bson))
            {
                Log(updateApplication.Id, "UpdateApplication");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult DeleteApplication(string id)
        {
            if (application.DeleteOne(ObjectId.Parse(id)))
            {
                Log(id, "DeleteApplication");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult ReDo(string id, string type)
        {
            Log(id, "ReDo");
            BsonDocument document = task.FindOne(ObjectId.Parse(id));
            string handlerId = document["HandlerId"].AsString;
            int state = Convert.ToInt32(document["State"]);
            if (state == 2 || state == 4 || state == -1)
            {
                task.UpdateState(ObjectId.Parse(id), TaskStateEnum.wait, 0);
                queue.Insert(handlerId, type, "Task", ObjectId.Parse(id), false, new BsonDocument());
                converter.AddCount(handlerId, 1);
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.task_not_completed, "");
            }
        }
        public ActionResult GetTaskById(string id)
        {
            BsonDocument document = task.FindOne(ObjectId.Parse(id));
            string fullPath = GetTempFilePath(document);
            if (System.IO.File.Exists(fullPath))
            {
                document.Add("FileExists", true);
            }
            else
            {
                document.Add("FileExists", false);
            }
            document.Add("RelativePath", "$\\" + AppSettings.tempFileDir + document["Folder"].ToString() + "\\" + document["FileId"].ToString() + Path.GetExtension(document["FileName"].ToString()));
            return new ResponseModel<BsonDocument>(ErrorCode.success, document);
        }
        public ActionResult DeleteCacheFile(string id)
        {
            Log(id, "DeleteCacheFile");
            BsonDocument document = task.FindOne(ObjectId.Parse(id));
            if (Convert.ToInt32(document["State"]) == 2)
            {
                string fullPath = GetTempFilePath(document);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.task_not_complete, "");
            }
        }
        public ActionResult DeleteAllCacheFile()
        {
            Log("-", "DeleteAllCacheFile");
            IEnumerable<BsonDocument> list = task.FindCacheFiles();
            int count = 0;
            foreach (BsonDocument bson in list)
            {
                string fullPath = GetTempFilePath(bson);
                if (System.IO.File.Exists(fullPath))
                {
                    count++;
                    System.IO.File.Delete(fullPath);
                }
            }
            return new ResponseModel<string>(ErrorCode.success, "", count);
        }
        public ActionResult GetAllHandlers()
        {
            IEnumerable<BsonDocument> result = converter.FindAll();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
        }
        public ActionResult UpdateHandler(UpdateHandler updateHandler)
        {
            Log(updateHandler.FileId, "UpdateHandler");
            BsonDocument document = new BsonDocument()
            {
                {"HandlerId",updateHandler.Handler },
                {"State",TaskStateEnum.updated },
                {"StateDesc",TaskStateEnum.updated.ToString() }
            };
            if (task.Update(ObjectId.Parse(updateHandler.Id), document))
            {
                return new ResponseModel<BsonDocument>(ErrorCode.success, document);
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult UpdateImageTask(UpdateImageTask updateImageTask)
        {
            BsonDocument document = new BsonDocument()
            {
                {"HandlerId",updateImageTask.Handler },
                {"State",TaskStateEnum.updated },
                {"StateDesc",TaskStateEnum.updated.ToString() },
                {"Output.Format",updateImageTask.Format },
                {"Output.Model",updateImageTask.Model },
                {"Output.Flag",updateImageTask.Flag },
                {"Output.Width",updateImageTask.Width },
                {"Output.Height",updateImageTask.Height },
                {"Output.X",updateImageTask.X },
                {"Output.Y",updateImageTask.Y },
            };
            Log(updateImageTask.FileId, "UpdateImageTask");
            filesWrap.UpdateFlagImage(ObjectId.Parse(updateImageTask.FileId), ObjectId.Parse(updateImageTask.ThumbnailId), updateImageTask.Flag);
            thumbnail.Update(ObjectId.Parse(updateImageTask.ThumbnailId), new BsonDocument("Flag", updateImageTask.Flag));
            if (task.Update(ObjectId.Parse(updateImageTask.Id), document))
                return new ResponseModel<BsonDocument>(ErrorCode.success, document);
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult UpdateVideoTask(UpdateVideoTask updateVideoTask)
        {
            BsonDocument document = new BsonDocument()
            {
                {"HandlerId",updateVideoTask.Handler },
                {"State",TaskStateEnum.updated },
                {"StateDesc",TaskStateEnum.updated.ToString() },
                {"Output.Format",updateVideoTask.Format },
                {"Output.Flag",updateVideoTask.Flag },
                {"Output.Quality",updateVideoTask.Quality},
            };
            Log(updateVideoTask.FileId, "UpdateVideoTask");
            filesWrap.UpdateFlagVideo(ObjectId.Parse(updateVideoTask.FileId), ObjectId.Parse(updateVideoTask.M3u8Id), updateVideoTask.Flag);
            m3u8.Update(ObjectId.Parse(updateVideoTask.M3u8Id), new BsonDocument("Flag", updateVideoTask.Flag));
            if (task.Update(ObjectId.Parse(updateVideoTask.Id), document))
            {
                return new ResponseModel<BsonDocument>(ErrorCode.success, document);
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [AppAuthorize]
        [HttpPost]
        public ActionResult AddVideoTask(AddVideoTask addVideoTask)
        {
            string handlerId = converter.GetHandlerId();
            ObjectId fileId = ObjectId.Parse(addVideoTask.FileId);
            BsonDocument fileWrap = filesWrap.FindOne(fileId);
            ObjectId m3u8Id = ObjectId.GenerateNewId();
            BsonDocument output = new BsonDocument()
            {
                {"_id",m3u8Id },
                {"Format",addVideoTask.Format },
                {"Quality",addVideoTask.Quality },
                {"Flag",addVideoTask.Flag }
            };
            BsonDocument subFile = new BsonDocument()
            {
                {"_id",m3u8Id },
                {"Format",addVideoTask.Format },
                {"Flag",addVideoTask.Flag }
            };
            Log(addVideoTask.FileId, "AddVideoTask");
            InsertTask(handlerId, fileId, fileWrap["FileName"].AsString, "video", Request.Headers["AppName"], output, fileWrap["Access"].AsBsonArray, Request.Headers["UserName"] ?? User.Identity.Name);
            filesWrap.AddSubVideo(fileId, subFile);
            return new ResponseModel<bool>(ErrorCode.success, true);
        }
        [AppAuthorize]
        [HttpPost]
        public ActionResult AddThumbnailTask(AddImageTask addImageTask)
        {
            string handlerId = converter.GetHandlerId();
            ObjectId fileId = ObjectId.Parse(addImageTask.FileId);
            BsonDocument fileWrap = filesWrap.FindOne(fileId);
            ObjectId thumbnailId = ObjectId.GenerateNewId();
            BsonDocument output = new BsonDocument()
            {
                {"_id",thumbnailId },
                {"Format",addImageTask.Format },
                {"Flag",addImageTask.Flag },
                {"Model",addImageTask.Model },
                {"X",addImageTask.X },
                {"Y",addImageTask.Y },
                {"Width",addImageTask.Width },
                {"Height",addImageTask.Height },
            };
            BsonDocument subFile = new BsonDocument()
            {
                {"_id",thumbnailId },
                {"Format",addImageTask.Format },
                {"Flag",addImageTask.Flag }
            };
            Log(addImageTask.FileId, "AddThumbnailTask");
            InsertTask(handlerId, fileId, fileWrap["FileName"].AsString, "image", Request.Headers["AppName"], output, fileWrap["Access"].AsBsonArray, Request.Headers["UserName"] ?? User.Identity.Name);
            filesWrap.AddSubThumbnail(fileId, subFile);
            return new ResponseModel<bool>(ErrorCode.success, true);
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult UpdateAttachmentTask(UpdateAttachmentTask updateAttachmentTask)
        {
            BsonDocument document = new BsonDocument()
            {
                {"HandlerId",updateAttachmentTask.Handler },
                {"State",TaskStateEnum.updated },
                {"StateDesc",TaskStateEnum.updated.ToString() },
                {"Output.Format",updateAttachmentTask.Format },
                {"Output.Flag",updateAttachmentTask.Flag }
            };
            Log(updateAttachmentTask.FileId, "UpdateAttachmentTask");
            filesWrap.UpdateFlagAttachment(ObjectId.Parse(updateAttachmentTask.FileId), ObjectId.Parse(updateAttachmentTask.SubFileId), updateAttachmentTask.Flag);
            if (task.Update(ObjectId.Parse(updateAttachmentTask.Id), document))
                return new ResponseModel<BsonDocument>(ErrorCode.success, document);
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult Empty(string handlerId)
        {
            if (converter.Empty(handlerId))
            {
                Log("-", "Empty");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        public ActionResult GetCompanyUsers(string company, int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            BsonDocument bson = new BsonDocument("Company", company);
            long count = 0;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "UserName", "asc" } };
            IEnumerable<BsonDocument> result = user.GetPageList(pageIndex, pageSize, bson, timeStart, timeEnd, sorts, filter, new List<string>() { "UserName" }, new List<string>() { "PassWord" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetUsers(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            IEnumerable<BsonDocument> result = user.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, sorts, filter, new List<string>() { "_id", "UserName", "Role" }, new List<string>() { "PassWord" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult AddUser(AddUser addUser)
        {
            BsonDocument bsonUser = user.GetUser(addUser.UserName);
            if (bsonUser != null) return new ResponseModel<string>(ErrorCode.record_exist, "");
            addUser.CreateTime = DateTime.Now;
            if (addUser.Department == null) addUser.Department = new List<string>();
            if (addUser.DepartmentDisplay == null) addUser.DepartmentDisplay = new List<string>();
            if (string.IsNullOrEmpty(addUser.Role)) addUser.Role = "none";
            addUser.PassWord = addUser.PassWord.ToMD5();
            BsonDocument document = addUser.ToBsonDocument();
            user.Insert(document);
            Log("-", "InsertUser(" + addUser.UserName + ")");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        public ActionResult UpdateUser(UpdateUser updateUser)
        {
            BsonDocument userBson = user.GetUser(updateUser.UserName);
            updateUser.Modified = true;
            updateUser.PassWord = updateUser.PassWord.ToMD5();
            if (updateUser.Department == null) updateUser.Department = new List<string>();
            if (updateUser.DepartmentDisplay == null) updateUser.DepartmentDisplay = new List<string>();
            if (string.IsNullOrEmpty(updateUser.Role)) updateUser.Role = "none";
            BsonDocument bson = updateUser.ToBsonDocument();
            if (userBson != null && userBson["_id"].ToString() != updateUser.Id) return new ResponseModel<string>(ErrorCode.record_exist, "");
            if (user.Update(ObjectId.Parse(updateUser.Id), bson))
            {
                Log(updateUser.Id, "UpdateUser");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult GetUser(string id)
        {
            BsonDocument document = user.FindOne(ObjectId.Parse(id));
            return new ResponseModel<BsonDocument>(ErrorCode.success, document);
        }
        [Authorize(Roles = "admin")]
        public ActionResult DeleteUser(string userName)
        {
            if (user.DeleteUser(userName))
            {
                Log("-", "DeleteUser(" + userName + ")");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult AddTopDepartment(DepartmentForm departmentForm)
        {
            BsonDocument bson = departmentForm.ToBsonDocument();
            bson.Add("CreateTime", DateTime.Now);
            department.Insert(bson);
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult DeleteTopDepartment(string id)
        {
            if (department.DeleteOne(ObjectId.Parse(id)))
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        [Authorize(Roles = "admin")]
        public ActionResult UpdateDepartment(string id, DepartmentForm departmentForm)
        {
            BsonDocument d = departmentForm.ToBsonDocument();
            if (department.UpdateDepartment(id, d))
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        [Authorize(Roles = "admin")]
        public ActionResult DepartmentChangeOrder(string id, List<DepartmentForm> departmentForms)
        {
            IEnumerable<BsonDocument> bsonDocument = departmentForms.Select(s => s.ToBsonDocument());
            if (department.ChangeOrder(id, bsonDocument))
            {
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        public ActionResult GetDepartments(int pageIndex = 1, int pageSize = 10, string filter = "", string startTime = null, string endTime = null)
        {
            long count = 0;
            DateTime.TryParse(startTime, out DateTime timeStart);
            DateTime.TryParse(endTime, out DateTime timeEnd);
            IEnumerable<BsonDocument> result = department.GetPageList(pageIndex, pageSize, null, timeStart, timeEnd, null, filter, new List<string>() { "_id", "DepartmentName", "DepartmentCode" }, new List<string>() { "Department" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetAllDepartment()
        {
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, department.GetAllDepartment(), department.Count());
        }
        public ActionResult GetDepartment(string code)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, department.GetByCode(code));
        }
        [Authorize(Roles = "admin")]
        public ActionResult DeleteDepartment(string id)
        {
            if (department.DeleteOne(ObjectId.Parse(id)))
            {
                Log(id, "DeleteDepartment");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult DeleteThumbnail(string fileId, string thumbnailId)
        {
            ObjectId thumbId = ObjectId.Parse(thumbnailId);
            thumbnail.DeleteOne(thumbId);
            task.DeleteByOutputId(thumbId);
            filesWrap.DeleteThumbnail(ObjectId.Parse(fileId), thumbId);
            Log(fileId, "DeleteThumbnail");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        [AppAuthorizeDefault]
        public ActionResult DeleteM3u8(string fileId, string m3u8Id)
        {
            ObjectId fId = ObjectId.Parse(fileId);
            ObjectId mId = ObjectId.Parse(m3u8Id);
            BsonDocument m3u8Bson = m3u8.FindOne(mId);
            List<ObjectId> tsIds = m3u8Bson["File"].AsString.GetTsIds();
            ts.DeleteByIds(m3u8Bson["From"].AsString, mId, tsIds);
            m3u8.DeleteOne(mId);
            task.DeleteByOutputId(mId);
            filesWrap.DeleteM3u8(fId, mId);
            Log(fileId, "DeleteM3u8");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult Remove(string id)
        {
            RemoveFile(id);
            Log(id, "RemoveFile");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult RemoveFiles(IEnumerable<string> ids)
        {
            foreach (string id in ids)
            {
                RemoveFile(id);
                Log(id, "RemoveFile");
            }
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult Restore(string id)
        {
            ObjectId fileWrapId = ObjectId.Parse(id);
            task.RestoreByFileId(fileWrapId);
            filesWrap.Restore(fileWrapId);
            Log(id, "RestoreFile");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult RestoreFiles(IEnumerable<string> ids)
        {
            IEnumerable<ObjectId> idsObject = ids.Select(s => ObjectId.Parse(s));
            task.RestoreByFileIds(idsObject);
            filesWrap.RestoreFiles(idsObject);
            foreach (string id in ids) Log(id, "RestoreFile");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult Delete(string id)
        {
            if (DeleteFile(id))
            {
                Log(id, "DeleteFile");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            else
            {
                return new ResponseModel<string>(ErrorCode.server_exception, "");
            }
        }
        [Authorize(Roles = "admin")]
        public ActionResult DeleteFiles(IEnumerable<string> ids)
        {
            foreach (string id in ids)
            {
                if (DeleteFile(id))
                {
                    Log(id, "DeleteFile");
                }
            }
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [AllowAnonymous]
        public ActionResult Test()
        {
            byte[] IV = { 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF };
            string iv = Convert.ToBase64String(IV);
            string key1 = Convert.ToBase64String(Rijndael.Create().Key);
            RijndaelManaged rijndaelManaged = new RijndaelManaged() { KeySize = 128 };
            string key2 = Convert.ToBase64String(rijndaelManaged.Key);
            return Json(new
            {
                key1,
                key2,
                iv,
            }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetHandler()
        {
            return Content(converter.GetHandlerId());
        }
    }
}