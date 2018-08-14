using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class Shared: ModelBase<Data.Shared>
    {
        public Shared() : base(new Data.Shared()) { }
        public IEnumerable<BsonDocument> GetShared(ObjectId fileId)
        {
            return mongoData.GetShared(fileId);
        }
    }
}
