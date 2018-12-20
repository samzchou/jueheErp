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
                </div>
                <div v-else>
                    <el-button @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
                </div>
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
                            <el-input v-model="searchForm.serial" clearable  style="width:150px"/>
                        </el-form-item>
                        <el-form-item label="库位：" prop="storeNoId">
                            <el-select v-model="searchForm.storeNoId" placeholder="请选择" clearable style="width:100px">
                                <el-option v-for="item in storeNoList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="出库去向：" prop="outTypeId">
                            <el-select v-model="searchForm.outTypeId" placeholder="请选择" clearable style="width:100px">
                                <el-option v-for="item in $store.state.storeTarget.filter(o=>{return o.id<4})" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="货品名称：" prop="productName">
                            <el-input v-model="searchForm.productName" clearable  style="width:150px"/>
                        </el-form-item>
                        <el-form-item label="客户：" prop="crmId">
                            <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                                <el-option v-for="item in crmList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="物料号：" prop="materialNo">
                            <el-input v-model="searchForm.materialNo" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="出库日期：" prop="updateDate">
                            <el-date-picker v-model="searchForm.updateDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px"/>
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                    <el-form-item v-if="!isLike">
                        <el-button type="text" @click="isLike=true">模糊查找</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading"  ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini"   @row-click="detailStoreClick" max-height="500">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <span>订单状态：</span>
                                    <span>{{parseFlow(props.row.order.flowStateId)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>原始订单号：</span>
                                    <span>{{props.row.order.sourceserial}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>制单日期：</span>
                                    <span>{{parseDate(props.row.order.orderDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>交付日期：</span>
                                    <span>{{parseDate(props.row.order.deliveryDate)}}</span>
                                </el-col>
                                <el-col :span="8" :title="props.row.order.projectNo">
                                    <span>项目号：</span>
                                    <span>{{props.row.order.projectNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目名称：</span>
                                    <span>{{props.row.order.projectName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯型：</span>
                                    <span>{{props.row.order.model}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯号：</span>
                                    <span>{{props.row.order.modelNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>订单数量：</span>
                                    <span>{{props.row.order.count}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>单位：</span>
                                    <span>{{props.row.order.util}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>单价：</span>
                                    <span>{{props.row.order.price}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>合计：</span>
                                    <span>{{parseMoney(props.row.order)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>存放库位：</span>
                                    <span>{{parseStoreNo(props.row.storeNoId)}}</span>
                                </el-col>
                                <el-col :span="24">
                                    <span>备注：</span>
                                    <span>{{props.row.content}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="typeId" label="出库去向" width="70">
                        <template slot-scope="scope">
                            <span>{{parseType(scope.row.outTypeId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="系统订单号">
                        <template slot-scope="scope">
                            <span>{{scope.row.serial}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="原始订单号">
                        <template slot-scope="scope">
                            <span>{{scope.row.order.sourceserial}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="客户名称">
                        <template slot-scope="scope">
                            <span>{{scope.row.crmName}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="货品名称">
                        <template slot-scope="scope">
                            <span>{{scope.row.productName}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="物料号">
                        <template slot-scope="scope">
                            <span>{{scope.row.materialNo}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" label="入库量" width="80">
                        <template slot-scope="scope">
                            <span>{{scope.row.count}} {{scope.row.order.util}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="outcount" label="出库量" width="80">
                        <template slot-scope="scope">
                            <span>{{scope.row.outcount}} {{scope.row.order.util}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateDate" label="出库日期" width="100">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.updateDate)}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div v-else class="form-plit">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" size="mini">
                <el-form-item label="出库来源" prop="ptypeId">
                    <el-radio-group v-model="ruleForm.typeId" @change="filterPtype">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="出库货品">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品':'请选择右侧库存货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" size="mini" style="width: 100%" max-height="350">
                            <div slot="empty">暂无选中的货品</div>
                            <el-table-column prop="productName" label="出库货品"/>
                            <el-table-column prop="count" label="出库数量" width="70">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit" class="edit-content" @click="scope.row.edit=true" title="点击编辑数量">
                                   <!--  <div v-if="!scope.row.edit" class="edit-content"> -->
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
                        <el-option v-for="item in $store.state.storeTarget.filter(o=>{return o.id<4})" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注说明">
                    <el-input v-model="ruleForm.updateContent"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0" icon="my-icon-save">提交出库</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>
                    <div><span>库存列表</span></div>
                    <div>
                        <el-form :inline="true" :model="searchInput" size="mini" @keyup.native.enter="searchFilter">
                            <el-form-item>
                                <el-select v-model="searchInput.crmId" placeholder="请选择客户" style="width:250px;" @change="searchFilter" clearable >
                                    <el-option v-for="crm in orderCrmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-input suffix-icon="el-icon-search" placeholder="输入关键字" v-model="searchInput.keyword" clearable style="width:120px;"  @change="searchFilter"/>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="searchFilter">查询</el-button>
                            </el-form-item>
                        </el-form>
                        <!-- <el-input size="mini" prefix-icon="el-icon-search" placeholder="快速查询" v-model="searchInput" @keyup.native="searchFilter"/> -->
                    </div>
                </h5>
                <el-table :data="sList" border fit highlight-current-row stripe  size="mini" max-height="400" @selection-change="selectionRow" v-loading="outLoading">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <span>原始订单号：</span><span>{{props.row.order.sourceserial}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span :title="props.row.order.projectNo">项目号：</span><span>{{props.row.order.projectNo}}</span>
                                </el-col>
                                <el-col :span="12">
                                <span>项目名称：</span><span>{{props.row.order.projectName}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>型号/梯号：</span><span>{{props.row.order.modelNo}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>单价：</span><span>{{props.row.order.price | currency}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>订单总量：</span><span>{{props.row.count}} {{props.row.order.util}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>已出库量：</span><span>{{props.row.outcount}} {{props.row.order.util}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>{{ruleForm.typeId==1?'供应商':'客户'}}：</span><span>{{props.row.crmName}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>制单日期：</span><span>{{parseDate(props.row.order.orderDate)}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>交付日期：</span><span>{{parseDate(props.row.order.deliveryDate)}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>制单人：</span><span>{{props.row.createByUser}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>备注：</span><span>{{props.row.content}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="系统订单号"/>
                    <el-table-column prop="productName" label="货品名称"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.order.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="materialNo" label="物料号"/>
                    <el-table-column prop="model" label="规格/型号">
                        <template slot-scope="scope">
                            <span>{{scope.row.order.model}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" label="库存量" width="80px">
                        <template slot-scope="scope">
                            <span>{{scope.row.incount}} {{scope.row.order.util}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="page-container" style="padding: 10px 0;">
                    <el-pagination size="mini" @size-change="storeSizeChange" @current-change="storeCurrentChange" :current-page.sync="queryStore.page" :page-sizes="[20,50,100,200]" :page-size="queryStore.pagesize" layout="total,sizes,prev,pager,next" :total="storeTotal">
                    </el-pagination>
                </div>
            </div>
        </div>
       
        
    </section>
</template>

<script>
export default {
    data(){
        return {
            currItem:null,
            searchInput:{
                crmId:'',
                keyword:''
            },
            orderCrmList:[],
            listLoading:false,
            isEdit:false,
            editRow:null,
            flowStateList:[
                {label:'待入库',value:1},{label:'已入库',value:2}
            ],
            total:0,
            query:{
                page:1,
                pagesize:50
            },
            storeTotal:0,
            queryStore:{
                page:1,
                pagesize:100
            },
            typeList:[],//settings.type,
            storeList:[],
            crmList:[],
            sList:[],
            storeNoList:[],//settings.storeNo,
            gridList:[],
            rowData:[],
            isLike:true,
            searchLike:{
                keyword:''
            },
            searchForm:{
                serial:'',
                outTypeId:'',
                storeNoId:'',
                crmId:'',
                materialNo:'',
                productName:'',
                updateDate:'',
            },
            ruleForm:{
                typeId:1,
                outTypeId:'',
                outcount:'',
                updateContent:''
            },
            rules:{
                outTypeId: [
                    { required: true, message: '请选择出库去向', trigger: 'change'},
                ]
            },
            //checkColumnList:['serial','crmName','productName','materialNo','model','modelNo','util','price','outcount','allPrice','outDate'],
            columnList:[
                {label:'订单编号',value:'serial'},
                {label:'客户名称',value:'crmName'},
                {label:'货品名称',value:'productName'},
                {label:'物料号',value:'materialNo'},
                {label:'规格/梯型',value:'model'},
                {label:'型号/梯号',value:'modelNo'},
                {label:'单位',value:'util'},
                {label:'单价',value:'price'},
                {label:'出库量',value:'outcount'},
                {label:'总价',value:'allPrice'},
                {label:'出库日期',value:'outDate'}
            ],
            exportLoading:false,
            searchExport:{
                //crmId:'',
                deliveryDate:'',
                boxNo:'',
            },
            searchExportRules:{
                //crmId:[{ required: true, message: '请选择客户', trigger: 'change'}],
                deliveryDate:[{ required: true, message: '请选择交付日期', trigger: 'change'}]
            },
            outLoading:false,
            //sendList:[],
        }
    },
    methods:{
        
        detailStoreClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['detailStore'].toggleRowExpansion(row, row.extend);
        },

        childrenClick(row){
            if(!row.projectNo) return;
            row.extend = !row.extend?true:false;
            this.$refs['exportTable'].toggleRowExpansion(row, row.extend);
        },

        handlePrint(){
            this.$print(this.$refs.print)
        },
        checkOutCount(row){
            console.log(row);
            if(row.outcount > row.incount || row.outcount <=0 ){
                this.$message.error('请正确出库数量不符！最大出库量：' + row.incount);
                row.outcount = row.incount;
            }
            row.edit = false;
        },
        parseFlow(id){
            if(!id) return '';
            let flow = _.find(this.setting.flowState, {'id':id});
            return flow?flow.name:'';
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parseReleaseMoney(row){
            return this.$options.filters['currency'](row.outcount*row.order.price);
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
            console.log('selection',selection);
            selection.forEach(item=>{
                this.rowData.push({
                    id:item.id,
                    orderId:item.orderId,
                    productName:item.productName,
                    incount:item.incount,
                    oldoutCount:item.outcount,
                    outcount:item.incount,
                    orderIds:item.orderIds,
                    edit:false
                });
            })
        },
        submitSave(){
            let orderIds = [];
            let dataList = this.rowData.map((item,index)=>{
                item = _.merge({}, this.ruleForm, item);
                item.incount -= item.outcount;
                item.outcount = parseInt(item.outcount) + parseInt(item.oldoutCount);
                item.updateByUser = this.$store.state.user.name;
                orderIds.push(item.orderId);
                if(item.orderIds && item.orderIds.length){
                    orderIds = orderIds.concat(item.orderIds);
                }
                delete item.edit,delete item.oldoutCount,delete item.orderIds;
                return item;
            });
            console.log('submitSave',dataList);
            //return;
            this.$refs['ruleForm'].validate((valid) => {
            if(valid) {
                let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                let condition = {
                    type:'updateArr',
                    collectionName: 'store',
                    notNotice:true,
                    updateDate:true,
                    data:dataList
                }
                //更新库品数据
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    // 更新订单流程状态
                    let cn = {
                        type:'updatePatch',
                        collectionName: 'order',
                        param:{'id':{$in:orderIds}},
                        set:{$set:{'flowStateId':this.ruleForm.typeId==1?4:9,'outTypeId':this.ruleForm.outTypeId}}
                    }
                    this.$axios.$post('mock/db', {data:cn}).then(result=>{
                        loadingMask.close();
                        this.query.page = 1;
                        let params = {typeId:this.ruleForm.typeId};
                        if(this.searchInput.crmId){
                            params.crmId = this.searchInput.crmId;
                        }
                        this.getStoreList(params);
                        this.getList();
                    });
                });
            }
            });
        },
        handleAdd(){
            this.isEdit = true;
            this.getOrderCrm();
            //this.getStoreList({typeId:1});
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
                        {'productName':{'$regex':keyWord}},
                        {'crmName':{'$regex':keyWord}},
                        {'materialNo':{'$regex':keyWord}},
                        {'projectNo':{'$regex':keyWord}},
                        {'boxNo':{'$regex':keyWord}},
                        {'model':{'$regex':keyWord}},
                        {'modelNo':{'$regex':keyWord}},
                        {'projectName':{'$regex':keyWord}},
                        {'caselNo':{'$regex':keyWord}},
                        {'content':{'$regex':keyWord}}
                        ]
                    };
                }
            }else{
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
            }
            if(!flag){ // 不需要再做分页复位
                this.query = {
                    page:1,
                    pagesize:20
                }
            }
            this.getList(params);
        },
        filterPtype(val){
            this.queryStore = {page:1,pagesize:100};
            this.rowData = [];
            this.searchInput.crmId = '';
            this.searchInput.keyword = '';
            //this.sList = [];
            this.getOrderCrm();
        },
        searchFilter(){
            let params = {};
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
            this.getStoreList(params);
        },
        storeSizeChange(val){
            this.queryStore.pagesize = val;
            this.getStoreList();
        },
        storeCurrentChange(val){
            this.queryStore.page = val;
            this.getStoreList();
        },
        // 获取订单中的客户
        async getOrderCrm(){
            let cnData = {storeTypeId:1,incount:{$gt:0},typeId:this.ruleForm.typeId}
            this.orderCrmList = [];
            let condition = {
                type:'distinctData',
                collectionName: 'store',
                distinct:'crmId',
                data:cnData
            };
            let cl = await this.$axios.$post('mock/db', {data:condition});
            //this.searchInput.crmId = cl[0];
            cl.forEach(id=>{
                let crm = _.find(this.setting.crm,{'id':id});
                this.orderCrmList.push(crm);
            });
            this.orderCrmList = _.orderBy(this.orderCrmList,['crmId'],['asc']);
            this.searchFilter();
        },
        // 获取入库数据
        async getStoreList(match={}){
            this.outLoading = true;
            //debugger
            let condition = {
                type:'aggregate',
                collectionName: 'store',
                data:_.merge({storeTypeId:1,incount:{$gt:0},typeId:this.ruleForm.typeId}, match),
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
                    {$match:_.merge({storeTypeId:1, incount:{$gt:0}, typeId:this.ruleForm.typeId}, match)},
                    {$sort:{_id:-1}},
                    {$skip:(this.queryStore.page-1)*this.queryStore.pagesize},
                    {$limit:this.queryStore.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.storeTotal = result.total;
            //this.storeList = result.list;
            this.sList = result.list;//_.cloneDeep(result.list);
            this.outLoading = false;
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
                {$match:_.merge({outcount:{$gt:0}},match)},
                {$sort:{id:-1}},
                {$skip:(this.query.page-1)*this.query.pagesize},
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
            console.log('getSetting',result)
            this.setting = result.content;
            this.typeList = this.setting.type;
            this.crmList = this.setting.crm;
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
            padding:10px 0;
            font-size: 14px;
            display:flex;
            align-items:center;
            justify-content: space-between;
            >span{
                color:#ff6c00;
            }
            /deep/ .el-form-item {
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
            >span,>i{
                pointer-events: none;
            }
            >span{
                width:30px;
                display:inline-block;
                text-align: right;
            }
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
