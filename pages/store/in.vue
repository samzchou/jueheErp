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
                        <el-form-item label="业务类型：" prop="typeId">
                            <el-select v-model="searchForm.typeId" placeholder="请选择" clearable style="width:100px" @change="searchForm.crmId=''">
                                <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="客户：" prop="crmId">
                            <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                                <el-option v-for="item in crmList.filter(o=>{return searchForm.typeId?o.typeId==searchForm.typeId:o})" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="库位：" prop="storeNoId">
                            <el-select v-model="searchForm.storeNoId" placeholder="请选择" clearable style="width:100px">
                                <el-option v-for="item in storeNoList" :key="item.id" :label="item.name" :value="item.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="货品名称：" prop="productName">
                            <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="物料号：" prop="materialNo">
                            <el-input v-model="searchForm.materialNo" clearable  style="width:120px"/>
                        </el-form-item>
                        <el-form-item label="入库日期：" prop="createDate">
                            <el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
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
            <el-table v-loading="listLoading" class="detail-table" ref="detailStore"
            :data="gridList"
            border fit highlight-current-row stripe
            size="mini" @row-click="detailStoreClick" max-height="500">
              <el-table-column type="expand">
                <template slot-scope="props">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <span>原始订单号：</span>
                      <span>{{props.row.order.sourceserial}}</span>
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
                      <span>{{props.row.order.price | currency}}</span>
                    </el-col>
                    <el-col :span="8">
                      <span>合计：</span>
                      <span>{{parseMoney(props.row.order)}}</span>
                    </el-col>
                    <el-col :span="8">
                        <span>存放库位：</span>
                        <span>{{parseStoreNo(props.row.storeNoId)}}</span>
                    </el-col>
                    <el-col :span="16">
                      <span>备注：</span>
                      <span>{{props.row.content}}</span>
                    </el-col>
                  </el-row>
                </template>
              </el-table-column>
              <el-table-column prop="typeId" label="入库来源" width="70">
                <template slot-scope="scope">
                  <span>{{parseType(scope.row.typeId)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="当前状态" prop="serial" width="80">
                <template slot-scope="scope">
                  <span>{{parseFlow(scope.row.order.flowStateId)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="系统订单号" prop="serial" width="150"/>
              <el-table-column label="货品名称" prop="productName"/>
              <el-table-column label="客户（供应商）" prop="crmName"/>
              <el-table-column label="物料号" prop="materialNo"/>
              <el-table-column label="单位" width="70">
                  <template slot-scope="scope">
                      <span>{{scope.row.order.util}}</span>
                  </template>
              </el-table-column>
              <el-table-column label="入库量" prop="count" width="70"/>
              <el-table-column prop="createDate" label="入库日期" width="100">
                  <template slot-scope="scope">
                      <span>{{parseDate(scope.row.createDate)}}</span>
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
                <el-form-item label="入库物料">
                    <div style="color:#e45c5c;font-size:12px;">{{rowData.length?'已选'+rowData.length+'件货品，请确认实际入库量,可重新编辑数量':'请选择右侧订单货品'}}</div>
                    <div class="form-plist">
                        <el-table :data="rowData" size="mini" style="width: 100%" max-height="400">
                            <div slot="empty">暂无选中的货品</div>
                            <el-table-column prop="productName" label="货品名称"/>
                            <el-table-column prop="materialNo" label="物料号/版本号"/>
                            <el-table-column prop="count" label="数量" width="80">
                                <template slot-scope="scope">
                                    <!-- <div v-if="!scope.row.edit" class="edit-content" @click="scope.row.edit=true" title="点击编辑数量"> -->
                                    <div class="edit-content">
                                        <span>{{scope.row.count}}</span>
                                        <!-- <i class="el-icon-edit"/> -->
                                    </div>
                                    <!-- <div v-else class="edit-content">
                                        <input v-model="scope.row.count" @blur="scope.row.edit=false"/>
                                    </div> -->
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
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0" icon="my-icon-save">提交入库</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>
                    <div>未入库<span>{{ruleForm.typeId==1?'采购':'销售'}}</span>订单列表</div>
                    <div>
                        <el-form :inline="true" :model="searchInput" size="mini" @keyup.native.enter="searchFilter">
                            <el-form-item>
                                <el-select v-model="searchInput.crmId" placeholder="选择客户" @change="searchFilter" style="width:150px;">
                                    <el-option v-for="crm in orderCrmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-date-picker v-model="searchInput.deliveryDate" value-format="timestamp" type="date" placeholder="选择交付日期" style="width:140px;"/>
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
                <el-table :data="oList" ref="detailTable" border fit highlight-current-row stripe  size="mini" max-height="400" @selection-change="selectionRow"  v-loading="loadingIn">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <span>原始订单号：{{props.row.sourceserial}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span :title="props.row.projectNo">项目号：{{props.row.projectNo}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>项目名称：{{props.row.projectName}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>型号/梯号：{{props.row.modelNo}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>单价：{{props.row.price | currency}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>{{ruleForm.typeId==1?'供应商':'客户'}}：{{props.row.crmName}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>制单日期：{{parseDate(props.row.orderDate)}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>制单人：{{props.row.createByUser}}</span>
                                </el-col>
                                <el-col :span="12">
                                    <span>备注：{{props.row.content}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="系统订单号" width="150px"/>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="货品名称"/>
                    <el-table-column prop="materialNo" label="物料号/版本号"/>
                    <el-table-column prop="model" label="规格/型号"/>
                    <el-table-column prop="count" label="数量" width="80px">
                        <template slot-scope="scope">
                        <span>{{scope.row.count}} {{scope.row.util}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="page-container" style="padding: 10px 0;">
                    <span>{{ruleForm.typeId==1?'供应商':'客户'}}：</span>
                    <span>{{parseCrm(searchInput.crmId)}}</span>
                    <span style="margin-left:20px;">共计{{orderTotal}}个原始订单；</span>
                    <span v-if="ruleForm.typeId==1">已合并为{{oList.length}}个订单</span>
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
            setting:{},
            searchInput:{
                crmId:'',
                deliveryDate:'',
                keyword:''
            },
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
            crmList:[],
            typeList:[],//settings.type,
            orderList:[],
            oList:[],
            storeNoList:[],//settings.storeNo,
            gridList:[],
            rowData:[],
            lastId:0,
            isLike:true,
            searchLike:{
                keyword:''
            },
            searchForm:{
                serial:'',
                typeId:'',
                storeNoId:'',
                productName:'',
                materialNo:'',
                crmId:'',
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
            },
            orderCrmList:[],
            loadingIn:false,
        }
    },
    methods:{
        detailStoreClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['detailStore'].toggleRowExpansion(row, row.extend);
        },
        detailRowClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['detailTable'].toggleRowExpansion(row, row.extend);
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
            return type?type.name:'';
        },
        parseStoreNo(id){
            if(!id || id=='') return '';
            let type = _.find(this.storeNoList, {id:id});
            return type?type.name:'';
        },
        parseFlow(id){
            if(!id || id=='') return '';
            let type = _.find(this.setting.flowState, {id:id});
            return type?type.name:'';
        },
        parseCrm(id){
            if(!id || id=='') return '';
            let type = _.find(this.setting.crm, {id:id});
            return type?type.name:'';
        },
        selectionRow(selection){
            this.rowData = [];
            selection.forEach(item=>{
                this.rowData.push({
                    orderId:item.id,
                    serial:item.serial,
                    productName:item.productName,
                    crmId:item.crmId,
                    crmName:item.crmName,
                    materialNo:item.materialNo,
                    count:item.count,
                    orderIds:item.orderIds,
                    edit:false
                });
            })
        },
        submitSave(){
            //debugger
            let orderIds = [];
            let dataList = this.rowData.map((item,index)=>{
                //this.lastId = this.lastId + index + 1;
                item = _.merge({},this.ruleForm, item);
                item.count = parseInt(item.count);
                item.incount = parseInt(item.count);
                item.createByUser = this.$store.state.user.name;
                item.id = this.lastId + index + 1;;
                orderIds.push(item.orderId);
                if(item.orderIds && item.orderIds.length){
                    orderIds = orderIds.concat(item.orderIds);
                }
                delete item.edit;
                return item;
            });
            console.log(dataList);
            //return;
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addPatch',
                        collectionName: 'store',
                        notNotice:true,
                        data:dataList
                    }
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this._getLastId();
                        this.clearData(orderIds);
                    });
                }
            });
        },
        async clearData(ids){
            let condition = {
                type:'updatePatch',
                collectionName: 'order',
                param:{'id':{$in:ids}},
                set:{$set:{'flowStateId':this.ruleForm.typeId==1?3:8}}
            }
            let reuslt = await this.$axios.$post('mock/db', {data:condition});
            this.query.page = 1;
            this.rowData = [];
            this.getOrderCrm();
            //this.getOrderList();
            this.getList();
        },
        handleAdd(){
            this.isEdit = true;
            this._getLastId();
            this.getOrderCrm();
        },
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },
        viewByType(typeId){
            this.searchForm.typeId = typeId;
            this.submitSearch();
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
                    pagesize:20
                }
            }
            this.getList(params);
        },

        filterPtype(val){
            this.rowData = [];
            this.searchInput.keyword = '';
            this.getOrderCrm();
        },
        searchFilter(){
            let params = {};
            if(this.searchInput.deliveryDate){
                params.deliveryDate = this.searchInput.deliveryDate;
            }
            params.crmId = this.searchInput.crmId;
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
        },

        // 获取订单中的客户
        async getOrderCrm(){
            this.loadingIn = true;
            let cnData = {isPayed:false,typeId:this.ruleForm.typeId,flowStateId:this.ruleForm.typeId==1?2:7}
            this.orderCrmList = [];
            let condition = {
                type:'distinctData',
                collectionName: 'order',
                distinct:'crmId',
                data:cnData
            };
            let cl = await this.$axios.$post('mock/db', {data:condition});
            this.searchInput.crmId = cl[0];
            cl.forEach(id=>{
                let crm = _.find(this.setting.crm,{'id':id});
                this.orderCrmList.push(crm);
            });
            this.orderCrmList = _.orderBy(this.orderCrmList,['crmId'],['asc']);
            this.searchFilter();
        },
        async getOrderList(params={}){
            let cnData = {isPayed:false,typeId:this.ruleForm.typeId,flowStateId:this.ruleForm.typeId==1?2:7}
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:_.merge(params, cnData)
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.orderTotal = result.total;
            this.orderList = _.cloneDeep(result.list);
            this.oList = this.ruleForm.typeId==1?this.mergeOrder(result.list):result.list;
            this.loadingIn = false;
            //this.orderList = this.mergeOrder(result.list);//result.list;
            //this.oList = this.ruleForm.typeId==1?this.mergeOrder(result.list):result.list;
            //this.orderTotal = this.oList.length;
        },
        // 合并订单数量,根据类型，产品名称，物料号，价格，项目号
		mergeOrder(lists){
			let listData = [];
			this.crmOrderIds = [];
			lists.forEach(item=>{
				this.crmOrderIds.push(item.id);
                let dataIndex = -1;
                if(this.ruleForm.typeId==1){
                    dataIndex = _.findIndex(listData,{'typeId':item.typeId,'productName':item.productName,'materialNo':item.materialNo,'price':item.price,'caselNo':item.caselNo});
                }else{
                    dataIndex = _.findIndex(listData,{'typeId':item.typeId,'productName':item.productName,'materialNo':item.materialNo,'model':item.model,'modelNo':item.modelNo,'price':item.price,'caselNo':item.caselNo});
                }
				if(dataIndex>-1){
                    listData[dataIndex]['orderIds'].push(item.id);
					let sIndex = listData[dataIndex]['sourceserial'].split(',');
					if(!~sIndex){
						listData[dataIndex]['sourceserial'] += ','+item.sourceserial;
					}
					if(listData[dataIndex]['projectNo'].indexOf(item.projectNo)<0){
						listData[dataIndex]['projectNo'] += ','+item.projectNo;
					}
					listData[dataIndex]['count'] += item.count;
				}else{
                    item.orderIds = [];
					listData.push(item);
				}
			});
			return listData;
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
                this.crmList = this.setting.crm;
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
    .detail-table{
        /deep/ .el-table__expanded-cell{
            padding: 15px 20px;
            background-color: #eafbff;
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
        }
        /deep/ .el-table__row{
            .cell{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
            padding: 10px 0;
            font-size: 14px;
            display:flex;
            align-items:center;
            justify-content: space-between;
            span{
                color:#ff6c00;
                margin:0 5px;
            }
            /deep/ .el-form-item {
                margin-bottom: 0;
            }
        }
        /deep/ .el-table{
          .el-table__expanded-cell{
            padding:10px 20px;
            background-color: #eafbff;
            .el-row{
              .el-col{
                line-height: 25px;
                display: block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
            
          }
          .cell{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .edit-content{
                >span{
                    width:30px;
                    display:inline-block;
                    text-align: right;
                }
            }
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
