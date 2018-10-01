using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public class Ts : ModelBase<Data.Ts>
    {
        public Ts() : base(new Data.Ts()) { }
        public void Insert(ObjectId id, string from, string sourceId, string sourceName, int n, long length, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"SourceId",ObjectId.Parse(sourceId) },
                {"SourceName",sourceName },
                {"N",n },
                {"Length",length},
                {"File",file },
                {"CreateTime",DateTime.Now }
            };
            mongoData.Insert(document);
        }
        public BsonDocument GetByMd5(string from, string md5)
        {
            return mongoData.GetByMd5(from, md5);
        }
        public bool DeleteBySourceId(string from, IEnumerable<ObjectId> sourceIds)
        {
            return mongoData.DeleteBySourceId(from, sourceIds);
        }
        public bool DeleteBySourceId(string from, ObjectId sourceId)
        {
            return mongoData.DeleteBySourceId(from, sourceId);
        }
    }
}
