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
        public void Insert(ObjectId id, ObjectId fileId, string tempFolder, string fileName, string type,string from, BsonDocument output, BsonArray access,string owner, string handlerId, int processCount, TaskStateEnum state, int priority)
        {
            BsonDocument task = new BsonDocument()
            {
                {"_id",id },
                {"FileId",fileId },
                {"TempFolder",tempFolder },
                {"FileName",fileName },
                {"Type",type },
                {"From",from },
                {"Output",output },
                {"Access",access },
                {"Owner",owner },
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
        public bool Fault(ObjectId id)
        {
            return mongoData.Fault(id);
        }
        public bool DeleteByOutputId(ObjectId id)
        {
            return mongoData.DeleteByOutputId(id);
        }
        public bool Delete(ObjectId fileId)
        {
            return mongoData.Delete(fileId);
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime startDateTime)
        {
            return mongoData.GetCountByRecentMonth(startDateTime);
        }
        public bool UpdateAccess(ObjectId fileId, BsonArray array)
        {
            return mongoData.UpdateAccess(fileId, array);
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return mongoData.GetFilesByAppName();
        }
    }
}
