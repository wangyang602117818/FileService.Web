using FileService.Business;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class SharedController : Controller
    {
        Shared shared = new Shared();
        Config config = new Config();
        FilesWrap filesWrap = new FilesWrap();
        public ActionResult Init(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
            int expiredDay = bson["ExpiredDay"].ToInt32();
            DateTime createTime = bson["CreateTime"].ToUniversalTime();
            string password = bson["PassWord"].IsBsonNull ? "" : bson["PassWord"].ToString();
            bool expired = false, hasPassword = false;
            if (DateTime.Now > createTime.AddDays(expiredDay) && expiredDay > 0) expired = true;
            if (!string.IsNullOrEmpty(password)) hasPassword = true;

            ViewBag.hasPassword = hasPassword;
            ViewBag.expired = expired;
            ViewBag.id = id;

            return View();
        }

        public ActionResult F(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));

            string fileId = bson["FileId"].ToString();
            string fileName = bson["FileName"].ToString();
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            ViewBag.id = id;
            ViewBag.fileId = fileId;
            ViewBag.convert = "false";
            ViewBag.fileType = fileType;
            if (fileType == "office")
            {
                ViewBag.convert = "true";
                BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(fileId));
                ViewBag.fileId = fileWrap.Contains("Files") ? fileWrap["Files"].AsBsonArray[0]["_id"].ToString() : ObjectId.Empty.ToString();
            }
            ViewBag.template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "/pdfview/template.html");
            return View();
        }
        public ActionResult Index(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
            string fileId = bson["FileId"].ToString();
            string fileName = bson["FileName"].ToString();
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            string password = bson["PassWord"].IsBsonNull ? "" : bson["PassWord"].ToString();
            int expiredDay = bson["ExpiredDay"].ToInt32();
            DateTime createTime = bson["CreateTime"].ToUniversalTime();
            bool expired = false, hasPassword = false;
            if (DateTime.Now > createTime.AddDays(expiredDay) && expiredDay > 0) expired = true;
            if (!string.IsNullOrEmpty(password)) hasPassword = true;

            ViewBag.convert = false;
            if (fileType == "office")
            {
                BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(fileId));
                string subFileId = fileWrap["Files"].AsBsonArray[0]["_id"].ToString();
                ViewBag.subFileId = subFileId;
                ViewBag.convert = true;
            }
            ViewBag.hasPassword = hasPassword;
            ViewBag.expired = expired;
            ViewBag.id = id;
            ViewBag.fileId = fileId;
            ViewBag.fileName = fileName;
            ViewBag.fileType = fileType;
            ViewBag.password = password;

            return View();
        }
        public ActionResult CheckPassWord(string id, string password)
        {
            if (string.IsNullOrEmpty(password.Trim()))
            {
                return new ResponseModel<string>(ErrorCode.invalid_password, "");
            }
            else
            {
                BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
                if(bson["PassWord"].ToString()== password)
                {
                    return new ResponseModel<bool>(ErrorCode.success, true);
                }
                else
                {
                    return new ResponseModel<string>(ErrorCode.invalid_password, "");
                }
            }
        }
    }
}