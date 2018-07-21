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
        public void InsertImage(ObjectId id, ObjectId fileId, string fileName, long length, string from, string contentType, BsonArray thumbnail, BsonArray access, string owner)
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
        public void InsertVideo(ObjectId id, ObjectId fileId, string fileName, long length, string from,string contentType, BsonArray videos, BsonArray videoCpIds, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"FileType","video" },
                    {"ContentType",contentType },
                    {"Videos",videos },
                    {"VideoCpIds",videoCpIds },
                    {"Access",access },
                    {"Owner",owner },
                    {"CreateTime",DateTime.Now }
                };
            mongoData.Insert(filesWrap);
        }
        public void InsertAttachment(ObjectId id, ObjectId fileId, string fileName, long length, string from,string contentType, BsonArray files, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"FileType","attachment" },
                    {"ContentType",contentType },
                    {"Files",files },
                    {"Access",access },
                    {"Owner",owner },
                    {"CreateTime",DateTime.Now }
                };
            mongoData.Insert(filesWrap);
        }
    }
}
