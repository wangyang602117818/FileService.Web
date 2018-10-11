﻿using MongoDB.Bson.Serialization.Attributes;
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
        public string Extension { get; set; }
        [Required]
        public string Type { get; set; }
        [BsonIgnoreIfDefault]
        public string Description { get; set; }
        [Required]
        public string Action { get; set; }
    }
    public class UpdateConfigModel
    {
        [Required]
        [BsonIgnore]
        public string Id { get; set; }
        [Required]
        public string Extension { get; set; }
        [Required]
        public string Type { get; set; }
        [BsonIgnoreIfDefault]
        public string Description { get; set; }
        [Required]
        public string Action { get; set; }
    }
}