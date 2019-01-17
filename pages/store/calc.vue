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
					<el-form-item label="业务类型：" prop="typeId">
						<el-select v-model="searchForm.typeId" placeholder="请选择" style="width:100px" v-if="setting" clearable="" @change="submitSearch">
							<el-option v-for="typeItem in setting.type" :key="typeItem.id" :label="typeItem.name" :value="typeItem.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="货品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable/>
					</el-form-item>
					<el-form-item label="物料号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable/>
					</el-form-item>
					<el-form-item label="库存小于：" prop="count">
						<el-input v-model="searchForm.count" clearable style="width:70px" />
					</el-form-item>
					<el-form-item label="最后更新：" prop="updateDate">
						<el-date-picker v-model="searchForm.updateDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div id="printTable">
				<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
					<el-table-column label="物料来源" prop="typeId" width="80">
						<template slot-scope="scope">{{parseType(scope.row.typeId)}}</template>
					</el-table-column>
					<el-table-column label="物料名称" prop="productName">
						<template slot-scope="scope">{{scope.row.product && scope.row.product.name}}</template>
					</el-table-column>
					<el-table-column label="物料号/版本号" prop="materialNo" width="150" />
					<el-table-column prop="util" label="单位" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.util}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="atcount" label="总入库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.incount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="outcount" label="总出库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.outcount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="count" label="当前库存" width="100">
						<template slot-scope="scope">
							<span>{{scope.row.count}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="incount" label="未来10天内采购量">
						<template slot-scope="scope">
							<span :class="{'warning':scope.row.incount==0}">
								<span style="margin-right:10px;">{{parseMaterialNo(scope.row)}}</span>
								<span v-if="scope.row.orderCount && scope.row.orderCount>scope.row.count" style="color:red">库存缺少 {{scope.row.orderCount - scope.row.count}}</span>
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateDate" label="最后更新" width="120">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.updateDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateUser" label="操作人" width="90" />
				</el-table>
			</div>
			<div class="page-container">
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
			searchForm: {
				typeId: "",
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
					} else if (_.isArray(this.searchForm[k]) && k === "updateDate") {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1]
						};
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] };
					} else {
						if (k === "count") {
							params[k] = { $lt: Number(this.searchForm[k]) };
						} else {
							params[k] = { $regex: this.searchForm[k] };
						}
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
			let condition = {
				type: "aggregate",
				collectionName: "store",
				data: _.merge(match),
				aggregate: [
					{ $match: _.merge(match) },
					{
						$lookup: {
							from: "product",
							localField: "materialNo",
							foreignField: "materialNo",
							as: "product"
						}
					},
					{
						$unwind: {
							path: "$product",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},

					{ $sort: { materialNo: -1 } },
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
				this.getList();
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
