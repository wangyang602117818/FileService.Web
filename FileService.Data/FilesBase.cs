using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class FilesBase : MongoBase
    {
        public FilesBase(string collectionName) : base(collectionName) { }
        
        public BsonDocument GetFileByMD5(string md5)
        {
            var filter = FilterBuilder.Eq("md5", md5);
            return MongoCollection.Find(filter).FirstOrDefault();
        }
        //protected override FilterDefinition<BsonDocument> GetPageFilters(IEnumerable<string> fields, string filter)
        //{
        //    FilterDefinition<BsonDocument> filterBuilder = FilterBuilder.And(FilterBuilder.Not(FilterBuilder.Eq("metadata.From", "Convert")));
        //    if (!string.IsNullOrEmpty(filter))
        //    {
        //        List<FilterDefinition<BsonDocument>> list = new List<FilterDefinition<BsonDocument>>();
        //        foreach (string field in fields)
        //        {
        //            list.Add(FilterBuilder.Regex(field, new Regex("^.*" + filter + ".*$", RegexOptions.IgnoreCase)));
        //        }
        //        filterBuilder = FilterBuilder.And(
        //            FilterBuilder.Not(FilterBuilder.Eq("metadata.From", "Convert")),
        //            FilterBuilder.Or(list));
        //    }
        //    return filterBuilder;
        //}
    }
}
