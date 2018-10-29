//const dbConfig = require('../files/dbConfig.json');
module.exports = {
    dbConect:{"dataUrl":"127.0.0.1","dataPort":"27017","dataName":"erp","username":"","password":""},
    /*----------数据表Collections-----------*/
    collectionList:[
        {"name":"用户列表","colname":"user"}
    ],
    collections:{
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
            orgId:{
                type:Number, 
                default:'', 
                widgetType:'select',
                multiple:false,
                label:'部门', 
                width:150,
                key:'orgId',
                valueSet:'org',
                inSearch:true,
                emit:['emit_posId'],
                sort:2
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
        }
        
    }
	
};

