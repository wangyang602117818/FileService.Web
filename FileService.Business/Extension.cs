﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Extension : ModelBase<Data.Extension>
    {
        public Extension() : base(new Data.Extension()) { }
        public bool CheckFileExtension(string extension)
        {
            BsonDocument document = mongoData.FindByExtension(extension);
            if (document == null) return true;
            if (document["Action"].AsString.ToLower() == "block") return false;
            return true;
        }
        public bool CheckFileExtensionVideo(string extension)
        {
            BsonDocument document = mongoData.FindByExtension(extension);
            if (document == null) return true;
            if (document["Type"].AsString.ToLower() != "video") return false;
            if (document["Action"].AsString.ToLower() == "block") return false;
            return true;
        }
        public bool CheckFileExtensionImage(string extension)
        {
            BsonDocument document = mongoData.FindByExtension(extension);
            if (document == null) return true;
            if (document["Type"].AsString.ToLower() != "image") return false;
            if (document["Action"].AsString.ToLower() == "block") return false;
            return true;
        }
        public string GetTypeByExtension(string extension)
        {
            BsonDocument document = mongoData.FindByExtension(extension);
            if (document == null) return "";
            return document["Type"].AsString;
        }
        public BsonDocument GetByExtension(string extension)
        {
            return mongoData.FindByExtension(extension);
        }
        public bool UpdateExtension(string extension, string type, string description, string action)
        {
            return mongoData.UpdateExtension(extension, type, description, action);
        }
        public bool DeleteExtension(string extension)
        {
            return mongoData.DeleteExtension(extension);
        }
        public IEnumerable<BsonDocument> FindByType(string type)
        {
            return mongoData.FindByType(type);
        }
    }
}