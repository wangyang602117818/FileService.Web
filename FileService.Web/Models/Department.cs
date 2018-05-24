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
        public int? Order { get; set; }
        [Required]
        public int? Layer { get; set; }
        public List<DepartmentForm> Department { get; set; }
    }
}