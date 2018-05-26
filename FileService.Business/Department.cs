using FileService.Model;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class Department : ModelBase<Data.Department>
    {
        public Department() : base(new Data.Department()) { }
        
        //public BsonDocument GetByDepartmentCode(string departmentCode)
        //{
        //    return mongoData.GetByDepartmentCode(departmentCode);
        //}
        //public int GetLayer(string departmentCode)
        //{
        //    return mongoData.GetByDepartmentCode(departmentCode)["Layer"].AsInt32;
        //}
        //public DepartmentSelect GetDepartmentSelect()
        //{
        //    IEnumerable<BsonDocument> departments = mongoData.FindAll();
        //    BsonDocument top = departments.Where(w => w["ParentCode"] == BsonNull.Value).FirstOrDefault();
        //    DepartmentSelect departmentSelect = AssembDepartment(top);
        //    GetSubDepartmentSelect(departmentSelect, departments, top["DepartmentCode"].AsString);
        //    return departmentSelect;
        //}
        //private void GetSubDepartmentSelect(DepartmentSelect departmentSelect, IEnumerable<BsonDocument> departments, string parentCode)
        //{
        //    List<DepartmentSelect> temp = new List<DepartmentSelect>();
        //    IEnumerable<BsonDocument> departs = departments.Where(w => w["ParentCode"] == parentCode).OrderBy(o => o["Order"].AsInt32);
        //    if (departs.Count() == 0) return;
        //    foreach (BsonDocument b in departs)
        //    {
        //        DepartmentSelect deptSelect = AssembDepartment(b);
        //        GetSubDepartmentSelect(deptSelect, departments, deptSelect.DepartmentCode);
        //        temp.Add(deptSelect);
        //    }
        //    departmentSelect.Departments = temp;
        //}
        //private DepartmentSelect AssembDepartment(BsonDocument b)
        //{
        //    return new DepartmentSelect()
        //    {
        //        Id = b["_id"].ToString(),
        //        DepartmentName = b["DepartmentName"].AsString,
        //        DepartmentCode = b["DepartmentCode"].AsString,
        //        Order = b["Order"].AsInt32,
        //        Layer = b["Layer"].AsInt32,
        //        ParentCode = b["ParentCode"] == BsonNull.Value ? null : b["ParentCode"].AsString,
        //        Departments = new List<DepartmentSelect>(),
        //        CreateTime = b["CreateTime"].ToUniversalTime()
        //    };
        //}

    }
}
