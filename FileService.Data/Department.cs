using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Data
{
    public class Department: MongoBase
    {
        public Department() : base("Department") { }
        public BsonDocument GetByDepartmentCode(string departmentCode)
        {
            return MongoCollection.Find(FilterBuilder.Eq("DepartmentCode", departmentCode)).FirstOrDefault();
        }
    }
}
