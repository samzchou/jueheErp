<template>
    <section class="order-main">
        <div class="page-title">
            <div>
                <span>订单生产列表</span>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="产品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="客户：" prop="crmId">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                            <el-option v-for="item in crmList" :key="item.id" :label="item.name" :value="item.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="箱号：" prop="boxNo">
                        <el-input v-model="searchForm.boxNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="型号/梯号：" prop="modelNo">
                        <el-input v-model="searchForm.modelNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="物料号/版本号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="制单日期：" prop="orderDate">
                        <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row size="mini" max-height="400">
                    <el-table-column label="No." width="70px" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="80px"/>
                    <el-table-column prop="flowStateId" label="流程状态" width="100">
                        <template slot-scope="scope">
                            <span v-bind:class="[scope.row.flowStateId===4?'wait-flow':'finished-flow']">{{parseFlow(scope.row.flowStateId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="serial" label="订单编号" width="150px"/>
                    <el-table-column prop="crmName" label="客户名称" width="220px">
                        <template slot-scope="scope">
                            <el-button title="点击查看客户的订单汇总" type="text" @click="showDetail(scope.row)">{{scope.row.crmName}}</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="orderDate" label="制单日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.orderDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="model" label="规格/梯型" width="100px"></el-table-column>
                    <el-table-column prop="modelNo" label="型号/梯号" width="100px"/>
                    <el-table-column prop="boxNo" label="箱号" width="100px"/>
                    <el-table-column prop="projectName" label="项目名称" width="150px"/>
                    <el-table-column prop="projectNo" label="项目号" width="150px"/>
                    <el-table-column prop="materialNo" label="物料号/版本号" width="150px"/>
                    <el-table-column prop="caselNo" label="图号/版本号" width="150px"/>

                    <el-table-column prop="productName" label="订单产品名称" width="200px"/>
                    <el-table-column prop="count" label="订单数量"/>
                    <el-table-column prop="util" label="单位"/>
                    <el-table-column prop="content" label="备注说明" width="250px"/>
                    <el-table-column prop="flowStateId" label="操作" fixed="right" align="center" width="100">
                        <template slot-scope="scope">
                            <el-button size="mini" type="text" @click="handleUpdate(scope.row)" :disabled="scope.row.flowStateId>5">{{parseControl(scope.row.flowStateId)}}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <el-dialog title="客户生产订单" :visible.sync="openDialogVisible" width="65%">
            <div class="form-dialog">
                <el-form :inline="true" :model="dialogForm" ref="dialogForm" size="mini">
                    <el-form-item label="客户：" prop="crmId">
                        <el-select v-model="dialogForm.crmId" placeholder="请选择" style="width:300px">
                            <el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="订单状态：" prop="flowStateId">
                        <el-select v-model="dialogForm.flowStateId" placeholder="请选择">
                            <el-option v-for="(flow,idx) in flowList" :key="idx" :label="flow.name" :value="flow.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="dialogSearch">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="compare" id="printTable" ref="printTable" v-if="currItem">
                <div class="order-title">
                    <span>客户：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
                 </div>
                <div class="order-title" style="padding:10px 0">
                    <span style="font-weight:bold">订单总价：{{currItem.crmOrderMoney | currency}} 【*注：根据梯号、物料号、图号/版本号，系统自动整合订单量】</span>
                    <el-button type="primary" size="mini" v-if="isMergeSerial" @click="splitCrmOrderList">拆分订单号</el-button>
                </div>
                <el-table
                :data="crmOrderList"
                border fit highlight-current-row
                size="mini" max-height="400">
                    <el-table-column prop="serial" label="订单号" width="120px"/>
                    <el-table-column prop="materialNo" label="型号/物料号" width="150px"/>
                    <el-table-column prop="productName" label="产品名称" width="250px"/>
                    <el-table-column prop="model" label="规格/梯型" width="100px"/>
                    <el-table-column prop="modelNo" label="梯号" width="80px"/>
                    <el-table-column prop="count" label="数量"/>
                    <el-table-column prop="price" label="单价"/>
                    <el-table-column prop="allPrice" label="合计"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="btns">
                <el-button type="success" @click="exportOrder">导出生产单</el-button>
                <el-button type="infor" size="medium" icon="el-icon-plus" v-print="'#printTable'">打印生产单</el-button>
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
            sourceCrmOrderList:[],
            crmOrderList:[],
            isMergeSerial:false,
            dialogForm:{
                crmId:'',
                flowStateId:4,
            },
            setting:{},
            listLoading:false,
            total:0,
            query:{
                page:1,
                pagesize:20
            },
            typeList:[],//settings.type,
            storeNoList:[],//settings.storeNo,
            flowList:[],//settings.flowState,
            gridList:[],
            crmList:[],
            searchForm:{
                serial:'',
                productName:'',
                projectNo:'',
                boxNo:'',
                modelNo:'',
                crmId:'',
                materialNo:'',
                orderDate:'',
                deliveryDate:''
            }
        }
    },
    methods:{
        exportOrder(){
            import ('@/components/Export2Excel').then(excel=>{
                const tHeader = ['订单号', '型号/物料号', '产品名称','规格/梯型','梯号', '交付日期','数量', '单价', '合计'];
                const filterVal = ['serial', 'materialNo', 'productName', 'model','modelNo','deliveryDate','count', 'price', 'allPrice'];
                const data = this.formatJson(filterVal, this.crmOrderList);
                console.log('exportOrder', data);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: this.currItem.crmName + '-' + new Date().getTime(),
                    autoWidth: true,
                    bookType: 'xlsx'
                })
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                if(j == 'deliveryDate'){
                    v[j] = this.parseDate(v[j]);
                }
                return v[j];
            }))
        },
        // 查看供应商订单汇总
        showDetail(row){
            let crm = _.find(this.crmList, {'id':row.crmId});
            this.dialogForm.crmId = row.crmId;
            this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
            this.openDialogVisible = true;
            console.log('showDetail',row, crm);
            // group 供应商订单
            this.listOrderByCrm({crmId:row.crmId});
        },
        dialogSearch(){
            let crm = _.find(this.crmList, {'id':this.dialogForm.crmId});
            this.listOrderByCrm(this.dialogForm);
            this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
            this.listOrderByCrm(this.dialogForm);
        },
        async listOrderByCrm(match={}){
            let params = {
                type:'listData',
                collectionName: 'order',
                data:_.merge({flowStateId:4}, match)
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            // group订单  materialNo
            let list = [];
            console.log('listOrderByCrm', data.list);
            this.sourceCrmOrderList = data.list;
            this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList), true);
        },
        splitCrmOrderList(){
            this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList), false);
        },
        filterCrmOrderList(arr,split){
            let list = [];
            this.isMergeSerial = false;
            arr.forEach(item=>{
                let index = _.findIndex(list, {'modelNo':item.modelNo,'materialNo':item.materialNo, 'caselNo':item.caselNo}); //
                //debugger
                if(index>-1 && split){
                    this.isMergeSerial = true;
                    list[index]['count'] += item.count;
                    list[index]['serial'] += '；'+item.serial;
                    list[index]['allPrice'] = list[index]['count'] * list[index]['price'];
                }else{
                    item.allPrice = item.count * item.price;
                    list.push(item);
                }
            });
            console.log('list', list);
            this.currItem.crmOrderMoney = 0;
            list.forEach(item=>{
                this.currItem.crmOrderMoney += item.allPrice;
            });
            this.crmOrderList = list;
        },
        parseControl(id){
            switch(id){
                case 4:
                    return '待生产';
                case 5:
                    return '完成生产';
                case 6:
                    return '待入库';
                case 7:
                    return '已入库';
                case 8:
                    return '已出库销售';
            }
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseFlow(id){
            if(!id || id=='') return '';
            let type = _.find(this.flowList, {id:id});
            return type.name;
        },
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },
        handleUpdate(row){
            let flowStateId = row.flowStateId + 1;
            let msg = flowStateId==5?'此操作将开始进行生产任务':'此操作将确认生产完成提交给入库';
            this.$confirm(msg + ', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type:'updateData',
                    collectionName: 'order',
                    updateDate:true,
                    data:{
                        id:row.id,
                        flowStateId:flowStateId
                    }
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    row.flowStateId = flowStateId;
                });

            }).catch();
        },
        submitSearch(flag){
            let params = {};
            for(let k in this.searchForm){
                if(this.searchForm[k] != '' && this.searchForm[k]){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && (k==='orderDate' || k==='deliveryDate')){
                        params[k] = {
                            $gte:this.searchForm[k][0],
                            $lte:this.searchForm[k][1]
                        }
                    }else if(_.isArray(this.searchForm[k])){
                        params[k] = {$in:this.searchForm[k]}
                    }else{
                        if(k === 'incount'){
                            params[k] = {$lt:Number(this.searchForm[k])}
                        }else{
                            params[k] = {$regex:this.searchForm[k]};
                        }
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
        async getList(match={}){
            this.listLoading = true;
            let condition = {
                type:'listData',
                collectionName: 'order',
                page:this.query.page,
                pagesize:this.query.pagesize,
                ascby:-1,
                data:_.merge({typeId:2,flowStateId:{$gte:4}}, match)
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
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
                this.flowList = _.filter(this.setting.flowState, item=>{
                    return item.id>3;
                });
                this.crmList = _.filter(this.setting.crm,{typeId:2});
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
    .finished-flow{
        color:#08750e;
        font-weight: 700;
    }
    .wait-flow{
        color:#e2420b;
        font-weight: 700;
    }
    .order-main{
        /deep/ .el-dialog{
            .el-dialog__body{
                padding:10px 20PX;

                .compare{
                    .order-title{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-top: 1px solid #DDD;
                    }
                }
                .btns{
                    padding:10px 0;
                    text-align: right;
                }
            }
        }
    }

</style>
