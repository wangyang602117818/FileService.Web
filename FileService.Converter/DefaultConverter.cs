﻿using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Converter
{
    public class DefaultConverter : Converter
    {
        FilesWrap filesWrap = new FilesWrap();
        public override bool Convert(FileItem taskItem)
        {
            ObjectId fileWrapId = taskItem.Message["FileId"].AsObjectId;
            //BsonDocument fileWrap = filesWrap.FindOne(fileWrapId);
            string fileName = taskItem.Message["FileName"].AsString;
            int processCount =System.Convert.ToInt32(taskItem.Message["ProcessCount"]);
            string fullPath = taskItem.Message["TempFolder"].AsString + fileName;

            if (processCount == 0 && File.Exists(fullPath))
            {
                if (SaveFileFromSharedFolder(fileWrapId, fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
            }
            return false;
        }
    }
}
