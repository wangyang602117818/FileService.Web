using FileService.Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace FileService.Web.Models
{
    public class UploadImgModel
    {
        [Required]
        public HttpPostedFileBase[] Images { get; set; }
        public string OutPut { get; set; }
        public string Access { get; set; }
    }
    public class CheckImgMd5Model
    {
        public string FileName { get; set; }
        public string Md5 { get; set; }
        public string OutPut { get; set; }
        public string Access { get; set; }
    }
    public class UploadVideoModel
    {
        [Required]
        public HttpPostedFileBase[] Videos { get; set; }
        public string OutPut { get; set; }
        public string Access { get; set; }
    }
    public class UploadAttachmentModel
    {
        [Required]
        public HttpPostedFileBase[] Attachments { get; set; }
        public string Access { get; set; }
    }
    public class UploadVideoCPModel
    {
        [Required]
        public string FileId { get; set; }
        [Required]
        public string FileBase64 { get; set; }
    }
    public class UploadVideoCPStreamModel
    {
        [Required]
        public string FileId { get; set; }
        [Required]
        public HttpPostedFileBase[] VideoCPs { get; set; }
    }
}
