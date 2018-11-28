<template>
    <section>
        <div class="page-title">
            <div>
                <span>
                    {{!isEdit?'入库单列表':'入库单编辑'}}
                </span>
            </div>
            <div>
                <el-button v-if="!isEdit" @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增入库单</el-button>
                <el-button v-else @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
               </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="业务类型" prop="typeId">
                        <el-select v-model="searchForm.typeId" placeholder="请选择" clearable style="width:100px">
                            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="库位" prop="storeNoId">
                        <el-select v-model="searchForm.storeNoId" placeholder="请选择" clearable style="width:100px">
                            <el-option v-for="item in storeNoList" :key="item.id" :label="item.name" :value="item.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="货品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="入库日期：" prop="createDate">
                        <el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading" 
            :data="gridList" 
            border fit highlight-current-row 
            size="mini" max-height="400">
                <el-table-column label="No." width="70px" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="typeId" label="入库来源" width="70">
                    <template slot-scope="scope">
                        <span>{{parseType(scope.row.typeId)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="storeNoId" label="存放库位" width="80">
                    <template slot-scope="scope">
                        <span>{{parseStoreNo(scope.row.storeNoId)}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="订单编号" width="120">
                    <template slot-scope="scope">
                        <el-button type="text" @click="showOrderInfo(scope.row)">{{scope.row.serial}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="货品名称">
                    <template slot-scope="scope">
                        <span>{{scope.row.productName}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="单位" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.order.util}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="单价" width="100">
                    <template slot-scope="scope">
                        <span>{{scope.row.order.price | currency}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="订单量" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.order.count}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="入库量" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.count}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="入库总价" width="150">
                    <template slot-scope="scope">
                        {{parseReleaseMoney(scope.row)}}
                    </template>
                </el-table-column>
                <el-table-column prop="createDate" label="入库日期" width="100">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.createDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createByUser" label="入库人员" width="70">
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
            <div class="page-container" style="padding: 10px 0;">
                    <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                    </el-pagination>
                </div>
        </div>

        <div v-else class="form-plit">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" size="mini">
                <el-form-item label="入库来源" prop="ptypeId">
                    <el-radio-group v-model="ruleForm.typeId" @change="filterPtype">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="入库货品">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品，请确认实际入库量,可重新编辑数量':'请选择右侧订单货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" size="mini" style="width: 100%">
                            <div slot="empty">暂无选中的货品</div>
                            <el-table-column prop="productName" label="入库货品"/>
                            <el-table-column prop="count" label="入库数量" width="70">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit" class="edit-content" @click="scope.row.edit=true" title="点击编辑数量">
                                        <span>{{scope.row.count}}</span>
                                        <i class="el-icon-edit"/>
                                    </div>
                                    <div v-else class="edit-content">
                                        <input v-model="scope.row.count" @blur="scope.row.edit=false"/>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-form-item>
                <el-form-item label="存放库位" prop="storeNoId">
                    <el-select v-model="ruleForm.storeNoId">
                        <el-option v-for="item in storeNoList" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
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
                    <div>未入库<span>{{ruleForm.typeId==1?'采购':'销售'}}</span>订单列表</div>
                    <div>
                        <el-input size="mini" prefix-icon="el-icon-search" placeholder="快速查询" v-model="searchInput" @keyup.native="searchFilter"/>
                    </div>
                </h5>
                <el-table :data="oList" border fit highlight-current-row  size="mini" max-height="400" @selection-change="selectionRow">
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="订单编号" width="120px"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="crmName" label="客户名称" width="200px"/>
                    <el-table-column prop="productName" label="货品名称" width="220px"/>
                    <el-table-column prop="materialNo" label="物料号/版本号" width="150px"/>
                    <el-table-column prop="count" label="采购数量" width="80px"/>
                    <el-table-column prop="util" label="单位" width="60px"/>
                    <el-table-column prop="price" label="单价" width="100px">
                        <template slot-scope="scope">
                            {{scope.row.price | currency}}
                        </template>
                    </el-table-column>
                    <el-table-column label="总价" width="150px">
                        <template slot-scope="scope">
                            {{parseMoney(scope.row)}}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="page-container" style="padding: 10px 0;">
                    <el-pagination size="mini" @size-change="orderSizeChange" @current-change="orderCurrentChange" :current-page.sync="queryOrder.page" :page-sizes="[20, 50, 100, 200]" :page-size="queryOrder.pagesize" layout="total,sizes,prev,pager,next" :total="orderTotal">
                    </el-pagination>
                </div>
            </div>
        </div>
        <el-dialog title="订单明细查阅" :visible.sync="openDialogVisible" width="450px">
            <div class="compare" v-if="currItem">
                <div>
                    <ul>
                        <li><span>货品名称：</span><span>{{currItem.productName}}</span></li>
                        <li><span>客户：</span><span>{{currItem.order.crmName}}</span></li>
                        <li><span>订单号：</span><span>{{currItem.serial}}</span></li>
                        <li><span>物料号：</span><span>{{currItem.order.materialNo}}</span></li>
                        <li><span>单位：</span><span>{{currItem.order.util}}</span></li>
                        <li><span>订单数量：</span><span>{{currItem.order.count}}</span></li>
                        <li><span>单价：</span><span>{{currItem.order.price}}</span></li>
                        <li><span>当前库存：</span><span>{{currItem.incount}}</span></li>
                        <li><span>制单日期：</span><span>{{parseDate(currItem.orderDate)}}</span></li>
                        <li><span>交付日期：</span><span>{{parseDate(currItem.deliveryDate)}}</span></li>
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
            setting:{},
            searchInput:'',
            listLoading:false,
            isEdit:false,
            editRow:null,
            flowStateList:[
                {label:'待入库',value:1},{label:'已入库',value:2}
            ],
            total:0,
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
            storeNoList:[],//settings.storeNo,
            gridList:[],
            rowData:[],
            lastId:0,
            searchForm:{
                serial:'',
                typeId:'',
                storeNoId:'',
                productName:'',
                createDate:'',
            },
            ruleForm:{
                storeTypeId:1,
                typeId:1,
                storeNoId:'',
                content:''
            },
            rules:{
                storeNoId: [
                    { required: true, message: '请选择存放库位', trigger: 'change'},
                ]
            }
        }
    },
    methods:{
        showOrderInfo(row){
            this.openDialogVisible = true;
            this.currItem = row;
            console.log('showOrderInfo',row)
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parseReleaseMoney(row){
            return this.$options.filters['currency'](row.count*row.order.price);
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
            selection.forEach(item=>{
                this.rowData.push({
                    orderId:item.id,
                    serial:item.serial,
                    productName:item.productName,
                    count:item.count,
                    edit:false
                });
            })
        },
        submitSave(){
            let orderIds = [];
            let dataList = this.rowData.map((item,index)=>{
                item = _.merge({},this.ruleForm, item);
                item.count = parseInt(item.count);
                item.incount = parseInt(item.count);
                item.createByUser = this.$store.state.user.name;
                item.id = this.lastId + index + 1;
                orderIds.push(item.orderId);
                delete item.edit;
                return item;
            });
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addPatch',
                        collectionName: 'store',
                        data:dataList
                    }
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        /* loadingMask.close();
                        this.clearData() */
                    });

                    // 更新订单流程状态
                    let cn = {
                        type:'updatePatch',
                        collectionName: 'order',
                        param:{'id':{$in:orderIds}},
                        set:{$set:{'flowStateId':this.ruleForm.typeId==1?2:7}}
                    }
                    //console.log('submitSave', cn);
                    this.$axios.$post('mock/db', {data:cn}).then(result=>{
                        loadingMask.close();
                        this.clearData()
                    });

                }
            });
            
        },
        async clearData(){
            let ids = this.rowData.map(item=>{
                return item.orderId;
            });
            let condition = {
                type:'updatePatch',
                collectionName: 'order',
                param:{'id':{$in:ids}},
                set:{$set:{'flowStateId':this.ruleForm.typeId==1?2:7}}
            }
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
        filterPtype(val){
            this.queryOrder = {
                page:1,
                pagesize:20
            }
            this.rowData = [];
            this.getOrderList({typeId:val,flowStateId:val==1?1:6});
        },

        searchFilter(){
            this.oList = [];
            this.orderList.map(item=>{
                if(item.serial.includes(this.searchInput) || item.productName.includes(this.searchInput) || item.crmName.includes(this.searchInput)){
                    this.oList.push(item);
                }
            });
        },

        orderSizeChange(val){
            this.queryOrder.pagesize = val;
            this.getOrderList();
        },
        orderCurrentChange(val){
            this.queryOrder.page = val;
            this.getOrderList();
        },

        async getOrderList(params={}){
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:_.merge(params, {isPayed:false,typeId:this.ruleForm.typeId}),
                page:this.queryOrder.page,
                pagesize:this.queryOrder.pagesize
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
                collectionName: 'store',
                data:_.merge({storeTypeId:1},match),
                aggregate:[
                    {
                        $lookup:{
                            from: "order",
                            localField: "orderId",
                            foreignField: "id",
                            as: "order"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$order",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {$match:_.merge({storeTypeId:1},match)},
                    /* {
                        $addFields: {flowStateName:"$order.name"}
                    }, */
                    {$sort:{_id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            console.log(this.gridList)
            this.listLoading = false;
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
                console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.storeNoList = this.setting.storeNo;

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
            span{
                color:#ff6c00;
                margin:0 5px;
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
