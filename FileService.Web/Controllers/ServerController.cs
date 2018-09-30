using FileService.Data;
using FileService.Model;
using FileService.Web.Models;
using MongoDB.Bson;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class ServerController : Controller
    {
        Business.Admin admin = new Business.Admin();
        Business.Application application = new Business.Application();
        public ActionResult ServerStatus()
        {
            string Type = "single";
            BsonDocument stats = application.DbStats();
            BsonDocument serverStatus = application.ServerStatus();
            if (stats.Contains("raw"))
            {
                Type = "sharding";
            }
            //BsonDocument bson = stats["raw"].AsBsonDocument;
            //foreach (var item in bson)
            //{
            //    string connsr = item.Name.Split('/')[1];
            //    string conn = MongoDataSource.GetConnectionString(connsr.Split(','));
            //    return new ResponseModel<string>(ErrorCode.success, conn);
            //}

            return new ResponseModel<ServerState>(ErrorCode.success, new ServerState().GetServerState());
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