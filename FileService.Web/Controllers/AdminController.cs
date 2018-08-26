using FileService.Business;
using FileService.Model;
using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace FileService.Web.Controllers
{
    public class AdminController : BaseController
    {
        Config config = new Config();
        Application application = new Application();
        FilesWrap filesWrap = new FilesWrap();
        MongoFile mongoFile = new MongoFile();
        FilesConvert filesConvert = new FilesConvert();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        User user = new User();
        Department department = new Department();
        Thumbnail thumbnail = new Thumbnail();
        M3u8 m3u8 = new M3u8();
        Ts ts = new Ts();
        VideoCapture videoCapture = new VideoCapture();
        Shared shared = new Shared();
        public ActionResult Index()
        {
            ViewBag.Name = User.Identity.Name;
            BsonDocument bsonUser = user.GetUser(User.Identity.Name);
            if (User.Identity.Name != "local")
            {
                if (bsonUser == null) return RedirectToAction("login", "admin");
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
            if (User.Identity.IsAuthenticated)
            {
                if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                    && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
                {
                    return Redirect(returnUrl);
                }
                else
                {
                    return Redirect("/admin/index");
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
        public ActionResult GetHandlers(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "StartTime", "desc" } };
            IEnumerable<BsonDocument> result = converter.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "HandlerId", "MachineName" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetTasks(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            var userName = Request.Headers["UserName"] ?? User.Identity.Name;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            IEnumerable<BsonDocument> result = task.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "FileId", "FileName", "StateDesc", "HandlerId", "StateDesc", "Type" }, new List<string>() { }, out count, userName);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetFiles(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            var userName = Request.Headers["UserName"] ?? User.Identity.Name;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            IEnumerable<BsonDocument> result = filesWrap.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "_id", "FileName", "From", "FileType" }, new List<string>() { }, out count, userName);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetConvertFiles(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "uploadDate", "desc" } };
            IEnumerable<BsonDocument> result = filesConvert.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "filename", "metadata.From", "metadata.FileType" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
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
            IEnumerable<BsonDocument> thumbs = thumbnail.FindBySourceId(ObjectId.Parse(id));
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
        public ActionResult Preview(string id, string fileName)
        {
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            ViewBag.id = id;
            ViewBag.convert = "false";
            ViewBag.fileType = fileType;
            if (fileType == "office")
            {
                ViewBag.Convert = "true";
                BsonDocument bson = filesWrap.FindOne(ObjectId.Parse(id));
                ViewBag.id = bson.Contains("Files") ? bson["Files"].AsBsonArray[0]["_id"].ToString() : ObjectId.Empty.ToString();
            }
            ViewBag.FileName = fileName;
            ViewBag.template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "/pdfview/template.html");
            return View();
        }
        public ActionResult PreviewConvert(string id, string fileName)
        {
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
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
        public ActionResult GetTotalCount()
        {
            BsonDocument result = new BsonDocument();
            result.Add("Handlers", converter.Count());
            result.Add("Tasks", task.Count());
            result.Add("Resources", new BsonArray(filesWrap.GetFilesByType()));
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
        public ActionResult GetExtensions(string type)
        {
            IEnumerable<string> result = config.FindByType(type).Select(s=>s["Extension"].ToString());
            return new ResponseModel<IEnumerable<string>>(ErrorCode.success, result);
        }
        public ActionResult GetLogs(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            IEnumerable<BsonDocument> result = log.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "_id", "AppName", "Content", "FileId" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetConfigs(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = config.GetPageList(pageIndex, pageSize, null, null, filter, new List<string>() { "_id", "Extension", "Type", "Action" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetConfig(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, config.FindOne(ObjectId.Parse(id)));
        }
        [Authorize(Roles = "admin,management")]
        [HttpPost]
        public ActionResult UpdateConfig(AddConfigModel updateConfigModel)
        {
            if (config.UpdateConfig(updateConfigModel.Extension, updateConfigModel.Type, updateConfigModel.Action))
            {
                Log("-", "UpdateConfig");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult DeleteConfig(string id)
        {
            if (config.DeleteOne(ObjectId.Parse(id)))
            {
                Log("-", "DeleteConfig");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplications(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = application.GetPageList(pageIndex, pageSize, null, null, filter, new List<string>() { "_id", "ApplicationName", "Action" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplication(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, application.FindOne(ObjectId.Parse(id)));
        }
        [OutputCache(Duration = 60 * 60 * 24)]
        [Authorize(Roles = "admin,management")]
        public ActionResult GetApplicationByAuthCode(string id)
        {
            return new ResponseModel<BsonDocument>(ErrorCode.success, application.FindByAuthCode(id));
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult UpdateApplication(UpdateApplicationModel updateApplicationModel)
        {
            if (application.UpdateApplication(updateApplicationModel.ApplicationName, updateApplicationModel.AuthCode, updateApplicationModel.Action))
            {
                Log("-", "UpdateApplication");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult DeleteApplication(string id)
        {
            if (application.DeleteOne(ObjectId.Parse(id)))
            {
                Log("-", "DeleteApplication");
                return new ResponseModel<string>(ErrorCode.success, "");
            }
            return new ResponseModel<string>(ErrorCode.server_exception, "");
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult ReDo(string id, string type)
        {
            Log(id, "ReDo");
            BsonDocument document = task.FindOne(ObjectId.Parse(id));
            if (document["State"].AsInt32 == 2 || document["State"].AsInt32 == 4 || document["State"].AsInt32 == -1)
            {
                task.UpdateState(ObjectId.Parse(id), TaskStateEnum.wait, 0);
                queue.Insert(document["HandlerId"].AsString, type, "Task", ObjectId.Parse(id), false, new BsonDocument());
                converter.AddCount(document["HandlerId"].AsString, 1);
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
            return new ResponseModel<BsonDocument>(ErrorCode.success, document);
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
            InserTask(handlerId, fileId, fileWrap["FileName"].AsString, "video", Request.Headers["AppName"], output, fileWrap["Access"].AsBsonArray, Request.Headers["UserName"] ?? User.Identity.Name);
            filesWrap.AddSubVideo(fileId, subFile);
            return new ResponseModel<bool>(ErrorCode.success, true);
        }
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
            InserTask(handlerId, fileId, fileWrap["FileName"].AsString, "image", Request.Headers["AppName"], output, fileWrap["Access"].AsBsonArray, Request.Headers["UserName"] ?? User.Identity.Name);
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
        public ActionResult GetCompanyUsers(string company, int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            BsonDocument bson = new BsonDocument("Company", company);
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "UserName", "asc" } };
            IEnumerable<BsonDocument> result = user.GetPageList(pageIndex, pageSize, bson, sorts, filter, new List<string>() { "UserName" }, new List<string>() { "PassWord" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetUsers(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            Dictionary<string, string> sorts = new Dictionary<string, string> { { "CreateTime", "desc" } };
            IEnumerable<BsonDocument> result = user.GetPageList(pageIndex, pageSize, null, sorts, filter, new List<string>() { "_id", "UserName", "Role" }, new List<string>() { "PassWord" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult AddUser(AddUser addUser)
        {
            BsonDocument bsonUser = user.GetUser(addUser.UserName);
            if (bsonUser == null)
            {
                addUser.CreateTime = DateTime.Now;
            }
            else
            {
                addUser.Modified = true;
            }
            if (addUser.Department == null) addUser.Department = new List<string>();
            if (addUser.DepartmentDisplay == null) addUser.DepartmentDisplay = new List<string>();
            if (string.IsNullOrEmpty(addUser.Role)) addUser.Role = "none";
            addUser.PassWord = addUser.PassWord.ToMD5();
            BsonDocument document = addUser.ToBsonDocument();
            if (bsonUser == null)
            {
                user.Insert(document);
                Log("-", "InsertUser(" + addUser.UserName + ")");
            }
            else
            {
                Log("-", "UpdateUser(" + addUser.UserName + ")");
                user.UpdateUser(addUser.UserName, addUser.ToBsonDocument());
            }
            return new ResponseModel<string>(ErrorCode.success, "");
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
                Log("-", "DeleteUser");
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
        public ActionResult GetDepartments(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = department.GetPageList(pageIndex, pageSize, null, null, filter, new List<string>() { "_id", "DepartmentName", "DepartmentCode" }, new List<string>() { "Department" }, out count);
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
                Log("-", "DeleteDepartment");
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
        public ActionResult DeleteM3u8(string fileId, string m3u8Id)
        {
            ObjectId fId = ObjectId.Parse(fileId);
            ObjectId mId = ObjectId.Parse(m3u8Id);
            ts.DeleteBySourceId(mId);
            m3u8.DeleteOne(mId);
            task.DeleteByOutputId(mId);
            filesWrap.DeleteM3u8(fId, mId);
            Log(fileId, "DeleteM3u8");
            return new ResponseModel<string>(ErrorCode.success, "");
        }
        [Authorize(Roles = "admin")]
        public ActionResult Delete(string id)
        {
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(id));
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
                foreach (BsonDocument d in fileWrap["Videos"].AsBsonArray) m3u8Ids.Add(d["_id"].AsObjectId);
                m3u8.DeleteMany(m3u8Ids);
                ts.DeleteBySourceId(m3u8Ids);
                videoCapture.DeleteBySourceId(ObjectId.Parse(id));
            }
            //删除 attachment 相关
            if (fileWrap["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in fileWrap["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
            }
            if (filesWrap.CountByFileId(fileWrap["FileId"].AsObjectId) == 1 && fileWrap["FileId"].AsObjectId != ObjectId.Empty)
            {
                mongoFile.Delete(fileWrap["FileId"].AsObjectId);
            }
            filesWrap.DeleteOne(ObjectId.Parse(id));
            task.Delete(ObjectId.Parse(id));
            Log(id, "DeleteFile");
            return new ResponseModel<string>(ErrorCode.success, "");
        }

        [AllowAnonymous]
        public ActionResult Test()
        {
            return View();
        }
    }
}