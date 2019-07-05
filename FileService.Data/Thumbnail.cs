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
        public bool DeleteByIds(string from, ObjectId sourceId, IEnumerable<ObjectId> ids)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids) & FilterBuilder.Size("SourceIds", 0)).IsAcknowledged;
        }
        public bool AddSourceId(string from, ObjectId id, ObjectId sourceId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.AddToSet("SourceIds", sourceId)).IsAcknowledged;
        }
        public bool DeleteSourceId(string from, ObjectId sourceId, IEnumerable<ObjectId> ids)
        {
            return MongoCollection.UpdateMany(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids), Builders<BsonDocument>.Update.Pull("SourceIds", sourceId)).IsAcknowledged;
        }
        public BsonDocument GetIdByMd5(string from, string md5)
        {
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.Eq("Md5", md5);
            return MongoCollection.Find(filter).Project(Builders<BsonDocument>.Projection.Include("_id")).FirstOrDefault();
        }
        public IEnumerable<BsonDocument> FindThumbnailMetadata(string from, IEnumerable<ObjectId> ids)
        {
            var proj = new BsonDocument()
                 {
                     {"Length",1 },
                     {"Width",1 },
                     {"Height",1 },
                     {"Flag",1 }
                 };
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids);
            return MongoCollection.Find(filter)
                 .Project(proj)
                 .Sort(new BsonDocument("Length", 1))
                 .ToEnumerable();
        }
    }
}
