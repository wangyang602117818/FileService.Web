using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 图片转换任务的描述
    /// </summary>
    public class ImageConvert
    {
        /// <summary>
        /// 指定一个标记，该标记会原样返回
        /// </summary>
        public string Flag { get; set; }
        /// <summary>
        /// 转换之后图片的格式
        /// </summary>
        public ImageFormat Format { get; set; }
        /// <summary>
        /// 图片转换模式
        /// </summary>
        public ImageModel Model { get; set; }
        /// <summary>
        /// x坐标点，仅仅在cut模式下有效,坐标点从左上角开始算起
        /// </summary>
        public int X { get; set; }
        /// <summary>
        /// y坐标点，仅仅在cut模式下有效，坐标点从左上角开始算起
        /// </summary>
        public int Y { get; set; }
        /// <summary>
        /// 转换之后图片宽度
        /// </summary>
        public int Width { get; set; }
        /// <summary>
        /// 转换之后图片高度
        /// </summary>
        public int Height { get; set; }
    }
    /// <summary>
    /// 图片转换的格式
    /// </summary>
    public enum ImageFormat
    {
        /// <summary>
        /// 与上传的图片格式一致
        /// </summary>
        Default = 0,
        /// <summary>
        /// jpg格式
        /// </summary>
        Jpeg = 1,
        /// <summary>
        /// png格式
        /// </summary>
        Png = 2,
        /// <summary>
        /// gif格式
        /// </summary>
        Gif = 3,
        /// <summary>
        /// bmp格式
        /// </summary>
        Bmp = 4
    }
    /// <summary>
    /// 图片转换的方式
    /// </summary>
    public enum ImageModel
    {
        /// <summary>
        /// 缩放  （按宽高比率缩放）
        /// </summary>
        Scale = 0,
        /// <summary>
        /// 剪切
        /// </summary>
        Cut = 1,
        /// <summary>
        /// 按宽度 （指定宽度，高度按比率缩放）
        /// </summary>
        Width = 2,
        /// <summary>
        /// 按高度 （指定高度，宽度按比率缩放）
        /// </summary>
        Height = 3
    }
    /// <summary>
    /// 文件项
    /// </summary>
    public class FileItem
    {
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 文件流
        /// </summary>
        public Stream FileStream { get; set; }
    }
    /// <summary>
    /// 图片返回项
    /// </summary>
    public class ImageFileResult
    {
        /// <summary>
        /// 文件id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 文件名
        /// </summary>
        public string FileName { get; set; }
        /// <summary>
        /// 缩列图列表
        /// </summary>
        public IEnumerable<Thumbnail> Thumbnail { get; set; }
    }
    /// <summary>
    /// 缩略图项
    /// </summary>
    public class Thumbnail
    {
        /// <summary>
        /// 缩略图文件id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 上传的时候指定的标记
        /// </summary>
        public string Flag { get; set; }
    }
}
