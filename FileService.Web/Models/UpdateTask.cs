using FileService.Model;
using System.ComponentModel.DataAnnotations;

namespace FileService.Web.Models
{
    public class UpdateHandler
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public string Handler { get; set; }
    }
    public class UpdateImageTask : AddImageTask
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string ThumbnailId { get; set; }
        [Required]
        public string Handler { get; set; }
    }
    public class AddImageTask
    {
        [Required]
        public string FileId { get; set; }
        [Required]
        public string Flag { get; set; }
        [Required]
        public int Format { get; set; }
        [Required]
        public int Model { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public ImageQuality ImageQuality { get; set; }
    }
    public class UpdateVideoTask : AddVideoTask
    {
        [Required]
        public string Id { get; set; }
        [Required]
        public string M3u8Id { get; set; }
        [Required]
        public string Handler { get; set; }
    }
    public class AddVideoTask
    {
        [Required]
        public string FileId { get; set; }
        [Required]
        public string Flag { get; set; }
        [Required]
        public int Format { get; set; }
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