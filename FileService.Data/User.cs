using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class User : MongoBase
    {
        public User() : base("User") { }
        public BsonDocument GetUser(string userCode)
        {
            var filter = FilterBuilder.Eq("UserCode", userCode);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public BsonDocument Login(string userCode, string password)
        {
            var filter = FilterBuilder.Eq("UserCode", userCode) & FilterBuilder.Eq("PassWord", password.GetSha256());
            return MongoCollection.Find(filter).FirstOrDefault();
        }
    }
}
