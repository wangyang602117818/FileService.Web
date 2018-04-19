using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Thumbnail : MongoBase
    {
        public Thumbnail() : base("Thumbnail") { }
        public IEnumerable<BsonDocument> FindBySourceId(ObjectId sourceId)
        {
            return MongoCollection.Find(FilterBuilder.Eq("SourceId", sourceId))
                .Project(Builders<BsonDocument>.Projection
                .Exclude("File")).ToEnumerable();
        }
    }
}
