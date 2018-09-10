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
    public class MongoFile : MongoFileBase
    {
        public MongoFile() : base(new Data.MongoFile()) { }
    }
    public class MongoFileConvert : MongoFileBase
    {
        public MongoFileConvert() : base(new Data.MongoFileConvert()) { }
    }
    
}
