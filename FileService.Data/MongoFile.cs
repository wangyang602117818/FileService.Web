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
    public class MongoFile : MongoFileBase
    {
        public MongoFile() : base("admin", "fs") { }
    }
    public class MongoFileConvert : MongoFileBase
    {
        public MongoFileConvert() : base("admin", "convert") { }
    }
}
