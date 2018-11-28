<template>
    <section>
        <div class="page-title">
            <div>
                <span>
                    {{!isEdit?'应付款列表':'应付款编辑'}}
                </span>
            </div>
            <div>
                <el-button v-if="!isEdit" @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增应付款</el-button>
                <el-button v-else @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
               </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="客户名称" prop="crmName">
                        <el-input v-model="searchForm.crmName" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="货品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                    </el-form-item>                    
                    <el-form-item label="付款日期：" prop="createDate">
                        <el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row size="mini" max-height="400">
                <el-table-column label="No." width="70px" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="serial" label="订单编号" width="120">
                    <template slot-scope="scope">
                        <el-button type="text" @click="showOrderInfo(scope.row)">{{scope.row.serial}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="crmName" label="客户名称" width="250">
                    <template slot-scope="scope">
                        <span>{{scope.row.crmName}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="productName" label="付款货品" width="250">
                    <template slot-scope="scope">
                        <span>{{scope.row.productName}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="materialNo" label="物料号" width="120">
                    <template slot-scope="scope">
                        <span>{{scope.row.order.materialNo}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="util" label="单位" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.util}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="单价" width="100">
                    <template slot-scope="scope">
                        <span>{{scope.row.price | currency}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="订单量" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.count}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="合计金额"  width="120">
                    <template slot-scope="scope">
                        <span>{{parseMoney(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createDate" label="创建日期" width="100">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.createDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createByUser" label="创建人员" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.createByUser}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="备注说明" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.content}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container">
                <div>本页合计金额：{{totalMoney | currency}}</div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>

        <div v-else class="form-plit">
            <el-form :model="ruleForm" ref="ruleForm" label-width="80px" size="mini">
                <el-form-item label="付款单列表">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品待付款':'请选择右侧待付款订单货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" size="mini" style="width: 100%">
                            <div slot="empty">暂无选中的待付款货品</div>
                            <el-table-column prop="productName" label="订单货品名称"/>
                            <el-table-column prop="count" label="数量" width="70"/>
                            <el-table-column prop="price" label="单价" width="100">
                                <template slot-scope="scope">
                                    <span>{{scope.row.price | currency}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="付款金额" width="120">
                                <template slot-scope="scope">
                                    <span>{{parseMoney(scope.row)}}</span>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div>总计付款金额：<span>{{payMoney | currency}}</span></div>
                    </div>
                </el-form-item>
                
                <el-form-item label="备注说明">
                    <el-input v-model="ruleForm.content"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0">提交保存</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>
                    <span>已采购入库未付款订单列表</span>
                    <span>
                        <el-input size="mini" prefix-icon="el-icon-search" placeholder="快速查询" v-model="searchInput" @keyup.native="searchFilter"/>
                    </span>
                </h5>
                <el-table 
                :data="oList" border fit highlight-current-row  size="mini" height="400" @selection-change="selectionRow">
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="订单编号" width="120px"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="crmName" label="客户名称" width="200px" sortable/>
                    <el-table-column prop="productName" label="货品名称" width="220px"/>
                    <el-table-column prop="count" label="采购数量" width="80px"/>
                    <el-table-column prop="util" label="单位" width="60px"/>
                    <el-table-column prop="price" label="单价" width="100px">
                        <template slot-scope="scope">
                            {{scope.row.price | currency}}
                        </template>
                    </el-table-column>
                    <el-table-column label="合计" width="150px">
                        <template slot-scope="scope">
                            {{parseMoney(scope.row)}}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <el-dialog title="订单明细查阅" :visible.sync="openDialogVisible" width="450px">
            <div class="compare" v-if="currItem">
                <div>
                    <ul>
                        <li><span>货品名称：</span><span>{{currItem.productName}}</span></li>
                        <li><span>客户：</span><span>{{currItem.order.crmName}}</span></li>
                        <li><span>联系人：</span><span>{{getCrm(currItem.order.crmId,'contactName')}}</span></li>
                        <li><span>电话：</span><span>{{getCrm(currItem.order.crmId,'contactPhone')}}</span></li>
                        <li><span>订单号：</span><span>{{currItem.serial}}</span></li>
                        <li><span>物料号：</span><span>{{currItem.order.materialNo}}</span></li>
                        <li><span>单位：</span><span>{{currItem.order.util}}</span></li>
                        <li><span>订单数量：</span><span>{{currItem.order.count}}</span></li>
                        <li><span>单价：</span><span>{{currItem.order.price}}</span></li>
                        <li><span>制单日期：</span><span>{{parseDate(currItem.order.orderDate)}}</span></li>
                        <li><span>交付日期：</span><span>{{parseDate(currItem.order.deliveryDate)}}</span></li>
                        <li><span>制单人：</span><span>{{currItem.order.createByUser}}</span></li>
                    </ul>
                </div>
            </div>
        </el-dialog>
    </section>
</template>

<script>
//import settings from '@/config/files/dataList.json';
export default {
    data(){
        return {
            openDialogVisible:false,
            currItem:null,
            listLoading:false,
            isEdit:false,
            total:0,
            searchInput:'',
            query:{
                page:1,
                pagesize:20
            },
            orderTotal:0,
            queryOrder:{
                page:1,
                pagesize:20
            },
            typeList:[],//settings.type,
            orderList:[],
            oList:[],
            gridList:[],
            rowData:[],
            lastId:0,
            payMoney:0,
            totalMoney:0,
            searchForm:{
                serial:'',
                crmName:'',
                productName:'',
                createDate:'',
            },
            ruleForm:{
                payType:1,
                createByUser:'',
                content:''
            }
        }
    },
    methods:{
        showOrderInfo(row){
            this.openDialogVisible = true;
            this.currItem = row;
            console.log('showOrderInfo',row)
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
            this.rowData = [];
            this.payMoney = 0;
            selection.forEach(item=>{
                this.rowData.push({
                    orderId:item.id,
                    serial:item.serial,
                    crmName:item.crmName,
                    productName:item.productName,
                    util:item.util,
                    price:item.price,
                    count:item.count
                });
                this.payMoney += item.price * item.count;
            })
            //console.log(this.rowData)
        },
        submitSave(){
            let dataList = this.rowData.map((item,index)=>{
                item = _.merge({},this.ruleForm, item);
                item.createByUser = this.$store.state.user.name;
                item.id = this.lastId + index + 1;
                return item;
            });
            //console.log('dataList', dataList)
            
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addPatch',
                        collectionName: 'finance',
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
            let ids = this.rowData.map(item=>{
                return item.orderId;
            });
            let condition = {
                type:'updatePatch',
                collectionName: 'order',
                param:{'id':{$in:ids}},
                set:{$set:{'isPayed':true}}
            }
            //console.log('clearData', condition);
            let reuslt = await this.$axios.$post('mock/db', {data:condition});
            this.isEdit = false;
            this.query.page = 1;
            this.getList();
        },
        handleAdd(){
            this.isEdit = true;
            this._getLastId();
            this.getOrderList({typeId:1, flowStateId:1});
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
            if(!flag){ // 不需要再做分页复位
                this.query = {
                    page:1,
                    pagesize:20
                }
            }
            this.getList(params);
        },
        orderCurrentChange(val){
            this.queryOrder.page = val;
        },
        orderSizeChange(val){
            this.queryOrder.pagesize = val;
        },
        searchFilter(){
            this.oList = [];
            this.orderList.map(item=>{
                if(item.serial.includes(this.searchInput) || item.productName.includes(this.searchInput) || item.crmName.includes(this.searchInput)){
                    this.oList.push(item);
                }
            });
        },
        async getOrderList(params={}){
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:{typeId:1,flowStateId:{$gt:1},isPayed:false}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.orderTotal = result.total;
            this.orderList = result.list;
            this.oList = _.cloneDeep(result.list);
        },
        
        async getList(match={}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',
                collectionName: 'finance',
                data:_.merge({payType:1},match),
                aggregate:[
                    {
                        $lookup:{
                            from: "order",
                            localField: "serial",
                            foreignField: "serial",
                            as: "order"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$order",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {$match:_.merge({payType:1},match)},
                    /* {
                        $addFields: {flowStateName:"$order.name"}
                    }, */
                    {$sort:{_id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});

            /* let condition = {
                type:'listData',
                collectionName: 'finance',
                data:_.merge({payType:1},match),
            };
            let result = await this.$axios.$post('mock/db', {data:condition}); */
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            this.totalMoney = 0;
            result.list.forEach(item=>{
                this.totalMoney += item.count*item.price;
            })
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
            line-height: 30px;
            font-size: 14px;
            display:flex;
            align-items:center;
            justify-content: space-between;
            >span{
                color:#ff6c00;
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
</style>
