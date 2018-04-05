using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class MongoFile : ModelBase<Data.MongoFile>
    {
        public static string AppDataDir = AppDomain.CurrentDomain.BaseDirectory + "App_Data\\";
        public MongoFile() : base(new Data.MongoFile()) { }
        public ObjectId Upload(string fileName, Stream stream, BsonDocument metadata)
        {
            return mongoData.Upload(fileName, stream, metadata);
        }
        public Task<ObjectId> UploadAsync(string fileName, Stream stream, BsonDocument metadata)
        {
            return mongoData.UploadAsync(fileName, stream, metadata);
        }
        public GridFSDownloadStream DownLoad(ObjectId id)
        {
            return mongoData.DownLoad(id);
        }
        public void Delete(ObjectId id)
        {
            mongoData.Delete(id);
        }
        public void SaveTo(ObjectId id)
        {
            using (GridFSDownloadStream mongoStream = mongoData.DownLoad(id))
            {
                string filePath = AppDataDir + mongoStream.FileInfo.Filename;
                using (FileStream fileStream = new FileStream(filePath, FileMode.Create))
                {
                    mongoStream.CopyTo(fileStream);
                }
            }
        }
    }
}
