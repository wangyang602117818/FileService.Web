﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileService.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace FileService.Data
{
    public class Task : MongoBase
    {
        public Task() : base("Task") { }
        public bool UpdateState(ObjectId id, TaskStateEnum state, int percent)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("State", state).Set("StateDesc", state.ToString()).Set("Percent", percent)).IsAcknowledged;
        }
        public bool UpdatePercent(ObjectId id, int percent)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("Percent", percent)).IsAcknowledged;
        }
        public bool UpdateOutPutId(ObjectId id, ObjectId outputId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("Output._id", outputId)).IsAcknowledged;
        }
        public bool Compeleted(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("State", TaskStateEnum.completed).Set("StateDesc", TaskStateEnum.completed.ToString()).Set("CompletedTime", DateTime.Now).Set("Percent", 100).Inc("ProcessCount", 1)).IsAcknowledged;
        }
        public bool Error(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("State", TaskStateEnum.error).Set("StateDesc", TaskStateEnum.error.ToString())).IsAcknowledged;
        }
        public bool Delete(ObjectId fileId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("FileId", fileId)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime dateTime)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Gte("CreateTime", dateTime))
                 .Project(new BsonDocument("date", new BsonDocument("$dateToString", new BsonDocument() {
                    {"format", "%Y-%m-%d" },
                    {"date", "$CreateTime" }}
                 )))
                 .Group<BsonDocument>(new BsonDocument() {
                    {"_id","$date" },
                    {"count",new BsonDocument("$sum",1) }
                 })
                 .Sort(new BsonDocument("_id", 1)).ToEnumerable();
        }
    }
}
