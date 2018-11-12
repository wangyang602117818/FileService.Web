using FileService.Model;
using MongoDB.Bson;
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
        private List<ImageOutPut> thumbnails = new List<ImageOutPut>() { };
        private List<ThumbnailDisplay> thumbnailsDisplay = new List<ThumbnailDisplay>() { };
        private List<VideoOutPut> videos = new List<VideoOutPut>() { };
        private List<VideoDisplay> videosDisplay = new List<VideoDisplay>() { };
        [Required]
        public string ApplicationName { get; set; }
        [Required]
        public string AuthCode { get; set; }
        public List<ImageOutPut> Thumbnails { get => thumbnails; set => thumbnails = value; }
        public List<ThumbnailDisplay> ThumbnailsDisplay { get => thumbnailsDisplay; set => thumbnailsDisplay = value; }
        public List<VideoOutPut> Videos { get => videos; set => videos = value; }
        public List<VideoDisplay> VideosDisplay { get => videosDisplay; set => videosDisplay = value; }
        [Required]
        public string Action { get; set; }
    }
    public class UpdateApplicationModel
    {
        private List<ImageOutPut> thumbnails = new List<ImageOutPut>() { };
        private List<ThumbnailDisplay> thumbnailsDisplay = new List<ThumbnailDisplay>() { };
        private List<VideoOutPut> videos = new List<VideoOutPut>() { };
        private List<VideoDisplay> videosDisplay = new List<VideoDisplay>() { };
        [Required]
        [BsonIgnore]
        public string Id { get; set; }
        [Required]
        public string ApplicationName { get; set; }
        [Required]
        public string AuthCode { get; set; }
        public List<ImageOutPut> Thumbnails { get => thumbnails; set => thumbnails = value; }
        public List<ThumbnailDisplay> ThumbnailsDisplay { get => thumbnailsDisplay; set => thumbnailsDisplay = value; }
        public List<VideoOutPut> Videos { get => videos; set => videos = value; }
        public List<VideoDisplay> VideosDisplay { get => videosDisplay; set => videosDisplay = value; }
        [Required]
        public string Action { get; set; }
    }

    public class ThumbnailDisplay
    {
        public ObjectId Id { get; set; }
        public string Format { get; set; }
        public string Flag { get; set; }
        public string Model { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
    public class VideoDisplay
    {
        public ObjectId Id { get; set; }
        public string Format { get; set; }
        public string Quality { get; set; }
        public string Flag { get; set; }
    }
}