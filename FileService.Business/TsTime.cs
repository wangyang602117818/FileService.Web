using MongoDB.Bson;
using System.Collections.Generic;

namespace FileService.Business
{
    public class TsTime : ModelBase<Data.TsTime>
    {
        public TsTime() : base(new Data.TsTime()) { }
        public bool UpdateByUserName(string from, ObjectId fileId, string userCode, int currentTime)
        {
            return mongoData.UpdateByUserName(from, fileId, userCode, currentTime);
        }
        public int GetTsTime(string from, ObjectId fileId, string userCode)
        {
            BsonDocument tsTime = mongoData.GetTsTime(from, fileId, userCode);
            if (tsTime == null) return 0;
            return tsTime["TsTime"].AsInt32;
        }
        public IEnumerable<BsonDocument> GetListLastMonth(IEnumerable<ObjectId> fileIds, int month)
        {
            return mongoData.GetListLastMonth(fileIds, month);
        }
    }
}
