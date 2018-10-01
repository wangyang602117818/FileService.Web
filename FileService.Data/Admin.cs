using MongoDB.Bson;
using MongoDB.Driver;
using System.Text;

namespace FileService.Data
{
    public class Admin
    {
        protected IMongoDatabase MongoDatabase;
        public Admin()
        {
            MongoDatabase = MongoDataSource.MongoClient.GetDatabase("admin", new MongoDatabaseSettings()
            {
                ReadEncoding = new UTF8Encoding(false, false)
            });
        }
        public BsonDocument RsStatus()
        {
            return MongoDatabase.RunCommand<BsonDocument>(new BsonDocument("replSetGetStatus", 1));
        }

    }
}
