<template>
    <section>
        <div class="page-title">
            <div>
                <span>库存列表</span>
            </div>
        </div>
        <div class="grid-container">
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
                            <el-input v-model="searchForm.productName" clearable/>
                        </el-form-item>
                        <el-form-item label="客户：" prop="crmId">
                            <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                                <el-option v-for="item in crmList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="物料号：" prop="materialNo">
                            <el-input v-model="searchForm.materialNo" clearable/>
                        </el-form-item>
                        <el-form-item label="入库日期：" prop="createDate">
                            <el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                        </el-form-item>
                        <el-form-item label="库存小于：" prop="incount">
                            <el-input v-model="searchForm.incount" clearable  style="width:70px"/>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
                    </el-form-item>
                    <el-form-item v-if="!isLike">
                        <el-button type="text" @click="isLike=true">模糊查找</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div id="printTable">
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" @row-click="detailStoreClick">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <span>原始订单号：</span><span>{{scope.row.order.sourceserial}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>当前流程状态：</span><span>{{parseFlow(scope.row.order.flowStateId)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>存放库位：</span><span>{{parseStoreNo(scope.row.storeNoId)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>{{scope.row.typeId==1?'供应商':'客户'}}：</span><span>{{scope.row.crmName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>物料号/版本号：</span><span>{{scope.row.materialNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目号：</span><span>{{scope.row.order.projectNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目名称：</span><span>{{scope.row.order.projectName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>箱号：</span><span>{{scope.row.order.boxNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯形：</span><span>{{scope.row.order.model}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯号：</span><span>{{scope.row.order.modelNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>制单日期：</span><span>{{parseDate(scope.row.order.orderDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>交付日期：</span><span>{{parseDate(scope.row.order.deliveryDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>入库日期：</span><span>{{parseDate(scope.row.order.createDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>出库日期：</span><span>{{parseDate(scope.row.order.updateDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>订单数量：</span><span>{{scope.row.order.count}} {{scope.row.order.util}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>单价：</span><span>{{scope.row.order.price | currency}}</span>
                                </el-col>
                                <el-col :span="16">
                                    <span>备注：</span><span>{{scope.row.content}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column label="业务类型" prop="typeId">
                        <template slot-scope="scope">
                            {{parseType(scope.row.typeId)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="货品名称" prop="productName"/>
                    <el-table-column label="物料号/版本号" prop="materialNo"/>
                    <el-table-column label="项目号">
                        <template slot-scope="scope">
                            {{scope.row.order.projectNo}}
                        </template>
                    </el-table-column>
                    <el-table-column label="梯形">
                        <template slot-scope="scope">
                            {{scope.row.order.model}}
                        </template>
                    </el-table-column>
                    <el-table-column label="梯号">
                        <template slot-scope="scope">
                            {{scope.row.order.modelNo}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="util" label="单位" width="70">
                        <template slot-scope="scope">
                            <span>{{scope.row.order.util}}</span>
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
                    <el-table-column prop="incount" label="当前库存" width="100">
                        <template slot-scope="scope">
                            <span :class="{'warning':scope.row.incount==0}">{{scope.row.incount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="incount" label="比对7天内采购库存">
                        <template slot-scope="scope">
                            <span :class="{'warning':scope.row.incount==0}">
                                <span style="margin-right:10px;">{{parseMaterialNo(scope.row)}}</span>
                                <el-button type="text" v-if="parseMaterialNo(scope.row)<0" @click="viewAfterOrder(scope.row)">查阅</el-button>
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <el-dialog title="比较采购订单" append-to-body :visible.sync="openDialogVisible" width="60%">
            <div style="margin-top:-10px" v-if="afterOrderItem">
              <div style="padding:0 0 10px 0">供应商：{{afterOrderItem.crmName}}；采购货品：{{afterOrderItem.productName}}</div>
              <div class="compare" style="border:1px solid #DDD">
                  <div>
                      <h3>即将采购订单</h3>
                      <ul>
                          <li><span>货品名称：</span><span>{{afterOrderItem.productName}}</span></li>
                          <li><span>订单号：</span><span>{{afterOrderItem.serial}}</span></li>
                          <li><span>物料号：</span><span>{{afterOrderItem.materialNo}}</span></li>
                          <li><span>项目号：</span><span>{{afterOrderItem.projectNo}}</span></li>
                          <li><span>项目名称：</span><span>{{afterOrderItem.projectName}}</span></li>
                          <li><span>单位：</span><span>{{afterOrderItem.util}}</span></li>
                          <li><span>采购数量：</span><span>{{afterOrderItem.count}}</span></li>
                          <li><span>单价：</span><span>{{afterOrderItem.price}}</span></li>
                          <li><span>制单日期：</span><span>{{parseDate(afterOrderItem.orderDate)}}</span></li>
                          <li><span>交付日期：</span><span>{{parseDate(afterOrderItem.deliveryDate)}}</span></li>
                      </ul>
                  </div>
                  <div>
                      <h3>库存货品</h3>
                      <ul>
                          <li><span>货品名称：</span><span>{{currItem.productName}}</span></li>
                          <li><span>订单号：</span><span>{{currItem.order.serial}}</span></li>
                          <li><span>物料号：</span><span>{{currItem.order.materialNo}}</span></li>
                          <li><span>项目号：</span><span>{{currItem.projectNo}}</span></li>
                          <li><span>项目名称：</span><span>{{currItem.projectName}}</span></li>
                          <li><span>单位：</span><span>{{currItem.order.util}}</span></li>
                          <li><span>库存数量：</span><span>{{currItem.incount}}</span></li>
                          <li><span>单价：</span><span>{{currItem.order.price}}</span></li>
                          <li><span>入库日期：</span><span>{{parseDate(currItem.createDate)}}</span></li>
                          <li><span>最后更新：</span><span>{{parseDate(currItem.updateDate)}}</span></li>
                      </ul>
                  </div>
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
        afterOrderItem:null,
        currItem:null,
        afterOrderList:[],
        listLoading:false,
        total:0,
        query:{
          page:1,
          pagesize:20
        },
        crmList:[],
        flowList:[],//settings.flowState,
        typeList:[],//settings.type,
        storeNoList:[],//settings.storeNo,
        gridList:[],
        isLike:true,
        searchLike:{
            keyword:''
        },
        searchForm:{
          serial:'',
          typeId:'',
          storeNoId:'',
          crmId:'',
          materialNo:'',
          productName:'',
          createDate:'',
          incount:'',
        },
      }
    },
    methods:{
        detailStoreClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['detailStore'].toggleRowExpansion(row, row.extend);
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseType(id){
            if(!id || id=='') return '';
            let type = _.find(this.typeList, {id:id});
            return type.name;
        },
        parseReleaseMoney(row){
            return this.$options.filters['currency'](row.outcount*row.order.price);
        },
        viewAfterOrder(row){
            this.afterOrderItem = _.find(this.afterOrderList, {'materialNo':row.order.materialNo});
            this.currItem = row;
            this.openDialogVisible = true;
        },
        // 比较物料号相同
        parseMaterialNo(row){
            let counts = 0;
            let order = _.find(this.afterOrderList, {'materialNo':row.order.materialNo,'crmId':row.crmId});
            console.log('parseMaterialNo', order);
            if(order && order.serial != row.serial){
                //debugger
                counts = row.incount - order.count;
            }
            return counts;
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
            if(this.isLike){
                let keyWord = this.searchLike.keyword;
                if(keyWord){
                    params = {
                        $or:[
                            {'serial':{'$regex':keyWord}},
                            {'productName':{'$regex':keyWord}},
                            {'crmName':{'$regex':keyWord}},
                            {'materialNo':{'$regex':keyWord}},
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
                        if(k === 'incount'){
                            params[k] = {$lt:Number(this.searchForm[k])}
                        }else{
                            params[k] = {$regex:this.searchForm[k]};
                        }
                        }
                    }
                };
            }
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
            this.flowList = this.setting.flowState;
            this.storeNoList = this.setting.storeNo;
            this.crmList = this.setting.crm;
            this.getList();
            }
        },
        async getBuys(){
            let condition = {
                type:"listOrderByDate",
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            console.log('getBuys', result);
            this.afterOrderList = result.list;
        },
    },
    created(){
        this.getSetting();
        // 获取七天后的采购订单数据
        this.getBuys();
    },
    mounted(){

    }
}
</script>

<style lang="scss" scoped>
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
            padding: 20px;
            .el-form-item{
                width:32%;
                margin:0;
                .el-form-item__label{
                    font-weight: bold;
                }
            }
            .el-row{
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
    .warning{
        color:red;
        font-size: 14px;
        font-weight: 700;
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
                    &:last-child{
                      border:0;
                    }
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
