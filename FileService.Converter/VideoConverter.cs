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
        FilePreviewBig filePreviewBig = new FilePreviewBig();
        static Queue<string> queues = new Queue<string>();   //防止存储和转换源文件任务执行多次 
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = taskItem.Message["Type"].AsString;

            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            ObjectId videoCpId = fileWrap["VideoCpIds"].AsBsonArray[0].AsObjectId;
            VideoOutPut output = BsonSerializer.Deserialize<VideoOutPut>(outputDocument);

            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            string ext = Path.GetExtension(fullPath).ToLower();
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                //确保文件只存一份
                lock (o)
                {
                    if (File.Exists(fullPath))
                    {
                        //同一份文件的不同转换任务 该部分工作相同,确保不同的线程只执行一次
                        if (!queues.Contains(fileWrapId.ToString()))
                        {
                            if (ext != ".mp4")
                            {
                                ConvertVideoMp4(from, fileType, fileWrapId, fullPath, ImageFormat.Jpeg);
                            }
                            else
                            {
                                SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, ImageFormat.Jpeg);
                            }
                            queues.Enqueue(fileWrapId.ToString());
                        }
                        if (queues.Count >= 10) queues.Dequeue();
                    }
                    //任务肯定是后加的
                    else
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
            }
            else
            {
                //确保只下载一份
                lock (o)
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
            }
            if (output.Id != ObjectId.Empty)
            {
                switch (output.Format)
                {
                    case VideoOutPutFormat.M3u8:
                        ConvertHls(from, taskItem.Message["_id"].AsObjectId, taskItem.Message["FileId"].AsObjectId, fullPath, output);
                        break;
                }
            }
            return true;
        }
        public void ConvertHls(string from, ObjectId id, ObjectId fileId, string fullPath, VideoOutPut output)
        {
            string sengmentFileName = fileId.ToString().Substring(0, 18) + "%06d.ts";
            string outputPath = MongoFileBase.AppDataDir + output.Id.ToString() + "\\";
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
            while (!SR.EndOfStream)
            {
                string line = SR.ReadLine();
                if (totalDuration == 0) totalDuration = GetTotalDuration(line);
                int currentDuration = GetCurrentDuration(line);
                if (totalDuration != 0 && currentDuration != 0)
                {
                    int percent = System.Convert.ToInt32(Math.Round((double)currentDuration / totalDuration, 2) * 100);
                    if (percent == 100) percent = 99;
                    task.UpdatePercent(id, percent);
                }
            }
            process.WaitForExit();
            HlsToMongo(from, outputPath, output.Id, fileId, Path.GetFileNameWithoutExtension(fullPath) + ".m3u8", (int)output.Quality, totalDuration, output.Flag);
            process.Close();
            process.Dispose();
        }
        public void HlsToMongo(string from, string path, ObjectId m3u8FileId, ObjectId sourceFileId, string fileNameM3u8, int quality, int duration, string flag)
        {
            string[] files = Directory.GetFiles(path);
            string m3u8Text = File.ReadAllText(path + fileNameM3u8);
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
            m3u8.Replace(m3u8FileId, from, sourceFileId, fileNameM3u8, m3u8Text, quality, duration, files.Length - 1, flag);
            Directory.Delete(path, true);
        }
        private int GetTotalDuration(string str)
        {
            Regex regex = new Regex(@"Duration:\s*(\d{2}):(\d{2}):(\d{2}).(\d{2})");
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
        private int GetCurrentDuration(string str)
        {
            Regex regex = new Regex(@"time=(\d{2}):(\d{2}):(\d{2}).(\d{2})");
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
    }
}
