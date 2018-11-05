<template>
    <section>
        <div class="page-title">
            <div>
                <span>订单生产列表</span>
            </div>
            <div>
                <el-button v-print="'#printTable'" type="text" size="medium" icon="el-icon-plus">打印</el-button>
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
            <div id="printTable">
                <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row size="mini" height="400">
                    <el-table-column label="No." width="70px" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="id" width="50px"/>
                    <el-table-column prop="flowStateId" label="流程状态" width="100">
                        <template slot-scope="scope">
                            <span v-bind:class="[scope.row.flowStateId===4?'wait-flow':'finished-flow']">{{parseFlow(scope.row.flowStateId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="serial" label="订单编号" width="150px"/>
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
                    <el-table-column prop="crmName" label="客户名称" width="150px"/>
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
    </section>
</template>

<script>
import settings from '@/config/files/dataList.json';
export default {
    data(){
        return {
            listLoading:false,
            total:0,
            query:{
                page:1,
                pagesize:20
            },
            typeList:settings.type,
            storeNoList:settings.storeNo,
            flowList:settings.flowState,
            gridList:[],
            searchForm:{
                serial:'',
                productName:'',
                projectNo:'',
                boxNo:'',
                modelNo:'',
                materialNo:'',
                orderDate:'',
                deliveryDate:''
            }
        }
    },
    methods:{
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
    },
    created(){
        this.getList();
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
</style>
