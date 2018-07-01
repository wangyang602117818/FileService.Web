using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class MongoBase
    {
        public IMongoDatabase MongoDatabase;
        public IMongoCollection<BsonDocument> MongoCollection;
        protected FilterDefinitionBuilder<BsonDocument> FilterBuilder = Builders<BsonDocument>.Filter;
        public MongoBase(string collectionName)
        {
            MongoDatabase = MongoDataSource.MongoClient.GetDatabase(AppSettings.database);
            MongoCollection = MongoDatabase.GetCollection<BsonDocument>(collectionName);
        }
        public void Insert(BsonDocument document)
        {
            MongoCollection.InsertOne(document);
        }
        public void InsertOneAsync(BsonDocument document)
        {
            MongoCollection.InsertOneAsync(document);
        }
        public void InsertManyAsync(IEnumerable<BsonDocument> documents)
        {
            MongoCollection.InsertManyAsync(documents);
        }
        public bool Update(ObjectId id, BsonDocument document)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), new BsonDocument("$set", document)).IsAcknowledged;
        }
        public bool DeleteOne(ObjectId id)
        {
            return MongoCollection.DeleteOne(new BsonDocument("_id", id)).IsAcknowledged;
        }
        public bool DeleteMany(IEnumerable<ObjectId> ids)
        {
            return MongoCollection.DeleteMany(FilterBuilder.In("_id", ids)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> Find(BsonDocument document)
        {
            return MongoCollection.Find(document).ToEnumerable();
        }
        public BsonDocument FindOne(ObjectId id)
        {
            return MongoCollection.Find(new BsonDocument("_id", id)).FirstOrDefault();
        }
        public IEnumerable<BsonDocument> FindAll()
        {
            return MongoCollection.Find(new BsonDocument()).ToEnumerable();
        }
        public long Count()
        {
            return MongoCollection.Count(new BsonDocument());
        }
        public bool Replace(BsonDocument document)
        {
            return MongoCollection.ReplaceOne(new BsonDocument("_id", document["_id"].AsObjectId), document, new UpdateOptions() { IsUpsert = true }).IsAcknowledged;
        }
        protected virtual FilterDefinition<BsonDocument> GetPageFilters(BsonDocument eqs, IEnumerable<string> fields, string filter)
        {
            FilterDefinition<BsonDocument> filterBuilder = null;
            
            if (!string.IsNullOrEmpty(filter))
            {
                List<FilterDefinition<BsonDocument>> list = new List<FilterDefinition<BsonDocument>>();
                foreach (string field in fields)
                {
                    if (field == "_id" || field == "FileId")
                    {
                        if (ObjectId.TryParse(filter, out ObjectId objectId))
                        {
                            list.Add(FilterBuilder.Eq(field, objectId));
                        }
                    }
                    else
                    {
                        list.Add(FilterBuilder.Regex(field, new Regex("^.*" + filter + ".*$", RegexOptions.IgnoreCase)));
                    }
                }
                filterBuilder = FilterBuilder.Or(list);
            }
            else
            {
                filterBuilder = new BsonDocument();
            }
            if (eqs != null) filterBuilder = FilterBuilder.And(eqs, filterBuilder);
            return filterBuilder;
        }

        public IEnumerable<BsonDocument> GetPageList(int pageIndex, int pageSize, BsonDocument eqs, string sortField, string filter, IEnumerable<string> fields, IEnumerable<string> excludeFields, out long count)
        {
            FilterDefinition<BsonDocument> filterBuilder = GetPageFilters(eqs, fields, filter);
            count = MongoCollection.Count(filterBuilder);
            var exclude = Builders<BsonDocument>.Projection.Exclude("PassWord");
            foreach (string ex in excludeFields)
            {
                exclude = exclude.Exclude(ex);
            }
            var find = MongoCollection.Find(filterBuilder)
               .Project(exclude);
            if (!string.IsNullOrEmpty(sortField)) find = find.SortByDescending(sort => sort[sortField]);
            return find
                .Skip((pageIndex - 1) * pageSize)
                .Limit(pageSize)
                .ToEnumerable();
        }
    }
}
