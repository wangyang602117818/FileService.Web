using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class DepartmentForm
    {
        private string departmentName = "";
        private string departmentCode = "";
        private List<DepartmentForm> department = new List<DepartmentForm>();

        [Required]
        public string DepartmentName { get => departmentName; set => departmentName = value; }
        [Required]
        public string DepartmentCode { get => departmentCode; set => departmentCode = value; }
        public List<DepartmentForm> Department { get => department; set => department = value; }

    }
}