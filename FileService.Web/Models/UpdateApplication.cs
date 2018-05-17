using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class UpdateApplicationModel
    {
        [Required]
        public string ApplicationName { get; set; }
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public string Action { get; set; }
    }
}