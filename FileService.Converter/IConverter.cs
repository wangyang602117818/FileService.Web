using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System.Diagnostics;
using System.IO;

namespace FileService.Converter
{
    interface IConverter
    {
        bool Convert(FileItem fileItem);
    }
    public class Converter : IConverter
    {
        Files files = new Files();
        FilesConvert filesConvert = new FilesConvert();
        FilesWrap filesWrap = new FilesWrap();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        public virtual bool Convert(FileItem fileItem)
        {
            return false;
        }
        public bool SaveFileFromSharedFolder(ObjectId filesWrapId, string fullPath, string fileType)
        {
            FileStream fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            string md5 = fileStream.GetMD5();
            BsonDocument file = files.GetFileByMd5(md5);
            ObjectId id = ObjectId.Empty;
            if (file == null)
            {
                id = mongoFile.Upload(Path.GetFileName(fullPath), fileStream, null);
            }
            else
            {
                id = file["_id"].AsObjectId;
            }
            fileStream.Close();
            fileStream.Dispose();
            return filesWrap.UpdateFileId(filesWrapId, id);
        }
        public bool SaveFileFromSharedFolder(ObjectId filesWrapId, string fileName, Stream fileStream)
        {
            string md5 = fileStream.GetMD5();
            BsonDocument file = files.GetFileByMd5(md5);
            ObjectId id = ObjectId.Empty;
            if (file == null)
            {
                id = mongoFile.Upload(fileName, fileStream, null);
            }
            else
            {
                id = file["_id"].AsObjectId;
            }
            return filesWrap.UpdateFileId(filesWrapId, id);
        }
        public bool ConvertMp4(ObjectId fileWrapId, string fullPath, string fileType)
        {
            ObjectId fileConvertId = ConvertVideoMp4(fileWrapId, fullPath);
            return filesWrap.AddSubVideo(fileWrapId, new BsonDocument()
            {
                {"_id",fileConvertId },
                {"Format",VideoOutPutFormat.Mp4 },
                {"Flag","mp4" }
            });
        }
        private ObjectId ConvertVideoMp4(ObjectId fileWrapId, string fullPath)
        {
            string convertPath = MongoFileBase.AppDataDir + Path.GetFileNameWithoutExtension(fullPath) + ".mp4";
            string cmd = "\"" + AppSettings.ExePath + "\"" + " -i " + "\"" + fullPath + "\" \"" + convertPath + "\"";
            Process process = new Process()
            {
                StartInfo = new ProcessStartInfo(cmd)
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = false
                }
            };
            process.Start();
            process.WaitForExit();
            ObjectId fileConvertId = ObjectId.Empty;
            if (File.Exists(convertPath))
            {
                using (FileStream fileStream = new FileStream(convertPath, FileMode.Open, FileAccess.Read))
                {
                    string md5 = fileStream.GetMD5();
                    BsonDocument file = filesConvert.GetFileByMd5(md5);
                    if (file == null)
                    {
                        fileConvertId = mongoFileConvert.Upload(Path.GetFileName(convertPath), fileStream, new BsonDocument()
                        {
                            {"From", "FilesWrap"},
                            {"Id",fileWrapId },
                            {"FileType","video"},
                            {"ContentType","video/mpeg4"}
                        });
                    }
                    else
                    {
                        fileConvertId = file["_id"].AsObjectId;
                    }
                }
            }
            process.Close();
            process.Dispose();
            File.Delete(convertPath);
            return fileConvertId;
        }
    }
}
