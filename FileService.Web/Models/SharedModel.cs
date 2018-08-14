using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class SharedModel
    {
        [Required]
        public string FileId { get; set; }
        [Required]
        public string FileName { get; set; }
        [Required]
        public string SharedUrl { get; set; }
        public string PassWord { get; set; }
        public int ExpiredDay { get; set; }
        public DateTime? CreateTime { get; set; }
    }
}