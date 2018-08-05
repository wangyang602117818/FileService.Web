using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace FileService.Business
{
    public class ModelBase<T> where T : Data.MongoBase
    {
        [BsonIgnore]
        protected T mongoData;
        public ModelBase(T mongoData)
        {
            this.mongoData = mongoData;
        }
        public void Insert(BsonDocument document)
        {
            mongoData.Insert(document);
        }
        public void InsertOneAsync(BsonDocument document)
        {
            mongoData.InsertOneAsync(document);
        }
        public void InsertManyAsync(IEnumerable<BsonDocument> documents)
        {
            mongoData.InsertManyAsync(documents);
        }
        public bool Update(ObjectId id, BsonDocument document)
        {
            return mongoData.Update(id, document);
        }
        public bool DeleteOne(ObjectId id)
        {
            return mongoData.DeleteOne(id);
        }
        public bool DeleteMany(IEnumerable<ObjectId> ids)
        {
            return mongoData.DeleteMany(ids);
        }
        public IEnumerable<BsonDocument> Find(BsonDocument document)
        {
            return mongoData.Find(document);
        }
        public BsonDocument FindOne(ObjectId id)
        {
            return mongoData.FindOne(id);
        }
        public IEnumerable<BsonDocument> FindAll()
        {
            return mongoData.FindAll();
        }
        public bool Replace(BsonDocument document)
        {
            return mongoData.Replace(document);
        }
        public IEnumerable<BsonDocument> GetPageList(int pageIndex, int pageSize, BsonDocument eqs, Dictionary<string, string> sorts, string filter, IEnumerable<string> fields, IEnumerable<string> excludeFields, out long count, string userName = null)
        {
            return mongoData.GetPageList(pageIndex, pageSize, eqs, sorts, filter, fields, excludeFields, out count, userName);
        }
        public long Count()
        {
            return mongoData.Count();
        }
    }
}
