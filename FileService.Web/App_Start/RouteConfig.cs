﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace FileService.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            //routes.RouteExistingFiles = true;
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("css/{*.*}");
            routes.IgnoreRoute("scripts/{*.*}");
            routes.IgnoreRoute("image/{*.*}");
            routes.IgnoreRoute("pdfview/{*.*}");
            routes.IgnoreRoute("hlsplayer/{*.*}");

            routes.MapRoute(
                name: "shared",
                url: "shared/{id}",
                defaults: new { controller = "shared", action = "init", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Image",
                url: "{controller}/{action}/{id}.{ext}",
                defaults: new { controller = "admin", action = "index", id = UrlParameter.Optional, ext = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "admin", action = "index", id = UrlParameter.Optional }
            );

        }
    }
}
