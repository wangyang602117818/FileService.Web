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
    public class UploadVideoModel
    {
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public HttpPostedFileBase[] Videos { get; set; }
        public string OutPut { get; set; }
    }
    public class UploadImgModel
    {
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public HttpPostedFileBase[] Images { get; set; }
        public string OutPut { get; set; }
    }
    public class UploadAttachmentModel
    {
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public HttpPostedFileBase[] Attachments { get; set; }
    }
    public class UploadVideoCPModel
    {
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public string FileBase64 { get; set; }
    }
    public class UploadVideoCPStreamModel
    {
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public string FileId { get; set; }
        [Required]
        public HttpPostedFileBase[] VideoCPs { get; set; }
    }
}
