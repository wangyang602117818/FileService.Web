using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Config : ModelBase<Data.Config>
    {
        public Config() : base(new Data.Config()) { }
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
        public bool UpdateConfig(string extension, string type, string action)
        {
            return mongoData.UpdateConfig(extension, type, action);
        }
        public bool DeleteConfig(string extension)
        {
            return mongoData.DeleteConfig(extension);
        }
    }
}
