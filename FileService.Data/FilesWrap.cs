using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FileService.Data
{
    public class FilesWrap : MongoBase
    {
        public FilesWrap() : base("FilesWrap") { }
        public override long Count()
        {
            var filter = FilterBuilder.Eq("Delete", false);
            return MongoCollection.CountDocuments(filter);
        }
        public long CountByFileId(ObjectId fileId)
        {
            var filter = FilterBuilder.Eq("FileId", fileId);
            return MongoCollection.CountDocuments(filter);
        }
        public bool UpdateFileId(ObjectId id, ObjectId fileId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("FileId", fileId)).IsAcknowledged;
        }
        public BsonDocument FindAndAddDownloads(ObjectId id)
        {
            return MongoCollection.FindOneAndUpdate(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Inc("Download", 1));
        }
        public bool AddDownloads(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Inc("Download", 1)).IsAcknowledged;
        }
        public bool Remove(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("Delete", true).Set("DeleteTime", DateTime.Now)).IsAcknowledged;
        }
        public bool Removes(IEnumerable<ObjectId> ids)
        {
            return MongoCollection.UpdateMany(FilterBuilder.In("_id", ids), Builders<BsonDocument>.Update.Set("Delete", true).Set("DeleteTime", DateTime.Now)).IsAcknowledged;
        }
        public bool Restore(ObjectId id)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Set("Delete", false).Set("DeleteTime", BsonNull.Value)).IsAcknowledged;
        }
        public bool RestoreFiles(IEnumerable<ObjectId> ids)
        {
            return MongoCollection.UpdateMany(FilterBuilder.In("_id", ids), Builders<BsonDocument>.Update.Set("Delete", false).Set("DeleteTime", BsonNull.Value)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime dateTime)
        {
            return MongoCollection.Aggregate()
                 .Match(FilterBuilder.Eq("Delete", false) & FilterBuilder.Gte("CreateTime", dateTime))
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
                .Match(FilterBuilder.Eq("Delete", false))
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$FileType" },
                    {"count",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return MongoCollection.Aggregate()
                .Match(FilterBuilder.Eq("Delete", false))
                .Group<BsonDocument>(new BsonDocument()
                {
                    {"_id","$From" },
                    {"files",new BsonDocument("$sum",1) }
                }).ToEnumerable();
        }
        public bool AddVideoCapture(ObjectId _id, ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", _id), Builders<BsonDocument>.Update.AddToSet("VideoCpIds",
                new BsonDocument() {
                    {"_id",id },
                    {"FileId",captureId },
            })).IsAcknowledged;
        }
        public bool AddHistory(ObjectId id, ObjectId fileId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.AddToSet("History", new BsonDocument() {
                { "FileId",fileId},
                { "CreateTime",DateTime.Now }
              })).IsAcknowledged;
        }
        public bool DeleteVideoCapture(ObjectId id, ObjectId captureId)
        {
            return MongoCollection.UpdateOne(FilterBuilder.Eq("_id", id), Builders<BsonDocument>.Update.Pull("VideoCpIds", new BsonDocument("FileId", captureId))).IsAcknowledged;
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
        public bool UpdateThumbFileId(ObjectId id, ObjectId subId, ObjectId thumbFileId)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Thumbnail._id", subId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("Thumbnail.$.FileId", thumbFileId)).IsAcknowledged;
        }
        public bool UpdateVideoMeta(ObjectId id, ObjectId subId, ObjectId cpFileId, int width, int height, int duration)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("VideoCpIds._id", subId);
            return MongoCollection.UpdateOne(filter, Builders<BsonDocument>.Update.Set("VideoCpIds.$.FileId", cpFileId).Set("Width", width).Set("Height", height).Set("Duration", duration)).IsAcknowledged;
        }
        public BsonDocument GetThumbFileId(ObjectId id, ObjectId subId)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("Thumbnail._id", subId);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        public BsonDocument GetCpFileIdFrom(ObjectId id, ObjectId subId)
        {
            var filter = FilterBuilder.Eq("_id", id) & FilterBuilder.Eq("VideoCpIds.FileId", subId);
            return MongoCollection.Find(filter).FirstOrDefault();
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
        public bool UpdateAccess(IEnumerable<ObjectId> ids, BsonArray array)
        {
            var filter = FilterBuilder.In("_id", ids);
            return MongoCollection.UpdateMany(filter, Builders<BsonDocument>.Update.Set("Access", array)).IsAcknowledged;
        }
        public IEnumerable<BsonDocument> GetCountByAppName(DateTime startDateTime)
        {
            return MongoCollection.Aggregate()
                .Match(FilterBuilder.Eq("Delete", false) & FilterBuilder.Gte("CreateTime", startDateTime))
                .Project(new BsonDocument() {
                    {"date",new BsonDocument("$dateToString", new BsonDocument() {{"format", "%Y-%m-%d" },{"date", "$CreateTime" }})},
                    {"from","$From" }
                })
                .Group<BsonDocument>(new BsonDocument() {
                    {"_id",new BsonDocument(){
                        {"date","$date" },
                        {"from","$from" }
                    }},
                    {"count",new BsonDocument("$sum",1) }
                })
                .Sort(new BsonDocument("_id.date", 1))
                .ToEnumerable();
        }
        public override FilterDefinition<BsonDocument> GetAccessFilter(string userName, bool checkAccess)
        {
            return base.GetAccessFilterBase(userName, checkAccess);
        }

    }
}
