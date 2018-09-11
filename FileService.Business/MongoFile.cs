namespace FileService.Business
{
    public class MongoFile : MongoFileBase
    {
        public MongoFile() : base(new Data.MongoFile()) { }
    }
    public class MongoFileConvert : MongoFileBase
    {
        public MongoFileConvert() : base(new Data.MongoFileConvert()) { }
    }
}
