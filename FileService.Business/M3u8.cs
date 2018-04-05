using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class M3u8 : ModelBase<Data.M3u8>
    {
        public M3u8() : base(new Data.M3u8()) { }
        public void Replace(ObjectId id, ObjectId sourceId, string fileName, string file, int duration, int tsCount, string flag)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id", id},
                {"SourceId", sourceId},
                {"FileName", fileName},
                {"Duration", duration},
                {"TsCount", tsCount},
                {"File", file}, {"Flag",flag },
                { "CreateTime",DateTime.Now }
            };
            mongoData.Replace(document);
        }
    }
}
