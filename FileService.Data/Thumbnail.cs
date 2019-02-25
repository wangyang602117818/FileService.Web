using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;

namespace FileService.Data
{
    public class Thumbnail : MongoBase
    {
        public Thumbnail() : base("Thumbnail") { }
        public IEnumerable<BsonDocument> FindByIds(string from, IEnumerable<ObjectId> ids)
        {
            return MongoCollection.Find(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids))
                .Project(Builders<BsonDocument>.Projection
                .Exclude("File")).ToEnumerable();
        }
        public IEnumerable<BsonDocument> FindThumbnailMetadata(string from, IEnumerable<ObjectId> ids)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids))
                 .Project(new BsonDocument()
                 {
                     { "Id", new BsonDocument("$toString", "$_id")},
                     {"_id",0 },
                     {"Length",1 },
                     {"Width",1 },
                     {"Height",1 },
                     {"Flag",1 }
                 })
                 .Sort(new BsonDocument("Length", 1))
                 .ToEnumerable();
        }
    }
}
