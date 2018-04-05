using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class UpdateImageTask
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public string ThumbnailId { get; set; }
        [Required]
        public string Flag { get; set; }
        [Required]
        public int Format { get; set; }
        [Required]
        public string Handler { get; set; }
        [Required]
        public int Model { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
    }
    public class UpdateVideoTask
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public string M3u8Id { get; set; }
        [Required]
        public string Flag { get; set; }
        [Required]
        public int Format { get; set; }
        [Required]
        public string Handler { get; set; }
        [Required]
        public int? Quality { get; set; }
    }
    public class UpdateAttachmentTask
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public string SubFileId { get; set; }
        [Required]
        public string Flag { get; set; }
        [Required]
        public int Format { get; set; }
        [Required]
        public string Handler { get; set; }

    }
}