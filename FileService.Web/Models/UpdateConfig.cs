using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class AddConfigModel
    {
        [Required]
        public string AppName { get; set; }
        [Required]
        public string Extension { get; set; }
        [Required]
        public string Type { get; set; }
        [Required]
        public string Action { get; set; }
    }
}