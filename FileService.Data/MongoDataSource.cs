using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class MongoDataSource
    {
        public static MongoClient MongoClient;   //mongo数据库操作
        static MongoDataSource()
        {
            MongoClient = new MongoClient(AppSettings.mongodb);
            IMongoDatabase database = MongoClient.GetDatabase(AppSettings.database);
            MongoDBInit.Init(database);
        }
    }
}
