﻿using MongoDB.Bson;
using System;
using System.IO;

namespace FileService.Business
{
    public class MongoFile : MongoFileBase
    {
        public MongoFile() : base(new Data.MongoFile()) { }
    }
    public class MongoFileConvert : MongoFileBase
    {
        public MongoFileConvert() : base(new Data.MongoFileConvert()) { }
        public ObjectId UploadFile(string fileName, Stream stream, string from, ObjectId id, string fileType, string contentType, DateTime expiredTime)
        {
            BsonDocument metadata = new BsonDocument()
            {
                {"From", from},
                {"Id",id },
                {"FileType",fileType},
                {"ContentType",contentType},
                {"ExpiredTime",expiredTime},
            };
            return Upload(fileName, stream, metadata);
        }
    }
}
