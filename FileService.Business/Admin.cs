using MongoDB.Bson;
using MongoDB.Driver;

namespace FileService.Business
{
    public class Admin
    {
        private Data.Admin admin = new Data.Admin();
        public BsonDocument RsStatus()
        {
            return admin.RsStatus();
        }
    }
}
