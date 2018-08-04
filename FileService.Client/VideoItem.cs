using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Client
{
    /// <summary>
    /// 视频转换的描述
    /// </summary>
    public class VideoConvert
    {
        /// <summary>
        /// 指定一个标记，该标记会原样返回
        /// </summary>
        public string Flag { get; set; }
        /// <summary>
        /// 转换之后视频的格式
        /// </summary>
        public VideoFormat Format { get; set; }
        /// <summary>
        /// 转换之后视频的质量
        /// </summary>
        public VideoQuality Quality { get; set; }
    }
    /// <summary>
    /// 视频转换的格式
    /// </summary>
    public enum VideoFormat
    {
        /// <summary>
        /// 视频ts切片
        /// </summary>
        M3u8 = 0
    }
    /// <summary>
    /// 视频的质量
    /// </summary>
    public enum VideoQuality
    {
        /// <summary>
        /// 原画
        /// </summary>
        Original = 0,
        /// <summary>
        /// 稍差
        /// </summary>
        Lower = 1,
        /// <summary>
        /// 画质中等
        /// </summary>
        Medium = 2,
        /// <summary>
        /// 画质差
        /// </summary>
        Bad = 3
    }
    /// <summary>
    /// 视频返回项
    /// </summary>
    public class VideoFileResult
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
        /// 文件字节数(大小)
        /// </summary>
        public long FileSize { get; set; }
        /// <summary>
        /// 转换之后的视频列表
        /// </summary>
        public IEnumerable<VideoItem> Videos { get; set; }
    }
    /// <summary>
    /// 转换之后的视频描述
    /// </summary>
    public class VideoItem
    {
        /// <summary>
        /// 文件id
        /// </summary>
        public string FileId { get; set; }
        /// <summary>
        /// 用户设置的标记，原样返回
        /// </summary>
        public string Flag { get; set; }
    }
}
