using MongoDB.Bson;
using System.Collections.Generic;

namespace FileService.Business
{
    public class TsTime : ModelBase<Data.TsTime>
    {
        public TsTime() : base(new Data.TsTime()) { }
        public bool UpdateByUser(ObjectId fileId, string userCode, int currentTime)
        {
            return mongoData.UpdateByUser(fileId, userCode, currentTime);
        }
        public int GetTsTime(ObjectId fileId, string userCode)
        {
            BsonDocument tsTime = mongoData.GetTsTime(fileId, userCode);
            if (tsTime == null) return 0;
            return tsTime["TsTime"].AsInt32;
        }
        public IEnumerable<BsonDocument> GetListLastMonth(IEnumerable<ObjectId> fileIds, int month)
        {
            return mongoData.GetListLastMonth(fileIds, month);
        }
    }
}
