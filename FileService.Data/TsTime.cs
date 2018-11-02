using MongoDB.Bson;
using MongoDB.Driver;
using System;

namespace FileService.Data
{
    public class TsTime : MongoBase
    {
        public TsTime() : base("TsTime") { }
        public bool UpdateByUserName(string from, ObjectId sourceId, string sourceName, string userName, int currentTime)
        {
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.Eq("UserName", userName) & FilterBuilder.Eq("SourceId", sourceId);
            return MongoCollection.UpdateOne(filter,
                Builders<BsonDocument>.Update.Set("SourceName", sourceName).Set("TsTime", currentTime).Set("CreateTime", DateTime.Now),
                new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        public BsonDocument GetTsTime(string from, ObjectId sourceId, string userName)
        {
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.Eq("UserName", userName) & FilterBuilder.Eq("SourceId", sourceId);
            return MongoCollection.Find(filter).SortByDescending(sort => sort["CreateTime"]).FirstOrDefault();
        }
    }
}
