using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public class M3u8 : ModelBase<Data.M3u8>
    {
        public M3u8() : base(new Data.M3u8()) { }
        public void Replace(ObjectId id, string from, ObjectId sourceId, string fileName, string file, int quality, int duration, int width, int height, int tsCount, string flag, DateTime expiredTime)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id", id},
                {"From", from},
                {"SourceId", sourceId},
                {"FileName", fileName},
                {"Quality", quality},
                {"Duration", duration},
                {"Width", width},
                {"Height", height},
                {"TsCount", tsCount},
                {"File", file}, {"Flag",flag },
                {"CreateTime",DateTime.Now },
                {"ExpiredTime",expiredTime }
            };
            mongoData.Replace(document);
        }
        public IEnumerable<BsonDocument> FindBySourceId(ObjectId sourceId)
        {
            return mongoData.FindBySourceId(sourceId);
        }
        public IEnumerable<BsonDocument> FindBySourceIdAndSort(ObjectId sourceId)
        {
            return mongoData.FindBySourceIdAndSort(sourceId);
        }
    }
}
