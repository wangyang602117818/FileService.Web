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
    public class RarConverter: IConverter
    {
        Files files = new Files();
        FilesConvert filesConvert = new FilesConvert();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        public void Convert(FileItem fileItem)
        {
            ObjectId fileId = fileItem.Message["FileId"].AsObjectId;
            BsonDocument file = files.FindOne(fileId);
            if (file != null)
            {
                BsonArray array = file["metadata"]["Files"].AsBsonArray;
                foreach (BsonDocument bson in array)
                {
                    ObjectId _id = bson["_id"].AsObjectId;
                    if (filesConvert.FindOne(_id) != null) mongoFileConvert.Delete(_id);
                }
            }
            string fileName = fileItem.Message["FileName"].AsString;
            string fullSourceFileName = MongoFileBase.AppDataDir + fileName;
            BsonArray subFiles = ConvertRar(fileId, fullSourceFileName);
            //更新 fs.files表
            files.ReplaceSubFiles(fileId, subFiles);
            if (File.Exists(fullSourceFileName)) File.Delete(fullSourceFileName);
        }
        public BsonArray ConvertRar(ObjectId sourceFileId, string fullSourceFileName)
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
                        if (OfficeFormatList.offices.Contains(fileExt))
                        {

                            string destPath = MongoFileBase.AppDataDir + Path.GetFileNameWithoutExtension(fullSourceFileName) + "\\";
                            if (!Directory.Exists(destPath)) Directory.CreateDirectory(destPath);
                            string sourcePath = destPath + Path.GetFileName(reader.Entry.Key);
                            //office文件存到磁盘
                            using (FileStream fileStream = new FileStream(sourcePath, FileMode.Create))
                            {
                                reader.OpenEntryStream().CopyTo(fileStream);
                            }
                            //转换之后的文件id
                            string destinationPath = destPath + Path.GetFileNameWithoutExtension(reader.Entry.Key) + ".pdf";
                            ObjectId newFileId = new OfficeConverter().ConvertOffice(sourcePath, destinationPath, sourceFileId);
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
                                {"SourceId",sourceFileId },
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
