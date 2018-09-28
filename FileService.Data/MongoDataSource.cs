using FileService.Util;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace FileService.Data
{
    public class MongoDataSource
    {
        public static MongoClient MongoClient;   //mongo数据库操作
        public static string UserName;
        public static string Password;
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
    }
}
