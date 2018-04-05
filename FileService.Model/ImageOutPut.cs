using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Model
{
    public class ImageOutPut
    {
        public ObjectId Id { get; set; }
        public ImageOutPutFormat Format { get; set; }
        public string Flag { get; set; }
        public ImageModelEnum Model { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
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
