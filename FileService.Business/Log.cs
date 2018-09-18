using MongoDB.Bson;
using System;

namespace FileService.Business
{
    public class Log : ModelBase<Data.Log>
    {
        public Log() : base(new Data.Log()) { }
        public void Insert(string from, string fileId, string content, string userName, string userIp, string userAgent)
        {
            BsonDocument document = new BsonDocument()
            {
                {"From",from??"" },
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
