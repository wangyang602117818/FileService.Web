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
            return MongoCollection.Find(FilterBuilder.Eq("From", from) & FilterBuilder.In("_id", ids))
                .Project(Builders<BsonDocument>.Projection
                .Include("_id").Include("Length").Include("Width").Include("Height").Include("Flag")).ToEnumerable();
        }
    }
}
