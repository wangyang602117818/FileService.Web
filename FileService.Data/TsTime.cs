using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;

namespace FileService.Data
{
    public class TsTime : MongoBase
    {
        public TsTime() : base("TsTime") { }
        public bool UpdateByUserName(string from, ObjectId sourceId, string sourceName, string userCode, int currentTime)
        {
            var filter = FilterBuilder.Eq("SourceId", sourceId) & FilterBuilder.Eq("From", from) & FilterBuilder.Eq("UserCode", userCode);
            return MongoCollection.UpdateOne(filter,
                Builders<BsonDocument>.Update.Set("SourceName", sourceName).Set("TsTime", currentTime).Set("CreateTime", DateTime.Now),
                new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public BsonDocument GetTsTime(string from, ObjectId sourceId, string userCode)
        {
            var filter = FilterBuilder.Eq("SourceId", sourceId) & FilterBuilder.Eq("From", from) & FilterBuilder.Eq("UserCode", userCode);
            return MongoCollection.Find(filter).SortByDescending(sort => sort["CreateTime"]).FirstOrDefault();
        }
        public IEnumerable<BsonDocument> GetListLastMonth(IEnumerable<ObjectId> sourceIds, int month)
        {
            var filter = FilterBuilder.In("SourceId", sourceIds) & FilterBuilder.Gte("CreateTime", DateTime.Now.AddMonths(-month));
            return MongoCollection.Find(filter).ToEnumerable();
        }
    }
}
