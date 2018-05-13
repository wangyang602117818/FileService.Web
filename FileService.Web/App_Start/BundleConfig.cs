using System.Web;
using System.Web.Optimization;
using System.Web.Optimization.React;

namespace FileService.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/scripts/culture_zh-CN").Include(
                        "~/scripts/culture_zh-CN.js"));
            bundles.Add(new ScriptBundle("~/scripts/culture_en-US").Include(
                        "~/scripts/culture_en-US.js"));
            //login
            bundles.Add(new BabelBundle("~/scripts/login")
                .Include("~/scripts/funs.jsx")
                .Include("~/scripts/login.jsx")
            );
            //index-head
            bundles.Add(new BabelBundle("~/scripts/index-head")
                .Include("~/scripts/funs.jsx")
                .Include("~/scripts/common.jsx")
                .Include("~/scripts/overview.jsx")
                .Include("~/scripts/handlers.jsx")
                .Include("~/scripts/tasks_update.jsx")
                .Include("~/scripts/tasks.jsx")
                .Include("~/scripts/resources_image.jsx")
                .Include("~/scripts/resources_video.jsx")
                .Include("~/scripts/resources_attachment.jsx")
                .Include("~/scripts/resources_thumbnail_list.jsx")
                .Include("~/scripts/resources_m3u8_list.jsx")
                .Include("~/scripts/resources_subfile_list.jsx")
                .Include("~/scripts/resources_zip_list.jsx")
                .Include("~/scripts/resources.jsx")
                .Include("~/scripts/logs.jsx")
            );
            //management
            bundles.Add(new BabelBundle("~/scripts/management")
               .Include("~/scripts/application.jsx")
               .Include("~/scripts/application_add.jsx")
               .Include("~/scripts/config.jsx")
               .Include("~/scripts/config_add.jsx")
            );
            //admin
            bundles.Add(new BabelBundle("~/scripts/admin")
               .Include("~/scripts/user.jsx")
               .Include("~/scripts/user_add.jsx")
            );
            //index
            bundles.Add(new BabelBundle("~/scripts/index")
               .Include("~/scripts/index.jsx")
            );
            //preview
            bundles.Add(new BabelBundle("~/scripts/preview")
               .Include("~/scripts/funs.jsx")
               .Include("~/scripts/preview.jsx")
            );
            //peview image
            bundles.Add(new BabelBundle("~/scripts/preview_image")
               .Include("~/scripts/preview_image.jsx")
            );
            //preivew video
            bundles.Add(new BabelBundle("~/scripts/preview_video")
               .Include("~/scripts/preview_video.jsx")
            );
            //preview pdf
            bundles.Add(new BabelBundle("~/scripts/preview_pdf")
               .Include("~/scripts/preview_pdf.jsx")
            );
            //preivew txt
            bundles.Add(new BabelBundle("~/scripts/preview_txt")
               .Include("~/scripts/preview_txt.jsx")
            );
            //preivew convert
            bundles.Add(new BabelBundle("~/scripts/preview_converting")
               .Include("~/scripts/preview_converting.jsx")
            );
            //preivew convert
            bundles.Add(new BabelBundle("~/scripts/preview_notsupported")
               .Include("~/scripts/preview_notsupported.jsx")
            );
            //css============================================
            bundles.Add(new StyleBundle("~/css/index")
                .Include("~/css/iconfont.css")
                .Include("~/css/index.css")
                .Include("~/css/page.css")
            );
            bundles.Add(new StyleBundle("~/css/preview")
               .Include("~/css/preview.css")
            );
            bundles.Add(new StyleBundle("~/css/login")
                .Include("~/css/login.css")
            );
        }
    }
}
