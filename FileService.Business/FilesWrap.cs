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
        public bool UpdateFileId(ObjectId id,ObjectId fileId)
        {
            return mongoData.UpdateFileId(id, fileId);
        }

        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime startDateTime)
        {
            return mongoData.GetCountByRecentMonth(startDateTime);
        }
        public IEnumerable<BsonDocument> GetFilesByType()
        {
            return mongoData.GetFilesByType();
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return mongoData.GetFilesByAppName();
        }
        public bool AddVideoCapture(ObjectId id, ObjectId captureId)
        {
            return mongoData.AddVideoCapture(id, captureId);
        }
        public bool DeleteVideoCapture(ObjectId id, ObjectId captureId)
        {
            return mongoData.DeleteVideoCapture(id, captureId);
        }
        public bool UpdateFlagImage(ObjectId id, ObjectId thumbnailId, string flag)
        {
            return mongoData.UpdateFlagImage(id, thumbnailId, flag);
        }
        public bool UpdateFlagVideo(ObjectId id, ObjectId m3u8Id, string flag)
        {
            return mongoData.UpdateFlagVideo(id, m3u8Id, flag);
        }
        public bool UpdateFlagAttachment(ObjectId id, ObjectId fileId, string flag)
        {
            return mongoData.UpdateFlagAttachment(id, fileId, flag);
        }
        public bool UpdateSubFileId(ObjectId id, ObjectId oldFileId, ObjectId newFileId)
        {
            return mongoData.UpdateSubFileId(id, oldFileId, newFileId);
        }
        public bool ReplaceSubFiles(ObjectId id, BsonArray array)
        {
            return mongoData.ReplaceSubFiles(id, array);
        }
    }
}
