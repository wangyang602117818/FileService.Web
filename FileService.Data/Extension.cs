using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Extension : MongoBase
    {
        public Extension() : base("Extension") { }
        public BsonDocument FindByExtension(string extension)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public bool UpdateExtension(string extension, string value,string description, string action)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Type", value).Set("Action", action).Set("Description", description).Set("CreateTime", DateTime.Now), new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public bool DeleteExtension(string extension)
        {
            var filter = FilterBuilder.Eq("Extension", extension);
            return MongoCollection.DeleteOne(filter).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> FindByType(string type)
        {
            var filter = FilterBuilder.Eq("Type", type);
            return MongoCollection.Find(filter).ToEnumerable();
        }
    }
}
