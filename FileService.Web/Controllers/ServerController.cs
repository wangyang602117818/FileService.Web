using FileService.Data;
using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
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
                Type = serverStatus["repl"].AsBsonDocument.Contains("hosts") ? "replset" : "single";
            }
            result.Add("Type", Type);
            result.Add("WebServer", new ServerState().GetServerState().ToBsonDocument());
            if (Type == "single")
            {
                result.Add("DataServer", MongoDataSource.GetSingleState(null,"mongo"));
            }
            if (Type == "replset")
            {
                BsonDocument replState = MongoDataSource.GetReplSetState();
                result.Add("DataServer", replState);
            }
            if (Type == "sharding")
            {
                List<BsonDocument> rsState = new List<BsonDocument>();
                BsonDocument raw = stats["raw"].AsBsonDocument;
                foreach (var item in raw)
                {
                    var address = item.Name.Split('/')[1].Split(',');
                    rsState.Add(MongoDataSource.GetReplSetState(address));
                }
                var addressConfig = serverStatus["sharding"]["configsvrConnectionString"].ToString().Split('/')[1].Split(',');
                rsState.Add(MongoDataSource.GetReplSetState(addressConfig));
                result.Add("MongosServer", MongoDataSource.GetSingleState(null,"mongos"));
                result.Add("DataServer", new BsonArray(rsState));

            }
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
    }
}