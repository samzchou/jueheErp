export default {
    "menuList" : [
        {
            "label":"数据库配置",
            "icon":"cog",
            "children":[
                {"label":"数据库连接", "icon":"database", "path":"/options/database"},
                {"label":"数据集", "icon":"table", "path":"/options/collection"},
                {"label":"数据表", "icon":"file-text-o", "path":"/options/document"}
            ]
        },
        {
            "label":"表单配置",
            "icon":"rss",
            "children":[
                {"label":"表单列表", "icon":"list-ul", "path":"/form/list"},
                {"label":"新建表单", "icon":"pencil", "path":"/form/edit"},
            ]
        },
        {
            "label":"图表配置",
            "icon":"line-chart",
            "children":[
                {"label":"图表列表", "icon":"list-ul", "path":"/chart/list"},
                {"label":"新建图表", "icon":"pencil", "path":"/chart/edit"},
            ]
        }
    ]
    
}