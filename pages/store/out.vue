<template>
    <section>
        <div class="page-title">
            <div>
                <span>
                    {{!isEdit?'出库单列表':'出库单编辑'}}
                </span>
            </div>
            <div>
                <div v-if="!isEdit" >
                    <el-button @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增出库单</el-button>
                    <el-button v-print="'#printTable'" type="text" size="medium" icon="el-icon-plus">打印</el-button>
                </div>
                <div v-else>
                    <el-button @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
                </div>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="出库去向" prop="outTypeId">
                        <el-select v-model="searchForm.outTypeId" placeholder="请选择" clearable style="width:100px">
                            <el-option v-for="item in $store.state.storeTarget" :key="item.id" :label="item.name" :value="item.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="货品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="出库日期：" prop="updateDate">
                        <el-date-picker v-model="searchForm.updateDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div id="printTable">
                <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row size="mini" height="400">
                    <el-table-column label="No." width="70px" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="typeId" label="出库去向" width="70">
                        <template slot-scope="scope">
                            <span>{{parseType(scope.row.outTypeId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="storeNoId" label="库位" width="80">
                        <template slot-scope="scope">
                            <span>{{parseStoreNo(scope.row.storeNoId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="订单编号" width="120">
                        <template slot-scope="scope">
                            <span>{{scope.row.serial}}</span>
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
                    <el-table-column prop="count" label="入库量" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.count}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="outcount" label="出库量"  width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.outcount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateDate" label="出库日期" width="100">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.updateDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateByUser" label="出库人员" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.updateByUser}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateContent" label="备注说明" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.updateContent}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>

        <div v-else class="form-plit">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" size="mini">
                  <el-form-item label="出库货品">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品':'请选择右侧库存货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" size="mini" style="width: 100%">
                            <div slot="empty">暂无选中的货品</div>
                            <el-table-column prop="productName" label="出库货品"/>
                            <el-table-column prop="count" label="出库数量" width="70">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit" class="edit-content" @click="scope.row.edit=true" title="点击编辑数量">
                                        <span>{{scope.row.outcount}}</span>
                                        <i class="el-icon-edit"/>
                                    </div>
                                    <div v-else class="edit-content">
                                        <input v-model="scope.row.outcount" @blur="checkOutCount(scope.row)"/>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-form-item>
                
                <el-form-item label="出库去向" prop="outTypeId">
                    <el-select v-model="ruleForm.outTypeId">
                        <el-option v-for="item in $store.state.storeTarget" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注说明">
                    <el-input v-model="ruleForm.updateContent"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0">提交保存</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>库存列表</h5>
                <el-table :data="storeList" border fit highlight-current-row  size="mini" height="400" @selection-change="selectionRow">
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="订单编号" width="120px">
                        <template slot-scope="scope">
                            <span>{{scope.row.order.serial}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="货品名称"/>
                    <el-table-column prop="count" label="入库数量" width="80px"/>
                    <el-table-column prop="incount" label="当前库存" width="80px"/>
                    <el-table-column prop="util" label="单位" width="60px">
                        <template slot-scope="scope">
                            <span>{{scope.row.order.util}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="入库日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.createDate)}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

        </div>
    </section>
</template>

<script>
export default {
    data(){
        return {
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
            typeList:[],
            tList:[],
            storeList:[],
            storeNoList:[],
            gridList:[],
            rowData:[],
            searchForm:{
                serial:'',
                outTypeId:'',
                productName:'',
                updateDate:'',
            },
            ruleForm:{
                outTypeId:'',
                outcount:'',
                updateContent:''
            },
            rules:{
                outTypeId: [
                    { required: true, message: '请选择出库去向', trigger: 'change'},
                ]
            }
        }
    },
    methods:{
        handlePrint(){
            this.$print(this.$refs.print) 
        },
        checkOutCount(row){
            console.log(row);
            if(row.outcount > row.incount || row.outcount <=0 ){
                this.$message.error('请正确出库数量不符！最大出库量：' + row.incount);
                return;
            }
            row.edit = false;
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parseType(id){
            if(!id || id=='') return '';
            let type = _.find(this.$store.state.storeTarget, {id:id});
            return type.name || '';
        },
        parseStoreNo(id){
            if(!id || id=='') return '';
            let type = _.find(this.storeNoList, {id:id});
            return type.name || '';
        },
        selectionRow(selection){
            this.rowData = [];
            selection.forEach(item=>{
                //let obj = _.merge({}, item, {outcount:item.incount,edit:false});
                //delete obj.order;
                //this.rowData.push(obj);
                this.rowData.push({
                    id:item.id,
                    productName:item.productName,
                    incount:item.incount,
                    outcount:item.incount,
                    edit:false
                });
            })
        },
        submitSave(){
            let dataList = this.rowData.map((item,index)=>{
                item = _.merge({}, this.ruleForm, item);
                item.outcount = parseInt(item.outcount);
                item.incount -= item.outcount;
                item.updateByUser = this.$store.state.user.name;
                delete item.edit;
                return item;
            });
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'updateArr',
                        collectionName: 'store',
                        data:dataList
                    }
                    console.log('submitSave', condition);
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
                        this.query.page = 1;
                        this.getList();
                    });
                }

            });
        },
        handleAdd(){
            this.isEdit = true;
            this.getStoreList();
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
                    }else if(_.isArray(this.searchForm[k]) && k==='updateDate'){
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
        async getStoreNoList(){
            let condition = {
                type:'listData',
                collectionName: 'storeNo',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.storeNoList = result.list;
        },
        async getStoreList(match={}){
            let condition = {
                type:'aggregate',
                collectionName: 'store',
                data:_.merge({storeTypeId:1},match),
                aggregate:[
                    {
                        $lookup:{
                            from: "orders",
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
                    {$match:_.merge({storeTypeId:1, incount:{$gt:0}},match)}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.storeList = result.list;
        },
        async getTypeList(){
            let condition = {
                type:'listData',
                collectionName: 'type',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.typeList = result.list;
        },
        
        async getList(match={}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',
                collectionName: 'store',
                data:_.merge({outcount:{$gt:0}},match),
                aggregate:[
                    {
                        $lookup:{
                            from: "orders",
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
                    {$match:_.merge({outcount:{$gt:0}},match)},
                    /* {
                        $addFields: {flowStateName:"$order.name"}
                    }, */
                    {$sort:{id:-1}},
                    {$skip:this.query.page-1},
                    {$limit:this.query.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
        },
    },
    created(){
        //this.getOrderList({typeId:1, flowStateId:1});
        this.getTypeList();
        this.getStoreNoList();
    },
    mounted(){
        this.getList();
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
            >span{
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
            width:700px;
            flex:0 0 700px;
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
</style>
