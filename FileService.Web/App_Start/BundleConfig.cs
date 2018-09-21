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

            bundles.Add(new ScriptBundle("~/scripts/react-only-js")
                .Include("~/scripts/react.js")
                .Include("~/scripts/react-dom.js")
            );
            bundles.Add(new ScriptBundle("~/scripts/datepicker")
                .Include("~/scripts/datepicker.js")
            );
            bundles.Add(new ScriptBundle("~/scripts/datepickertemplate")
                .Include("~/scripts/datepicker-template.html")
            );
            //js-boundles
            bundles.Add(new ScriptBundle("~/scripts/index-common-js")
                .Include("~/scripts/jquery-3.3.1.js")
                .Include("~/scripts/jquery-ui.js")
                .Include("~/scripts/react.js")
                .Include("~/scripts/react-dom.js")
                .Include("~/scripts/echarts.js")
                .Include("~/scripts/nestedsortable.js")
            );
            //login
            bundles.Add(new BabelBundle("~/scripts/index-login-jsx")
                .Include("~/scripts/funs.jsx")
                .Include("~/scripts/login.jsx")
            );
            //index-head-jsx
            bundles.Add(new BabelBundle("~/scripts/index-head-jsx")
                .Include("~/scripts/funs.jsx")
                .Include("~/scripts/common.jsx")
                .Include("~/scripts/overview.jsx")
                .Include("~/scripts/handlers.jsx")
                .Include("~/scripts/tasks_update.jsx")
                .Include("~/scripts/tasks.jsx")
                .Include("~/scripts/dropdownlist.jsx")
                .Include("~/scripts/resources_image.jsx")
                .Include("~/scripts/resources_video.jsx")
                .Include("~/scripts/resources_attachment.jsx")
                .Include("~/scripts/resources_thumbnail_list.jsx")
                .Include("~/scripts/resources_m3u8_list.jsx")
                .Include("~/scripts/resources_subfile_list.jsx")
                .Include("~/scripts/resources_zip_list.jsx")
                .Include("~/scripts/resources_update_access.jsx")
                .Include("~/scripts/resources_shared_file.jsx")
                .Include("~/scripts/resources.jsx")
                .Include("~/scripts/logs.jsx")
                .Include("~/scripts/file_recycle.jsx")
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
                .Include("~/scripts/department.jsx")
                .Include("~/scripts/department_detail.jsx")
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
            //shared init
            bundles.Add(new BabelBundle("~/scripts/shared_init")
                .Include("~/scripts/shared_init.jsx"));
            //shared image
            bundles.Add(new BabelBundle("~/scripts/shared")
               .Include("~/scripts/shared.jsx")
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
                .Include("~/css/org_chart.css")
            );
            bundles.Add(new StyleBundle("~/css/preview")
               .Include("~/css/preview.css")
            );
            bundles.Add(new StyleBundle("~/css/login")
                .Include("~/css/login.css")
            );
            bundles.Add(new StyleBundle("~/css/datepicker-orange")
                .Include("~/css/datepicker-orange.css")
            );
        }
    }
}
