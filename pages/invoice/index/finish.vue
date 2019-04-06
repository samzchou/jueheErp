<template>
    <section class="list-container">
        <div class="search-form">
			<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
				<el-form-item label="系统订单号：" prop="serial">
					<el-input v-model="searchForm.serial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="蒂森订单号：" prop="sourceserial">
					<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目号：" prop="projectNo">
					<el-input v-model="searchForm.projectNo" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目名称：" prop="projectName">
					<el-input v-model="searchForm.projectName" clearable style="width:150px" />
				</el-form-item>
				<!-- <el-form-item label="交付日期：" prop="deliveryDate">
					<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
				</el-form-item> -->
                <el-form-item label="开票日期：" prop="createDate">
					<el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitSearch">搜索</el-button>
				</el-form-item>
			</el-form>
		</div>
        <div class="table-content">
			<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" style="width:100%" @selection-change="handleSelectionChange">
				<!-- <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                            <el-col :span="3">
                                <span style="width:30px">{{idx+1}}、</span>
                                <span>ID：{{item.id}}</span>
                            </el-col>
                            <el-col :span="4">物料号：{{item.materialNo}}</el-col>
                            <el-col :span="5">物料描述：{{item.productName}}</el-col>
                            <el-col :span="3">订单量：{{item.count}}</el-col>
                            <el-col :span="3">订单单价：{{item.price}}</el-col>
                            <el-col :span="3">总价：{{parseMoney(item)}}</el-col>
                        </el-row>
                    </template>
                </el-table-column>-->
                <el-table-column type="selection" width="50" align="center" /> 
                <el-table-column prop="invoiceNumber" label="发票号" width="150"/>
                
                <el-table-column prop="crmName" label="客户" width="150"/>
                <el-table-column prop="createDate" label="开票日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.createDate)}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="price" label="总金额" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.price | currency}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="createByUser" label="开票人" width="80"/>
				<el-table-column prop="serial" label="系统订单号" width="150">
					<template slot-scope="scope">
						<span>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="projectName" label="项目名称" />
                <el-table-column prop="content" label="备注" />
				<!-- <el-table-column prop="deliveryDate" label="交付日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column> -->
			</el-table>
			<div class="page-container">
				<div>
					<span style="margin-right:15px;">共计{{total}}个已开票订单</span>
                    <el-button size="mini" type="primary" @click="submitExport" :disabled="!selectRows.length">导出</el-button>
				</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>
    </section>
</template>
<script>
export default {
	data: () => ({
		setting: {},
		searchForm: {
			serial: '',
			sourceserial: '',
			projectNo: '',
			projectName: '',
			createDate: '',
			//deliveryDate: ''
		},
		listLoading: false,
		query: {
			page: 1,
			pagesize: 100
		},
		gridList: [],
		total: 0,
		selectRows: [],
		allPrice: 0,
		
	}),
	methods: {
		splitSerial(serial) {
			let s = serial.split('-');
			return s.length ? s[1] : serial;
		},
		parseDate(date, format) {
			if (!date) return '';
			return moment(date).format(format || 'YYYY-MM-DD');
		},
		parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
		handleSelectionChange(rows) {
			this.selectRows = rows;
			console.log(rows)
        },
        submitExport(){
            let arr = _.cloneDeep(this.selectRows);
            this.allPrice = 0;
            arr.forEach(item=>{
                this.allPrice += item.price;
            });
            arr.push({invoiceNumber:'合计',price:this.allPrice});

            import('@/components/Export2Excel').then(excel => {
				const tHeader = ['开票日期', '发票号', '金额', '订单号'];
				const filterVal = ['createDate','invoiceNumber','price','sourceserial'];
				const data = this.formatJson(filterVal, arr);
				const now = moment(new Date()).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: '发票汇总-' + now
				});
			}) 
        },
        formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'createDate') {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
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
			let condition = {
                type:'listData',
                collectionName: 'finance',
                data:{payType:2}
            }

            let result = await this.$axios.$post('mock/db', { data: condition });
            //this.gridList = result.list;
			this.total = result.total;
			console.log(result)
			this.gridList = result.list;
			this.listLoading = false;
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
		}
	},
	mounted() {

	},
	created() {
		this.getSetting();
	}
}
</script>


<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
.list-container {
	padding: 20px 0;
	
}
.invoice-dialog {
	/deep/ .el-dialog__body {
		padding: 10px 20px 20px;
		.order-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 0px 20px;
		}
		.el-form {
			.el-form-item {
				margin-bottom: 0;
			}
		}
	}
}
</style>

