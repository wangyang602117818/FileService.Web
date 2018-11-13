using MongoDB.Bson;
using System.Collections.Generic;

namespace FileService.Business
{
    public class TsTime : ModelBase<Data.TsTime>
    {
        public TsTime() : base(new Data.TsTime()) { }
        public bool UpdateByUserName(string from, ObjectId sourceId, string sourceName, string userName, int currentTime)
        {
            return mongoData.UpdateByUserName(from, sourceId, sourceName, userName, currentTime);
        }
        public int GetTsTime(string from, ObjectId sourceId, string userName)
        {
            BsonDocument tsTime = mongoData.GetTsTime(from, sourceId, userName);
            if (tsTime == null) return 0;
            return tsTime["TsTime"].AsInt32;
        }
        public IEnumerable<BsonDocument> GetListLastMonth(IEnumerable<ObjectId> sourceIds,int month)
        {
            return mongoData.GetListLastMonth(sourceIds, month);
        }
    }
}
