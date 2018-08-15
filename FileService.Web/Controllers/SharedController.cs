using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class SharedController : Controller
    {
        Shared shared = new Shared();
        Config config = new Config();
        public ActionResult Index(string id)
        {
            BsonDocument bson = shared.FindOne(ObjectId.Parse(id));
            string fileId = bson["FileId"].ToString();
            string fileName = bson["FileName"].ToString();
            string fileType = config.GetTypeByExtension(Path.GetExtension(fileName).ToLower()).ToLower();
            string password = bson["PassWord"].ToString();
            int expiredDay = bson["ExpiredDay"].ToInt32();
            DateTime createTime = bson["CreateTime"].ToUniversalTime();
            bool expired = false;
            if (DateTime.Now > createTime.AddDays(expiredDay)) expired = true;

            ViewBag.expired = expired;
            ViewBag.fileId = fileId;
            ViewBag.fileName = fileName;
            ViewBag.fileType = fileType;
            ViewBag.password = password;

            return View();
        }
    }
}