using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class DepartmentForm
    {
        [Required]
        public string DepartmentName { get; set; }
        [Required]
        public string DepartmentCode { get; set; }
        public int? Order { get; set; }
        public int? Layer { get; set; }
        [Required]
        public string ParentCode { get; set; }
        public DateTime CreateTime { get; set; }
    }
}