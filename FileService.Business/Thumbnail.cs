using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace FileService.Business
{
    public partial class Thumbnail : ModelBase<Data.Thumbnail>
    {
        public Thumbnail() : base(new Data.Thumbnail()) { }
        public bool Replace(ObjectId id, string from, ObjectId sourceId, long length, int width, int height, string fileName, string flag, byte[] file, DateTime expiredTime)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"SourceId",sourceId },
                {"Length",length },
                {"Width",width },
                {"Height",height },
                {"FileName",fileName },
                {"File",file },
                {"Flag",flag },
                {"CreateTime",DateTime.Now },
                {"ExpiredTime",expiredTime },
            };
            return mongoData.Replace(document);
        }
        public void Insert(ObjectId id, string from, IEnumerable<ObjectId> sourceIds, long length, int width, int height, string md5, byte[] file, DateTime expiredTime)
        {
            BsonDocument document = new BsonDocument()
            {
                {"_id",id },
                {"From",from },
                {"Md5",md5 },
                {"Length",length},
                {"Width",width },
                {"Height",height },
                {"SourceIds",new BsonArray(sourceIds)},
                {"File",file },
                {"CreateTime",DateTime.Now },
                {"ExpiredTime",expiredTime },
            };
            mongoData.Insert(document);
        }
        public bool AddSourceId(string from, ObjectId id, ObjectId sourceId)
        {
            return mongoData.AddSourceId(from, id, sourceId);
        }
        public BsonDocument GetIdByMd5(string from, string md5)
        {
            return mongoData.GetIdByMd5(from, md5);
        }
        public bool DeleteByIds(string from, ObjectId sourceId, IEnumerable<ObjectId> ids)
        {
            if (mongoData.DeleteSourceId(from, sourceId, ids))
            {
                return mongoData.DeleteByIds(from, sourceId, ids);
            }
            else
            {
                return false;
            }
        }
        public IEnumerable<BsonDocument> FindByIds(string from, IEnumerable<ObjectId> ids)
        {
            return mongoData.FindByIds(from, ids);
        }
        public IEnumerable<BsonDocument> FindThumbnailMetadata(string from, IEnumerable<ObjectId> ids)
        {
            return mongoData.FindThumbnailMetadata(from, ids);
        }
    }
}
