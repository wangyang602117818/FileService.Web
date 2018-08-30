using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;

namespace FileService.Converter
{
    public class VideoConverter : Converter
    {
        public static string ExePath = AppDomain.CurrentDomain.BaseDirectory + "ffmpeg.exe";
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        VideoCapture videoCapture = new VideoCapture();
        Ts ts = new Ts();
        M3u8 m3u8 = new M3u8();
        Business.Task task = new Business.Task();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string fileName = taskItem.Message["FileName"].AsString;
            ObjectId filesWrapId = taskItem.Message["FileId"].AsObjectId;

            VideoOutPut output = BsonSerializer.Deserialize<VideoOutPut>(outputDocument);

            int processCount = taskItem.Message["ProcessCount"].AsInt32;
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName; //数据库里面存的path

            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                //确保文件只存一份
                lock (o)
                {
                    if (File.Exists(fullPath))
                    {
                        SaveFileFromSharedFolder(filesWrapId, fullPath);
                        //第一次转换，先截一张图
                        ConvertVideoCp(taskItem.Message["_id"].AsObjectId, taskItem.Message["FileId"].ToString(), fullPath);
                    }
                    //任务肯定是后加的
                    else
                    {
                        string newPath = MongoFileBase.AppDataDir + fileName;
                        if (!File.Exists(newPath))
                        {
                            BsonDocument filesWrap = new FilesWrap().FindOne(filesWrapId);
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
                            BsonDocument filesWrap = new FilesWrap().FindOne(filesWrapId);
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
                        ConvertHls(taskItem.Message["_id"].AsObjectId, taskItem.Message["FileId"].ToString(), fullPath, output);
                        break;
                }
            }
            return true;
        }
        public void ConvertVideoCp(ObjectId id, string fileWrapId, string fullPath)
        {
            if (videoCapture.CountBySourceId(ObjectId.Parse(fileWrapId)) <= 0)
            {
                string cpPath = MongoFileBase.AppDataDir + Path.GetFileNameWithoutExtension(fullPath) + ".jpg";
                string cmd = "\"" + ExePath + "\" -ss 00:00:01 -i \"" + fullPath + "\" -vframes 1 \"" + cpPath + "\"";
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
                process.WaitForExit();
                if (File.Exists(cpPath))
                {
                    FileStream imageStream = new FileStream(cpPath, FileMode.Open, FileAccess.Read);
                    ObjectId cpId = ObjectId.GenerateNewId();
                    BsonDocument document = new BsonDocument()
                    {
                        {"_id",cpId },
                        {"SourceId",ObjectId.Parse(fileWrapId) },
                        {"Length",imageStream.Length },
                        {"FileName",Path.GetFileName(cpPath) },
                        {"File",imageStream.ToBytes() },
                        {"CreateTime",DateTime.Now }
                    };
                    videoCapture.Insert(document);
                    filesWrap.AddVideoCapture(ObjectId.Parse(fileWrapId), cpId);
                    imageStream.Close();
                    imageStream.Dispose();
                }
                File.Delete(cpPath);
            }
        }
        public void ConvertHls(ObjectId id, string fileId, string fullPath, VideoOutPut output)
        {
            string sengmentFileName = fileId.Substring(0, 18) + "%06d.ts";
            string outputPath = MongoFile.AppDataDir + output.Id.ToString() + "\\";
            if (!Directory.Exists(outputPath)) Directory.CreateDirectory(outputPath);
            int crf = 23 + (int)output.Quality * 6;
            string cmd = "\"" + ExePath + "\"" + " -i " + "\"" + fullPath + "\"" + " -crf " + crf + " -f hls -hls_list_size 0 -hls_segment_filename " + "\"" + outputPath + sengmentFileName + "\" \"" + outputPath + Path.GetFileNameWithoutExtension(fullPath) + ".m3u8" + "\"";
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
            HlsToMongo(outputPath, output.Id.ToString(), fileId, Path.GetFileNameWithoutExtension(fullPath) + ".m3u8", totalDuration, output.Flag);
        }
        public void HlsToMongo(string path, string m3u8FileId, string sourceFileId, string fileNameM3u8, int duration, string flag)
        {
            string[] files = Directory.GetFiles(path);
            string m3u8Text = File.ReadAllText(path + fileNameM3u8);
            ts.DeleteBySourceId(ObjectId.Parse(m3u8FileId));
            int n = 0;
            foreach (string file in files)
            {
                if (Path.GetExtension(file) == ".ts")
                {
                    byte[] buffer = File.ReadAllBytes(file);
                    ObjectId tsId = ObjectId.GenerateNewId();
                    m3u8Text = m3u8Text.Replace(Path.GetFileNameWithoutExtension(file), tsId.ToString());
                    ts.Insert(tsId, m3u8FileId, fileNameM3u8, n, buffer.Length, buffer);
                    n++;
                }
            }
            m3u8.Replace(ObjectId.Parse(m3u8FileId), ObjectId.Parse(sourceFileId), fileNameM3u8, m3u8Text, duration, files.Length - 1, flag);
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
