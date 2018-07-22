using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class FilesWrap : MongoBase
    {
        public FilesWrap() : base("FilesWrap") { }
        public bool UpdateFileId(ObjectId id, ObjectId fileId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id),Builders<BsonDocument>.Update.Set("FileId", fileId)).IsAcknowledged;
        }
    }
}
