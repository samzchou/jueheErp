<template>
    <section>
        <div class="page-title">
            <div>
                <span>
                    {{!isEdit?'应收款列表':'应收款编辑'}}
                </span>
            </div>
            <div>
                <el-button v-if="!isEdit" @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增应收款</el-button>
                <el-button v-else @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
               </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <template v-if="isLike">
                        <el-form-item label="模糊查找：" prop="keyword">
                            <el-input v-model="searchLike.keyword" clearable  style="width:150px" @blur="submitSearch"/>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="text" @click="isLike=false">高级查找</el-button>
                        </el-form-item>
                        </template>
                    <template v-else>
                        <el-form-item label="订单编号：" prop="serial">
                            <el-input v-model="searchForm.serial" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="货品名称：" prop="productName">
                            <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="物料号：" prop="materialNo">
                            <el-input v-model="searchForm.materialNo" clearable/>
                        </el-form-item>
                        <el-form-item label="客户：" prop="crmId">
                            <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                                <el-option v-for="item in crmList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="发票号：" prop="invoiceNumber">
                            <el-input v-model="searchForm.invoiceNumber" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="收款日期：" prop="createDate">
                            <el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">查找</el-button>
                    </el-form-item>
                    <el-form-item v-if="!isLike">
                        <el-button type="text" @click="isLike=true">模糊查找</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" ref="payedTable">
                <!-- <el-table-column type="expand">
                    <template slot-scope="scope">
                        <div>{{scope.row.children}}</div>
                    </template>
                </el-table-column> -->
                <el-table-column prop="sourceserial" label="原始订单号"/>
                <el-table-column prop="projectNo" label="项目号"/>
                <el-table-column prop="projectName" label="项目名称"/>
                <el-table-column prop="modelNo" label="梯号"/>
                <el-table-column prop="productName" label="部件名称"/>
                <el-table-column prop="count" label="数量" width="80"/>
                <el-table-column label="开票金额">
                    <template slot-scope="scope">
                        <span>{{parseMoney(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="invoiceNumber" label="发票号"/>
                <el-table-column prop="createDate" label="开票日期">
                     <template slot-scope="scope">
                        <span>{{parseDate(scope.row.createDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createByUser" label="开票人"/>
            </el-table>
            <div class="page-container">
                <div>本页合计金额：{{totalMoney | currency}}</div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div v-else class="form-plit">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" size="mini">
                <el-form-item label="收款单列表">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品待收款':'请选择右侧待收款订单货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" stripe  size="mini" style="width: 100%" max-height="500">
                            <div slot="empty">暂无选中的待收款货品</div>
                            <el-table-column prop="productName" label="项目名称"/>
                            <el-table-column label="收款金额" width="120">
                                <template slot-scope="scope">
                                    <span>{{scope.row.totalMoney | currency}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div>总计收款金额：<span>{{payMoney | currency}}</span></div>
                    </div>
                </el-form-item>
                <el-form-item prop="invoiceNumber" label="发票号">
                    <el-input v-model="ruleForm.invoiceNumber"/>
                </el-form-item>
                <el-form-item label="备注说明">
                    <el-input v-model="ruleForm.content"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0" icon="my-icon-save">确定收款</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>
                    <div><span>未收款订单列表</span></div>
                    <div>
                        <el-form :inline="true" :model="searchInput" :rules="searchRules" ref="searchInput" size="mini" @keyup.native.enter="searchFilter">
                            <!-- <el-form-item prop="crmId">
                                <el-select v-model="searchInput.crmId" placeholder="请选择客户" @change="submitSearch" style="width:150px"> 
                                    <el-option v-for="crm in setting.crm.filter(o=>{return o.typeId==2})" :key="crm.id" :label="crm.name" :value="crm.id"/>
                                </el-select>
                            </el-form-item> -->
                            <el-form-item label="按交付日期" prop="deliveryDate">
                                <el-select v-model="searchInput.deliveryDate" placeholder="请选择交付日期" @change="searchFilter" style="width:130px"> 
                                    <el-option v-for="(date,idx) in deliveryDateList" :key="idx" :label="parseDate(date)" :value="date"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-input suffix-icon="el-icon-search" placeholder="输入关键字" v-model="searchInput.keyword" clearable style="width:120px;"  @change="searchFilter"/>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="searchFilter">查询</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </h5>
                <el-table
                :data="oList" border fit highlight-current-row stripe  size="mini" height="400" @selection-change="selectionRow">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-row :gutter="10" v-for="(item,idx) in scope.row.children" :key="idx">
                            <el-col :span="1">{{idx+1}}.</el-col>
                            <el-col :span="6">{{item.productName}}</el-col>
                            <el-col :span="5">制单：{{parseDate(item.orderDate)}}</el-col>
                            <el-col :span="3">数量：{{item.count}} {{item.util}}</el-col>
                            <el-col :span="4">单价：{{item.price}}</el-col>
                            <el-col :span="5">合计：{{parseMoney(item)}}</el-col>
                        </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="sourceserial" label="原始订单号"/>
                    <el-table-column prop="projectNo" label="项目号"/>
                    <el-table-column prop="projectName" label="项目名称"/>
                    <el-table-column prop="modelNo" label="梯号" width="60px"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="订单金额">
                        <template slot-scope="scope">
                            {{calcMoney(scope.row)}}
                        </template>
                    </el-table-column>
                </el-table>
                <div style="padding:10px 0">
                    <span>共有{{orderTotal}}个原始订单，已合并为{{oList.length}}个订单</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
//import settings from '@/config/files/dataList.json';
export default {
    data(){
        return {
            currItem:null,
            searchInput:{
                crmId:'',
                deliveryDate:'',
                keyword:''
            },
            searchRules:{
                deliveryDate:[{required:true, message: '请选择交付日期', trigger: 'change'}]
            },
            listLoading:false,
            isEdit:false,
            total:0,
            query:{
                page:1,
                pagesize:50
            },
            orderTotal:0,
            typeList:[],//settings.type,
            orderList:[],
            oList:[],
            crmList:[],
            gridList:[],
            rowData:[],
            lastId:0,
            payMoney:0,
            totalMoney:0,
            isLike:true,
            searchLike:{
              keyword:''
            },
            searchForm:{
                serial:'',
                invoiceNumber:'',
                crmName:'',
                productName:'',
                crmId:'',
                materialNo:'',
                createDate:'',
            },
            ruleForm:{
                payType:2,
                createByUser:'',
                invoiceNumber:'',
                content:''
            },
            rules:{
                invoiceNumber: [
                    { required: true, message: '请输入发票号', trigger: 'blur'},
                ]
            },
            deliveryDateList:[],
            crmOrderIds:[]
        }
    },
    methods:{
        calcMoney(row){
            let money = 0;
            if(row.children && row.children.length){
                row.children.forEach(item=>{
                    money += item.count * item.price;
                })
            }
            row.totalMoney = money;
            return this.$options.filters['currency'](money);
        },
        detailPayedClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['payedTable'].toggleRowExpansion(row, row.extend);
        },
        parseCrm(id, key){
            let crm = _.find(this.crmList,{'id':id});
            if(!crm){
                return '--'
            }
            return crm[key] || '--';
        },
        getCrm(id, key){
            let crm = _.find(this.setting.crm, {'id':id});
            return crm[key];
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parseType(id){
            if(!id || id=='') return '';
            let type = _.find(this.typeList, {id:id});
            return type.name;
        },
        parseStoreNo(id){
            if(!id || id=='') return '';
            let type = _.find(this.storeNoList, {id:id});
            return type.name;
        },
        selectionRow(selection){
            //this.crmOrderIds = [];
            this.rowData = [];
            this.payMoney = 0;
            selection.forEach(item=>{
                /* if(item.orderIds && item.orderIds.length){
                    this.crmOrderIds = this.crmOrderIds.concat(item.orderIds);
                } */
                this.rowData.push(item);
                this.payMoney += item.totalMoney;
            })
        },
        submitSave(){
            this.crmOrderIds = [];
            let dataList = [], id = 0;
            this.rowData.forEach(item=>{
                console.log(item);
                this.crmOrderIds = this.crmOrderIds.concat(item.orderIds);
                this.lastId++;
                dataList.push({
                    id:this.lastId,
                    payType:this.ruleForm.payType,
                    invoiceNumber:this.ruleForm.invoiceNumber,
                    orderId:item.id,
                    orderIds:item.orderIds,
                    serial:item.serial,
                    sourceserial:item.sourceserial,
                    crmId:item.crmId,
                    crmName:item.crmName,
                    productName:'线槽总成',
                    modelNo:item.modelNo,
                    projectNo:item.projectNo,
                    projectName:item.projectName,
                    count:1,
                    price:item.totalMoney,
                    createByUser:this.$store.state.user.name,
                    content:this.ruleForm.content
                })
                /* row.children.forEach(item=>{
                    this.lastId++;
                    this.crmOrderIds.push(item.id);
                    let obj = {
                        id:this.lastId,
                        payType:this.ruleForm.payType,
                        invoiceNumber:this.ruleForm.invoiceNumber,
                        orderId:item.id,
                        serial:item.serial,
                        crmId:item.crmId,
                        crmName:item.crmName,
                        productName:item.productName,
                        materialNo:item.materialNo,
                        util:item.util,
                        price:item.price,
                        count:item.count,
                        createByUser:this.$store.state.user.name,
                        content:this.ruleForm.content
                    };
                    dataList.push(obj);
                }) */
            });
            //console.log('dataList', dataList, this.crmOrderIds);
            //return;
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addPatch',
                        collectionName: 'finance',
                        notNotice:true,
                        data:dataList
                    }
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.updateOrderData();
                    });
                }
            });
        },
        async updateOrderData(){
            let condition = {
                type:'updatePatch',
                collectionName: 'order',
                param:{'id':{$in:this.crmOrderIds}},
                set:{$set:{'isPayed':true,'flowStateId':11}}
            }
            let reuslt = await this.$axios.$post('mock/db', {data:condition});
            //this.isEdit = false;

            this.crmOrderIds = [];
            this.searchFilter();
            this._getLastId();

            this.query.page = 1;
            this.getList();
        },
        handleAdd(){
            this.isEdit = true;
            this._getLastId();
            this.getDeliveryDate();
            //this.getOrderList({typeId:1, flowStateId:1});
        },
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },
        submitSearch(flag){
            let params = {};
            if(this.isLike){
                let keyWord = this.searchLike.keyword;
                if(keyWord){
                    params = {
                        $or:[
                            {'serial':{'$regex':keyWord}},
                            {'sourceserial':{'$regex':keyWord}},
                            {'modelNo':{'$regex':keyWord}},
                            {'projectNo':{'$regex':keyWord}},
                            {'projectName':{'$regex':keyWord}},
                            {'invoiceNumber':{'$regex':keyWord}},
                            {'crmName':{'$regex':keyWord}},
                            {'content':{'$regex':keyWord}}
                        ]
                    };
                }
            }else{
                for(let k in this.searchForm){
                    if(this.searchForm[k] != '' && this.searchForm[k]){
                        if(_.isNumber(this.searchForm[k])){
                            params[k] = Number(this.searchForm[k]);
                        }else if(_.isArray(this.searchForm[k]) && k==='createDate'){
                            params[k] = {
                                $gte:this.searchForm[k][0],
                                $lte:this.searchForm[k][1]
                            }
                        }else if(_.isArray(this.searchForm[k])){
                            params[k] = {$in:this.searchForm[k]}
                        }else{
                            params[k] = {$regex:this.searchForm[k]};
                        }
                    }
                };
            }
            if(!flag){ // 不需要再做分页复位
                this.query = {
                    page:1,
                    pagesize:50
                }
            }
            this.getList(params);
        },
        searchFilter(){
            this.$refs['searchInput'].validate((valid) => {
                if(valid){
                    let params = {deliveryDate:this.searchInput.deliveryDate};
                    if(this.searchInput.crmId){
                        params.crmId = this.searchInput.crmId;
                    }
                    if(this.searchInput.keyword){
                        params['$or'] = [
                            {'serial':{'$regex':this.searchInput.keyword}},
                            {'sourceserial':{'$regex':this.searchInput.keyword}},
                            {'productName':{'$regex':this.searchInput.keyword}},
                            {'crmName':{'$regex':this.searchInput.keyword}},
                            {'materialNo':{'$regex':this.searchInput.keyword}},
                            {'projectNo':{'$regex':this.searchInput.keyword}},
                            {'boxNo':{'$regex':this.searchInput.keyword}},
                            {'model':{'$regex':this.searchInput.keyword}},
                            {'modelNo':{'$regex':this.searchInput.keyword}},
                            {'projectName':{'$regex':this.searchInput.keyword}},
                            {'caselNo':{'$regex':this.searchInput.keyword}},
                            {'content':{'$regex':this.searchInput.keyword}}
                        ]
                    }
                    this.getOrderList(params);
                }
            });
        },
        async getOrderList(params={}){
            // 发货单已下达
            let condition = {
                type:'listData',
                collectionName: 'order',
                sortby:'typeId',
                ascby:-1,
                data:_.merge({flowStateId:10, outTypeId:4}, params)//{typeId:2,flowStateId:10,isPayed:false}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            //console.log('getOrderList', result)
            this.orderTotal = result.total;
            this.oList = this.parseListData(result.list);
        },
        parseListData(datas){
            let lists = [];
            datas.forEach(item=>{
                item.orderIds = [];
                let index = _.findIndex(lists, {'sourceserial':item.sourceserial,'projectNo':item.projectNo,'boxNo':item.boxNo,'modelNo':item.modelNo});
                if(!~index){
                    item.children = [item];
                    item.orderIds.push(item.id);
                    lists.push(item);
                }else{
                     lists[index]['orderIds'].push(item.id);
                    lists[index]['children'].push(item);
                }
            });
            return lists;
            //this.gridList = lists;
        },
        // 获取已收款列表
        async getList(match={}){
            this.gridList = [];
            this.listLoading = true;
            let condition = {
                type:'listData',
                collectionName: 'finance',
                page:this.query.page,
                pagesize:this.query.pagesize,
                data:_.merge({payType:2},match)
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            result.list.forEach(item=>{
                this.totalMoney += item.count*item.price;
            });
            console.log('this.gridList', this.gridList);
            this.listLoading = false;
            this.totalMoney = 0;
            
        },
        async setChildren(orderIds){
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:{id:{$in:orderIds}}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            return result.list;
        },
        // 获取待交付日期
        async getDeliveryDate(){
            let condition = {
                type:'distinctData',
                collectionName: 'order',
                distinct:'deliveryDate',
                data:{'outTypeId':4,'isPayed':false}
            };

            let result = await this.$axios.$post('mock/db', {data:condition});
            result.sort();
            this.searchInput.deliveryDate = result[0];
            this.deliveryDateList = result;
        },

        async _getLastId(){
            let condition = {
                type:"getId",
                data:{
                    model:'store'
                }
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                this.lastId = result;
            }
        },
        async getSetting(){
            let condition = {
                type:"getData",
                collectionName:"setting",
                data:{}
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                //console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.crmList = _.filter(this.setting.crm, item=>{
                    return item.typeId == 2;
                });
                this.getList();
            }
        }
    },
    created(){
        this.getSetting();
    }
}
</script>

<style lang="scss" scoped>
    .edit-count{
        color:#999;
        >i{
            margin-left:5px;
            color:#e85810;
            font-size:16px;
            cursor: pointer;
        }

    }
    .editrow-form{
        /deep/ .el-input{
            width:60px;
            input{
                height:24px;
                line-height: 24px;
            }
        }
        /deep/ .el-button{
            padding: 5px 10px;
            font-size: 10px;
            margin-left: 5px;
        }
    }
    .form-plit{
        display: flex;
        padding:10px 0;
        h5{
            padding: 10px 0;
            font-size: 14px;
            display:flex;
            align-items:center;
            justify-content: space-between;
            span{
                color:#ff6c00;
                margin:0 5px;
            }
            /deep/ .el-form-item{
                margin-bottom: 0;
            }
        }
        /deep/ .el-form{
            flex:1;
            padding: 0 20px;
            box-sizing: border-box;
        }
        .grid-list{
            width:750px;
            flex:0 0 750px;
        }
    }
    .form-plist{
        //padding-right:25px;
        box-sizing:border-box;
        .edit-content{
            i{
                margin-left:5px;
                color:#e85810;
            }
            input{
                width: 30px;
                border: 1px solid #DDD;
                padding: 3px 5px;
                text-align: center;
                border-radius: 3px;
            }
        }
    }
    .page-container{
        padding: 10px 0;
        display:flex;
        align-items: center;
        justify-content: space-between;
    }
    .compare{
        display: flex;
        >div{
            flex:1;
            box-sizing: border-box;
            padding: 0 10px;
            >h3{
                font-size: 14px;
                border-bottom: 1px solid #DDD;
                line-height: 36px;
            }
            >ul{
                flex:1;
                box-sizing: border-box;
                >li{
                    line-height: 30px;
                    border-bottom: 1px solid #DDD;
                    display: flex;
                    >span{
                        &:first-child{
                            width:80px;
                            color:#417ce8;
                        }
                    }
                }
            }
        }
    }
    /deep/ .el-table{
        .cell{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            >i{
                font-size:14px;
                color:#EEE;
                margin-right:5px;
                &.payed{
                    color:green;
                }
            }
            .el-button{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
            }
        }
        /deep/ .el-table__expanded-cell{
            padding: 5px 10px;
            background-color: #e4f5ff;
            .el-form-item{
                width:32%;
                margin:0;
                .el-form-item__label{
                    font-weight: bold;
                }
            }
            .el-row{
                border-bottom:1px solid #cadde8;
                &:last-child{
                    border: 0;
                }
                .el-col{
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 25px;
                    >span{
                        &:first-child{
                            width:80px;
                            display: inline-block;
                            font-weight: bold;
                        }
                    }
                }
            }
            h5{
                line-height: 30px;
                border-bottom: 1px solid #DDD;
            }
            ul{
                li{
                    line-height: 30px;
                    border-bottom: 1px solid #EEE;
                    &:before{
                        margin-right:5px;
                        content:"●";
                    }
                }
            }
        }
    }
</style>
