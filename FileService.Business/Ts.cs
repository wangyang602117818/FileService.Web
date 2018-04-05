using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class Ts : ModelBase<Data.Ts>
    {
        public Ts() : base(new Data.Ts()) { }
        public void Replace(ObjectId id, string sourceId, string sourceName, long length, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"SourceId",ObjectId.Parse(sourceId) },
                {"SourceName",sourceName },
                { "Length",length},
                {"File",file },
                {"CreateTime",DateTime.Now }
            };
            mongoData.Replace(document);
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
