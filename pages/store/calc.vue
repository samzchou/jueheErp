<template>
    <section>
        <div class="page-title">
            <div>
                <span>库存列表</span>
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
                    <el-form-item label="库存小于：" prop="incount">
                        <el-input v-model="searchForm.incount" clearable  style="width:70px"/>
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
                    <el-table-column prop="typeId" label="入库来源" width="70">
                        <template slot-scope="scope">
                            <span>{{parseType(scope.row.typeId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flowStateId" label="当前流程状态" width="100">
                        <template slot-scope="scope">
                            <span>{{parseFlow(scope.row.order.flowStateId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="storeNoId" label="存放库位" width="80">
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
                    <el-table-column prop="outcount" label="出库量" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.outcount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="incount" label="当前库存" width="120">
                        <template slot-scope="scope">
                            <span :class="{'warning':scope.row.incount==0}">{{scope.row.incount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createDate" label="入库日期" width="100">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.createDate)}}</span>
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
            flowList:settings.flowState,
            typeList:settings.type,
            storeNoList:settings.storeNo,
            gridList:[],
            searchForm:{
                serial:'',
                typeId:'',
                storeNoId:'',
                productName:'',
                createDate:'',
                incount:'',
            }
        }
    },
    methods:{
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
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
        parseFlow(id){
            if(!id) return '';
            let flow = _.find(this.flowList, {'id':id});
            return flow.name;
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
                type:'aggregate',
                collectionName: 'store',
                data:_.merge(match),
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
                    {$match:_.merge(match)},
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
        this.getList();
    }
}
</script>

<style lang="scss" scoped>
    .warning{
        color:red;
        font-size: 14px;
        font-weight: 700;
    }
</style>
