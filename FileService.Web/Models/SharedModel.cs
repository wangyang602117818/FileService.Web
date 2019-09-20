using MongoDB.Bson.Serialization.Attributes;
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
        public string PassWord { get; set; }
        public int ExpiredDay { get; set; }
        public bool Disabled { get; set; }
        public DateTime? CreateTime { get; set; }
    }
}