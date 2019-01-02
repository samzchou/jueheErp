<template>
    <section>
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
					<el-form-item label="系统订单号：" prop="serial">
						<el-input v-model="searchForm.serial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="蒂森订单号：" prop="sourceserial" v-if="needSource">
						<el-input v-model="searchForm.sourceserial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="项目号：" prop="projectNo">
						<el-input v-model="searchForm.projectNo" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="项目名称：" prop="projectName">
						<el-input v-model="searchForm.projectName" clearable  style="width:150px"/>
					</el-form-item>
					
					<el-form-item label="制单日期：" prop="orderDate">
						<el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px"/>
					</el-form-item>
					<el-form-item label="交付日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px"/>
					</el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
                    <el-table-column prop="serial" label="系统订单号" width="150">
                        <template slot-scope="scope">
							<span>{{scope.row.serial}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="蒂森订单号" width="120" v-if="needSource">
                        <template slot-scope="scope">
                            <span>{{scope.row.sourceserial}}</span>
                        </template>
                    </el-table-column>
					<el-table-column prop="projectNo" label="项目号" width="150"/>
					<el-table-column prop="projectName" label="项目名称"/>
					<el-table-column prop="total" label="订单总数">
						<template slot-scope="scope">
                            <span>共 {{scope.row.total}} 件</span>
                        </template>
					</el-table-column>
					<el-table-column prop="orderDate" label="制单日期" width="120">
						<template slot-scope="scope">
                            <span>{{parseDate(scope.row.orderDate)}}</span>
                        </template>
					</el-table-column>
					<el-table-column prop="deliveryDate" label="交付日期" width="120">
						<template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="120">
						<template slot-scope="scope">
							<el-button v-if="scope.row.store" size="mini" type="text" icon="el-icon-download" @click="showDetail(scope.row)">制单送货</el-button>
							<span v-else>未入库</span>
						</template>
					</el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
		
        <el-dialog :title="'送货清单--'+(needSource?'蒂森订单':'珏合订单')" append-to-body :visible.sync="openDialogVisible" width="80%">
			<div class="compare" v-if="currItem">
				<el-row :gutter="20">
					<el-col :span="6">系统订单号：{{currItem.serial}}</el-col>
					<el-col :span="6" v-if="needSource">蒂森订单号：{{currItem.sourceserial}}</el-col>
					<el-col :span="6">项目号：{{currItem.projectNo}}</el-col>
					<el-col :span="6">项目名称：{{currItem.projectName}}</el-col>
					<el-col :span="6">制单日期：{{parseDate(currItem.orderDate)}}</el-col>
					<el-col :span="6">交付日期：{{parseDate(currItem.deliveryDate)}}</el-col>
					<el-col :span="6">订单总数：{{currItem.total}}</el-col>
				</el-row>
			</div>
			<el-table ref="exportTable" :data="orderList" border fit highlight-current-row stripe size="mini" max-height="350" style="width:100%">
				<el-table-column type="index" width="50" align="center"/>
				<el-table-column label="订单号" prop="serial" width="120px"/>
				<el-table-column prop="projectNo" label="项目号" width="120"/>
				<el-table-column prop="projectName" label="项目名称"/>
				<el-table-column prop="modelNo" label="梯号" width="70"/>
				<el-table-column prop="materialNo" label="物料号" width="120"/>
				<el-table-column prop="productName" label="物料名称"/>
				<el-table-column prop="boxNo" label="箱号" width="60"/>
				<el-table-column prop="count" label="订单数量" width="80">
					<template slot-scope="scope">
						<span>{{scope.row.count}} {{scope.row.util}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="store" label="已入库量" width="80">
					<template slot-scope="scope">
						<span>{{scope.row.store && scope.row.store.atcount}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="store" label="当前库存" width="80">
					<template slot-scope="scope">
						<span>{{scope.row.store && scope.row.store.count}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="price" label="单价" width="80"/>
				<el-table-column prop="allPrice" label="订单金额" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.allPrice | currency}}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="update-form" v-if="currItem">
				<div>
					<span v-if="!currItem.isout">订单库存不足，无法出单</span>
					<span v-else>可以出单送货</span>
				</div>
				<div>
					<el-button size="mini" type="primary" icon="el-icon-download" @click="exportOrder" :disabled="!currItem.isout">制定送货单</el-button>
				</div>
			</div>
		</el-dialog>
    </section>
</template>

<script>
export default {
    data(){
        return {
			needSource:true,
            listLoading:false,
			total:0,
			gridList:[],
            query:{
                page:1,
                pagesize:50
            },
            searchForm:{
                serial:'',
                sourceserial:'',
                projectNo:'',
                projectName:'',
                orderDate:'',
                deliveryDate:''
			},
			openDialogVisible:false,
			currItem:null,
			orderList:[],
			exportOrderIds:[],
			updateIds:[],
        }
    },
    methods:{
		setOrderParams(flag){
			this.needSource = flag;
			this.query.page = 1;
			this.getList();
		},
		exportOrder(){
			this.exportOrderIds = [];
			let exportData = [], allCount = 0, allMoney = 0;
			import ('@/components/Export2Excel').then(excel=>{
				const tHeader = ['订单编号','项目号','项目名称','梯号','部件名称','数量','单价','箱号','订单金额','交货日期'];
				const filterVal = ['serial','projectNo','projectName','modelNo','productName','count','price','boxNo','allPrice','deliveryDate'];
				const data = this.formatJson(filterVal, _.cloneDeep(this.orderList));
				const now =  moment(new Date()).format('YYYYMMDD');
				let title = this.needSource?'蒂森送货单':'珏合送货单';
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: title + '-' + now
        		});
				this.updateOrder();
        	});
		},
		updateOrder(){
			// 这里需要处理，更新原始订单状态， 更新库存
			let cn = {
                type:'updatePatch',
                collectionName: 'order',
				param:{'id':{$in:this.updateIds}},
				notNotice:true,
                set:{$set:{'flowStateId':10}}
			}
			let updateData = [];
			
			this.orderList.forEach(item=>{
				if(item.id){
					let obj = {
						id:item.store.id,
						count:item.store.count + item.store.incount - item.count,
						incount:0,
						outcount:item.store.outcount + item.count,
						updateByUser: this.$store.state.user.name
					};
					updateData.push(obj);
				}
			})
			console.log('updateData', updateData);
			//return;
            this.$axios.$post('mock/db', {data:cn}).then(result=>{
				let condition = {
					type:'updateArr',
					collectionName: 'store',
					updateDate:true,
					data:updateData
				}
				this.$axios.$post('mock/db', {data:condition}).then(res=>{
					this.orderList = [];
					this.openDialogVisible = false;
					this.submitSearch(true);
				});
            });
		},
		formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                if(j == 'deliveryDate' && v[j]){
                    v[j] = this.parseDate(v[j]);
                }
                return v[j];
            }))
        },
		splitSerial(serial){
			let s = serial.split('-');
			return s.length?s[1]:serial;
		},
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
		},
		async showDetail(row){
			this.currItem = row;
			this.openDialogVisible = true;
			console.log('showDetail', row);
			let params = {
				projectNo:row.projectNo,
				sourceserial:this.needSource?row.sourceserial:row.serial,
				flowStateId:{$gte:2,$lte:6}
			};
			let conditions = {
				type:"aggregate",
				collectionName:'order',
				data:params,
				aggregate:[
					{
						$lookup:{
							from: "store",
							localField: "materialNo", //materialNo
							foreignField: "materialNo", //materialNo
							as: "store"
						}
					},
					{
						$unwind: { // 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{$match:params},
					{$sort:{deliveryDate:1,productId:1}}
				]
			}
			let result = await this.$axios.$post('mock/db', {data:conditions});
			console.log(result.list);
			this.updateIds = [];
			this.currItem.isout = true;
			let allPrice = 0, allCount = 0;
			//let lists = this.mergeOrder(result.list);
			//debugger
			this.orderList = result.list.map(item=>{
				if(!item.store){
					this.currItem.isout = false;
				}
				if(this.needSource){
					item.serial = item.sourceserial;
				}
				item.allPrice = item.count * item.price;
				allCount += item.count;
				allPrice += item.count * item.price;
				this.updateIds.push(item.id);
				return item;
			});
			this.orderList.push({
				'serial':'合计',
				'count':allCount,
				'allPrice':allPrice
			})
		},
		mergeOrder(lists){
			let listData = [];
			lists.forEach(item=>{
				item.children = [];
				let dataIndex = _.findIndex(listData,{
					'productId':item.productId,
					'materialNo':item.materialNo,
					'price':item.price,
				});
				if(!!~dataIndex){
					listData[dataIndex]['children'].push(item);
					listData[dataIndex]['count'] += item.count;
					//listData[dataIndex]['incount'] += item.store?item.store.incount:0;
				}else{
					item.children.push(_.cloneDeep(item));
					/* item.incount = item.store?item.store.incount:0;
					item.outcount = item.store?item.store.outcount:0; */
					listData.push(item);
				}
			});
			return listData;
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

        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },

        async getList(match={}){
			this.listLoading = true;
			let groupId = {"projectNo":"$projectNo"};//{"sourceserial":"$sourceserial"};
            let bySerial = {'sourceserial':{$ne:''}};
			if(!this.needSource){
                bySerial = {'sourceserial':''};
				groupId = {"serial":"$serial"};
			}
			//groupId = _.merge(groupId,{"projectNo","$projectNo","boxNo":"$boxNo","modelNo":"$modelNo"})
			match = _.merge(bySerial, match);
            let condition = {
				type:'groupList',
				collectionName: 'order',
				data:_.merge({flowStateId:{$gte:2,$lte:6}},match),
				distinct:this.needSource?"projectNo":"serial",
				aggregate:[
					{"$match":_.merge({flowStateId:{$gte:2, $lte:6}}, match)},
					{
						"$group": {
							"_id": groupId, // 按字段分组
							"id":{"$first" :"$id"},
							"serial":{"$first":"$serial"},
							"sourceserial":{"$first" :"$sourceserial"},
							"materialNo":{"$first" :"$materialNo"},
							"projectNo":{"$first" :"$projectNo"},
							"projectName":{"$first" :"$projectName"},
							"productId":{"$first" :"$productId"},
							"productName":{"$first" :"$productName"},
							"crmId":{"$first" :"$crmId"},
							"crmName":{"$first" :"$crmName"},
							"boxNo":{"$first" :"$boxNo"},
							"model":{"$first" :"$model"},
							"modelNo":{"$first" :"$modelNo"},
							"caselNo":{"$first" :"$caselNo"},
							"util":{"$first" :"$util"},
							"price":{"$first" :"$price"},
							"count":{"$first" :"$count"},
							"orderDate":{"$first" :"$orderDate"},
							"deliveryDate":{"$first" :"$deliveryDate"},
							"content":{"$first" :"$content"},
							"flowStateId":{"$first":"$flowStateId"},
							"total": { $sum: 1 }
						}
					},
					{
						$lookup:{
							from: "store",
							localField: "materialNo",
							foreignField: "materialNo",
							as: "store"
						}
					},
					{
						$unwind: { // 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{$sort:{deliveryDate:1}},
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
				this.setting = result.content;
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
	@import '~/assets/scss/order.scss';
</style>