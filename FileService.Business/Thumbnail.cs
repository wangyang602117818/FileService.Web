using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public partial class Thumbnail : ModelBase<Data.Thumbnail>
    {
        public Thumbnail() : base(new Data.Thumbnail()) { }
        public bool Replace(ObjectId id, ObjectId sourceId, long length, string fileName, string flag, byte[] file)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"SourceId",sourceId },
                {"Length",length },
                {"FileName",fileName },
                {"File",file },
                {"Flag",flag },
                {"CreateTime",DateTime.Now },
            };
            return mongoData.Replace(document);
        }
        public IEnumerable<BsonDocument> FindBySourceId(ObjectId sourceId)
        {
            return mongoData.FindBySourceId(sourceId);
        }
    }
}
