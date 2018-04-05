using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class Log : ModelBase<Data.Log>
    {
        public Log() : base(new Data.Log()) { }
        public void Insert(string appName, string fileId, string content, string userName, string userIp, string userAgent)
        {
            BsonDocument document = new BsonDocument()
            {
                {"AppName",appName??"" },
                {"FileId",fileId },
                {"Content",content },
                {"UserName",userName },
                {"UserIp",userIp },
                {"UserAgent",userAgent??"" },
                {"CreateTime",DateTime.Now }
            };
            mongoData.Insert(document);
        }
    }
}
