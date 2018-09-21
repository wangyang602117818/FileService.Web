using FileService.Util;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;

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
                    new BsonDocument(){{"Extension", ".m3u8" },{"Type", "video" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".doc" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".docx" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xls" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xlsx" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ppt" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pptx" },{"Type", "office" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".txt" },{"Type", "text" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".js" },{"Type", "text" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".htm" },{"Type", "text" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".html" },{"Type", "text" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".css" },{"Type", "text" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".zip" },{"Type", "attachment" }, { "Action","allow"}, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".rar" },{"Type", "attachment" }, { "Action","allow"}, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pdf" },{"Type", "pdf" }, { "Action","allow"} ,{ "CreateTime", DateTime.Now }}
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
                    {"AuthCode","3c9deb1f8f6e" },
                    {"Action","allow" },
                    {"CreateTime", DateTime.Now }
                });
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Department");
                database.GetCollection<BsonDocument>("Department").InsertOne(new BsonDocument()
                {
                    {"DepartmentName","Company" },
                    {"DepartmentCode",new Random().RandomCodeHex(12) },
                    {"Department",new BsonArray() },
                    {"CreateTime", DateTime.Now }
                });
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            //设置分片键/////////////////////////////////////////////////////////////////////////////////////
            try
            {
                database.CreateCollection("Ts");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "SourceId", 1 }, { "N", 1 } });  //shared key
                database.GetCollection<BsonDocument>("Ts").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Download");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } }); //shared key
                database.GetCollection<BsonDocument>("Download").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Log");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } }); //shared key
                database.GetCollection<BsonDocument>("Log").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("VideoCapture");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } });  //shared key
                database.GetCollection<BsonDocument>("VideoCapture").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("FilePreview");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } });  //shared key
                database.GetCollection<BsonDocument>("FilePreview").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("FilePreviewBig");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } });  //shared key
                database.GetCollection<BsonDocument>("FilePreviewBig").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
            try
            {
                database.CreateCollection("Thumbnail");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", -1 } });  //shared key
                database.GetCollection<BsonDocument>("Thumbnail").Indexes.CreateOne(c);
            }
            catch (Exception ex)
            {
                Log4Net.InfoLog(ex.Message);
            }
        }
    }
}
