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
            var databases = database.ListCollectionNames().ToList();
            if (!databases.Contains("queue"))
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
            if (!databases.Contains("Config"))
            {
                database.CreateCollection("Config");
                List<BsonDocument> list = new List<BsonDocument>()
                {
                    new BsonDocument(){{"Extension",".jpg"},{"Type","image"},{"Action","allow"},{"Description","image"},
                      {"CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".png"},{"Type","image"},{"Action","allow"},{"Description","image" }, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension",".gif"},{"Type","image"},{"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".bmp"},{"Type","image"},{"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension",".mp4"},{"Type","video"},{"Action","allow"},{"Description","video"}, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".avi"},{"Type","video"},{"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".wmv"},{"Type","video"},{"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".m3u8" },{"Type","video"},{"Action","allow"},{"Description", "HTTP Live Streaming" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".doc" },{"Type","office"},{"Action","allow"},{"Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".docx" },{"Type", "office" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xls" },{"Type", "office" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xlsx" },{"Type", "office" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ppt" },{"Type", "office" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pptx" },{"Type", "office" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".txt" },{"Type", "text" }, { "Action","allow"}, { "Description", "text" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".js" },{"Type", "text" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".htm" },{"Type", "text" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".html" },{"Type", "text" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".css" },{"Type", "text" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".zip" },{"Type", "attachment" }, { "Action","allow"}, { "Description", "compress" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".rar" },{"Type", "attachment" }, { "Action","allow"}, { "Description", "compress" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pdf" },{"Type", "pdf" }, { "Action","allow"}, { "Description", "Portable Document Format" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odg" },{"Type", "office" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ods" },{"Type", "office" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odp" },{"Type", "office" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odf" },{"Type", "office" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odt" },{"Type", "office" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                };
                database.GetCollection<BsonDocument>("Config").InsertMany(list);
            }
            if (!databases.Contains("Application"))
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
            if (!databases.Contains("Department"))
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
            //设置分片键/////////////////////////////////////////////////////////////////////////////////////
            if (!databases.Contains("Ts"))
            {
                database.CreateCollection("Ts");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("Ts").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Download"))
            {
                database.CreateCollection("Download");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } }); //shared key
                database.GetCollection<BsonDocument>("Download").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Log"))
            {
                database.CreateCollection("Log");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } }); //shared key
                database.GetCollection<BsonDocument>("Log").Indexes.CreateOne(c);
            }
            if (!databases.Contains("VideoCapture"))
            {
                database.CreateCollection("VideoCapture");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("VideoCapture").Indexes.CreateOne(c);
            }
            if (!databases.Contains("FilePreview"))
            {
                database.CreateCollection("FilePreview");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("FilePreview").Indexes.CreateOne(c);
            }
            if (!databases.Contains("FilePreviewBig"))
            {
                database.CreateCollection("FilePreviewBig");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("FilePreviewBig").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Thumbnail"))
            {
                database.CreateCollection("Thumbnail");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("Thumbnail").Indexes.CreateOne(c);
            }
        }
    }
}
