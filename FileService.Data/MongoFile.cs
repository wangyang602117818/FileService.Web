using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class MongoFile : MongoBase
    {
        public GridFSBucket gridFSBucket;
        public MongoFile() : base("admin")
        {
            gridFSBucket = new GridFSBucket(MongoDatabase);
        }
        public ObjectId Upload(string fileName, Stream stream,BsonDocument metadata)
        {
            return gridFSBucket.UploadFromStream(fileName, stream, new GridFSUploadOptions() { Metadata = metadata });
        }
        public Task<ObjectId> UploadAsync(string fileName, Stream stream, BsonDocument metadata)
        {
            return gridFSBucket.UploadFromStreamAsync(fileName, stream, new GridFSUploadOptions() { Metadata = metadata });
        }
        public GridFSDownloadStream DownLoad(ObjectId id)
        {
            return gridFSBucket.OpenDownloadStream(id);
        }
        public void Delete(ObjectId id)
        {
            gridFSBucket.Delete(id);
        }
    }
}
