using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace FileService.Data
{
    public class MongoDataSource
    {
        public static MongoClient MongoClient;   //mongo数据库操作
        public static string UserName;
        public static string Password;
        public static int Port;
        static MongoDataSource()
        {
            MongoClient = new MongoClient(AppSettings.mongodb);
            ParseUserNamePassword(AppSettings.mongodb);
            IMongoDatabase database = MongoClient.GetDatabase(AppSettings.database);
            MongoDBInit.Init(database);
        }
        static void ParseUserNamePassword(string connectionString)
        {
            Regex regex = new Regex("mongodb://(.*?):(.*?)@", RegexOptions.IgnoreCase);
            Match match = regex.Match(connectionString);
            UserName = match.Groups[1].Value;
            Password = match.Groups[2].Value;
        }
        public static string GetConnectionString(params string[] address)
        {
            string auth = UserName.Length > 0 ? UserName + ":" + Password + "@" : "";
            if (address.Length == 1) return "mongodb://" + auth + address[0] + "/admin";
            return "mongodb://" + auth + string.Join(",", address) + "/admin";
        }
        public static BsonDocument GetHostInfo(string connectionString)
        {
            var mc = new MongoClient(AppSettings.mongodb);
            var database = mc.GetDatabase(AppSettings.database);
            return database.RunCommand<BsonDocument>("hostInfo");
        }
        public static BsonDocument GetReplSetState(params string[] address)
        {
            string connectionStr = address.Length == 0 ? AppSettings.mongodb : GetConnectionString(address);
            var mongoClient = new MongoClient(connectionStr);
            var database = mongoClient.GetDatabase(AppSettings.database);
            var serverStatus = database.RunCommand<BsonDocument>(new BsonDocument("serverStatus", 1));
            var dbStats = database.RunCommand<BsonDocument>(new BsonDocument("dbStats", 1));
            var hostInfo = database.RunCommand<BsonDocument>(new BsonDocument("hostInfo", 1));
            var rsStatus = mongoClient.GetDatabase("admin",new MongoDatabaseSettings() { ReadEncoding= new UTF8Encoding(false, false) }).RunCommand<BsonDocument>(new BsonDocument("replSetGetStatus", 1));
            List<BsonDocument> replList = new List<BsonDocument>();
            List<BsonDocument> servers = new List<BsonDocument>();
            BsonDocument repl = new BsonDocument();
            repl.Add("ReplSetName", rsStatus["set"]);
            foreach (BsonDocument bson in rsStatus["members"].AsBsonArray)
            {
                string[] server = bson["name"].AsString.Split(':');
                string data = (bson["state"].AsInt32 == 1 || bson["state"].AsInt32 == 2) ? ServerState.GetFileConvertSize(Convert.ToInt64(dbStats["dataSize"])) : "";
                servers.Add(new BsonDocument()
                    {
                        {"State",bson["state"] },
                        {"ServerName",server[0] },
                        {"Port",server.Length==2?server[1]:"27017" },
                        {"Version",serverStatus["version"] },
                        {"Health",bson["health"] },
                        {"UpTime",bson["uptime"] },
                        {"Data",data },
                    });
            }
            repl.Add("Servers", new BsonArray(servers));
            return repl;
        }
        public static BsonDocument GetSingleState(string address, string type)
        {
            string connectionStr = string.IsNullOrEmpty(address) ? AppSettings.mongodb : address;
            var mongoClient = new MongoClient(connectionStr);
            var database = mongoClient.GetDatabase(AppSettings.database);
            var serverStatus = database.RunCommand<BsonDocument>(new BsonDocument("serverStatus", 1));
            var dbStats = database.RunCommand<BsonDocument>(new BsonDocument("dbStats", 1));
            BsonDocument hostInfo = database.RunCommand<BsonDocument>(new BsonDocument("hostInfo", 1));
            string[] server = serverStatus["host"].AsString.Split(':');
            BsonDocument result = new BsonDocument() {
                {"ServerName",server[0]},
                {"Port",server.Length==2?server[1]:"27017" },
                {"Version",serverStatus["version"]},
                {"OS",hostInfo["os"]["type"].AsString+hostInfo["os"]["version"].AsString},
                {"MemoryTotal",Math.Round(hostInfo["system"]["memSizeMB"].AsInt32*1.0/1024)+"GB" },
                {"Data",ServerState.GetFileConvertSize(Convert.ToInt64(dbStats["dataSize"])) },
                {"Type",type },
                {"UpTime",serverStatus["uptime"] },
                {"Health",1 }
            };
            return result;
        }
    }
}
