using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class FilesBase : ModelBase<Data.FilesBase>
    {
        public FilesBase(Data.FilesBase filesBase) : base(filesBase) { }
        
        public BsonDocument GetFileByMd5(string md5)
        {
            return mongoData.GetFileByMD5(md5);
        }
    }
}
