using FileService.Data;
using FileService.Util;
using FileService.Web.Models;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace FileService.Web.Controllers
{
    public class ServerController : BaseController
    {
        Business.Admin admin = new Business.Admin();
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
                if (serverStatus.Contains("repl"))
                {
                    Type = serverStatus["repl"].AsBsonDocument.Contains("hosts") ? "replset" : "single";
                }
                else
                {
                    Type = "single";
                }
            }
            result.Add("Type", Type);
            result.Add("WebServer", new ServerState().GetServerState().ToBsonDocument());
            if (Type == "single")
            {
                result.Add("DataServer", MongoDataSource.GetSingleState(null, "mongo"));
            }
            if (Type == "replset")
            {
                BsonDocument replState = MongoDataSource.GetReplSetState();
                result.Add("DataServer", new BsonArray() { replState });
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
                result.Add("MongosServer", MongoDataSource.GetSingleState(null, "mongos"));
                result.Add("DataServer", new BsonArray(rsState));

            }
            return new ResponseModel<BsonDocument>(ErrorCode.success, result);
        }
        public ActionResult GetCacheFiles(string handlerId)
        {
            BsonDocument handler = converter.GetHandler(handlerId);
            string saveFileType = handler["SaveFileType"].AsString;
            string saveFilePath = handler["SaveFilePath"].AsString;
            string saveFileApi = handler["SaveFileApi"].AsString;
            string cacheFile = "";
            if (saveFileType == "path")
            {
                cacheFile = ServerState.GetCacheFiles(saveFilePath);
                return new ResponseModel<string>(ErrorCode.success, cacheFile);
            }
            else
            {
                Dictionary<string, string> header = new Dictionary<string, string>();
                header.Add("path", saveFilePath);
                cacheFile = new HttpRequestHelper().Get(saveFileApi + "/home/getcachefiles" + "?handlerId=" + handlerId, header).Result;
            }
            return Content(cacheFile, "application/json");
        }
        public ActionResult DeleteHandlerCacheFiles(string handlerId)
        {
            Log("-", "DeleteHandlerCacheFiles");
            BsonDocument handler = converter.GetHandler(handlerId);
            int count = DeleteCacheFiles(handler);
            return new ResponseModel<int>(ErrorCode.success, count);
        }
        public ActionResult DeleteAllCacheFiles()
        {
            Log("-", "DeleteAllCacheFiles");
            IEnumerable<BsonDocument> handlers = converter.FindAll();
            int count = 0;
            foreach (BsonDocument handler in handlers)
            {
                count += DeleteCacheFiles(handler);
            }
            return new ResponseModel<int>(ErrorCode.success, count);
        }

    }
}