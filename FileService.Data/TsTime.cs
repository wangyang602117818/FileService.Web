using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;

namespace FileService.Data
{
    public class TsTime : MongoBase
    {
        public TsTime() : base("TsTime") { }
        public bool UpdateByUser(ObjectId fileId, string userCode, int currentTime)
        {
            var filter = FilterBuilder.Eq("FileId", fileId) & FilterBuilder.Eq("UserCode", userCode);
            return MongoCollection.UpdateOne(filter,
                Builders<BsonDocument>.Update.Set("TsTime", currentTime).Set("CreateTime", DateTime.Now),
                new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public BsonDocument GetTsTime(ObjectId fileId, string userCode)
        {
            var filter = FilterBuilder.Eq("FileId", fileId) & FilterBuilder.Eq("UserCode", userCode);
            return MongoCollection.Find(filter).SortByDescending(sort => sort["CreateTime"]).FirstOrDefault();
        }
        public IEnumerable<BsonDocument> GetListLastMonth(IEnumerable<ObjectId> fileIds, int month)
        {
            var filter = FilterBuilder.In("FileId", fileIds) & FilterBuilder.Gte("CreateTime", DateTime.Now.AddMonths(-month));
            return MongoCollection.Find(filter).ToEnumerable();
        }
    }
}
