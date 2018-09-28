using FileService.Business;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class ServerController : Controller
    {
        Admin admin = new Admin();
        Application application = new Application();
        public ActionResult ServerStatus()
        {

            BsonDocument serverStatus = application.ServerStatus();


            return new ResponseModel<BsonDocument>(ErrorCode.success, serverStatus);
        }
        public ActionResult DbStats()
        {
            BsonDocument dbStats = application.DbStats();
            return new ResponseModel<BsonDocument>(ErrorCode.success, dbStats);
        }
        public ActionResult RsStatus()
        {
            BsonDocument status = admin.RsStatus();
            return new ResponseModel<BsonDocument>(ErrorCode.success, status);
        }
    }
}