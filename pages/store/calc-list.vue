<template>
	<section>
		<div class="page-title">
			<div>
				<span>出入库清单</span>
			</div>
		</div>
		<div class="grid-container">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="业务类型：" prop="typeId">
						<el-select v-model="searchForm.typeId" placeholder="请选择" style="width:100px" v-if="setting" clearable="" @change="submitSearch">
							<el-option v-for="typeItem in setting.type" :key="typeItem.id" :label="typeItem.name" :value="typeItem.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="出入库类型：" prop="storeTypeId">
						<el-select v-model="searchForm.storeTypeId" placeholder="请选择" style="width:80px"  @change="submitSearch">
							<el-option label="入库" v-for="item in storeType" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="货品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable/>
					</el-form-item>
					<el-form-item label="物料号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable/>
					</el-form-item>
					<el-form-item :label="searchForm.storeTypeId==1?'入库日期：':'出库日期'" prop="updateDate">
						<el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div id="printTable">
				<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
					<el-table-column label="No." fixed="left" align="center" width="50">
						<template slot-scope="scope">
							<span>{{scope.$index+(query.page - 1) * query.pagesize + 1}}</span>
						</template>
					</el-table-column>
					<el-table-column label="物料来源" prop="typeId" width="80">
						<template slot-scope="scope">{{parseType(scope.row.typeId)}}</template>
					</el-table-column>
					<el-table-column label="物料名称" prop="productName"/>
					<el-table-column label="物料号/版本号" prop="materialNo" width="150" />
					<el-table-column prop="util" label="单位" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.util}}</span>
						</template>
					</el-table-column>
					<el-table-column v-if="searchForm.storeTypeId==1" prop="atcount" label="入库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.incount}}</span>
						</template>
					</el-table-column>
					<el-table-column v-else prop="outcount" label="出库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.outcount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="createDate" :label="searchForm.storeTypeId==1?'入库日期':'出库日期'" width="120">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.createDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="createByUser" :label="searchForm.storeTypeId==1?'入库人':'出库人'" width="90" />
				</el-table>
			</div>
			<div class="page-container">
                <div></div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"></el-pagination>
			</div>
		</div>
		<el-dialog title="比较采购订单" append-to-body :visible.sync="openDialogVisible" width="60%">
			<div style="margin-top:-10px" v-if="afterOrderItem">
				<div style="padding:0 0 10px 0">供应商：{{afterOrderItem.crmName}}；采购货品：{{afterOrderItem.productName}}</div>
				<div class="compare" style="border:1px solid #DDD">
					<div>
						<h3>即将采购订单</h3>
						<ul>
							<li>
								<span>货品名称：</span>
								<span>{{afterOrderItem.productName}}</span>
							</li>
							<li>
								<span>订单号：</span>
								<span>{{afterOrderItem.serial}}</span>
							</li>
							<li>
								<span>物料号：</span>
								<span>{{afterOrderItem.materialNo}}</span>
							</li>
							<li>
								<span>项目号：</span>
								<span>{{afterOrderItem.projectNo}}</span>
							</li>
							<li>
								<span>项目名称：</span>
								<span>{{afterOrderItem.projectName}}</span>
							</li>
							<li>
								<span>单位：</span>
								<span>{{afterOrderItem.util}}</span>
							</li>
							<li>
								<span>采购数量：</span>
								<span>{{afterOrderItem.count}}</span>
							</li>
							<li>
								<span>单价：</span>
								<span>{{afterOrderItem.price}}</span>
							</li>
							<li>
								<span>制单日期：</span>
								<span>{{parseDate(afterOrderItem.orderDate)}}</span>
							</li>
							<li>
								<span>交付日期：</span>
								<span>{{parseDate(afterOrderItem.deliveryDate)}}</span>
							</li>
						</ul>
					</div>
					<div>
						<h3>库存货品</h3>
						<ul>
							<li>
								<span>货品名称：</span>
								<span>{{currItem.productName}}</span>
							</li>
							<li>
								<span>订单号：</span>
								<span>{{currItem.order.serial}}</span>
							</li>
							<li>
								<span>物料号：</span>
								<span>{{currItem.order.materialNo}}</span>
							</li>
							<li>
								<span>项目号：</span>
								<span>{{currItem.projectNo}}</span>
							</li>
							<li>
								<span>项目名称：</span>
								<span>{{currItem.projectName}}</span>
							</li>
							<li>
								<span>单位：</span>
								<span>{{currItem.order.util}}</span>
							</li>
							<li>
								<span>库存数量：</span>
								<span>{{currItem.incount}}</span>
							</li>
							<li>
								<span>单价：</span>
								<span>{{currItem.order.price}}</span>
							</li>
							<li>
								<span>入库日期：</span>
								<span>{{parseDate(currItem.createDate)}}</span>
							</li>
							<li>
								<span>最后更新：</span>
								<span>{{parseDate(currItem.updateDate)}}</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</el-dialog>
	</section>
</template>

<script>
export default {
	data() {
		return {
			openDialogVisible: false,
			afterOrderItem: null,
			currItem: null,
			afterOrderList: [],
			listLoading: false,
			total: 0,
			query: {
				page: 1,
				pagesize: 50
			},
			setting: {},
			crmList: [],
			flowList: [], //settings.flowState,
			typeList: [], //settings.type,
			storeNoList: [], //settings.storeNo,
			gridList: [],
			storeType:[
				{id:1,name:'入库'},{id:2,name:'出库'}
			],
			searchForm: {
				typeId: "",
				storeTypeId:1,
				materialNo: "",
				productName: "",
				count: ""
			}
		};
	},
	methods: {
		parseDate(date, format) {
			return moment(date).format(format || "YYYY-MM-DD");
		},
		parseType(id) {
			if (!id || id == "") return "";
			let type = _.find(this.typeList, { id: id });
			return type.name;
		},
		parseReleaseMoney(row) {
			return this.$options.filters["currency"](row.outcount * row.order.price);
		},
		viewAfterOrder(row) {
			this.afterOrderItem = _.find(this.afterOrderList, {
				materialNo: row.order.materialNo
			});
			this.currItem = row;
			this.openDialogVisible = true;
		},
		// 比较物料号相同
		parseMaterialNo(row) {
			let order = _.find(this.afterOrderList, {
				materialNo: row.materialNo
			});

			let counts = order ? order.count : 0;
			row.orderCount = counts;
			return counts;
		},
		parseStoreNo(id) {
			if (!id || id == "") return "";
			let type = _.find(this.storeNoList, { id: id });
			return type.name;
		},
		parseFlow(id) {
			if (!id) return "";
			let flow = _.find(this.flowList, { id: id });
			return flow.name;
		},
		handleSizeChange(val) {
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val) {
			this.query.page = val;
			this.submitSearch(true);
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != "" && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && k === "createDate") {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1]
						};
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] };
					}else{
						params[k] = {$regex:this.searchForm[k]}
					}
				}
			}
			if (!flag) {
				// 不需要再做分页复位
				this.query = {
					page: 1,
					pagesize: 20
				};
			}
			
			this.getList(params);
		},
		async getList(match = {}) {
			this.listLoading = true;
			let groupId = { materialNo: "$materialNo" };
			let condition = {
				type: "groupList",
				collectionName: "storeCalc",
				data: _.merge(match),
				distinct: "materialNo",
				groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
				],
				aggregate: [
					{ $match: match },
					{
						$group: {
							_id: groupId, // 按字段分组
							id: { $first: "$id" },
							typeId: { $first: "$typeId" },
							productName: { $first: "$productName" },
                            materialNo: { $first: "$materialNo" },
							util: { $first: "$util" },
							incount: { $sum: "$incount" },
							outcount: { $sum: "$outcount" },
							createDate: { $first: "$createDate" },
							createByUser: { $first: "$createByUser" },
							total: { $sum: 1 }
						}
					},
					{ $sort: { cerateDate: -1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};

			let result = await this.$axios.$post("mock/db", { data: condition });
			this.total = result.total;
			this.gridList = result.list;
			this.listLoading = false;
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				//console.log('getSetting',result)
				this.setting = result.content;
				this.typeList = this.setting.type;
				this.flowList = this.setting.flowState;
				this.storeNoList = this.setting.storeNo;
				this.crmList = this.setting.crm;
				this.getList({storeTypeId:1});
			}
		},
		async getBuys() {
			let params = {
				'flowStateId': { $in: [1, 5] }, //$in:[1,5] $lte:6
				'updateDate': { $gte: new Date().getTime() - 24 * 3600 * 1000, $lte: new Date().getTime() + 24 * 3600 * 1000 * 10 }
			};
			let condition = {
				type: "aggregate",
				collectionName: "order",
				data: params,
				aggregate: [
					{ $match: params },
					{
						$group: {
							_id: { materialNo: "$materialNo" }, // 按字段分组
							productName: { $first: "$productName" },
							materialNo: { $first: "$materialNo" },
							count: { $sum: "$count" },
							total: { $sum: 1 }
						}
					}
				]
			};
			//debugger
			let result = await this.$axios.$post("mock/db", { data: condition });
			console.log("getBuys", result);
			this.afterOrderList = result.list;
		}
	},
	created() {
		this.getSetting();
		// 获取七天后的采购订单数据
		this.getBuys();
	},
	mounted() { }
};
</script>
<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>
