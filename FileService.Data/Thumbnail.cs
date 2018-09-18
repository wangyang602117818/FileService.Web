using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;

namespace FileService.Data
{
    public class Thumbnail : MongoBase
    {
        public Thumbnail() : base("Thumbnail") { }
        public IEnumerable<BsonDocument> FindByIds(IEnumerable<ObjectId> ids)
        {
            return MongoCollection.Find(FilterBuilder.In("_id", ids))
                .Project(Builders<BsonDocument>.Projection
                .Exclude("File")).ToEnumerable();
        }
    }
}
