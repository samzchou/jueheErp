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
                default:0
            },
            name : {
                type:String,
                default:''
            },
            tag : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------组织部门-----------*/
        org : {
            id : {
                type: Number,
                default:0
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------职位-----------*/
        pos : {
            id : {
                type: Number,
                default:0
            },
            orgId : {
                type: Number,
                default:''
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------仓库库位-----------*/
        storeNo:{
            id : {
                type: Number,
                default:0
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------业务分类-----------*/
        type : {
            id : {
                type: Number,
                default:0
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------产品分类-----------*/
        ptype : {
            id : {
                type: Number,
                default:0
            },
            typeId : {
                type: Number,
                default:0
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------付款方式-----------*/
        payType : {
            id : {
                type: Number,
                default:0
            },
            name : {
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------流程状态数据-----------*/
        flowState:{
            id:{
                type: Number,
                default:0
            },
            typeId:{
                type: Number,
                default:0
            },
            name:{
                type:String,
                default:''
            },
            content : {
                type:String,
                default:''
            }
        },
        /*----------用户数据-----------*/
        user : {
            id : {
                type:Number,
                default:0
            },
            roles : {
                type:Array,
                default:[]
            },
            posId:{
                type:Number,
                default:0
            },
            username : {
                type:String,
                default:''
            },
            password : {
                type:String,
                default:'juehe123456'
            },
            name : {
                type:String,
                default:''
            },
            token :{
                type:String,
                default:''
            },
            content :{
                type:String,
                default:''
            }
        },
        /*----------客户数据-----------*/
        crm : {
            id : {
                type: Number,
                default:0
            },
            typeId : {
                type: Number,
                default:0
            },
            isuse:{
                type:Boolean,
                default:true
            },
            crmNo:{
                type:String,
                default:''
            },
            name : {
                type:String,
                default:''
            },
            revenueNo : {
                type:String,
                default:''
            },
            bank:{
                type:String,
                default:''
            },
            bankNo : {
                type:String,
                default:''
            },
            address : {
                type:String,
                default:''
            },
            contactName : {
                type:String,
                default:''
            },
            contactPhone : {
                type:String,
                default:''
            },
            payTypeId:{
                type: Number,
                default:0
            },
            payTimes:{
                type: String,
                default:''
            },
            content : {
                type:String,
                default:''
            },
            updateDate:{
                type: Number,
                default:new Date().getTime()
            }
        },
        /*----------产品数据-----------*/
        product : {
            id : {
                type: Number,
                default:0
            },
            typeId : {
                type: Number,
                default:0
            },
            ptypeId : {
                type: Number,
                default:0
            },
            crmId : {
                type: Number,
                default:0
            },
            isuse:{
                type:Boolean,
                default:true
            },
            name : {
                type:String,
                default:''
            },
            model : {
                type:String,
                default:''
            },
            modelNo : {
                type:String,
                default:''
            },
            parentMater:{
                type:String,
                default:''
            },
            materialNo : {
                type:String,
                default:''
            },
            caselNo : {
                type:String,
                default:''
            },
            util:{
                type:String,
                default:''
            },
            price:{
                type: Number,
                default:0
            },
            content : {
                type:String,
                default:''
            },
            updateDate:{
                type: Number,
                default:new Date().getTime()
            }
        },
        /*----------订单数据-----------*/
        order : {
            id:{
                type: Number,
                default:0
            },
            isPayed:{
                type: Boolean,
                default:false
            },
            typeId:{
                type: Number,
                default:0
            },
            ptypeId:{
                type: Number,
                default:0
            },
            flowStateId:{
                type: Number,
                default:0
            },
            serial:{
                type:String,
                default:''
            },
            dserial:{
                type:String,
                default:''
            },
            sourceserial:{
                type:String,
                default:''
            },
            crmId:{
                type: Number,
                default:0
            },
            crmName:{
                type: String,
                default:''
            },
            productId:{
                type: Number,
                default:0
            },
            productName:{
                type: String,
                default:''
            },
            projectNo:{
                type: String,
                default:''
            },
            dprojectNo:{
                type: String,
                default:''
            },
            projectName:{
                type: String,
                default:''
            },
            boxNo:{
                type: String,
                default:''
            },
            model : {
                type:String,
                default:''
            },
            modelNo : {
                type:String,
                default:''
            },
            dmodelNo : {
                type:String,
                default:''
            },
            materialNo : {
                type:String,
                default:''
            },
            caselNo : {
                type:String,
                default:''
            },
            util:{
                type:String,
                default:''
            },
            price:{
                type: Number,
                default:0
            },
            count:{
                type: Number,
                default:0
            },
            releaseCount:{
                type: Number,
                default:0
            },
            orderDate:{
                type: Number,
                default:new Date().getTime()
            },
            deliveryDate:{
                type: Number,
                default:new Date().getTime()
            },
			outTypeId:{
				type: Number,
                default:0
			},
            content:{
                type:String,
                default:''
            },
            createByUser:{
                type: String,
                default:''
            },
            updateDate:{
                type: Number,
                default:new Date().getTime()
            }
        },
        /*----------订单上传原始数据-----------*/
        orderUpload : {
 			isPayed:{
				type:Boolean,
				default:false
			},
            flowStateId:{
                type: Number,
                default:0
            },
            typeId:{
                type: Number,
                default:0
            },
            ptypeId:{
                type: Number,
                default:0
            },
            sourceserial:{
                type:String,
                default:''
            },
            crmId:{
                type: Number,
                default:0
            },
            crmName:{
                type: String,
                default:''
            },
            productId:{
                type: Number,
                default:0
            },
            productName:{
                type: String,
                default:''
            },
            projectNo:{
                type: String,
                default:''
            },
            projectName:{
                type: String,
                default:''
            },
            boxNo:{
                type: String,
                default:''
            },
            model : {
                type:String,
                default:''
            },
            modelNo : {
                type:String,
                default:''
            },
            materialNo : {
                type:String,
                default:''
            },
            caselNo : {
                type:String,
                default:''
            },
            util:{
                type:String,
                default:''
            },
            price:{
                type: Number,
                default:0
             },
            count:{
                type: Number,
                default:0
            },
            orderDate:{
                type: Number,
                default:new Date().getTime()
            },
            deliveryDate:{
                type: Number,
                default:new Date().getTime()
            },
            content:{
                type:String,
                default:''
            },
            createByUser:{
                type: String,
                default:''
            },
            updateDate:{
                type: Number,
                default:new Date().getTime()
            }
        },
        /*----------仓库数据（入库出库）-----------*/
        store : {
            id:{
                type: Number,
                default:0
            },
            isPayed:{
                type: Boolean,
                default:false
            },
            typeId:{
                type: Number,
                default:0
            },
            orderId:{
                type: Number,
                default:0
            },
			orderIds:{
				type:Array,
				default:[]
			},
            serial:{
                type:String,
                default:''
            },
			crmId:{
                type: Number,
                default:0
            },
            crmName:{
                type: String,
                default:''
            },
            productName:{
                type:String,
                default:''
            },
			materialNo : {
                type:String,
                default:''
            },
            storeTypeId:{
                type: Number,
                default:0
            },
            storeNoId:{
                type: Number,
                default:0
            },
            count:{
                type: Number,
                default:0
            },
            incount:{
                type: Number,
                default:0
            },
            outcount:{
                type: Number,
                default:0
            },
            outTypeId:{
                type: Number,
                default:0
            },
            content:{
                type:String,
                default:''
            },
            updateContent:{
                type:String,
                default:''
            },
            createByUser:{
                type: String,
                default:''
            },
            createDate:{
                type: Number,
                default:new Date().getTime()
            },
            updateByUser:{
                type: String,
                default:''
            },
            updateDate:{
                type: Number,
                default:new Date().getTime()
            }
        },
        /*----------财务-----------*/
        finance : {
            id : {
                type: Number,
                default:0
            },
            payType : {
                type: Number,
                default:0
            },
            orderId : {
                type: Number,
                default:0
            },
			orderIds : {
                type: Array,
                default:[]
            },
            serial:{
                type:String,
                default:''
            },
			sourceserial:{
				type:String,
                default:''
			},
			crmId:{
                type: Number,
                default:''
            },
            crmName:{
                type: String,
                default:''
            },
            productName:{
                type: String,
                default:''
            },
			materialNo : {
                type:String,
                default:''
            },
			modelNo:{
                type:String,
                default:''
            },
			projectNo:{
                type:String,
                default:''
            },
			projectName:{
                type:String,
                default:''
            },
            util:{
                type:String,
                default:''
            },
            price:{
                type: Number,
                default:0
            },
            count:{
                type: Number,
                default:0
            },
            invoiceNumber:{
                type: String,
                default:''
            },
            createDate:{
                type: Number,
                default:new Date().getTime()
            },
            createByUser:{
                type: String,
                default:''
            },
            content:{
                type: String,
                default:''
            }
        },
    }

};

