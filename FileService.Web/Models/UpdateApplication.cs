using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class AddApplicationModel
    {
        [Required]
        public string ApplicationName { get; set; }
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public string Action { get; set; }
    }
    public class UpdateApplicationModel
    {
        [Required]
        [BsonIgnore]
        public string Id { get; set; }
        [Required]
        public string ApplicationName { get; set; }
        [Required]
        public string AuthCode { get; set; }
        [Required]
        public string Action { get; set; }
    }
}