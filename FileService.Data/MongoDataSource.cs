using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
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
    }
}
