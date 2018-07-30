using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class ImageItemResponse
    {
        public string FileId { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public IEnumerable<ThumbnailItem> Thumbnail { get; set; }
    }
    public class ThumbnailItem
    {
        public string FileId { get; set; }
        public string Flag { get; set; }
    }
    public class VideoItemResponse
    {
        public string FileId { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public IEnumerable<VideoItem> Videos { get; set; }
    }
    public class VideoItem
    {
        public string FileId { get; set; }
        public string Flag { get; set; }
    }
    public class AttachmentResponse
    {
        public string FileId { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
    }
}