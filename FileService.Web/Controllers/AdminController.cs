using FileService.Web.Models;
using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace FileService.Web.Controllers
{
    public class AdminController : BaseController
    {
        Config config = new Config();
        Application application = new Application();
        Files files = new Files();
        MongoFile mongoFile = new MongoFile();
        FilesConvert filesConvert = new FilesConvert();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        User user = new User();
        Department department = new Department();
        Converter converter = new Converter();
        Task task = new Task();
        Thumbnail thumbnail = new Thumbnail();
        M3u8 m3u8 = new M3u8();
        Ts ts = new Ts();
        Queue queue = new Queue();
        VideoCapture videoCapture = new VideoCapture();
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
            IEnumerable<BsonDocument> result = converter.GetPageList(pageIndex, pageSize, "StartTime", filter, new List<string>() { "HandlerId", "MachineName" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetTasks(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = task.GetPageList(pageIndex, pageSize, "CreateTime", filter, new List<string>() { "FileName", "StateDesc", "HandlerId", "StateDesc", "Type" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetFiles(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = files.GetPageList(pageIndex, pageSize, "uploadDate", filter, new List<string>() { "filename", "metadata.From", "metadata.FileType" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetConvertFiles(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = filesConvert.GetPageList(pageIndex, pageSize, "uploadDate", filter, new List<string>() { "filename", "metadata.From", "metadata.FileType" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        public ActionResult GetThumbnailMetadata(string id)
        {
            IEnumerable<BsonDocument> thumbs = thumbnail.FindBySourceId(ObjectId.Parse(id));
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, thumbs);
        }
        public ActionResult GetM3u8Metadata(string id)
        {
            int cp = files.FindOne(ObjectId.Parse(id))["metadata"]["VideoCpIds"].AsBsonArray.Count;
            IEnumerable<BsonDocument> m3u8s = m3u8.FindBySourceId(ObjectId.Parse(id)).Select(sel => sel.Add("Cp", cp));
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, m3u8s);
        }
        public ActionResult GetSubFileMetadata(string id)
        {
            BsonDocument file = files.FindOne(ObjectId.Parse(id));
            List<BsonDocument> result = new List<BsonDocument>();
            if (file == null) return new ResponseModel<List<BsonDocument>>(ErrorCode.success, result);
            if (!file["metadata"].AsBsonDocument.Contains("Files"))
            {
                return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
            }
            string fileExt = Path.GetExtension(file["filename"].AsString).ToLower();
            if (fileExt == ".zip" || fileExt == ".rar")
            {
                BsonArray bsonArray = file["metadata"]["Files"].AsBsonArray;
                return new ResponseModel<BsonArray>(ErrorCode.success, bsonArray);
            }
            foreach (BsonDocument doc in file["metadata"]["Files"].AsBsonArray)
            {
                if (doc.Contains("_id") && doc["_id"].AsObjectId != ObjectId.Empty)
                {
                    result.Add(filesConvert.FindOne(doc["_id"].AsObjectId));
                }
                else
                {
                    result.Add(doc);
                }
            }
            return new ResponseModel<List<BsonDocument>>(ErrorCode.success, result);
        }
        [AllowAnonymous]
        public ActionResult Preview(string id, string fileType, string fileName)
        {
            ViewBag.id = id;
            ViewBag.Convert = "false";
            if (OfficeFormatList.offices.Contains(Path.GetExtension(fileName)))
            {
                ViewBag.Convert = "true";
                BsonDocument metadata = files.FindOne(ObjectId.Parse(id))["metadata"].AsBsonDocument;
                ViewBag.id = metadata.Contains("Files") ? metadata["Files"].AsBsonArray[0]["_id"].ToString() : ObjectId.Empty.ToString();
            }
            ViewBag.FileType = fileType;
            ViewBag.FileName = fileName;
            return View();
        }
        [AllowAnonymous]
        public ActionResult PreviewConvert(string id, string fileType, string fileName)
        {
            ViewBag.id = id;
            ViewBag.Convert = "true";
            ViewBag.FileType = fileType;
            ViewBag.FileName = fileName;
            return View("Preview");
        }
        public ActionResult GetCountRecentMonth(int month)
        {
            BsonDocument result = new BsonDocument();
            DateTime dateTime = DateTime.Now;
            var startDateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0).AddMonths(-month);
            IEnumerable<BsonDocument> fileResult = files.GetCountByRecentMonth(startDateTime);
            result.Add("files", new BsonArray(fileResult));
            IEnumerable<BsonDocument> taskResult = task.GetCountByRecentMonth(startDateTime);
            result.Add("tasks", new BsonArray(taskResult));
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult GetTotalCount()
        {
            BsonDocument result = new BsonDocument();
            result.Add("Handlers", converter.Count());
            result.Add("Tasks", task.Count());
            result.Add("Resources", new BsonArray(files.GetFilesByType()));
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult GetFilesByAppName()
        {
            IEnumerable<BsonDocument> result = files.GetFilesByAppName();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
        }
        public ActionResult GetHexCode(int id)
        {
            return new ResponseModel<string>(ErrorCode.success, new Random().RandomCodeHex(id));
        }
        public ActionResult GetLogs(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = log.GetPageList(pageIndex, pageSize, "CreateTime", filter, new List<string>() { "AppName", "Content", "FileId" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin,management")]
        public ActionResult GetConfigs(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = config.GetPageList(pageIndex, pageSize, "", filter, new List<string>() { "Extension", "Type", "Action" }, new List<string>() { }, out count);
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
            IEnumerable<BsonDocument> result = application.GetPageList(pageIndex, pageSize, "", filter, new List<string>() { "ApplicationName", "Action" }, new List<string>() { }, out count);
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
        [Authorize(Roles = "admin")]
        public ActionResult GetTaskById(string id)
        {
            BsonDocument document = task.FindOne(ObjectId.Parse(id));
            return new ResponseModel<BsonDocument>(ErrorCode.success, document);
        }
        [Authorize(Roles = "admin")]
        public ActionResult GetAllHandlers()
        {
            IEnumerable<BsonDocument> result = converter.FindAll();
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result);
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
            files.UpdateFlagImage(ObjectId.Parse(updateImageTask.FileId), ObjectId.Parse(updateImageTask.ThumbnailId), updateImageTask.Flag);
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
            files.UpdateFlagVideo(ObjectId.Parse(updateVideoTask.FileId), ObjectId.Parse(updateVideoTask.M3u8Id), updateVideoTask.Flag);
            m3u8.Update(ObjectId.Parse(updateVideoTask.M3u8Id), new BsonDocument("Flag", updateVideoTask.Flag));
            if (task.Update(ObjectId.Parse(updateVideoTask.Id), document))
                return new ResponseModel<BsonDocument>(ErrorCode.success, document);
            return new ResponseModel<string>(ErrorCode.server_exception, "");
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
            files.UpdateFlagAttachment(ObjectId.Parse(updateAttachmentTask.FileId), ObjectId.Parse(updateAttachmentTask.SubFileId), updateAttachmentTask.Flag);
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
        [Authorize(Roles = "admin")]
        public ActionResult GetUsers(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = user.GetPageList(pageIndex, pageSize, "CreateTime", filter, new List<string>() { "UserName", "Role" }, new List<string>() { "PassWord" }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        public ActionResult AddUser(AddUser addUser)
        {
            BsonDocument bsonUser = user.GetUser(addUser.UserName);
            if (bsonUser == null) { addUser.CreateTime = DateTime.Now; } else { addUser.Modified = true; }
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
        public ActionResult GetUser(string name)
        {
            BsonDocument document = user.GetUser(name);
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
        public ActionResult GetDepartment(int pageIndex = 1, int pageSize = 10, string filter = "")
        {
            long count = 0;
            IEnumerable<BsonDocument> result = department.GetPageList(pageIndex, pageSize, "CreateTime", filter, new List<string>() { "DepartmentName" }, new List<string>() { }, out count);
            return new ResponseModel<IEnumerable<BsonDocument>>(ErrorCode.success, result, count);
        }
        [Authorize(Roles = "admin")]
        public ActionResult Delete(string id)
        {
            BsonDocument doc = files.FindOne(ObjectId.Parse(id));
            if (doc["metadata"]["FileType"] == "image")
            {
                List<ObjectId> thumbnailIds = new List<ObjectId>();
                foreach (BsonDocument d in doc["metadata"]["Thumbnail"].AsBsonArray) thumbnailIds.Add(d["_id"].AsObjectId);
                thumbnail.DeleteMany(thumbnailIds);
            }
            if (doc["metadata"]["FileType"] == "video")
            {
                List<ObjectId> m3u8Ids = new List<ObjectId>();
                foreach (BsonDocument d in doc["metadata"]["Videos"].AsBsonArray) m3u8Ids.Add(d["_id"].AsObjectId);
                m3u8.DeleteMany(m3u8Ids);
                ts.DeleteBySourceId(m3u8Ids);
                videoCapture.DeleteBySourceId(ObjectId.Parse(id));
            }
            if (doc["metadata"]["FileType"] == "attachment")
            {
                foreach (BsonDocument bson in doc["metadata"]["Files"].AsBsonArray)
                {
                    if (!bson.Contains("_id")) continue;
                    if (filesConvert.FindOne(bson["_id"].AsObjectId) != null) mongoFileConvert.Delete(bson["_id"].AsObjectId);
                }
            }
            mongoFile.Delete(ObjectId.Parse(id));
            task.Delete(ObjectId.Parse(id));
            Log(id, "DeleteFile");
            return new ResponseModel<string>(ErrorCode.success, "");
        }

    }
}