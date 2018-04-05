using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Config : MongoBase
    {
        public Config() : base("Config") { }
        public BsonDocument FindByExtension(string extension)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public bool UpdateConfig(string extension, string value, string action)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Type", value).Set("Action", action).Set("CreateTime", DateTime.Now), new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public bool DeleteConfig(string extension)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.DeleteOne(filter).IsAcknowledged;
        }
    }
}
