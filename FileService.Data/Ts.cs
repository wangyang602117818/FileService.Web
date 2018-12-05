using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;

namespace FileService.Data
{
    public class Ts : MongoBase
    {
        public Ts() : base("Ts") { }
        public bool DeleteByIds(string from, IEnumerable<ObjectId> ids)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids) & FilterBuilder.Size("SourceIds", 1)).IsAcknowledged;
        }
        public bool DeleteById(string from, ObjectId id)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.Eq("_id", id) & FilterBuilder.Size("SourceIds", 1)).IsAcknowledged;
        }
        public bool AddSourceId(ObjectId id, ObjectId sourceId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.AddToSet("SourceIds", sourceId)).IsAcknowledged;
        }
        public BsonDocument GetIdByMd5(string from, string md5)
        {
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.Eq("Md5", md5);
            return MongoCollection.Find(filter).Project(Builders<BsonDocument>.Projection.Include("_id")).FirstOrDefault();
        }

    }
}
