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
