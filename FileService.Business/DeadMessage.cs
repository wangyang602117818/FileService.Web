using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileService.Business
{
    public class DeadMessage : ModelBase<Data.DeadMessage>
    {
        public DeadMessage() : base(new Data.DeadMessage()) { }
    }
}
