using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Shared:MongoBase
    {
        public Shared() : base("Shared") { }
        public IEnumerable<BsonDocument> GetShared(ObjectId fileId)
        {
            return MongoCollection.Find(FilterBuilder.Eq("FileId", fileId)).ToEnumerable();
        }
    }
}
