﻿using FileService.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FileService.Data
{
    public class Task : MongoBase
    {
        public Task() : base("Task") { }
        public override IEnumerable<BsonDocument> Find(BsonDocument document)
        {
            document.Add("Delete", false);
            return MongoCollection.Find(document).ToEnumerable();
        }
        public override BsonDocument FindOne(ObjectId id)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Delete", false);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public override IEnumerable<BsonDocument> FindAll()
        {
            var filter = FilterBuilder.Eq("Delete", false);
            return MongoCollection.Find(filter).ToEnumerable();
        }
        public override long Count()
        {
            var filter = FilterBuilder.Eq("Delete", false) & FilterBuilder.Exists("Output._id");
            return MongoCollection.CountDocuments(filter);
        }
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
        public bool Fault(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("State", TaskStateEnum.fault).Set("StateDesc", TaskStateEnum.fault.ToString())).IsAcknowledged;
        }
        public bool RemoveByFileId(ObjectId fileId)
        {
            return MongoCollection.UpdateMany(FilterBuilder.Eq("FileId", fileId), Builders<BsonDocument>.Update.Set("Delete", true).Set("DeleteTime", DateTime.Now)).IsAcknowledged;
        }
        public bool RestoreByFileId(ObjectId fileId)
        {
            return MongoCollection.UpdateMany(FilterBuilder.Eq("FileId", fileId), Builders<BsonDocument>.Update.Set("Delete", false).Set("DeleteTime", BsonNull.Value)).IsAcknowledged;
        }
        public bool RestoreByFileIds(IEnumerable<ObjectId> fileIds)
        {
            return MongoCollection.UpdateMany(FilterBuilder.In("FileId", fileIds), Builders<BsonDocument>.Update.Set("Delete", false).Set("DeleteTime", BsonNull.Value)).IsAcknowledged;
        }
        public bool DeleteByFileId(ObjectId fileId)
        {
            return MongoCollection.DeleteMany(FilterBuilder.Eq("FileId", fileId)).IsAcknowledged;
        }
        public bool DeleteByOutputId(ObjectId id)
        {
            return MongoCollection.DeleteOne(FilterBuilder.Eq("Output._id", id)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime dateTime)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Eq("Delete", false) & FilterBuilder.Gte("CreateTime", dateTime) & FilterBuilder.Exists("Output._id"))
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
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return MongoCollection.Aggregate()
                .Match(FilterBuilder.Eq("Delete", false) & FilterBuilder.Exists("Output._id"))
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$From" },
                    {"tasks",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public IEnumerable<BsonDocument> GetCountByAppName(DateTime startDateTime)
        {
            return MongoCollection.Aggregate()
                .Match(FilterBuilder.Eq("Delete", false) & FilterBuilder.Gte("CreateTime", startDateTime))
                .Project(new BsonDocument() {
                    {"date",new BsonDocument("$dateToString", new BsonDocument() {{"format", "%Y-%m-%d" },{"date", "$CreateTime" }})},
                    {"from","$From" }
                })
                .ToEnumerable();
        }
        public bool UpdateAccess(IEnumerable<ObjectId> ids, BsonArray array)
        {
            var filter = FilterBuilder.In("FileId", ids);
            return MongoCollection.UpdateMany(filter, Builders<BsonDocument>.Update.Set("Access", array)).IsAcknowledged;
        }
        public override FilterDefinition<BsonDocument> GetAccessFilter(string userName)
        {
            return base.GetAccessFilterBase(userName);
        }
        public override FilterDefinition<BsonDocument> GetAndFilter()
        {
            return FilterBuilder.Exists("Output._id");
        }
        public IEnumerable<BsonDocument> FindCacheFiles()
        {
            List<FilterDefinition<BsonDocument>> list = new List<FilterDefinition<BsonDocument>>();
            list.Add(FilterBuilder.In("Type", new List<string>() { "image", "video" }));
            list.Add(FilterBuilder.Exists("Output._id"));
            list.Add(FilterBuilder.Eq("State", 2));
            return MongoCollection.Find(FilterBuilder.And(list)).ToEnumerable();
        }
    }
}
