﻿using MongoDB.Bson;
using System;

namespace FileService.Business
{
    public class FilePreview : ModelBase<Data.FilePreview>
    {
        public FilePreview() : base(new Data.FilePreview()) { }
        public bool Replace(ObjectId id, string from, long length, string fileName, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"Length",length },
                {"FileName",fileName },
                {"File",file },
                {"CreateTime",DateTime.Now },
            };
            return mongoData.Replace(document);
        }
    }

}
