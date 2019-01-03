using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System;
using System.Diagnostics;
using System.Drawing.Imaging;
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
        FilesWrap filesWrap = new FilesWrap();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        FilePreview filePreview = new FilePreview();
        FilePreviewMobile filePreviewMobile = new FilePreviewMobile();
        VideoCapture videoCapture = new VideoCapture();
        public virtual bool Convert(FileItem fileItem)
        {
            return false;
        }
        public bool SaveFileFromSharedFolder(string from, string type, ObjectId fileWrapId, string fullPath, string fileName, ImageFormat format)
        {
            FileStream fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            string md5 = fileStream.GetMD5();
            BsonDocument file = files.GetFileByMd5(md5);
            ObjectId id = ObjectId.Empty;
            if (file == null)
            {
                id = mongoFile.Upload(fileName, fileStream, null);
                //生成文件缩略图
                if (type == "image") GenerateFilePreview(from, id, fileName, fileStream, format);
                if (type == "video") ConvertVideoCpPreview(from, id, fileWrapId, fullPath, true);
            }
            else
            {
                id = file["_id"].AsObjectId;
                if (type == "video") ConvertVideoCpPreview(from, id, fileWrapId, fullPath, false);
            }
            fileStream.Close();
            fileStream.Dispose();
            return filesWrap.UpdateFileId(fileWrapId, id);
        }
        public bool SaveFileFromSharedFolder(string from, string type, ObjectId filesWrapId, string fileName, Stream fileStream, ImageFormat format)
        {
            string md5 = fileStream.GetMD5();
            BsonDocument file = files.GetFileByMd5(md5);
            ObjectId id = ObjectId.Empty;
            if (file == null)
            {
                id = mongoFile.Upload(fileName, fileStream, null);
                //生成文件缩略图
                if (type == "image") GenerateFilePreview(from, id, fileName, fileStream, format);
            }
            else
            {
                id = file["_id"].AsObjectId;
            }
            return filesWrap.UpdateFileId(filesWrapId, id);
        }
        public void ConvertVideoCpPreview(string from, ObjectId fileId, ObjectId fileWrapId, string fullPath, bool filePreview)
        {
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            BsonArray videoCp = fileWrap["VideoCpIds"].AsBsonArray;
            ObjectId videoCpId;
            if (videoCp.Count > 0)
            {
                videoCpId = videoCp[0].AsObjectId;
            }
            else
            {
                videoCpId = ObjectId.GenerateNewId();
                filesWrap.AddVideoCapture(fileWrapId, videoCpId);
            }
            string cpPath = MongoFileBase.AppDataDir + Path.GetFileNameWithoutExtension(fullPath) + ".jpg";
            string fileName = Path.GetFileName(cpPath);
            string cmd = "\"" + AppSettings.ExePath + "\" -ss 00:00:01 -i \"" + fullPath + "\" -vframes 1 \"" + cpPath + "\"";
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
            if (File.Exists(cpPath))
            {
                using (FileStream imageStream = new FileStream(cpPath, FileMode.Open, FileAccess.Read))
                {
                    BsonDocument document = new BsonDocument()
                    {
                        {"_id",videoCpId },
                        {"From",from },
                        {"SourceId",fileWrapId },
                        {"Length",imageStream.Length },
                        {"FileName",fileName },
                        {"File",imageStream.ToBytes() },
                        {"CreateTime",DateTime.Now }
                    };
                    videoCapture.Replace(document);
                    if (filePreview)
                    {
                        GenerateFilePreview(from, fileId, fileName, imageStream, ImageFormat.Jpeg);
                    }
                }
            }
            process.Close();
            process.Dispose();
            File.Delete(cpPath);
        }
        public void GenerateFilePreview(string from, ObjectId fileId, string fileName, Stream fileStream, ImageFormat format)
        {
            fileStream.Position = 0;
            int width = 0, height = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 80, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreview.Replace(fileId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
            fileStream.Position = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(fileName, 50, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreviewMobile.Replace(fileId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
        }
        public bool ConvertVideoMp4(string from, string type, ObjectId fileWrapId, string fullPath, ImageFormat format)
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
            ObjectId fileId = ObjectId.Empty;
            if (File.Exists(convertPath))
            {
                using (FileStream fileStream = new FileStream(convertPath, FileMode.Open, FileAccess.Read))
                {
                    string md5 = fileStream.GetMD5();
                    BsonDocument file = files.GetFileByMd5(md5);
                    if (file == null)
                    {
                        fileId = mongoFile.Upload(Path.GetFileName(convertPath), fileStream, null);
                        ConvertVideoCpPreview(from, fileId, fileWrapId, convertPath, true);
                    }
                    else
                    {
                        fileId = file["_id"].AsObjectId;
                        ConvertVideoCpPreview(from, fileId, fileWrapId, convertPath, false);
                    }
                }
            }
            process.Close();
            process.Dispose();
            File.Delete(convertPath);
            return filesWrap.UpdateFileId(fileWrapId, fileId);
        }
    }
}
