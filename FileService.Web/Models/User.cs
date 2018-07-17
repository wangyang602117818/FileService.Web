using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class AddUser
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        public string PassWord { get; set; }
        [Required]
        public string Company { get; set; }
        [Required]
        public string CompanyDisplay { get; set; }
        public string[] Department { get; set; }
        public string[] DepartmentDisplay { get; set; }
        public string Role { get; set; }
        [BsonIgnoreIfNull]
        public DateTime? CreateTime { get; set; }
        [BsonIgnoreIfNull]
        public DateTime? LastLoginDate { get; set; }
        public bool Modified { get; set; }
    }
    public class UserLogin
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        public string PassWord { get; set; }
    }
}