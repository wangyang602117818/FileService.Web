using FileService.Business;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    [AllowAnonymous]
    public class SharedController : BaseController
    {
        public ActionResult Init(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
            int expiredDay = bson["ExpiredDay"].ToInt32();
            DateTime createTime = bson["CreateTime"].ToUniversalTime();
            string password = bson["PassWord"].IsBsonNull ? "" : bson["PassWord"].ToString();
            bool expired = false, hasPassword = false;
            if (DateTime.Now > createTime.AddDays(expiredDay) && expiredDay > 0) expired = true;
            if (!string.IsNullOrEmpty(password)) hasPassword = true;

            ViewBag.disabled = bson["Disabled"].AsBoolean;
            ViewBag.hasPassword = hasPassword;
            ViewBag.expired = expired;
            ViewBag.id = id;
            return View();
        }
        public ActionResult F(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
            DateTime createTime = bson["CreateTime"].ToUniversalTime();
            int expiredDay = bson["ExpiredDay"].ToInt32();
            HttpCookie password_cookie = Request.Cookies["shared_password_" + id];
            //验证//////////////////////
            string password = bson["PassWord"].IsBsonNull ? "" : bson["PassWord"].ToString();
            bool expired = false, hasPassword = false;
            bool disabled = bson["Disabled"].AsBoolean;

            if (DateTime.Now > createTime.AddDays(expiredDay) && expiredDay > 0) expired = true;
            if (!string.IsNullOrEmpty(password)) hasPassword = true;

            if (disabled || expired || (hasPassword && password_cookie == null) || (password_cookie != null && password_cookie.Value != password))
            {
                return RedirectToAction("init", "shared", new { id });
            }
            //验证/////////////////////

            string fileId = bson["FileId"].ToString();
            BsonDocument fileWrap = filesWrap.FindOne(ObjectId.Parse(fileId));
            string fileName = fileWrap["FileName"].ToString();
            string fileType = extension.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            ViewBag.id = id;
            ViewBag.fileId = fileId;
            ViewBag.fileName = fileName;
            ViewBag.convert = "false";
            ViewBag.deleted = "false";
            ViewBag.fileType = fileType;
            if (fileType == "office")
            {
                ViewBag.convert = "true";
                ViewBag.fileId = fileWrap.Contains("Files") ? fileWrap["Files"].AsBsonArray[0]["_id"].ToString() : ObjectId.Empty.ToString();
            }
            ViewBag.template = System.IO.File.ReadAllText(AppDomain.CurrentDomain.BaseDirectory + "/pdfview/template.html");
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
                if (bson["PassWord"].ToString() == password)
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