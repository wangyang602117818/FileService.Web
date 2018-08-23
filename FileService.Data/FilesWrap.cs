using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class FilesWrap : MongoBase
    {
        public FilesWrap() : base("FilesWrap") { }
        public long CountByFileId(ObjectId fileId)
        {
            return MongoCollection.Count(FilterBuilder.Eq("FileId", fileId));
        }
        public bool UpdateFileId(ObjectId id, ObjectId fileId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("FileId", fileId)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime dateTime)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Gte("CreateTime", dateTime))
                 .Project(new BsonDocument("date", new BsonDocument("$dateToString", new BsonDocument() {
                    {"format", "%Y-%m-%d" },
                    {"date", "$CreateTime" }}
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
                    {"_id","$FileType" },
                    {"count",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return MongoCollection.Aggregate()
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$From" },
                    {"files",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public bool AddVideoCapture(ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.AddToSet("VideoCpIds", captureId)).IsAcknowledged;
        }
        public bool DeleteVideoCapture(ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Pull("VideoCpIds", captureId)).IsAcknowledged;
        }
        public bool DeleteThumbnail(ObjectId id, ObjectId thumbnailId)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Pull("Thumbnail", new BsonDocument("_id", thumbnailId))).IsAcknowledged;
        }
        public bool DeleteM3u8(ObjectId id, ObjectId thumbnailId)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Pull("Videos", new BsonDocument("_id", thumbnailId))).IsAcknowledged;
        }
        public bool UpdateFlagImage(ObjectId id, ObjectId thumbnailId, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Thumbnail._id", thumbnailId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Thumbnail.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateFlagVideo(ObjectId id, ObjectId m3u8Id, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Videos._id", m3u8Id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Videos.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateFlagAttachment(ObjectId id, ObjectId subFileId, string flag)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Files._id", subFileId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Files.$.Flag", flag)).IsAcknowledged;
        }
        public bool UpdateSubFileId(ObjectId id, ObjectId oldFileId, ObjectId newFileId)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Files._id", oldFileId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Files.$._id", newFileId)).IsAcknowledged;
        }
        public bool AddSubVideo(ObjectId id, BsonDocument bson)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.AddToSet("Videos", bson)).IsAcknowledged;
        }
        public bool AddSubThumbnail(ObjectId id, BsonDocument bson)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.AddToSet("Thumbnail", bson)).IsAcknowledged;
        }
        public bool ReplaceSubFiles(ObjectId id, BsonArray array)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Files", array)).IsAcknowledged;
        }
        public bool UpdateAccess(ObjectId id, BsonArray array)
        {
            var filter = FilterBuilder.Eq("_id", id);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Access", array)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByAppName(DateTime startDateTime)
        {
            return MongoCollection.Aggregate()
                .Match(FilterBuilder.Gte("CreateTime", startDateTime))
                .Group<BsonDocument>(new BsonDocument() {
                    {"_id","$From" },
                    {"count",new BsonDocument("$sum",1) },
                 })
                .ToEnumerable();
        }
        public override FilterDefinition<BsonDocument> GetAccessFilter(string userName)
        {
            return base.GetAccessFilterBase(userName);
        }
    }
}
