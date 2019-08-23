using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;

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
                if (type == "image") GenerateFilePreview(from, id, fileName, fullPath, fileStream, format);
                if (type == "video") ConvertVideoCpPreview(from, id, fileWrapId, fullPath, fileName, true);
            }
            else
            {
                id = file["_id"].AsObjectId;
                if (type == "video") ConvertVideoCpPreview(from, id, fileWrapId, fullPath, fileName, false);
            }
            fileStream.Close();
            fileStream.Dispose();
            return filesWrap.UpdateFileId(fileWrapId, id);
        }
        //public bool SaveFileFromSharedFolder(string from, string type, ObjectId filesWrapId, string fileName, Stream fileStream, ImageFormat format)
        //{
        //    string md5 = fileStream.GetMD5();
        //    BsonDocument file = files.GetFileByMd5(md5);
        //    ObjectId id = ObjectId.Empty;
        //    if (file == null)
        //    {
        //        id = mongoFile.Upload(fileName, fileStream, null);
        //        //生成文件缩略图
        //        if (type == "image") GenerateFilePreview(from, id, fileName, fileStream, format);
        //    }
        //    else
        //    {
        //        id = file["_id"].AsObjectId;
        //    }
        //    return filesWrap.UpdateFileId(filesWrapId, id);
        //}
        public void ConvertVideoCpPreview(string from, ObjectId fileId, ObjectId fileWrapId, string fullPath, string fileName, bool filePreview)
        {
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            BsonArray videoCp = fileWrap["VideoCpIds"].AsBsonArray;
            fileName = Path.GetFileNameWithoutExtension(fileName) + ".gif";
            ObjectId videoCpId;
            if (videoCp.Count > 0)
            {
                videoCpId = videoCp[0]["_id"].AsObjectId;
            }
            else
            {
                videoCpId = ObjectId.GenerateNewId();
                filesWrap.AddVideoCapture(fileWrapId, ObjectId.GenerateNewId(), videoCpId);
            }
            string cpPath = Path.GetDirectoryName(fullPath) + "\\" + fileWrapId.ToString() + ".gif";
            string cmd = "\"" + AppSettings.ExePath + "\" -ss 00:00:01 -t 5 -i \"" + fullPath + "\" -r 4 -y \"" + cpPath + "\"";
            Process process = new Process()
            {
                StartInfo = new ProcessStartInfo(cmd)
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = true
                }
            };
            process.Start();
            StreamReader SR = process.StandardError;
            int totalDuration = 0;
            int width = 0, height = 0;
            while (!SR.EndOfStream)
            {
                string line = SR.ReadLine();
                if (totalDuration == 0) totalDuration = GetTotalDuration(line);
                if (width == 0 && height == 0)
                {
                    var frame = GetFrame(line);
                    width = frame.Width;
                    height = frame.Height;
                }
            }
            process.WaitForExit();
            if (File.Exists(cpPath))
            {
                using (FileStream imageStream = new FileStream(cpPath, FileMode.Open, FileAccess.Read))
                {
                    string md5 = imageStream.GetMD5();
                    ObjectId cpId = ObjectId.Empty;
                    BsonDocument cpBson = videoCapture.GetIdByMd5(from, md5);
                    if (cpBson == null)
                    {
                        cpId = ObjectId.GenerateNewId();
                        Size size = imageStream.GetImageSize();
                        videoCapture.Insert(cpId,
                            from,
                            new List<ObjectId>() { fileWrapId },
                            imageStream.Length,
                            size.Width,
                            size.Height,
                            md5,
                            imageStream.ToBytes()
                         );
                    }
                    else
                    {
                        cpId = cpBson["_id"].AsObjectId;
                        videoCapture.AddSourceId(from, cpId, fileWrapId);
                    }
                    filesWrap.UpdateVideoMeta(fileWrapId, videoCpId, cpId, width, height, totalDuration);

                    if (filePreview)
                    {
                        GenerateFilePreview(from, fileId, fileName, cpPath, imageStream, ImageFormat.Jpeg);
                    }
                }
            }
            process.Close();
            process.Dispose();
            File.Delete(cpPath);
        }
        public void GenerateFilePreview(string from, ObjectId fileId, string fileName, string fullPath, Stream fileStream, ImageFormat format)
        {
            fileStream.Position = 0;
            int width = 0, height = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(80, fullPath, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreview.Replace(fileId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
            fileStream.Position = 0;
            using (Stream stream = ImageExtention.GenerateFilePreview(50, fullPath, fileStream, ImageModelEnum.scale, format, ref width, ref height))
            {
                filePreviewMobile.Replace(fileId, from, stream.Length, width, height, fileName, stream.ToBytes());
            }
        }
        public bool ConvertVideoMp4(string from, string type, ObjectId fileWrapId, string fullPath, string fileName, ImageFormat format)
        {
            string convertPath = Path.GetDirectoryName(fullPath) + "\\" + fileWrapId.ToString() + ".mp4";
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
                        fileId = mongoFile.Upload(fileName, fileStream, null);
                        ConvertVideoCpPreview(from, fileId, fileWrapId, convertPath, fileName, true);
                    }
                    else
                    {
                        fileId = file["_id"].AsObjectId;
                        ConvertVideoCpPreview(from, fileId, fileWrapId, convertPath, fileName, false);
                    }
                }
            }
            process.Close();
            process.Dispose();
            File.Delete(convertPath);
            return filesWrap.UpdateFileId(fileWrapId, fileId);
        }

        public int GetTotalDuration(string str)
        {
            Regex regex = new Regex(@"Duration:\s*(\d{2}):(\d{2}):(\d{2}).(\d{2})", RegexOptions.IgnoreCase);
            if (regex.IsMatch(str))
            {
                foreach (Match item in regex.Matches(str))
                {
                    int h = int.Parse(item.Groups[1].Value);
                    int m = int.Parse(item.Groups[2].Value);
                    int s = int.Parse(item.Groups[3].Value);
                    return h * 60 * 60 + m * 60 + s;
                }
            }
            return 0;
        }
        public int GetCurrentDuration(string str)
        {
            Regex regex = new Regex(@"time=(\d{2}):(\d{2}):(\d{2}).(\d{2})", RegexOptions.IgnoreCase);
            if (regex.IsMatch(str))
            {
                foreach (Match item in regex.Matches(str))
                {
                    int h = int.Parse(item.Groups[1].Value);
                    int m = int.Parse(item.Groups[2].Value);
                    int s = int.Parse(item.Groups[3].Value);
                    return h * 60 * 60 + m * 60 + s;
                }
            }
            return 0;
        }
        public VideoFrame GetFrame(string str)
        {
            Regex regex = new Regex(@"(\d{2,})x(\d{2,})", RegexOptions.IgnoreCase);
            if (regex.IsMatch(str))
            {
                foreach (Match item in regex.Matches(str))
                {
                    int width = int.Parse(item.Groups[1].Value);
                    int height = int.Parse(item.Groups[2].Value);
                    return new VideoFrame() { Width = width, Height = height };
                }
            }
            return new VideoFrame() { Width = 0, Height = 0 };
        }
    }
}
