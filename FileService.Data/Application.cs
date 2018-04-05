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
        public BsonDocument FindByApplicationName(string name)
        {
            var filter = FilterBuilder.Eq("ApplicationName", name);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public bool UpdateApplication(string name, string action)
        {
            var filter = FilterBuilder.Eq("ApplicationName", name);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Action", action), new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public bool DeleteApplication(string name)
        {
            var filter = FilterBuilder.Eq("ApplicationName", name);
            return MongoCollection.DeleteOne(filter).IsAcknowledged;
        }
    }
}
