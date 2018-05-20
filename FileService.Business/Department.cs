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
    }
}
