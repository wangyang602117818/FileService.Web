using FileService.Model;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Task : ModelBase<Data.Task>
    {
        public Task() : base(new Data.Task()) { }
        public void Insert(ObjectId id, ObjectId fileId, string fileName, string type, BsonDocument output, string handlerId, TaskStateEnum state, int priority)
        {
            BsonDocument task = new BsonDocument()
            {
                {"_id",id },
                {"FileId",fileId },
                {"FileName",fileName },
                {"Type",type },
                {"Output",output },
                {"HandlerId",handlerId },
                {"State",state },
                {"StateDesc",state.ToString() },
                {"Percent",0 },
                {"Priority",priority },
                {"CreateTime",DateTime.Now },
                {"CompletedTime",BsonNull.Value }
            };
            mongoData.InsertOneAsync(task);
        }
        public void Insert(ObjectId id, ObjectId fileId, string tempFolder, string fileName, string type, BsonDocument output, BsonArray access, string handlerId, int processCount, TaskStateEnum state, int priority)
        {
            BsonDocument task = new BsonDocument()
            {
                {"_id",id },
                {"FileId",fileId },
                {"TempFolder",tempFolder },
                {"FileName",fileName },
                {"Type",type },
                {"Output",output },
                {"Access",access },
                {"HandlerId",handlerId },
                {"ProcessCount",processCount },
                {"State",state },
                {"StateDesc",state.ToString() },
                {"Percent",0 },
                {"Priority",priority },
                {"CreateTime",DateTime.Now },
                {"CompletedTime",BsonNull.Value }
            };
            mongoData.InsertOneAsync(task);
        }
        public bool UpdateState(ObjectId id, TaskStateEnum state, int percent)
        {
            return mongoData.UpdateState(id, state, percent);
        }
        public bool UpdatePercent(ObjectId id, int percent)
        {
            return mongoData.UpdatePercent(id, percent);
        }
        public bool UpdateOutPutId(ObjectId id, ObjectId outputId)
        {
            return mongoData.UpdateOutPutId(id, outputId);
        }
        public bool Compeleted(ObjectId id)
        {
            return mongoData.Compeleted(id);
        }
        public bool Error(ObjectId id)
        {
            return mongoData.Error(id);
        }
        public bool Delete(ObjectId fileId)
        {
            return mongoData.Delete(fileId);
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime startDateTime)
        {
            return mongoData.GetCountByRecentMonth(startDateTime);
        }

    }
}
