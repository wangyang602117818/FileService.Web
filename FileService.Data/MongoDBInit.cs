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
    public static class MongoDBInit
    {
        public static void Init(IMongoDatabase database)
        {
            try
            {
                database.CreateCollection("queue", new CreateCollectionOptions() { Capped = true, MaxSize = 1048576 * 100 });
                database.GetCollection<BsonDocument>("queue").InsertOne(new BsonDocument()
                {
                    {"handlerId","system" },
                    {"type","system" },
                    {"collectionName","system" },
                    {"collectionId",ObjectId.GenerateNewId() },
                    {"op","init" },
                    {"data",new BsonDocument() },
                    {"processed",true },
                    {"createTime",DateTime.Now }
                });
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Config");
                List<BsonDocument> list = new List<BsonDocument>()
                {
                    new BsonDocument(){{"Extension",".jpg" },{"Type","image" }, { "Action","allow"},{ "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".png" },{"Type", "image" }, { "Action","allow"},{ "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".gif" },{"Type", "image" }, { "Action","allow"},{ "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".bmp" },{"Type", "image" }, { "Action","allow"},{ "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".mp4" },{"Type","video" }, { "Action","allow"},{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".avi" },{"Type", "video" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".wmv" },{"Type", "video" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pdf" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".doc" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".docx" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xls" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xlsx" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ppt" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pptx" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".txt" },{"Type", "attachment" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".zip" },{"Type", "attachment" }, { "Action","allow"}, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".rar" },{"Type", "attachment" }, { "Action","allow"}, { "CreateTime", DateTime.Now }}
                };
                database.GetCollection<BsonDocument>("Config").InsertMany(list);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Application");
                database.GetCollection<BsonDocument>("Application").InsertOne(new BsonDocument()
                {
                    {"ApplicationName","FileServiceApi" },
                    {"Code","3c9deb1f8f6e" },
                    {"Action","allow" },
                    {"CreateTime", DateTime.Now }
                });
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
        }
    }
}
