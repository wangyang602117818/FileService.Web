using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
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
            BsonDocument result = new BsonDocument();
            if (stats.Contains("raw"))
            {
                Type = "sharding";
            }
            else
            {
                Type = serverStatus["metrics"].AsBsonDocument["repl"].AsBsonDocument.Contains("hosts") ? "replset" : "single";
            }
            result.Add("Type", Type);
            result.Add("WebServer", new ServerState().GetServerState().ToBsonDocument());
            if (Type == "single")
            {
                BsonDocument hostInfo = application.HostInfo();
                result.Add("DataServer", new BsonDocument() {
                    { "ServerName",serverStatus["host"]},
                    { "Version",serverStatus["version"]},
                    { "OS",hostInfo["os"]["type"].AsString+hostInfo["os"]["version"].AsString},
                    {"MemoryTotal",Math.Round(hostInfo["system"]["memSizeMB"].AsInt32*1.0/1024)+"GB" },
                    {"Data",ServerState.GetFileConvertSize(Convert.ToInt64(stats["dataSize"])) },
                    {"Type","mongodb" }
                });
            }
            //BsonDocument bson = stats["raw"].AsBsonDocument;
            //foreach (var item in bson)
            //{
            //    string connsr = item.Name.Split('/')[1];
            //    string conn = MongoDataSource.GetConnectionString(connsr.Split(','));
            //    return new ResponseModel<string>(ErrorCode.success, conn);
            //}

            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
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