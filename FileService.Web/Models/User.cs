﻿using MongoDB.Bson.Serialization.Attributes;
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
        public string UserCode { get; set; }
        [Required]
        public string PassWord { get; set; }
        [Required]
        public string Company { get; set; }
        [Required]
        public string CompanyDisplay { get; set; }
        public List<string> Department { get; set; }
        public List<string> DepartmentDisplay { get; set; }
        public string Role { get; set; }
        [BsonIgnoreIfNull]
        public DateTime? CreateTime { get; set; }
        [BsonIgnoreIfNull]
        public DateTime? LastLoginDate { get; set; }
        public bool Modified { get; set; }
    }
    public class UpdateUser
    {
        private DateTime? updateTime = DateTime.Now;
        [BsonIgnore]
        public string Id { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        public string UserCode { get; set; }
        [Required]
        public string PassWord { get; set; }
        [Required]
        public string Company { get; set; }
        [Required]
        public string CompanyDisplay { get; set; }
        public List<string> Department { get; set; }
        public List<string> DepartmentDisplay { get; set; }
        public string Role { get; set; }
        [BsonIgnoreIfNull]
        public DateTime? LastLoginDate { get; set; }
        public bool Modified { get; set; }
        public DateTime? UpdateTime { get => updateTime; set => updateTime = value; }

    }
    public class UserLogin
    {
        [Required]
        public string UserCode { get; set; }
        public string UserName { get; set; }
        [Required]
        public string PassWord { get; set; }
    }
}