using FileService.Business;
using FileService.Util;
using MongoDB.Bson;
using SharpCompress.Archives.Rar;
using SharpCompress.Readers;
using System;
using System.IO;

namespace FileService.Converter
{
    public class RarConverter : Converter
    {
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        FilesConvert filesConvert = new FilesConvert();
        Extension extension = new Extension();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            DateTime expiredTime = fileWrap.Contains("ExpiredTime") ? fileWrap["ExpiredTime"].ToUniversalTime() : DateTime.MaxValue.ToUniversalTime();
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = taskItem.Message["Type"].AsString;

            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            if (processCount == 0)
            {
                if (File.Exists(fullPath))
                {
                    SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, fileName, null);
                }
            }
            else
            {
                if (!File.Exists(fullPath))
                {
                    string newPath = MongoFileBase.AppDataDir + fileWrapId.ToString() + Path.GetExtension(fileName).ToLower();
                    if (!File.Exists(newPath))
                    {
                        BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                        mongoFile.SaveTo(filesWrap["FileId"].AsObjectId, newPath);
                    }
                    fullPath = newPath;
                }
            }
            if (fileWrap != null)
            {
                BsonArray array = fileWrap["Files"].AsBsonArray;
                foreach (BsonDocument bson in array)
                {
                    ObjectId _id = bson["_id"].AsObjectId;
                    if (filesConvert.FindOne(_id) != null) mongoFileConvert.Delete(_id);
                }
            }
            BsonArray subFiles = ConvertRar(fileWrapId, fullPath, expiredTime);
            //更新 fs.files表
            if (filesWrap.ReplaceSubFiles(fileWrapId, subFiles))
            {
                if (File.Exists(fullPath)) File.Delete(fullPath);
                return true;
            }
            return false;
        }
        public BsonArray ConvertRar(ObjectId fileWrapId, string fullSourceFileName, DateTime expiredTime)
        {
            BsonArray result = new BsonArray();
            using (RarArchive rarArchive = RarArchive.Open(fullSourceFileName))
            {
                using (IReader reader = rarArchive.ExtractAllEntries())
                {
                    //获取压缩文件列表
                    while (reader.MoveToNextEntry())
                    {
                        if (reader.Entry.IsDirectory) continue;
                        //压缩文件内部的扩展名
                        string fileExt = Path.GetExtension(reader.Entry.Key).ToLower();
                        if (extension.GetTypeByExtension(fileExt) == "office")
                        {
                            string destPath = MongoFileBase.AppDataDir + fileWrapId.ToString() + "\\";
                            if (!Directory.Exists(destPath)) Directory.CreateDirectory(destPath);
                            string sourcePath = destPath + Path.GetFileName(reader.Entry.Key);
                            //office文件存到磁盘
                            using (FileStream fileStream = new FileStream(sourcePath, FileMode.Create))
                            {
                                reader.OpenEntryStream().CopyTo(fileStream);
                            }
                            //转换之后的文件id
                            string convertName = Path.GetFileNameWithoutExtension(reader.Entry.Key) + ".pdf";
                            string destinationPath = destPath + convertName;
                            ObjectId newFileId = new OfficeConverter().ConvertOffice(sourcePath, destinationPath, convertName, fileWrapId, expiredTime);
                            if (File.Exists(sourcePath)) File.Delete(sourcePath);
                            if (Directory.Exists(destPath)) Directory.Delete(destPath, true);
                            //id列表
                            result.Add(new BsonDocument() {
                                {"_id",newFileId},
                                {"FileName",reader.Entry.Key },
                                {"Length",reader.Entry.Size},
                                {"Flag","preview" }
                            });
                        }
                        else
                        {
                            ObjectId newFileId = mongoFileConvert.UploadFile(Path.GetFileName(reader.Entry.Key), reader.OpenEntryStream(), "FilesWrap", fileWrapId, "attachment", "application/octet-stream", expiredTime);
                            //id列表
                            result.Add(new BsonDocument() {
                                { "_id",newFileId},
                                {"FileName",reader.Entry.Key },
                                {"Length",reader.Entry.Size},
                                {"Flag","preview" }
                            });
                        }
                    }
                }
            }
            return result;
        }
    }
}
