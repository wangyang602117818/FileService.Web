using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class VideoConverter : IConverter
    {
        public static string ExePath = AppDomain.CurrentDomain.BaseDirectory + "ffmpeg.exe";
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Ts ts = new Ts();
        M3u8 m3u8 = new M3u8();
        Business.Task task = new Business.Task();
        static object o = new object();
        public void Convert(FileItem taskItem)
        {
            BsonDocument outputDocument = taskItem.Message["Output"].AsBsonDocument;
            string fileName = taskItem.Message["FileName"].AsString;
            ObjectId filesWrapId = taskItem.Message["FileId"].AsObjectId;

            VideoOutPut output = BsonSerializer.Deserialize<VideoOutPut>(outputDocument);

            int processCount = taskItem.Message["ProcessCount"].AsInt32;
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                if (File.Exists(fullPath))
                {
                    FileStream fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
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
                    filesWrap.UpdateFileId(filesWrapId, id);
                    fileStream.Close();
                    fileStream.Dispose();
                }
            }
            else
            {
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
            foreach (string file in files)
            {
                if (Path.GetExtension(file) == ".ts")
                {
                    byte[] buffer = File.ReadAllBytes(file);
                    ObjectId tsId = ObjectId.GenerateNewId();
                    m3u8Text = m3u8Text.Replace(Path.GetFileNameWithoutExtension(file), tsId.ToString());
                    ts.Replace(tsId, m3u8FileId, fileNameM3u8, buffer.Length, buffer);
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
