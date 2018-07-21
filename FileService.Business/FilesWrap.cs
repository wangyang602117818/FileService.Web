using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class FilesWrap : ModelBase<Data.FilesWrap>
    {
        public FilesWrap() : base(new Data.FilesWrap()) { }
        public void Insert(ObjectId id, ObjectId fileId, string fileName, long length, string from, string fileType, string contentType, BsonArray thumbnail, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"FileType","image" },
                    {"ContentType",contentType },
                    {"Thumbnail",thumbnail },
                    {"Access",access },
                    {"Owner",owner },
                    {"CreateTime",DateTime.Now }
                };
            mongoData.Insert(filesWrap);
        }
    }
}
