export default {
    "menuList" : [
        {
            "label":"基础数据配置",
            "icon":"cog",
            "children":[
                {"label":"系统权限", "icon":"list-ul", "path":"/options/role"},
                {"label":"机构部门", "icon":"list-ul", "path":"/options/org"},
                {"label":"职务", "icon":"list-ul", "path":"/options/pos"},
                {"label":"仓库库位", "icon":"list-ul", "path":"/options/storeNo"},
                {"label":"业务分类", "icon":"list-ul", "path":"/options/type"},
                {"label":"产品分类", "icon":"list-ul", "path":"/options/ptype"},
                {"label":"付款方式", "icon":"list-ul", "path":"/options/payType"},
                {"label":"流程状态", "icon":"list-ul", "path":"/options/flowState"}
            ]
        },
        {
            "label":"元数据配置",
            "icon":"rss",
            "children":[
                {"label":"用户管理", "icon":"list-ul", "path":"/meta/user"},
                {"label":"客户管理", "icon":"list-ul", "path":"/meta/crm"},
                {"label":"产品管理", "icon":"list-ul", "path":"/meta/product"}
            ]
        },
        {
            "label":"订单",
            "icon":"ils",
            "children":[
                {"label":"采购", "icon":"list-ul", "path":"/order/buy"},
                {"label":"销售", "icon":"pencil", "path":"/order/sale"},
            ]
        }
    ]
    
}