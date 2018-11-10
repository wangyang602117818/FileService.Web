using FileService.Business;
using FileService.Model;
using MongoDB.Bson;
using SharpCompress.Archives.Rar;
using SharpCompress.Readers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class RarConverter: Converter
    {
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        FilesConvert filesConvert = new FilesConvert();
        Extension config = new Extension();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            string fileName = taskItem.Message["FileName"].AsString;

            int processCount =System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;
            if (processCount == 0)
            {
                if (File.Exists(fullPath))
                {
                    SaveFileFromSharedFolder(fileWrapId, fullPath);
                }
            }
            else
            {
                if (!File.Exists(fullPath))
                {
                    string newPath = MongoFileBase.AppDataDir + fileName;
                    if (!File.Exists(newPath))
                    {
                        BsonDocument filesWrap = new FilesWrap().FindOne(fileWrapId);
                        mongoFile.SaveTo(filesWrap["FileId"].AsObjectId);
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
            BsonArray subFiles = ConvertRar(fileWrapId, fullPath);
            //更新 fs.files表
            if(filesWrap.ReplaceSubFiles(fileWrapId, subFiles))
            {
                if (File.Exists(fullPath)) File.Delete(fullPath);
                return true;
            }
            return false;
        }
        public BsonArray ConvertRar(ObjectId fileWrapId, string fullSourceFileName)
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
                        if (config.GetTypeByExtension(fileExt) == "office")
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
                            string destinationPath = destPath + Path.GetFileNameWithoutExtension(reader.Entry.Key) + ".pdf";
                            ObjectId newFileId = new OfficeConverter().ConvertOffice(sourcePath, destinationPath, fileWrapId);
                            if (File.Exists(sourcePath)) File.Delete(sourcePath);
                            if (Directory.Exists(destPath)) Directory.Delete(destPath, true);
                            //id列表
                            result.Add(new BsonDocument() {
                                {"_id",newFileId},
                                {"FileName",reader.Entry.Key },
                                {"Length",reader.Entry.Size},
                                {"Tag","preview" }
                            });
                        }
                        else
                        {
                            ObjectId newFileId = mongoFileConvert.Upload(Path.GetFileName(reader.Entry.Key), reader.OpenEntryStream(), new BsonDocument()
                            {
                                {"From","fs.files" },
                                {"SourceId",fileWrapId },
                                {"FileType","attachment" },
                                {"ContentType","application/octet-stream" },
                            });
                            //id列表
                            result.Add(new BsonDocument() {
                                { "_id",newFileId},
                                {"FileName",reader.Entry.Key },
                                {"Length",reader.Entry.Size},
                                {"Tag","preview" }
                            });
                        }
                    }
                }
            }
            return result;
        }
    }
}
