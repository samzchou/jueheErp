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
						<el-input v-model="searchForm.serial" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="蒂森订单号：" prop="sourceserial" v-if="needSource">
						<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="项目号：" prop="projectNo">
						<el-input v-model="searchForm.projectNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="项目名称：" prop="projectName">
						<el-input v-model="searchForm.projectName" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="制单日期：" prop="orderDate">
						<el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item label="交付日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div>
				<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
					<el-table-column type="index" width="50" align="center" />
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
					<el-table-column prop="projectNo" label="项目号" width="150" />
					<el-table-column prop="projectName" label="项目名称" />
					<el-table-column prop="total" label="订单总数" width="100">
						<template slot-scope="scope">
							<span>共 {{scope.row.total}} 件</span>
						</template>
					</el-table-column>
					<el-table-column prop="finishCount" label="实际完成量" width="100" />
					<el-table-column prop="orderDate" label="制单日期" width="100">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.orderDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="deliveryDate" label="交付日期" width="100">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.deliveryDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="isCanceled" label="取消送货" width="80">
						<template slot-scope="scope">
                            <div v-if="scope.row.finished">
                                <el-button v-if="!scope.row.isCanceled" size="mini" type="text" icon="my-icon-reply" @click="handleCancel(scope.row, true)">取消</el-button>
                                <el-button v-else size="mini" class="icon-link" icon="my-icon-share" @click="handleCancel(scope.row, false)">恢复</el-button>
                            </div>
                            <div v-else>订单已取消</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="120">
						<template slot-scope="scope">
							<el-button size="mini" type="text" :icon="scope.row.finished?'el-icon-download':'el-icon-view'" @click="showDetail(scope.row)">{{scope.row.finished?'制定送货单':'查看送货单'}}</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="page-container" style="padding: 10px 0;">
				<div>
					<span style="margin-right:15px;">请选择可以出库送货的订单，制定出库送货单</span>
					<el-button size="mini" type="primary" v-if="orderList.length" @click="openDialogVisible=true">制订送货单({{orderList.length-1}})</el-button>
				</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>

		<el-dialog :title="'送货清单--'+(needSource?'蒂森订单':'珏合订单')" append-to-body :visible.sync="openDialogVisible" @close="closeDialog" width="65%">
			<div class="compare" v-if="currItem">
				<el-row :gutter="20">
					<el-col :span="6">系统订单号：{{currItem.serial}}</el-col>
					<el-col :span="6" v-if="needSource">蒂森订单号：{{currItem.sourceserial}}</el-col>
					<el-col :span="6">项目号：{{currItem.projectNo}}</el-col>
					<el-col :span="6">项目名称：{{currItem.projectName}}</el-col>
					<el-col :span="6">制单日期：{{parseDate(currItem.orderDate)}}</el-col>
					<el-col :span="6">交付日期：{{parseDate(currItem.deliveryDate)}}</el-col>
					<el-col :span="6">订单总数：{{currItem.total}}</el-col>
					<el-col :span="6">实际完成订单数：{{currItem.finishCount}}</el-col>
				</el-row>
			</div>
			<el-table ref="exportTable" :data="orderList" border fit highlight-current-row stripe size="mini" max-height="350" style="width:100%">
				<el-table-column type="expand">
					<template slot-scope="scope" v-if="scope.row.result && scope.row.result.length">
						<el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
							<el-col :span="6" :title="item.sourceserial">
								<span style="width:30px">{{idx+1}}、</span>
								<span>蒂森订单号：{{item.sourceserial}}</span>
								<span>ID：{{item.id}}</span>
							</el-col>
							<el-col :span="4" :title="item.projectNo">项目号：{{item.projectNo}}</el-col>
							<el-col :span="4">物料号：{{item.materialNo}}</el-col>
							<el-col :span="4">物料描述：{{item.productName}}</el-col>
							<el-col :span="3">订单量：{{item.count}}</el-col>
							<el-col :span="3">状态：{{parseFlow(item.flowStateId)}}</el-col>
						</el-row>
						<!-- <div>{{scope.row.result}}</div> -->
					</template>
				</el-table-column>
				<el-table-column type="index" width="50" align="center" />
				<el-table-column prop="projectName" label="项目名称" />
				<el-table-column prop="projectNo" label="项目号" width="120" />
				<el-table-column prop="modelNo" label="梯号" width="70" />
				<el-table-column label="订单号" width="150px">
					<template slot-scope="scope">
						<span v-if="needSource">{{scope.row.sourceserial}}</span>
						<span v-else>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="partName" label="部件名称" />
				<el-table-column prop="boxCount" label="箱数" width="60" />
				<el-table-column prop="count" label="交货日期" width="120">
					<template slot-scope="scope">
						<span v-if="scope.$index<orderList.length">{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="update-form">
				<div>
					<span v-if="!isCanExport && currItem">订单库存不足，尚缺{{currItem.total-currItem.finishCount}}项；无法出单</span>
				</div>
				<div>
					<el-button size="mini" type="primary" icon="el-icon-download" @click="exportOrder" :disabled="!isCanExport" :loading="exportLoading">制定送货单</el-button>
				</div>
			</div>
		</el-dialog>
	</section>
</template>

<script>
export default {
	data() {
		return {
			needSource: true,
			listLoading: false,
			total: 0,
			gridList: [],
			query: {
				page: 1,
				pagesize: 100
			},
			searchForm: {
				serial: '',
				sourceserial: '',
				projectNo: '',
				projectName: '',
				orderDate: '',
				deliveryDate: ''
			},
			openDialogVisible: false,
			currItem: null,
			orderList: [],
			exportLoading: false,
			exportOrderIds: [],
			updateIds: [],
			isCanExport: false,
			storeCalcLastId: 0,
		}
	},
	methods: {
        // 取消订单
		handleCancel(row, flag) {
			console.log('handleCancel', row);
			this.$confirm('确定要'+(flag?'取消':'恢复')+'该送货单?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let condition = {
					type: 'updatePatch',
					collectionName: 'order',
					param: { "sourceserial": row.sourceserial },
					set: {
						$set: {
							'isCanceled': flag
						}
					}
				}
				this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.$message.error("已"+(flag?'取消':'恢复')+"送货单");
                    row.isCanceled = flag;
                    //debugger
                    let orderIndex = _.findIndex(this.orderList, {id:row.id}); //
                    if(!!~orderIndex && flag){
                        this.$refs.detailStore.toggleRowSelection(row);
                    }
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.$set(this.gridList, index, row);
				});
			}).catch(() => { });
        },
        
		parseFlow(id) {
			if (!id) return "";
			let flow = _.find(this.setting.flowState, { id: id });
			return flow ? flow.name : "";
		},
		setOrderParams(flag) {
			this.needSource = flag;
			this.query.page = 1;
			this.getList();
		},
		closeDialog() {
			this.orderList = [];
		},
		checkSelectable(row) {
			return row.finished && !row.isCanceled;
		},
		handleSelectionChange(rows) {
			this.orderList = rows;
			if (rows.length) {
				this.updateIds = this.setUpdateIds(this.orderList);
				this.orderList.push({
					projectName: "合计",
					boxCount: rows.length
				});
				this.currItem = null;
				this.isCanExport = true;
			}
		},
		exportOrder() {
			import('@/components/Export2Excel').then(excel => {
				const tHeader = ['项目名称', '项目号', '梯号', '订单号', '部件名称', '箱数', '交货日期', '备注'];
				const filterVal = ['projectName', 'projectNo', 'modelNo', 'sourceserial', 'partName', 'boxCount', 'deliveryDate', 'boxContent'];
				//debugger
				const data = this.formatJson(filterVal, _.cloneDeep(this.orderList));
				const now = moment(new Date()).format('YYYYMMDD');
				let title = this.needSource ? '蒂森送货单' : '珏合送货单';
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: title + '-' + now
				});
				this.updateOrder();
			});
		},
		updateOrder() {
			this.exportLoading = true;
			// 这里需要处理，更新原始订单状态， 更新库存 4505531472 4505532071
			let cn = {
				type: 'outStore',//'updatePatch',
				collectionName: 'order',
				notNotice: true,
				user: this.$store.state.user.name,
				data: { 'id': { $in: this.updateIds } },
				set: { $set: { 'flowStateId': 10, 'updateByUser': this.$store.state.user.name } }
			}
			let updateData = [];
			// 更新原始订单状态为已出库
			this.$axios.$post('mock/db', { data: cn }).then(result => {
				this.orderList = [];
				this.exportLoading = false;
				this.openDialogVisible = false;
				this.addStoreCalc(result);
				this.submitSearch(true);
			});
		},
		addStoreCalc(list) {
			let dataList = [];
			list.forEach(item => {
				//debugger
				dataList.push({
					id: this.storeCalcLastId++,
					typeId: item.typeId,
					productName: item.productName,
					materialNo: item.materialNo,
					storeTypeId: 2,
					price: item.price,
					metaprice: item.metaprice,
					util: item.util,
					outcount: item.count,
					storeCount: item.storeCount - item.count,
					createByUser: this.$store.state.user.name
				})
			});
			//return;
			let condition = {
				type: 'addPatch',
				collectionName: 'storeCalc',
				data: dataList,
				notNotice: true
			};
			this.$axios.$post('mock/db', { data: condition });
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'deliveryDate' && v[j]) {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
		},
		splitSerial(serial) {
			let s = serial.split('-');
			return s.length ? s[1] : serial;
		},
		parseDate(date, format) {
			if (!date) return '';
			return moment(date).format(format || 'YYYY-MM-DD');
		},
		parseMoney(row) {
			return this.$options.filters['currency'](row.count * row.price);
		},
		setUpdateIds(arr) {
			let updateIds = [];
			arr.forEach(item => {
				let ids = [];
				item.result.forEach(c => {
					ids.push(c.id);
				});
				updateIds = updateIds.concat(ids);
			})
			return updateIds;
		},

		async showDetail(row) {
			this.currItem = row;
			this.openDialogVisible = true;
			console.log('showDetail', row);
			this.orderList = [row];
			this.updateIds = this.setUpdateIds(this.orderList);
			/* let materialNoArr = [];
			row.result.map(item => {
				materialNoArr.push(item.materialNo);
			});
			materialNoArr = _.union(materialNoArr);
			let conditions = {
				type: 'getColumns',
				collectionName: 'store',
				condition: { materialNo: { $in: materialNoArr } },
				cols: { count: 1, materialNo: 1 }
			}
			this.$axios.$post('mock/db', { data: conditions }).then(res => {
				console.log('materialNoArr', res);
				// 对比数据校验是否满足库存
				this.orderList.forEach(item => {
					item.result.forEach(o => {
						let store = _.find(res, { materialNo: o.materialNo });
						console.log(o.count, store.count);
						if (o.count > store.count) {
							console.log("error")
						}
					})
				})
			});*/
			this.isCanExport = row.finished;
			this.orderList.push({
				projectName: "合计",
				boxCount: 1
			})
		},
		mergeOrder(lists) {
			let listData = [];
			lists.forEach(item => {
				item.children = [];
				let dataIndex = _.findIndex(listData, {
					'productId': item.productId,
					'materialNo': item.materialNo,
					'price': item.price,
				});
				if (!!~dataIndex) {
					listData[dataIndex]['children'].push(item);
					listData[dataIndex]['count'] += item.count;
				} else {
					item.children.push(_.cloneDeep(item));
					listData.push(item);
				}
			});
			return listData;
		},

		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != '' && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && (k === 'orderDate' || k === 'deliveryDate')) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1] + 24 * 3600 * 1000
						}
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] }
					} else {
						params[k] = { $regex: this.searchForm[k] };
					}
				}
			};

			if (!flag) { // 不需要再做分页复位
				this.query = {
					page: 1,
					pagesize: 20
				}
			}
			this.getList(params);
		},

		handleSizeChange(val) {
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val) {
			this.query.page = val;
			this.submitSearch(true);
		},

		async getList(match = {}) {
			this.listLoading = true;
			let groupId = { "sourceserial": "$sourceserial", "projectNo": "$projectNo" };
			let bySerial = { 'sourceserial': { $ne: '' } };
			if (!this.needSource) {
				bySerial = { 'sourceserial': '' };
				groupId = { "serial": "$serial", "projectNo": "$projectNo" };
			}
			match = _.merge({ flowStateId: { $lt: 10 }, }, bySerial, match);
			let condition = {
				type: 'groupList',
				collectionName: 'order',
				data: match,
				distinct: this.needSource ? "sourceserial" : "serial",
				groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
				],
				aggregate: [
					{ "$match": match },
					{
						"$group": {
							"_id": groupId, // 按字段分组
							"id": { "$first": "$id" },
							"isCanceled": { "$first": "$isCanceled" },
							"serial": { "$first": "$serial" },
							"sourceserial": { "$first": "$sourceserial" },
							"materialNo": { "$first": "$materialNo" },
							"projectNo": { "$first": "$projectNo" },
							"projectName": { "$first": "$projectName" },
							"productId": { "$first": "$productId" },
							"productName": { "$first": "$productName" },
							"crmId": { "$first": "$crmId" },
							"crmName": { "$first": "$crmName" },
							"boxNo": { "$first": "$boxNo" },
							"model": { "$first": "$model" },
							"modelNo": { "$first": "$modelNo" },
							"caselNo": { "$first": "$caselNo" },
							"util": { "$first": "$util" },
							"price": { "$first": "$price" },
							"count": { "$first": "$count" },
							"orderDate": { "$first": "$orderDate" },
							"deliveryDate": { "$first": "$deliveryDate" },
							"content": { "$first": "$content" },
							"flowStateId": { "$first": "$flowStateId" },
							"total": { $sum: 1 },
							"result": { "$push": "$$ROOT" }
						}
					},
					{
						$lookup: {
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
					{ $sort: { deliveryDate: 1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};
			let result = await this.$axios.$post('mock/db', { data: condition });
			this.total = result.total;
			//let gridList = this.getIsCanExport(result.list);
			this.gridList = result.list.map(item => {
				item.finishCount = this.checkFinished(item);
				item.finished = item.finishCount == item.total;
				item.partName = "机房线槽总成";
				item.boxCount = 1;
				return item;
			});

			this.listLoading = false;
		},
		async getIsCanExport(arr) {
			let materialNoArr = [];
			arr.forEach(item => {
				item.result.forEach(o => {
					materialNoArr.push(o.materialNo);
				})
			});
			materialNoArr = _.union(materialNoArr);
			console.log('materialNoArr', materialNoArr);
			let conditions = {
				type: 'getColumns',
				collectionName: 'store',
				condition: { materialNo: { $in: materialNoArr } },
				cols: { count: 1, materialNo: 1 }
			}
			let response = await this.$axios.$post('mock/db', { data: conditions });
			//console.log('getIsCanExport', response);
			arr.forEach(item => {
				item.result.forEach((o, idx) => {
					let store = _.find(response, { materialNo: o.materialNo });
					//console.log(o.count, store.count);
					if (o.count > store.count) {
						item.notExport = true;
						console.log("error", o.materialNo, idx)
					}
				})
			});
			console.log('getIsCanExport', arr);
			return arr;
		},
		checkFinished(row) {
			let countFinish = 0;
			row.result.forEach(item => {
				if ([3, 8].includes(item.flowStateId)) {
					countFinish++;
				}
			});
			return countFinish;
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			}
			let result = await this.$axios.$post('mock/db', { data: condition });
			if (result) {
				this.setting = result.content;
				this.getList();
			}
		},
		async _getLastId() {
			// 仓库待入库Id
			let cn = {
				type: "getId",
				data: {
					model: "storeCalc"
				}
			};
			let res = await this.$axios.$post("mock/db", { data: cn });
			if (res) {
				//console.log("lastId-storeId", res);
				this.storeCalcLastId = res;
			}
		}
	},
	created() {
		this.getSetting();
		this._getLastId();
	}
}
</script>
<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>
