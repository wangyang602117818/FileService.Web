using MongoDB.Bson;
using MongoDB.Driver;
using System;

namespace FileService.Data
{
    public class Download : MongoBase
    {
        public Download() : base("Download") { }
        /// <summary>
        /// 查询在1分钟内指定user的文档
        /// </summary>
        /// <param name="from">添加from字段能使用到索引</param>
        /// <param name="fileId"></param>
        /// <param name="user"></param>
        /// <param name="gtDate"></param>
        /// <returns></returns>
        public BsonDocument DocumentMinute(string from, ObjectId fileId, string user, DateTime gtDate)
        {
            var filter = FilterBuilder.Eq("From", from) & FilterBuilder.Eq("FileId", fileId) & FilterBuilder.Eq("User", user) & FilterBuilder.Gt("CreateTime", gtDate);
            return MongoCollection.Find(filter).Limit(1).FirstOrDefault();
        }
    }
}
