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
            if (!databases.Contains("Extension"))
            {
                database.CreateCollection("Extension");
                List<BsonDocument> list = new List<BsonDocument>()
                {
                    new BsonDocument(){{"Extension",".jpg"},{"Type","image"}, { "Content-Type","image/jpeg"}, {"Action","allow"},{"Description","image"},{"CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".png"},{"Type","image"}, { "Content-Type", "image/png" }, {"Action","allow"},{"Description","image" }, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension",".gif"},{"Type","image"}, { "Content-Type", "image/gif" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".bmp"},{"Type","image"}, { "Content-Type", "application/x-bmp" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".jpeg"},{"Type","image"}, { "Content-Type", "image/jpeg" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".pic"},{"Type","image"}, { "Content-Type", "application/x-pic" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".ico"},{"Type","image"}, { "Content-Type", "image/x-icon" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".tif"},{"Type","image"}, { "Content-Type", "image/tiff" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },
                    new BsonDocument(){{"Extension", ".svg"},{"Type","image"}, { "Content-Type", "image/svg+xml" }, {"Action","allow"},{"Description","image"}, { "CreateTime", DateTime.Now } },

                    new BsonDocument(){{"Extension", ".mp3"},{"Type","audio"}, { "Content-Type", "audio/mpeg" }, {"Action","allow"},{"Description", "audio" }, { "CreateTime", DateTime.Now } },

                    new BsonDocument(){{"Extension",".mp4"},{"Type","video"}, { "Content-Type", "video/mp4" }, {"Action","allow"},{"Description","video"}, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".avi"},{"Type","video"}, { "Content-Type", "video/avi" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".wmv"},{"Type","video"}, { "Content-Type", "video/x-ms-wmv" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".mov"},{"Type","video"}, { "Content-Type", "video/quicktime" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".mkv"},{"Type","video"}, { "Content-Type", "video/mkv" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".flv" },{"Type","video"}, { "Content-Type", "video/x-flv" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".rm"},{"Type","video"}, { "Content-Type", "application/vnd.rn-realmedia" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".rmvb"},{"Type","video"}, { "Content-Type", "application/vnd.rn-realmedia-vbr" }, {"Action","allow"},{"Description", "video" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension",".m3u8" },{"Type","video"}, { "Content-Type", "application/x-mpegURL" }, {"Action","allow"},{"Description", "HTTP Live Streaming" }, { "CreateTime", DateTime.Now }},

                    new BsonDocument(){{"Extension",".doc" },{"Type","office"}, { "Content-Type", "application/msword" }, {"Action","allow"},{"Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".docx" },{"Type", "office" }, { "Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xls" },{"Type", "office" }, { "Content-Type", "application/vnd.ms-excel" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".xlsx" },{"Type", "office" }, { "Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ppt" },{"Type", "office" }, { "Content-Type", "application/vnd.ms-powerpoint" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".pptx" },{"Type", "office" }, { "Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation" }, { "Action","allow"}, { "Description", "microsoft office" }, { "CreateTime", DateTime.Now }},

                    new BsonDocument(){{"Extension", ".txt" },{"Type", "text" },{ "Content-Type", "text/plain" }, { "Action","allow"}, { "Description", "text" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".js" },{"Type", "text" }, { "Content-Type", "application/javascript" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".htm" },{"Type", "text" }, { "Content-Type", "text/html" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".html" },{"Type", "text" }, { "Content-Type", "text/html" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".css" },{"Type", "text" }, { "Content-Type", "text/css" }, { "Action","allow"}, { "Description", "code" }, { "CreateTime", DateTime.Now }},

                    new BsonDocument(){{"Extension", ".zip" }, {"Type", "attachment" },{ "Content-Type", "application/x-zip-compressed" }, { "Action","allow"}, { "Description", "compress" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".rar" },{"Type", "attachment" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "compress" }, { "CreateTime", DateTime.Now }},

                    new BsonDocument(){{"Extension", ".pdf" },{"Type", "pdf" }, { "Content-Type", "application/pdf" }, { "Action","allow"}, { "Description", "Portable Document Format" }, { "CreateTime", DateTime.Now }},

                    new BsonDocument(){{"Extension", ".odg" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".ods" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odp" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odf" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".odt" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "libreoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".wps" },{"Type", "office" }, { "Content-Type", "application/vnd.ms-works" }, { "Action","allow"}, { "Description", "wpsoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".et" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "wpsoffice" }, { "CreateTime", DateTime.Now }},
                    new BsonDocument(){{"Extension", ".dps" },{"Type", "office" }, { "Content-Type", "application/octet-stream" }, { "Action","allow"}, { "Description", "wpsoffice" }, { "CreateTime", DateTime.Now }},
                     new BsonDocument(){{"Extension", ".exe" },{"Type", "attachment" }, { "Content-Type", "application/octet-stream" }, { "Action","block"}, { "Description", "executable file" }, { "CreateTime", DateTime.Now }}
                };
                database.GetCollection<BsonDocument>("Extension").InsertMany(list);
            }
            if (!databases.Contains("Application"))
            {
                database.CreateCollection("Application");
                database.GetCollection<BsonDocument>("Application").InsertOne(new BsonDocument()
                {
                    {"ApplicationName","FileServiceWeb" },
                    {"AuthCode","3c9deb1f8f6e" },
                    {"Action","allow" },
                    {"Thumbnails",new BsonArray() },
                    {"ThumbnailsDisplay",new BsonArray() },
                    {"Videos",new BsonArray() },
                    {"VideosDisplay",new BsonArray() },
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
            if (!databases.Contains("FilePreviewMobile"))
            {
                database.CreateCollection("FilePreviewMobile");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("FilePreviewMobile").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Thumbnail"))
            {
                database.CreateCollection("Thumbnail");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "From", 1 }, { "CreateTime", 1 } });  //shared key
                database.GetCollection<BsonDocument>("Thumbnail").Indexes.CreateOne(c);
            }
            if (!databases.Contains("M3u8"))
            {
                database.CreateCollection("M3u8");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "SourceId", 1 } });  //index
                database.GetCollection<BsonDocument>("M3u8").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Shared"))
            {
                database.CreateCollection("Shared");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "FileId", 1 } });  //index
                database.GetCollection<BsonDocument>("Shared").Indexes.CreateOne(c);
            }
            if (!databases.Contains("TsTime"))
            {
                database.CreateCollection("TsTime");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "SourceId", 1 } });  //index
                database.GetCollection<BsonDocument>("TsTime").Indexes.CreateOne(c);
            }
            if (!databases.Contains("Task"))
            {
                database.CreateCollection("Task");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "FileId", 1 } });  //index
                database.GetCollection<BsonDocument>("Task").Indexes.CreateOne(c);
                var c1 = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "Output._id", 1 } });  //index
                database.GetCollection<BsonDocument>("Task").Indexes.CreateOne(c1);
            }
            if (!databases.Contains("fs.files"))
            {
                database.CreateCollection("fs.files");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "md5", 1 } });  //index
                database.GetCollection<BsonDocument>("fs.files").Indexes.CreateOne(c);
            }
            if (!databases.Contains("convert.files"))
            {
                database.CreateCollection("convert.files");
                var c = new CreateIndexModel<BsonDocument>(new BsonDocument() { { "md5", 1 } });  //index
                database.GetCollection<BsonDocument>("convert.files").Indexes.CreateOne(c);
            }
        }
    }
}
