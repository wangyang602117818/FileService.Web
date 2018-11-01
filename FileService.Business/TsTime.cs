using MongoDB.Bson;
using System;

namespace FileService.Business
{
    public class TsTime : ModelBase<Data.TsTime>
    {
        public TsTime() : base(new Data.TsTime()) { }
        public bool UpdateByUserName(ObjectId sourceId, string userName, int currentTime)
        {
            return mongoData.UpdateByUserName(userName, sourceId,currentTime);
        }
        public int GetTsTime(ObjectId sourceId, string userName)
        {
            BsonDocument tsTime = mongoData.GetTsTime(sourceId, userName);
            if (tsTime == null) return 0;
            return tsTime["TsTime"].AsInt32;
        }
    }
}
