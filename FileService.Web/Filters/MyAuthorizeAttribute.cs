using FileService.Web.Models;
using FileService.Business;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace FileService.Web.Filters
{
    public class MyAuthorizeAttribute : AuthorizeAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            Controller controller = (Controller)filterContext.Controller;
            bool access = true;
            if (controller.User.Identity.IsAuthenticated)
            {
                IEnumerable<CustomAttributeData> customAttributes = ((ReflectedActionDescriptor)filterContext.ActionDescriptor).MethodInfo.CustomAttributes;
                foreach (CustomAttributeData c in customAttributes)
                {
                    if (c.AttributeType.Name == "AuthorizeAttribute")
                    {
                        access = false;
                        foreach (var item in c.NamedArguments)
                        {
                            string[] name = item.TypedValue.Value.ToString().Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                            foreach (string n in name)
                            {
                                if (controller.User.IsInRole(n)) access = true;
                            }
                        }
                    }
                }
                //BsonDocument user = new User().GetUser(controller.User.Identity.Name);
                //GenericPrincipal gp = new GenericPrincipal(controller.User.Identity, new string[] { user["Role"].AsString });
                //controller.HttpContext.User = gp;
            }
            if (access)
            {
                base.OnAuthorization(filterContext);
            }
            else
            {
                filterContext.Result= new ResponseModel<string>(ErrorCode.authorize_fault, "");
            }
        }
    }
}