using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;

namespace FileService.Data
{
    public class Ts : MongoBase
    {
        public Ts() : base("Ts") { }
        public bool DeleteBySourceId(string from, IEnumerable<ObjectId> sourceIds)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.In("SourceId", sourceIds)).IsAcknowledged;
        }
        public BsonDocument GetByMd5(string from, string md5)
        {
            return MongoCollection.Find(FilterBuilder.Eq("From", from) & FilterBuilder.Eq("Md5", md5)).FirstOrDefault();
        }
        public bool DeleteBySourceId(string from, ObjectId sourceId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.Eq("SourceId", sourceId)).IsAcknowledged;
        }
    }
}
