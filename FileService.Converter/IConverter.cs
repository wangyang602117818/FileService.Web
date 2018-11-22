using FileService.Business;
using FileService.Util;
using MongoDB.Bson;
using System.IO;
using System.Linq;

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
        public virtual bool Convert(FileItem fileItem)
        {
            return false;
        }
        public string GetFilePath(BsonDocument task)
        {
            string machine = task["Machine"].AsString;
            string tempPath = AppSettings.sharedFolders.Split(';').ToList().Where(w => w.Contains(machine)).FirstOrDefault();
            return tempPath.TrimEnd('\\') + "\\" + task["Folder"].AsString + "\\" + task["FileName"];
        }
        public bool SaveFileFromSharedFolder(ObjectId filesWrapId, string fullPath)
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
    }
}
