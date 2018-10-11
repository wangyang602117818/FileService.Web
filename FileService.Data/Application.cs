using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Application : MongoBase
    {
        public Application() : base("Application") { }
        public BsonDocument FindByAuthCode(string authCode)
        {
            var filter = FilterBuilder.Eq("AuthCode", authCode);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public BsonDocument FindByAppName(string appName)
        {
            var filter = FilterBuilder.Eq("ApplicationName", appName);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public bool UpdateApplication(string name, string code, string action)
        {
            var filter = FilterBuilder.Eq("ApplicationName", name);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("AuthCode", code).Set("Action", action).Set("CreateTime", DateTime.Now), new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
    }
}
