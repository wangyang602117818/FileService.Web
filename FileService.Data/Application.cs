using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;

namespace FileService.Data
{
    public class Application : MongoBase
    {
        public Application() : base("Application") { }
        public BsonDocument FindByAuthCode(string authCode)
        {
            var filter = FilterBuilder.Eq("AuthCode", authCode);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public BsonDocument FindByAppName(string appName)
        {
            var filter = FilterBuilder.Eq("ApplicationName", appName);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public IEnumerable<BsonDocument> FindApplications()
        {
            return MongoCollection.Find(new BsonDocument()).Project(Builders<BsonDocument>.Projection.Include("ApplicationName")).ToEnumerable();
        }
    }
}
