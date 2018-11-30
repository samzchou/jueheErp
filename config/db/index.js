//const dbConfig = require('../files/dbConfig.json');
module.exports = {
    dbConect:{"dataUrl":"127.0.0.1","dataPort":"27017","dataName":"test","username":"","password":""}, //47.91.231.119
    /*----------数据表Collections-----------*/
    collectionList:[
        {"name":"用户列表","colname":"user"}
    ],
    collections:{
        /*--------------全局数据设定--------------*/
        setting:{
            name:{
                type:String,
                default:'opts',
            },
            content:{
                type:Object,
                default:''
            }
        },
        /*--------------ID自增计数器--------------*/
        counters:{
            model:{
                type:String,
                default:'',
            },
            count:{
                type:Number,
                default:0
            }
        },
        /*----------权限数据-----------*/
        role : {
            id : {
                type: Number, 
                key:'id',
                default:0, 
                label:'ID',
                sort:0, 
                notForm:true
            },
            name : {
                type:String, 
                key:'name',
                default:'',
                widgetType:'input',
                subtype:'text',
                width:200,
                label:'名称定义',
                rules:[
                    {"required": true, "message": '请输入名称', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:1
            },
            tag : {
                type:String, 
                key:'tag',
                default:'',
                widgetType:'input',
                subtype:'text',
                width:200,
                label:'别名',
                rules:[
                    {"required": true, "message": '请输入别名', "trigger": 'blur'},
                    {"pattern": "^[A-Za-z]+$","message": "正则验证失败: 须匹配英文字母","trigger": "blur"}
                ],
                inSearch:true,
                sort:2
            },
            content : {
                type:String, 
                key:'content',
                default:'',
                widgetType:'input', 
                width:500,
                label:'描述',
                sort:4
            }
        },
        /*----------组织部门-----------*/
        org : {
            id : {
                type: Number, 
                default:0, 
                key:'id',
                label:'ID',
                sort:0, 
                notForm:true
            },
            name : {
                type:String,  
                widgetType:'input',
                subtype:'text',
                key:'name',
                label:'部门名称',
                width:200,
                rules:[
                    {"required": true, "message": '请输入部门名称', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:1
            },
            content : {
                type:String, 
                default:'',
                widgetType:'input', 
                key:'content',
                width:500,
                label:'描述',
                sort:4
            }
        },
        /*----------职位-----------*/
        pos : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            orgId : {
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'所属部门', 
                key:'orgId',
                valueSet:'org',
                inSearch:true,
                sort:1
            },
            name : {
                type:String,  
                widgetType:'input',
                subtype:'text',
                label:'职位名称',
                key:'name',
                width:200,
                inSearch:true,
                sort:2
            },
            content : {
                type:String, 
                widgetType:'input', 
                label:'描述',
                key:'content',
                width:500,
                sort:4
            }
        },
        /*----------仓库库位-----------*/
        storeNo:{
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            name : {
                type:String,  
                width:200,
                widgetType:'input',
                subtype:'text',
                label:'库位别名',
                key:'name',
                rules:[
                    {"required": true, "message": '请输入名称', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:1
            },
            content : {
                type:String, 
                widgetType:'input', 
                label:'描述',
                key:'content',
                sort:2
            }
        },
        /*----------业务分类-----------*/
        type : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0,
                notForm:true
            },
            name : {
                type:String, 
                widgetType:'input',
                subtype:'text',
                width:200,
                label:'分类名称',
                key:'name',
                rules:[
                    {"required": true, "message": '请输入名称', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:1
            },
            content : {
                type:String, 
                widgetType:'input', 
                label:'描述',
                key:'content',
                sort:2
            }
        },
        /*----------产品分类-----------*/
        ptype : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0,
                notForm:true
            },
            typeId : {
                type: Number, 
                default:0, 
                label:'业务分类',
                key:'typeId',
                sort:0,
                notForm:true
            },
            name : {
                type:String, 
                widgetType:'input',
                subtype:'text',
                width:200,
                label:'分类名称',
                key:'name',
                rules:[
                    {"required": true, "message": '请输入名称', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:1
            },
            content : {
                type:String, 
                widgetType:'input', 
                label:'描述',
                key:'content',
                sort:2
            }
        },
        /*----------付款方式-----------*/
        payType : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            name : {
                type:String,  
                widgetType:'input',
                subtype:'text',
                label:'名称定义',
                key:'name',
                width:200,
                inSearch:true,
                rules:[
                    {"required": true, "message": '请输入名称', "trigger": 'blur'}
                ],
                sort:1
            },
            content : {
                type:String, 
                widgetType:'input', 
                label:'描述',
                key:'content',
                width:500,
                sort:2
            }
        },
        /*----------流程状态数据-----------*/
        flowState:{
            id:{
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                notForm:true,
                sort:0
            },
            typeId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'所属业务类别', 
                key:'typeId',
                valueSet:'type',
                sort:1
            },
            name:{
                type:String, 
                default:'', 
                widgetType:'input',
                width:100,
                subtype:'text',
                label:'流程状态',
                key:'name',
                inSearch:true,
                sort:2
            },
            content : {
                type:String, 
                default:'',
                widgetType:'input',
                label:'备注说明',
                key:'content',
                sort:3
            }
        },
        /*----------用户数据-----------*/
        user : {
            id : {
                type:Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            roles : {
                type:Array, 
                default:[], 
                widgetType:'select',
                multiple: true,
                label:'权限', 
                key:'roles',
                rules: [
                    {"type": "array","required": true,"min": 1,"message": "请至少选1项"}
                ],
                valueSet:'role',
                sort:1
            },
            posId:{
                type:Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                width:150,
                label:'职位', 
                key:'posId',
                valueSet:'pos',
                sort:3
            },
            username : {
                type:String, 
                widgetType:'input',
                default:'', 
                subtype:'text',
                width:200,
                label:'用户名',
                key:'username',
                rules:[
                    {"required": true, "message": '请输入用户名', "trigger": 'blur'},
                    {"min": 3,"max": 10,"type": "string","message": "长度在3~10个单元","trigger": "blur"}
                ],
                inSearch:true,
                sort:4
            },
            password : {
                type:String, 
                widgetType:'input',
                subtype:'password',
                default:'juehe123456', 
                width:200,
                label:'登录密码',
                key:'password',
                rules:[
                    {"required": true, "message": '请输入密码', "trigger": 'blur'},
                    {"min": 5,"type": "string","message": "长度至少在5个单元","trigger": "blur"}
                ],
                sort:5
            },
            name : {
                type:String, 
                widgetType:'input',
                subtype:'text',
                width:150,
                default:'', 
                label:'姓名',
                key:'name',
                rules:[
                    {"required": true, "message": '请输入姓名', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:6
            },
            token :{
                type:String,  
                widgetType:'input', 
                label:'TOKEN',
                key:'token',
                notForm:true,
                sort:13
            },
            content :{
                type:String,  
                widgetType:'input', 
                label:'备注说明',
                key:'content',
                sort:14
            }
        },
        /*----------客户数据-----------*/
        crm : {
            id : {
                type: Number, 
                default:1, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            typeId : {
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'所属类别', 
                key:'typeId',
                valueSet:'type',
                inSearch:true,
                sort:1
            },
            isuse:{
                type:Boolean, 
                default:true, 
                widgetType:'switch',
                label:'启用', 
                key:'isuse',
                sort:2
            },
            crmNo:{
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'客户ID',
                key:'crmNo',
                sort:3
            },
            name : {
                type:String, 
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'客户名称',
                key:'name',
                inSearch:true,
                rules:[
                    {"required": true, "message": '请输入客户名称', "trigger": 'blur'}
                ],
                sort:4
            },
            revenueNo : {
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'税号',
                key:'revenueNo',
                sort:5
            },
            bank:{
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'开户银行',
                key:'bank',
                sort:5
            },
            bankNo : {
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'银行账号',
                key:'bankNo',
                sort:6
            },
            address : {
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'联系地址',
                key:'address',
                sort:6
            },
            contactName : {
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'联系人',
                width:100,
                key:'contactName',
                rules:[
                    {"required": true, "message": '请输入联系人', "trigger": 'blur'}
                ],
                sort:7
            },
            contactPhone : {
                type:String,
                default:'', 
                widgetType:'input',
                subtype:'text',
                label:'联系电话',
                width:200,
                key:'contactPhone',
                rules:[
                    {"required": true, "message": '请输入联系人', "trigger": 'blur'}
                ],
                sort:8
            },
            payTypeId:{
                type: Number, 
                widgetType:'select',
                default:'', 
                label:'付款方式',
                key:'payTypeId',
                valueSet:'payType',
                sort:9
            },
            payTimes:{
                type: String, 
                default:'',
                widgetType:'input', 
                subtype:'text',
                width:150,
                append:'天',
                label:'付款期',
                key:'payTimes',
                rules:[
                    {"required": true, "message": '请输入付款期', "trigger": 'blur'}
                ],
                sort:10
            },
            content : {
                type:String, 
                default:'',
                widgetType:'input',
                label:'备注说明',
                key:'content',
                sort:11
            },
            updateDate:{
                type: Number, 
                default:new Date().getTime(), 
                widgetType:'date',
                label:'更新日期',
                notForm:true,
                sort:13
            }
        },
        /*----------产品数据-----------*/
        product : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                sort:0, 
                notForm:true
            },
            typeId : {
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'业务分类', 
                key:'typeId',
                valueSet:'type',
                rules:[
                    {"required": true, "message": '请选择业务分类', "trigger": 'change'}
                ],
                emit:['emit_crmId'],
                inSearch:true,
                sort:1, 
            },
            ptypeId : {
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'产品分类', 
                key:'ptypeId',
                valueSet:'ptype',
                rules:[
                    {"required": true, "message": '请选择类别', "trigger": 'change'}
                ],
                emit:['emit_crmId'],
                inSearch:true,
                sort:1, 
            },
            crmId : {
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'所属客户', 
                key:'crmId',
                valueSet:'crm',
                inSearch:true,
                sort:2
            },
            isuse:{
                type:Boolean, 
                default:true, 
                widgetType:'switch',
                label:'启用', 
                key:'isuse',
                sort:3
            },
            name : {
                type:String, 
                default:'', 
                widgetType:'input',
                subtype:'text',
                width:200,
                label:'产品名称',
                key:'name',
                inSearch:true,
                rules:[
                    {"required": true, "message": '请输入产品名称', "trigger": 'blur'}
                ],
                sort:4
            },
            model : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'规格/梯型',
                key:'model',
                sort:5
            },
            modelNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'型号/梯号',
                key:'modelNo',
                sort:6
            },
            parentMater:{
                type:String, 
                default:'', 
                widgetType:'select',
                label:'父级物料号/版本号',
                key:'parentMater',
                sort:7
            },
            materialNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'物料号/版本号',
                key:'materialNo',
                sort:8
            },
            caselNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'图号/版本号',
                key:'caselNo',
                sort:9
            },
            util:{
                type:String, 
                default:'', 
                widgetType:'input',
                width:100,
                subtype:'text', 
                label:'单位',
                key:'util',
                rules:[
                    {"required": true, "message": '请输入单位', "trigger": 'blur'}
                ],
                sort:10
            },
            price:{
                type: Number, 
                default:0, 
                widgetType:'number',
                width:100,
                decimal: 2,
                min:0,
                prepend:'￥',
                append:'元',
                label:'单价',
                key:'price',
                rules:[
                    {"required": true, "message": '请输入单价', "trigger": 'blur'}
                ],
                sort:11
            },
            content : {
                type:String, 
                default:'',
                widgetType:'richtext', 
                label:'备注说明',
                key:'content',
                sort:12
            },
            updateDate:{
                type: Number, 
                default:new Date().getTime(), 
                widgetType:'date', 
                label:'更新日期',
                key:'updateDate',
                sort:13, 
                notForm:true
            }
        },
        /*----------订单数据-----------*/
        order : {
            id:{
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                notForm:true,
                sort:0
            },
            isPayed:{
                type: Boolean,
                default:false,
                label:'是否已付款', 
                key:'isPayed',
                notForm:true,
                sort:1
            },
            typeId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'业务类别', 
                key:'typeId',
                valueSet:'type',
                notForm:true,
                sort:1
            },
            ptypeId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'产品类别', 
                key:'ptypeId',
                valueSet:'ptype',
                notForm:true,
                sort:2
            },
            flowStateId:{
                type: Number, 
                width:100,
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'流程状态', 
                key:'flowStateId',
                valueSet:'flowState',
                byId:'typeId',
                inSearch:true,
                notForm:true,
                sort:3
            },
            serial:{
                type:String, 
                default:'', 
                widgetType:'input',
                width:250,
                subtype:'text',
                label:'订单编号',
                key:'serial',
                autoHash:true,
                rules: [
                    {"required": true,"message": "请填写编号","trigger": "blur"}
                ],
                sort:4
            },
            crmId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'客户ID', 
                key:'crmId',
                valueSet:'crm',
                notForm:true,
                sort:5
            },
            crmName:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                multiple:false,
                label:'关联客户名称',
                key:'crmName',
                sort:6
            },
            crmNo:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                multiple:false,
                label:'客户编号ID',
                key:'crmNo',
                sort:7
            },
            productId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'产品ID', 
                key:'productId',
                valueSet:'product',
                sort:8
            },
            productName:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                label:'产品名称',
                key:'productName',
                rules: [
                    {"required": true,"message": "请选择产品","trigger": "change"}
                ],
                sort:9
            },
            projectNo:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                label:'项目号',
                key:'projectNo',
                sort:10
            },
            projectName:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                label:'项目名称',
                key:'projectName',
                sort:11
            },
            boxNo:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                label:'箱号',
                key:'boxNo',
                sort:12
            },
            model : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'规格/梯型',
                key:'model',
                sort:13
            },
            modelNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'型号/梯号',
                key:'modelNo',
                sort:14
            },
            materialNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'物料号/版本号',
                key:'materialNo',
                sort:15
            },
            caselNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'图号/版本号',
                key:'caselNo',
                sort:16
            },
            util:{
                type:String, 
                width:100,
                default:'',
                widgetType:'input',
                subtype:'text', 
                label:'单位',
                key:'util',
                sort:17
            },
            price:{
                type: Number, 
                width:100,
                default:0, 
                widgetType:'number',
                decimal1: 2,
                min:0,
                prepend:'￥',
                append:'元',
                label:'单价',
                key:'price',
                rules:[
                    {"required": true, "message": '请输入单价', "trigger": 'blur'}
                ],
                sort:18
            },
            count:{
                type: Number, 
                width:100,
                default:0, 
                widgetType:'number',
                label:'数量',
                min:1,
                key:'count',
                rules:[
                    {"required": true, "message": '请输入数量', "trigger": 'blur'}
                ],
                sort:19
            },
            releaseCount:{
                type: Number, 
                width:100,
                default:'', 
                widgetType:'number',
                label:'实际数量',
                key:'releaseCount',
                sort:19
            },
            orderDate:{
                type: Number, 
                default:new Date().getTime(), 
                widgetType:'date', 
                label:'制单日期',
                key:'orderDate',
                sort:20
            },
            deliveryDate:{
                type: Number, 
                default:new Date().getTime(), 
                widgetType:'date', 
                label:'交付日期',
                key:'deliveryDate',
                notForm:true,
                sort:21
            },
            content:{
                type:String, 
                widgetType:'input',
                default:'',
                label:'备注说明',
                key:'content',
                sort:22
            },
            createByUser:{
                type: String, 
                default:'', 
                widgetType:'input',
                label:'创建者',
                key:'createByUser',
                notForm:true,
                sort:23
            },
            updateDate:{
                type: Number, 
                default:new Date().getTime(), 
                label:'更新日期',
                key:'updateDate',
                notForm:true,
                sort:24
            }
        },
        /*----------仓库数据（入库出库）-----------*/
        store : {
            id:{
                type: Number, 
                default:0, 
                label:'ID',
                notForm:true,
                sort:0
            },
            isPayed:{
                type: Boolean,
                default:false,
                label:'是否已付款', 
                key:'isPayed',
                notForm:true,
                sort:1         
            },
            typeId:{
                type: Number, 
                default:'', 
                widgetType:'radio',
                label:'订单',
                key:'typeId',
                valueSet:'type',
                sort:2
            },
            orderId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'订单',
                key:'orderId',
                valueSet:'order',
                byId:'typeId',
                rules:[
                    {"required": true, "message": '请选择订单', "trigger": 'change'}
                ],
                sort:2
            },
            serial:{
                type:String, 
                widgetType:'input',
                label:'订单编号',
                key:'serial',
                sort:3
            },
			crmId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'客户ID', 
                key:'crmId',
                valueSet:'crm',
                notForm:true,
                sort:4
            },
            crmName:{
                type: String, 
                width:200,
                default:'', 
                widgetType:'input',
                multiple:false,
                label:'关联客户名称',
                key:'crmName',
                sort:5
            },
            productName:{
                type:String, 
                widgetType:'input',
                label:'货品名称',
                key:'productName',
                sort:6
            },
			materialNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'物料号/版本号',
                key:'materialNo',
                sort:7
            },
            storeTypeId:{
                type: Number, 
                default:'', 
                widgetType:'radio',
                label:'入库分类', 
                key:'storeTypeId',
                valueSet:'storeType',
                notForm:true,
                sort:8
            },
            storeNoId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'库位', 
                key:'storeNoId',
                valueSet:'storeNo',
                rules:[
                    {"required": true, "message": '请选择库位', "trigger": 'change'}
                ],
                inSearch:true,
                sort:9
            },
            count:{
                type: Number, 
                default:0, 
                widgetType:'number',
                label:'入库数量',
                min:1,
                key:'count',
                rules:[
                    {"required": true, "message": '请输入数量', "trigger": 'blur'}
                ],
                sort:10
            },
            incount:{
                type: Number, 
                default:0, 
                widgetType:'number',
                label:'库存数量',
                key:'incount',
                sort:11
            },
            outcount:{
                type: Number, 
                default:0, 
                widgetType:'number',
                label:'出库数量',
                key:'outcount',
                sort:12
            },
            outTypeId:{
                type: Number, 
                default:'', 
                widgetType:'radio',
                label:'出库去向', 
                key:'outTypeId',
                notForm:true,
                sort:13
            },
            content:{
                type:String, 
                widgetType:'input',
                label:'备注说明',
                key:'content',
                sort:14
            },
            updateContent:{
                type:String, 
                widgetType:'input',
                label:'出库备注说明',
                key:'updateContent',
                sort:15
            },
            createByUser:{
                type: String, 
                default:'', 
                label:'创建者',
                key:'createByUser',
                notForm:true,
                sort:16
            },
            createDate:{
                type: Number, 
                default:new Date().getTime(), 
                label:'创建日期',
                notForm:true,
                key:'createDate',
                sort:17
            },
            updateByUser:{
                type: String, 
                default:'', 
                label:'出库者',
                key:'updateByUser',
                notForm:true,
                sort:18
            },
            updateDate:{
                type: Number, 
                default:new Date().getTime(), 
                label:'更新日期',
                notForm:true,
                key:'updateDate',
                sort:19
            }
        },
        /*----------财务-----------*/
        finance : {
            id : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'id',
                notForm:true,
                sort:0
            },
            payType : {
                type: Number, 
                default:0, 
                label:'应收支类型',
                key:'payType',
                notForm:true,
                sort:1
            },
            orderId : {
                type: Number, 
                default:0, 
                label:'ID',
                key:'orderId',
                notForm:true,
                sort:2
            },
            serial:{
                type:String, 
                default:'', 
                widgetType:'input',
                width:150,
                subtype:'text',
                label:'订单编号',
                key:'serial',
                notForm:true,
                inSearch:true,
                sort:2
            },
			crmId:{
                type: Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'客户ID', 
                key:'crmId',
                valueSet:'crm',
                notForm:true,
                sort:3
            },
            crmName:{
                type: String, 
                widgetType:'input',
                width:150,
                subtype:'text',
                label:'客户名称',
                key:'crmName',
                notForm:true,
                inSearch:true,
                sort:4
            },
            productName:{
                type: String, 
                widgetType:'input',
                subtype:'text',
                label:'产品',
                key:'productName',
                notForm:true,
                inSearch:true,
                sort:5
            },
			materialNo : {
                type:String, 
                default:'', 
                widgetType:'input',
                width:200,
                subtype:'text',
                label:'物料号/版本号',
                key:'materialNo',
                sort:6
            },
            util:{
                type:String, 
                width:100,
                default:'',
                widgetType:'input',
                subtype:'text', 
                label:'单位',
                key:'util',
                notForm:true,
                sort:7
            },
            price:{
                type: Number, 
                width:100,
                default:0, 
                widgetType:'number',
                decimal1: 2,
                min:0,
                prepend:'￥',
                append:'元',
                label:'单价',
                key:'price',
                notForm:true,
                sort:8
            },
            count:{
                type: Number, 
                width:100,
                default:0, 
                widgetType:'number',
                label:'数量',
                min:1,
                key:'count',
                notForm:true,
                sort:9
            },
            invoiceNumber:{
                type: String, 
                widgetType:'input',
                subtype:'text',
                label:'发票号',
                key:'invoiceNumber',
                rules:[
                    {"required": true, "message": '请输入发票号', "trigger": 'blur'}
                ],
                inSearch:true,
                sort:10
            },
            createDate:{
                type: Number, 
                default:new Date().getTime(), 
                widgetType:'date',
                subtype:'daterange',
                label:'日期',
                key:'createDate',
                notForm:true,
                inSearch:true,
                sort:11
            },
            createByUser:{
                type: String, 
                default:'', 
                label:'操作者',
                key:'createByUser',
                notForm:true,
                sort:12
            },
            content:{
                type: String, 
                widgetType:'input',
                label:'备注说明',
                key:'content',
                sort:13
            }
        },
    }
	
};

