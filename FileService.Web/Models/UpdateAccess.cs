﻿using FileService.Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileService.Web.Models
{
    public class UpdateAccess
    {
        [Required]
        public IEnumerable<string> FileIds { get; set; }
        public List<AccessModel> Access { get; set; }
    }

}