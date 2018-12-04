﻿using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public class FilesWrap : ModelBase<Data.FilesWrap>
    {
        public FilesWrap() : base(new Data.FilesWrap()) { }
        public long CountByFileId(ObjectId fileId)
        {
            return mongoData.CountByFileId(fileId);
        }
        public void InsertImage(ObjectId id, ObjectId fileId, string fileName, long length, string from, int downloads, string contentType, BsonArray thumbnail, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"Download",downloads },
                    {"FileType","image" },
                    {"ContentType",contentType },
                    {"Thumbnail",thumbnail },
                    {"Access",access },
                    {"Owner",owner },
                    {"Delete",false },
                    {"DeleteTime",BsonNull.Value },
                    {"CreateTime",DateTime.Now }
                };
            mongoData.Insert(filesWrap);
        }
        public void InsertVideo(ObjectId id, ObjectId fileId, string fileName, long length, string from, int downloads, string contentType, BsonArray videos, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"Download",downloads },
                    {"FileType","video" },
                    {"ContentType",contentType },
                    {"Videos",videos },
                    {"VideoCpIds",new BsonArray(){ ObjectId.GenerateNewId()} },
                    {"Access",access },
                    {"Owner",owner },
                    {"Delete",false },
                    {"DeleteTime",BsonNull.Value },
                    {"CreateTime",DateTime.Now }
                };
            mongoData.Insert(filesWrap);
        }
        public void InsertAttachment(ObjectId id, ObjectId fileId, string fileName, string fileType, long length, string from, int downloads, string contentType, BsonArray files, BsonArray access, string owner)
        {
            BsonDocument filesWrap = new BsonDocument()
                {
                    {"_id",id },
                    {"FileId",fileId },
                    {"FileName",fileName },
                    {"Length",length },
                    {"From",from },
                    {"Download",downloads },
                    {"FileType","attachment" },
                    {"ContentType",contentType },
                    {"Files",files },
                };
            if (fileType == "video") filesWrap.Add("VideoCpIds", new BsonArray() { ObjectId.GenerateNewId() });
            filesWrap.AddRange(new Dictionary<string, object>{
                { "Access",access },
                { "Owner",owner },
                { "Delete",false },
                { "DeleteTime",BsonNull.Value },
                { "CreateTime",DateTime.Now }
            });
            mongoData.Insert(filesWrap);
        }
        public bool UpdateFileId(ObjectId id, ObjectId fileId)
        {
            return mongoData.UpdateFileId(id, fileId);
        }
        public BsonDocument FindAndAddDownloads(ObjectId id)
        {
            return mongoData.FindAndAddDownloads(id);
        }
        public bool AddDownloads(ObjectId id)
        {
            return mongoData.AddDownloads(id);
        }
        public bool Remove(ObjectId id)
        {
            return mongoData.Remove(id);
        }
        public bool Restore(ObjectId id)
        {
            return mongoData.Restore(id);
        }
        public bool RestoreFiles(IEnumerable<ObjectId> ids)
        {
            return mongoData.RestoreFiles(ids);
        }
        public IEnumerable<BsonDocument> GetCountByRecentMonth(DateTime startDateTime)
        {
            return mongoData.GetCountByRecentMonth(startDateTime);
        }
        public IEnumerable<BsonDocument> GetFilesByType()
        {
            return mongoData.GetFilesByType();
        }
        public IEnumerable<BsonDocument> GetFilesByAppName()
        {
            return mongoData.GetFilesByAppName();
        }
        public bool AddVideoCapture(ObjectId id, ObjectId captureId)
        {
            return mongoData.AddVideoCapture(id, captureId);
        }
        public bool AddHistory(ObjectId id, ObjectId fileId)
        {
            return mongoData.AddHistory(id, fileId);
        }
        public bool DeleteVideoCapture(ObjectId id, ObjectId captureId)
        {
            return mongoData.DeleteVideoCapture(id, captureId);
        }
        public bool DeleteVideoCapture(ObjectId id)
        {
            return mongoData.DeleteVideoCapture(id);
        }
        public bool DeleteThumbnail(ObjectId id, ObjectId thumbnailId)
        {
            return mongoData.DeleteThumbnail(id, thumbnailId);
        }
        public bool DeleteM3u8(ObjectId id, ObjectId m3u8Id)
        {
            return mongoData.DeleteM3u8(id, m3u8Id);
        }
        public bool UpdateFlagImage(ObjectId id, ObjectId thumbnailId, string flag)
        {
            return mongoData.UpdateFlagImage(id, thumbnailId, flag);
        }
        public bool UpdateFlagVideo(ObjectId id, ObjectId m3u8Id, string flag)
        {
            return mongoData.UpdateFlagVideo(id, m3u8Id, flag);
        }
        public bool UpdateFlagAttachment(ObjectId id, ObjectId fileId, string flag)
        {
            return mongoData.UpdateFlagAttachment(id, fileId, flag);
        }
        public bool UpdateSubFileId(ObjectId id, ObjectId oldFileId, ObjectId newFileId)
        {
            return mongoData.UpdateSubFileId(id, oldFileId, newFileId);
        }
        public bool AddSubVideo(ObjectId id, BsonDocument bson)
        {
            return mongoData.AddSubVideo(id, bson);
        }
        public bool AddSubThumbnail(ObjectId id, BsonDocument bson)
        {
            return mongoData.AddSubThumbnail(id, bson);
        }
        public bool ReplaceSubFiles(ObjectId id, BsonArray array)
        {
            return mongoData.ReplaceSubFiles(id, array);
        }
        public bool UpdateAccess(IEnumerable<ObjectId> ids, BsonArray array)
        {
            return mongoData.UpdateAccess(ids, array);
        }
        public IEnumerable<BsonDocument> GetCountByAppName(DateTime startDateTime)
        {
            return mongoData.GetCountByAppName(startDateTime);
        }
        
    }
}
