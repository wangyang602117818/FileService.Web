using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public partial class Thumbnail : ModelBase<Data.Thumbnail>
    {
        public Thumbnail() : base(new Data.Thumbnail()) { }
        public bool Replace(ObjectId id, string from, ObjectId sourceId, long length, int width, int height, string fileName, string flag, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"SourceId",sourceId },
                {"Length",length },
                {"Width",width },
                {"Height",height },
                {"FileName",fileName },
                {"File",file },
                {"Flag",flag },
                {"CreateTime",DateTime.Now },
            };
            return mongoData.Replace(document);
        }
        public IEnumerable<BsonDocument> FindByIds(IEnumerable<ObjectId> ids)
        {
            return mongoData.FindByIds(ids);
        }
    }
}
