using FileService.Business;
using FileService.Util;
using MongoDB.Bson;
using System;
using System.Diagnostics;
using System.IO;

namespace FileService.Converter
{
    public class OfficeConverter : Converter
    {
        Files files = new Files();
        FilesWrap filesWrap = new FilesWrap();
        FilesConvert filesConvert = new FilesConvert();
        Business.Task task = new Business.Task();
        MongoFile mongoFile = new MongoFile();
        MongoFileConvert mongoFileConvert = new MongoFileConvert();
        static object o = new object();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            DateTime expiredTime = fileWrap.Contains("ExpiredTime") ? fileWrap["ExpiredTime"].ToUniversalTime() : DateTime.MaxValue.ToUniversalTime();
            string from = taskItem.Message["From"].AsString;
            string fileName = taskItem.Message["FileName"].AsString;
            string fileType = taskItem.Message["Type"].AsString;

            string fullPath = AppSettings.GetFullPath(taskItem.Message);
            if (File.Exists(fullPath))
            {
                SaveFileFromSharedFolder(from, fileType, fileWrapId, fullPath, fileName, null);
            }
            else
            {
                mongoFile.SaveTo(fileWrap["FileId"].AsObjectId, fullPath);
            }
            ObjectId oldFileId = ObjectId.Empty;
            if (fileWrap != null)
            {
                oldFileId = taskItem.Message["Output"]["_id"].AsObjectId;
                if (oldFileId != ObjectId.Empty && filesConvert.FindOne(oldFileId) != null) mongoFileConvert.Delete(oldFileId);
            }

            string destinationFullPath = Path.GetDirectoryName(fullPath) + "\\" + fileWrapId.ToString() + ".pdf";
            //转换office方法
            ObjectId outputId = ConvertOffice(fullPath, destinationFullPath, Path.GetFileNameWithoutExtension(fileName) + ".pdf", fileWrapId, expiredTime);
            //更新 filesWrap 表
            filesWrap.UpdateSubFileId(fileWrapId, oldFileId, outputId);
            //更新 task 表
            task.UpdateOutPutId(taskItem.Message["_id"].AsObjectId, outputId);
            if (File.Exists(destinationFullPath)) File.Delete(destinationFullPath);
            if (File.Exists(fullPath)) File.Delete(fullPath);
            return true;
        }
        public ObjectId ConvertOffice(string sourcePath, string destinationPath, string convertName, ObjectId fileWrapId, DateTime expiredTime)
        {
            if (!File.Exists(AppSettings.libreOffice))
            {
                Log4Net.InfoLog("LibreOffice not installed");
                return ObjectId.Empty;
            }
            lock (o)
            {
                Process process = new Process()
                {
                    StartInfo = new ProcessStartInfo()
                    {
                        FileName = AppSettings.libreOffice,
                        Arguments = "-norestore -nofirststartwizard -headless -convert-to pdf  \"" + sourcePath + "\"",
                        WorkingDirectory = Path.GetDirectoryName(destinationPath)
                    }
                };
                process.Start();
                process.WaitForExit();
                process.Close();
                process.Dispose();
            }
            if (File.Exists(destinationPath))
            {
                using (FileStream stream = new FileStream(destinationPath, FileMode.Open))
                {
                    return mongoFileConvert.UploadFile(convertName, stream, "FilesWrap", fileWrapId, "pdf", "application/pdf", expiredTime);
                }
            }
            else
            {
                return ObjectId.Empty;
            }
        }
    }
}
