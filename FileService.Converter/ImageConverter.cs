using FileService.Business;
using FileService.Model;
using FileService.Util;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;

namespace FileService.Converter
{
    public class ImageConverter : Converter
    {
        MongoFile mongoFile = new MongoFile();
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        Thumbnail thumbnail = new Thumbnail();

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

            ImageOutPut output = BsonSerializer.Deserialize<ImageOutPut>(outputDocument);
            string outputExt = "";
            ImageFormat format = ImageFormat.Jpeg;
            if (Path.GetExtension(fileName).ToLower() == ".svg")
            {
                outputExt = ".svg";
            }
            else
            {
                format = ImageExtention.GetFormat(output.Format, fileName, out outputExt);
            }
            int processCount = System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            Stream fileStream = null;
            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            //第一次转换，文件肯定在共享文件夹
            if (processCount == 0)
            {
                lock (o)
                {
                    if (File.Exists(fullPath))
                    {
                        fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
                        //同一份文件的不同转换任务 该部分工作相同,确保不同的线程只执行一次
                        if (!queues.Contains(fileWrapId.ToString()))
                        {
                            SaveFileFromSharedFolder(from, fileType, fileWrapId, fileName, fileStream, format);
                            queues.Enqueue(fileWrapId.ToString());
                        }
                        if (queues.Count >= 10) queues.Dequeue();
                        fileStream.Position = 0;
                    }
                    //任务肯定是后加的
                    else
                    {
                        ObjectId fileId = fileWrap["FileId"].AsObjectId;
                        fileStream = mongoFile.DownLoadSeekable(fileId);
                    }
                }
            }
            else
            {
                ObjectId fileId = fileWrap["FileId"].AsObjectId;
                fileStream = mongoFile.DownLoadSeekable(fileId);
            }
            if (fileStream != null)
            {
                if (output.Id != ObjectId.Empty)
                {
                    int twidth = output.Width, theight = output.Height;
                    using (Stream stream = ImageExtention.GenerateThumbnail(fileName, fileStream, output.Model, format, output.ImageQuality, output.X, output.Y, ref twidth, ref theight))
                    {
                        thumbnail.Replace(output.Id, from, taskItem.Message["FileId"].AsObjectId, stream.Length, twidth, theight, Path.GetFileNameWithoutExtension(fileName) + outputExt, output.Flag, stream.ToBytes(), fileWrap.Contains("ExpiredTime") ? fileWrap["ExpiredTime"].ToUniversalTime() : DateTime.MaxValue.ToUniversalTime());
                    }
                }
                fileStream.Close();
                fileStream.Dispose();
            }
            return true;
        }
    }
}
