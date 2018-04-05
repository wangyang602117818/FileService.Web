using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class Application : ModelBase<Data.Application>
    {
        public Application() : base(new Data.Application()) { }
        public bool FindByApplicationName(string name)
        {
            BsonDocument document = mongoData.FindByApplicationName(name);
            if (document == null || document["Action"] == "block") return false;
            return true;
        }
        public bool UpdateApplication(string name, string action)
        {
            return mongoData.UpdateApplication(name, action);
        }
        public bool DeleteApplication(string name)
        {
            return mongoData.DeleteApplication(name);
        }
    }
}
