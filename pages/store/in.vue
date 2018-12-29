<template>
    <section class="order-main">
        <div class="head-title">
			<div>
				<div>
					<span :class="{'inactive':needSource}" @click="setOrderParams(true)">蒂森订单</span>
					<span :class="{'inactive':!needSource}" @click="setOrderParams(false)">珏合订单</span>
				</div>
			</div>
		</div>
        <div class="grid-container">
            <div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="蒂森订单号：" v-if="needSource" prop="sourceserial">
						<el-input v-model="searchForm.sourceserial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="系统订单号：" prop="serial">
						<el-input v-model="searchForm.serial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="订单状态：" prop="flowStateId">
						<el-select v-model="searchForm.storeTypeId" placeholder="请选择" style="width:90px">
							<el-option v-for="type in storeType" :key="type.id" :label="type.label" :value="type.id"/>
						</el-select>
					</el-form-item>
                    <el-form-item label="业务类型：" prop="typeId">
						<el-select v-model="searchForm.typeId" placeholder="请选择" style="width:100px" v-if="setting">
							<el-option v-for="type in setting.type" :key="type.id" :label="type.name" :value="type.id"/>
						</el-select>
					</el-form-item>
					<el-form-item :label="searchForm.typeId==1?'供应商：':'客户：'" prop="crmId" v-if="setting">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable filterable >
						    <el-option v-for="crm in setting.crm.filter(o=>o.typeId==searchForm.typeId)" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="产品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="物料号/版本号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="交付日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels  style="width:250px"/>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
            <el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList"
			border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column prop="isuse" label="订单状态" width="90">
					<template slot-scope="scope">
						<div>{{parseStoreType(scope.row.storeTypeId)}}</div>
					</template>
				</el-table-column>
				<el-table-column prop="serial" label="系统订单号" width="150"/>
                <el-table-column v-if="needSource" label="蒂森订单号" width="250">
					<template slot-scope="scope">
						<span :title="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="crmName" label="供应商" width="250px">
					<template slot-scope="scope">
						<el-button title="供应商订单汇总" type="text" @click.stop="showDetail(scope.row)">{{scope.row.crmName}}</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="productName" label="订单产品名称">
					<template slot-scope="scope">
						<span>{{scope.row.productName}}</span><span style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="count" label="总量" width="80px">
					<template slot-scope="scope">
						<span>{{scope.row.total}} 件</span>
					</template>
				</el-table-column>
				<el-table-column prop="deliveryDate" label="交付日期" width="100px">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" width="70">
					<template slot-scope="scope">
						<div v-if="!scope.row.storeTypeId">
							<el-button size="mini" type="text" @click="showDetail(scope.row)" icon="el-icon-circle-check">入库</el-button>
						</div>
						<span v-else style="color:#CCC">{{parseStoreType(scope.row.storeTypeId)}}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container">
				<div>共有{{total}}个采购订单，请点击供应商名称查阅或操作订单</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"/>
			</div>
        </div>
        <el-dialog :title="'仓库入库清单--'+(needSource?'蒂森采购清单':'珏合采购清单')" append-to-body :visible.sync="openOrderVisible" width="80%">
            <div class="order-title">
                <span v-if="currItem">供应商：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
            </div>
            <div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
                <span style="font-weight:bold">订单总价：{{parseAllOrderMoney(true)}}</span>
            </div>
            <div>
                <el-table ref="exportTable" :data="crmOrderList" border fit highlight-current-row stripe 
                size="mini" 
                max-height="350" 
                v-loading="searchLoading" 
                @selection-change="handleSelectionChange" >
                    <el-table-column type="selection" width="40" align="center" v-if="!searchForm.storeTypeId"/>
                    <el-table-column type="index" width="50" align="center"/>
                    <el-table-column prop="serial" label="系统订单号" width="120"/>
                    <el-table-column v-if="needSource" prop="sourceserial" label="蒂森订单编号"/>
					<el-table-column prop="materialNo" label="物料号" width="120"/>
					<el-table-column prop="productName" label="物料名称" />
                    <el-table-column prop="model" label="规格型号" width="100"/>
					<el-table-column prop="price" label="单价" width="100"/>
					<el-table-column prop="count" label="订单数量" width="100">
                        <template slot-scope="scope">
							<span>{{scope.row.count}} {{scope.row.util}}</span>
						</template>
                    </el-table-column>
                    <el-table-column prop="incount" label="实际数量" width="100px"/>
                    <el-table-column label="订单金额" width="100px">
                        <template slot-scope="scope">
							<span  v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
                            <span v-else>{{parseAllOrderMoney(true)}}</span>
						</template>
                    </el-table-column>
					<el-table-column prop="deliveryDate" label="交付日期" width="120px">
						<template slot-scope="scope">
                           <span>{{parseDate(scope.row.deliveryDate)}}</span>
						</template>
					</el-table-column>
                </el-table>
            </div>
            <div class="btns" v-if="crmOrderList.length">
				<div>
					<span>合计：共{{crmOrderList.length-1}}个采购订单；</span><span v-if="!searchForm.storeTypeId">请勾选需要入库的订单</span><span v-else>已入库</span>
				</div>
				<div>
					<el-button type="success" @click="inOrder" icon="el-icon-document" :disabled="!selectOrders.length" v-if="!searchForm.storeTypeId">采购订单入库</el-button>
                    <el-button @click="openOrderVisible=false">取消退出</el-button>
				</div>
			</div>
        </el-dialog>
    </section>
</template>

<script>
import {mapState} from 'vuex';
export default {
    computed: {
        ...mapState(['checkStatus','floor','seatList']),
    },
    data(){
        return {
            needSource:true,
            setting:null,
            listLoading:false,
            gridList:[],
            query:{
                page:1,
                pagesize:50
            },
            total:0,
            storeType:[
                {id:0,label:'未入库'},{id:1,label:'已入库'}
            ],
            searchForm:{
				serial:'',
				sourceserial:'',
				productName:'',
				crmId:'',
                materialNo:'',
                typeId:1,
				storeTypeId:0,
				deliveryDate:''
            },
            searchLoading:false,
            currItem : null,
            crmOrderList:[],
            openOrderVisible:false,
            selectOrders:[],
        }
    },
    methods:{
        handleSelectionChange(val){
            this.selectOrders = val;
        },
        // 提交入库
        inOrder(){
            console.log(this.selectOrders);
            if(!this.selectOrders.length){
                this.$message.error('请选择需要入库的订单！');
                return;
            }

            let storeIds = [];
            this.selectOrders.forEach((item,index)=>{
                if(item.id){
                    storeIds.push(item.id);
                }
            })
            let condition = {
                type:'updatePatch',
                collectionName: 'store',
                notNotice:true,
                param:{'id':{$in:storeIds}},
                set:{$set:{'storeTypeId':1,'updateByUser':this.$store.state.user.name,'updateDate':new Date().getTime()}}
            }
            console.log('inOrder', condition);

            this.$confirm('确定将所选订单入库, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message.success('所选订单已完成入库');
                    this.selectOrders = [];
                    this.crmOrderList = [];
                    this.openOrderVisible = false;
                    this.getList();
                });
            }).catch(() => {});
        },
        setRowData(row){
            row.allPrice = row.incount * row.price;
        },
        async showDetail(row){
            let crm = _.find(this.setting.crm, {'id':row.crmId});
            this.currItem = _.merge(row, {
                contactName:crm.contactName,
                contactPhone:crm.contactPhone,
                address:crm.address
            });
            debugger
            console.log('this.currItem', this.currItem);
            let bySerial = {'sourceserial':{$ne:''}};
			if(!this.needSource){
                bySerial = {'sourceserial':''};
            } 
            let params = _.merge(bySerial,{
                crmId:row.crmId,
                storeTypeId:row.storeTypeId,
                typeId:row.typeId
            });
            // 查询供应商的具体订单
            let condition = {
				type:"aggregate",
                collectionName:'store',
                data:params,
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
                    {$match:params},
                    {
						$addFields: {model:"$order.model"}
					},
                ]
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            //debugger
            this.crmOrderList = result.list;
            this.crmOrderList.push({serial:'合计'});
            this.parseAllOrderMoney();
            this.openOrderVisible = true;
        },
        showSourceOrder(sourceserial){
            console.log('showSourceOrder', sourceserial);
        },
        setOrderParams(flag){
            this.needSource = flag;
            this.getList();
        },
        handleDeleteBySerial(row){
            console.log('handleDeleteBySerial', row);
        },
        parseAllOrderMoney(flag){
			let money = 0, count = 0;
			this.crmOrderList.forEach((item,index)=>{
                if(index < this.crmOrderList.length-1){
                    count += item.incount;
                    money += item.incount*item.price;
                }
            });
            //debugger
            this.crmOrderList[this.crmOrderList.length-1]['incount'] = count;
            this.crmOrderList[this.crmOrderList.length-1]['allPrice'] = money;
            return this.$options.filters['currency'](money);
		},
        parseReleaseMoney(row){
            let money = row.incount * row.price;
            row.allPrice = money;
			return this.$options.filters['currency'](money);
		},
        parseDate(date, format){
			return date?moment(date).format(format||'YYYY-MM-DD'):'';
		},
        parseStoreType(id){
            if(id == undefined) return '';
            let type = _.find(this.storeType,{id:id});
            return type?type.label:'';
        },
        submitSearch(flag){
            let params = {};
			for(let k in this.searchForm){
				if(this.searchForm[k] && this.searchForm[k] != ''){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && k==='deliveryDate'){
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
					pagesize:50
				}
            }
			this.getList(params);
        },
        handleSizeChange(val){
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val){
			this.query.page = val;
			this.submitSearch(true);
		},
        async getList(match = {}){
            this.listLoading = true;
			let groupId = {"crmId":"$crmId"};
            let bySerial = {'sourceserial':{$ne:''}};
			if(!this.needSource){
                bySerial = {'sourceserial':''};
            } 
			match = _.merge(bySerial, match);
            let condition = {
				type:'groupList',
				collectionName: 'store',
				data:_.merge({typeId:1,storeTypeId:0}, match),
				distinct:"crmId",
				aggregate:[
					{"$match":_.merge({typeId:1,storeTypeId:0},match)},
					{ 
						"$group": {
							"_id": groupId, // 按字段分组
                            "id":{"$first" :"$id"},
                            "orderIds":{"$first" :"$orderIds"},
                            "storeTypeId":{"$first" :"$storeTypeId"},
                            "serial":{"$first" :"$serial"},
                            "sourceserial":{"$first" :"$sourceserial"},
							"crmId":{"$first" :"$crmId"},
                            "crmName":{"$first" :"$crmName"},
                            "productName":{"$first" :"$productName"},
                            "deliveryDate":{"$first" :"$deliveryDate"},
                            "total": { $sum: 1 }
						}
					},
					{"$sort":{'deliveryDate':1,'crmId':1}},
					{"$skip":(this.query.page-1)*this.query.pagesize},
					{"$limit":this.query.pagesize}
				]
			};
			
			let result = await this.$axios.$post('mock/db', {data:condition});
			this.total = result.total;
            this.gridList = _.orderBy(result.list,['crmId'], ['asc']);
            this.listLoading = false;
            console.log('this.gridList', this.gridList)
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
			}
		}
    },
    created(){
		this.getSetting();
	},
    mounted(){
        this.getList();
    }
}
</script>

<style lang="scss" scoped>
	@import '~/assets/scss/order.scss';
</style>

