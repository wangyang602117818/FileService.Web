﻿using MongoDB.Bson;

namespace FileService.Model
{
    public class ImageOutPut
    {
        private ObjectId fileId = ObjectId.Empty;
        public ObjectId Id { get; set; }
        public ObjectId FileId { get => fileId; set => fileId = value; }
        public ImageOutPutFormat Format { get; set; }
        public string Flag { get; set; }
        public ImageModelEnum Model { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int ImageQuality { get; set; }
    }
    public enum ImageOutPutFormat
    {
        Default = 0,
        Jpeg = 1,
        Png = 2,
        Gif = 3,
        Bmp = 4
    }
}
