using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;

namespace FileService.Converter
{
    public class VideoConverter : Converter
    {
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Ts ts = new Ts();
        M3u8 m3u8 = new M3u8();
        Task task = new Task();
        FilePreview filePreview = new FilePreview();
        FilePreviewMobile filePreviewBig = new FilePreviewMobile();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = taskItem.Message["Type"].AsString;

            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            DateTime expiredTime = fileWrap.Contains("ExpiredTime") ? fileWrap["ExpiredTime"].ToUniversalTime() : DateTime.MaxValue.ToUniversalTime();

            VideoOutPut output = BsonSerializer.Deserialize<VideoOutPut>(outputDocument);

            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            //第一次转换，文件肯定在共享文件夹
            //确保文件只存一份
            lock (o)
            {
                if (File.Exists(fullPath))
                {
                    if (fileName.GetFileExt().ToLower() != ".mp4")
                    {
                        ConvertVideoMp4(from, fileType, fileWrapId, fullPath, fileName, ImageFormat.Jpeg);
                    }
                    else
                    {
                        SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, fileName, ImageFormat.Jpeg);
                    }
                }
                //任务肯定是后加的
                else
                {
                    mongoFile.SaveTo(fileWrap["FileId"].AsObjectId, fullPath);
                }
            }
            if (output.Id != ObjectId.Empty)
            {
                switch (output.Format)
                {
                    case VideoOutPutFormat.M3u8:
                        ConvertHls(from, taskItem.Message["_id"].AsObjectId, fileWrapId, fullPath, fileName, output, expiredTime);
                        break;
                }
            }
            return true;
        }
        public void ConvertHls(string from, ObjectId id, ObjectId fileId, string fullPath, string fileName, VideoOutPut output, DateTime expiredTime)
        {
            string sengmentFileName = fileId.ToString().Substring(0, 18) + "%06d.ts";
            string outputPath = Path.GetDirectoryName(fullPath) + "\\" + output.Id.ToString() + "\\";
            if (!Directory.Exists(outputPath)) Directory.CreateDirectory(outputPath);
            int crf = 23 + (int)output.Quality * 6;
            string cmd = "\"" + AppSettings.ExePath + "\"" + " -i " + "\"" + fullPath + "\"" + " -crf " + crf + " -f hls -hls_list_size 0 -hls_segment_filename " + "\"" + outputPath + sengmentFileName + "\" \"" + outputPath + Path.GetFileNameWithoutExtension(fullPath) + ".m3u8" + "\"";
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
            //进度
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
                int currentDuration = GetCurrentDuration(line);
                if (totalDuration != 0 && currentDuration != 0)
                {
                    int percent = System.Convert.ToInt32(Math.Round((double)currentDuration / totalDuration, 2) * 100);
                    if (percent == 100) percent = 99;
                    task.UpdatePercent(id, percent);
                }
            }
            process.WaitForExit();
            HlsToMongo(from, outputPath, output.Id, fileId, Path.GetFileNameWithoutExtension(fileName) + ".m3u8", (int)output.Quality, totalDuration, width, height, output.Flag, expiredTime);
            process.Close();
            process.Dispose();
        }
        public void HlsToMongo(string from, string path, ObjectId m3u8FileId, ObjectId sourceFileId, string fileNameM3u8, int quality, int duration, int width, int height, string flag, DateTime expiredTime)
        {
            string[] files = Directory.GetFiles(path);
            string m3u8Text = File.ReadAllText(path + sourceFileId.ToString() + ".m3u8");
            foreach (string file in files)
            {
                if (Path.GetExtension(file) == ".ts")
                {
                    byte[] buffer = File.ReadAllBytes(file);
                    string md5 = buffer.GetMD5();
                    BsonDocument tsBson = ts.GetIdByMd5(from, md5);
                    ObjectId tsId = ObjectId.Empty;
                    if (tsBson == null)
                    {
                        tsId = ObjectId.GenerateNewId();
                        ts.Insert(tsId, from, buffer.Length, md5, new List<ObjectId>() { m3u8FileId }, buffer);
                    }
                    else
                    {
                        tsId = tsBson["_id"].AsObjectId;
                        ts.AddSourceId(from, tsId, m3u8FileId);
                    }
                    m3u8Text = m3u8Text.Replace(Path.GetFileNameWithoutExtension(file), tsId.ToString());
                }
            }
            m3u8.Replace(m3u8FileId, from, sourceFileId, fileNameM3u8, m3u8Text, quality, duration, width, height, files.Length - 1, flag, expiredTime);
            Directory.Delete(path, true);
        }
       
    }
}
