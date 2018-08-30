using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public class Ts : ModelBase<Data.Ts>
    {
        public Ts() : base(new Data.Ts()) { }
        public void Insert(ObjectId id, string sourceId, string sourceName, int n, long length, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"SourceId",ObjectId.Parse(sourceId) },
                {"SourceName",sourceName },
                {"N",n },
                {"Length",length},
                {"File",file },
                {"CreateTime",DateTime.Now }
            };
            mongoData.Insert(document);
        }
        public bool DeleteBySourceId(IEnumerable<ObjectId> sourceIds)
        {
            return mongoData.DeleteBySourceId(sourceIds);
        }
        public bool DeleteBySourceId(ObjectId sourceId)
        {
            return mongoData.DeleteBySourceId(sourceId);
        }
    }
}
