using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class FilesBase : MongoBase
    {
        public FilesBase(string collectionName) : base(collectionName) { }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime dateTime)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Gte("uploadDate", dateTime) & FilterBuilder.Not(FilterBuilder.Eq("metadata.From", "Convert")))
                 .Project(new BsonDocument("date", new BsonDocument("$dateToString", new BsonDocument() {
                    {"format", "%Y-%m-%d" },
                    {"date", "$uploadDate" }}
                 )))
                 .Group<BsonDocument>(new BsonDocument() {
                    {"_id","$date" },
                    {"count",new BsonDocument("$sum",1) }
                 })
                 .Sort(new BsonDocument("_id", 1)).ToEnumerable();
        }
        public IEnumerable<BsonDocument> GetFilesByType()
        {
            return MongoCollection.Aggregate()
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$metadata.FileType" },
                    {"count",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return MongoCollection.Aggregate()
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$metadata.From" },
                    {"count",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public bool AddVideoCapture(ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.AddToSet("metadata.VideoCpIds", captureId)).IsAcknowledged;
        }
        public bool DeleteVideoCapture(ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Pull("metadata.VideoCpIds", captureId)).IsAcknowledged;
        }
        public bool UpdateFlagImage(ObjectId id, ObjectId thumbnailId, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("metadata.Thumbnail._id", thumbnailId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("metadata.Thumbnail.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateFlagVideo(ObjectId id, ObjectId thumbnailId, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("metadata.Videos._id", thumbnailId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("metadata.Videos.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateFlagAttachment(ObjectId id, ObjectId subFileId, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("metadata.Files._id", subFileId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("metadata.Files.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateSubFileId(ObjectId id, ObjectId oldFileId, ObjectId newFileId)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("metadata.Files._id", oldFileId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("metadata.Files.$._id", newFileId)).IsAcknowledged;
        }
        public bool ReplaceSubFiles(ObjectId id, BsonArray array)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("metadata.Files", array)).IsAcknowledged;
        }
        public BsonDocument GetFileByMD5(string md5)
        {
            var filter = FilterBuilder.Eq("md5", md5);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        //protected override FilterDefinition<BsonDocument> GetPageFilters(IEnumerable<string> fields, string filter)
        //{
        //    FilterDefinition<BsonDocument> filterBuilder = FilterBuilder.And(FilterBuilder.Not(FilterBuilder.Eq("metadata.From", "Convert")));
        //    if (!string.IsNullOrEmpty(filter))
        //    {
        //        List<FilterDefinition<BsonDocument>> list = new List<FilterDefinition<BsonDocument>>();
        //        foreach (string field in fields)
        //        {
        //            list.Add(FilterBuilder.Regex(field, new Regex("^.*" + filter + ".*$", RegexOptions.IgnoreCase)));
        //        }
        //        filterBuilder = FilterBuilder.And(
        //            FilterBuilder.Not(FilterBuilder.Eq("metadata.From", "Convert")),
        //            FilterBuilder.Or(list));
        //    }
        //    return filterBuilder;
        //}
    }
}
