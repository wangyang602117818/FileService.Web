using MongoDB.Bson;
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
        public bool DeleteBySourceId(string from, ObjectId sourceId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.Eq("SourceId", sourceId)).IsAcknowledged;
        }
    }
}
