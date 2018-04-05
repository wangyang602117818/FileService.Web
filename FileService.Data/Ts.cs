using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Ts : MongoBase
    {
        public Ts() : base("Ts") { }
        public bool DeleteBySourceId(IEnumerable<ObjectId> sourceIds)
        {
            return MongoCollection.DeleteMany(FilterBuilder.In("SourceId", sourceIds)).IsAcknowledged;
        }
        public bool DeleteBySourceId(ObjectId sourceId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("SourceId", sourceId)).IsAcknowledged;
        }
    }
}
