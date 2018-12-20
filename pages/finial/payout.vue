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
                    <template v-if="isLike">
                        <el-form-item label="模糊查找：" prop="keyword">
                            <el-input v-model="searchLike.keyword" clearable  style="width:150px" @blur="submitSearch"/>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="text" @click="isLike=false">高级查找</el-button>
                        </el-form-item>
                        </template>
                    <template v-else>
                        <el-form-item label="系统订单号：" prop="serial">
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
                        <el-form-item label="付款日期：" prop="createDate">
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
            <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" ref="payedTable"  @row-click="detailPayedClick">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <span>原始订单号：</span>
                                <span>{{props.row.order.sourceserial}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>物料号：</span>
                                <span>{{props.row.materialNo}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>规格/梯型：</span>
                                <span>{{props.row.order.model}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>型号/梯号：</span>
                                <span>{{props.row.order.modelNo}}</span>
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
                                <span>制单日期：</span>
                                <span>{{parseDate(props.row.order.orderDate)}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>交付日期：</span>
                                <span>{{parseDate(props.row.order.deliveryDate)}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>付款日期：</span>
                                <span>{{parseDate(props.row.order.createDate)}}</span>
                            </el-col>
                            <el-col :span="8">
                                <span>付款人：</span>
                                <span>{{props.row.createByUser}}</span>
                            </el-col>
                            <el-col :span="16">
                                <span>备注：</span>
                                <span>{{props.row.content}}</span>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column label="No." width="70px" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="serial" label="系统订单号"/>
                <el-table-column prop="crmName" label="客户名称"/>
                <el-table-column prop="productName" label="付款货品"/>
                <el-table-column prop="materialNo" label="物料号"/>
                <el-table-column prop="price" label="单价" width="100">
                    <template slot-scope="scope">
                        <span>{{scope.row.price | currency}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="数量">
                    <template slot-scope="scope">
                        <span>{{scope.row.count}} {{scope.row.util}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="合计金额">
                    <template slot-scope="scope">
                        <span>{{parseMoney(scope.row)}}</span>
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
                        <el-table :data="rowData" size="mini" stripe style="width: 100%" max-height="400">
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
                    <el-button type="primary" @click="submitSave" :disabled="rowData.length==0" icon="my-icon-save">确认付款</el-button>
                    <el-button type="infor" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
            <div class="grid-list">
                <h5>
                    <div><span>已采购入库未付款订单列表</span></div>
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
                <el-table
                :data="oList" border fit highlight-current-row stripe size="mini" ref="payTable" max-height="400" 
                @selection-change="selectionRow" v-loading="orderLoading">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <span>系统订单号：</span><span>{{props.row.serial}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>原始订单号：</span><span>{{props.row.sourceserial}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>物料号：</span><span>{{props.row.materialNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯形：</span><span>{{props.row.model}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯号：</span><span>{{props.row.modelNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目号：</span><span>{{props.row.projectNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目名称：</span><span>{{props.row.projectName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>制单日期：</span><span>{{parseDate(props.row.orderDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>交付日期：</span><span>{{parseDate(props.row.deliveryDate)}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>供应商：</span><span>{{props.row.crmName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>联系地址：</span><span>{{parseCrm(props.row.crmId,'address')}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>联系人：</span><span>{{parseCrm(props.row.crmId,'contactName')}} {{parseCrm(props.row.crmId,'contactPhone')}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>税号：</span><span>{{parseCrm(props.row.crmId,'revenueNo')}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>开户银行：</span><span>{{parseCrm(props.row.crmId,'bank')}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>银行账号：</span><span>{{parseCrm(props.row.crmId,'bankNo')}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" type="selection"/>
                    <el-table-column prop="serial" label="系统订单号"/>
                    <el-table-column prop="deliveryDate" label="交付日期">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="物料名称"/>
                    <el-table-column prop="materialNo" label="物料号"/>
                    <el-table-column prop="count" label="数量">
                        <template slot-scope="scope">
                            {{scope.row.count}} {{scope.row.util}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="单价">
                        <template slot-scope="scope">
                            {{scope.row.price | currency}}
                        </template>
                    </el-table-column>
                    <el-table-column label="金额">
                        <template slot-scope="scope">
                            {{parseMoney(scope.row)}}
                        </template>
                    </el-table-column>
                </el-table>
                <div style="padding:10px 0">共有{{this.orderTotal}}个原始订单，已合并为{{this.oList.length}}个订单需付款</div>
            </div>
        </div>
        <el-dialog title="订单明细查阅" :visible.sync="openDialogVisible" width="40%">
            <div class="compare" v-if="currItem" style="margin-top:-10px">
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
            searchInput:{
                crmId:'',
                deliveryDate:'',
                keyword:''
            },
            query:{
                page:1,
                pagesize:50
            },
            orderTotal:0,
            queryOrder:{
                page:1,
                pagesize:50
            },
            typeList:[],//settings.type,
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
                crmName:'',
                productName:'',
                crmId:'',
                materialNo:'',
                createDate:'',
            },
            ruleForm:{
                payType:1,
                createByUser:'',
                content:''
            },
            orderCrmList:[],
            crmOrderIds:[],
            orderLoading:false,
        }
    },
    methods:{
        detailPayedClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['payedTable'].toggleRowExpansion(row, row.extend);
        },
        detailPayClick(row){
            row.extend = !row.extend?true:false;
            this.$refs['payTable'].toggleRowExpansion(row, row.extend);
        },
        parseCrm(id, key){
            let crm = _.find(this.crmList,{'id':id});
            return crm[key] || '--';
        },
        showOrderInfo(row){
            this.openDialogVisible = true;
            this.currItem = row;
            //console.log('showOrderInfo',row)
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
            this.crmOrderIds = [];
            this.rowData = [];
            this.payMoney = 0;
            selection.forEach(item=>{
                this.crmOrderIds.push(item.id);
                if(item.orderIds && item.orderIds.length){
                    this.crmOrderIds = this.crmOrderIds.concat(item.orderIds);
                }
                this.rowData.push({
                    orderId:item.id,
                    orderIds:item.orderIds,
                    serial:item.serial,
                    crmId:item.crmId,
                    crmName:item.crmName,
                    productName:item.productName,
                    materialNo:item.materialNo,
                    util:item.util,
                    price:item.price,
                    count:item.count
                });
                this.payMoney += item.price * item.count;
            })
        },
        submitSave(){
            //debugger
            let dataList = this.rowData.map((item,index)=>{
                item = _.merge({},this.ruleForm, item);
                item.createByUser = this.$store.state.user.name;
                item.id = this.lastId + index + 1;
                return item;
            });
            console.log('dataList', dataList, this.crmOrderIds);
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
                set:{$set:{'isPayed':true}}
            }
            let reuslt = await this.$axios.$post('mock/db', {data:condition});

            this.rowData = [];
            this.oList = [];
            this.orderTotal = 0;
            this.searchFilter();

            //this.isEdit = false;
            this.query.page = 1;
            this.getList();
        },
        handleAdd(){
            this.isEdit = true;
            this._getLastId();
            this.searchFilter();
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
        orderCurrentChange(val){
            this.queryOrder.page = val;
        },
        orderSizeChange(val){
            this.queryOrder.pagesize = val;
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
        async getOrderList(params={}){
            this.orderLoading = true;
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:_.merge({typeId:1,flowStateId:{$gt:2},isPayed:false}, params)
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.orderTotal = result.total;
            //this.orderList = result.list;
            this.oList = this.mergeOrder(result.list);
            this.orderLoading = false;
        },
        // 合并订单数量,根据类型，产品名称，物料号，价格，项目号
		mergeOrder(lists){
			let listData = [];
			//this.crmOrderIds = [];
			lists.forEach(item=>{
				//this.crmOrderIds.push(item.id);
				let dataIndex = _.findIndex(listData,{'typeId':item.typeId,'productName':item.productName,'materialNo':item.materialNo,'price':item.price,'caselNo':item.caselNo});
				if(dataIndex>-1){
					let sIndex = listData[dataIndex]['sourceserial'].split(',');
					if(!~sIndex){
						listData[dataIndex]['sourceserial'] += ','+item.sourceserial;
					}
					if(listData[dataIndex]['projectNo'].indexOf(item.projectNo)<0){
						listData[dataIndex]['projectNo'] += ','+item.projectNo;
					}
                    listData[dataIndex]['count'] += item.count;
                    listData[dataIndex]['orderIds'].push(item.id);
				}else{
                    item.orderIds = [];
					listData.push(item);
				}
            });
            console.log('listData', listData)
			return listData;
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
                    {$sort:{_id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
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
                    model:'finance'
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
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.crmList = _.filter(this.setting.crm, item=>{
                    return item.typeId == 1;
                });
                // 获取订单客户（未下单）
                let cn = {
                    type:'distinctData',
                    collectionName: 'order',
                    distinct:'crmId',
                    data:{flowStateId:{'$gt':2}}
                };
                this.$axios.$post('mock/db', {data:cn}).then(res=>{
                    res.forEach(id=>{
                        let crm = _.find(this.setting.crm,{'id':id});
                        this.orderCrmList.push(crm);
                    });
                    this.searchInput.crmId = res[0];
                });
                // 获取列表
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
</style>
