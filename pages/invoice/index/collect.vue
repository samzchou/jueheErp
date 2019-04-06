<template>
    <section class="list-container">
        <div class="search-form" v-loading="listLoading">
			<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini">
                <el-form-item label="起始日期：" >
					<el-date-picker v-model="searchForm.startDate" value-format="timestamp" type="date" placeholder="起始日期" style="width:250px" />
				</el-form-item>
                <el-form-item label="截止日期：" >
					<el-date-picker v-model="searchForm.endDate" value-format="timestamp" type="date" placeholder="截止日期" style="width:250px" />
				</el-form-item>
				<el-form-item>
					<!-- <el-button type="primary" @click="submitCollect(1)">生成汇总</el-button> -->
                    <el-button type="primary" @click="submitCollect(2)">生成明细汇总清单</el-button>
				</el-form-item>
			</el-form>
		</div>
    </section>
</template>
<script>
export default {
	data: () => ({
        listLoading:false,
		setting: {},
		searchForm: {
            startDate: '',
            endDate:''
        },
        typeId:1,
		gridList: [],
		allPrice: 0,
		
	}),
	methods: {
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
        exportExcel(){
            let orderIds = [];
            this.allPrice = 0;
            this.gridList.forEach(item=>{
                orderIds = _.concat(orderIds, item.orderIds);
                this.allPrice += item.price;
            });
            console.log(orderIds);

            let condition = {
                type:'listData',
                collectionName: 'order',
                data:{id:{$in:orderIds}}
            }

            this.$axios.$post('mock/db', { data: condition }).then(res=>{
                console.log('submitExport', res);
                let arr = res.list.map((item, index)=>{
                    let invoice = this.getVoiceNumber(item.sourceserial);
                    item.no = index+1;
                    item.invoiceNumber = invoice.invoiceNumber;
                    item.invoiceDate = invoice.createDate;
                    item.allPrice = item.price * item.count;
                    return item;
                });
                this.exportOrder(arr);
                this.listLoading = false;

            });
        },
        getVoiceNumber(sourceserial){
            let invoice = _.find(this.gridList, {'sourceserial': sourceserial});
            return invoice;
        },
        exportOrder(arr){
            console.log('exportOrder', arr);

            arr.push({no:'合计',allPrice:this.allPrice});

            import('@/components/Export2Excel').then(excel => {
				const tHeader = ['序号', '发票号','开票日期','订单号','物料号', '物料名称', '规格型号', '项目号','项目名称','数量', '单价', '金额', '交货日期'];
				const filterVal = ['no','invoiceNumber','invoiceDate','sourceserial', 'materialNo', 'productName', 'model', 'projectNo','projectName','count', 'price', 'allPrice', 'deliveryDate'];
				const data = this.formatJson(filterVal, arr);
				const now = moment(new Date()).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: '发票明细-' + now
				});
				//this.updateOrderByCrm(this.crmOrderList);
			}) 
        },
        
        formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'invoiceDate' || j == 'deliveryDate') {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
        },
        submitCollect(type){
            this.typeId = type;
            if(!this.searchForm.startDate || !this.searchForm.endDate){
                this.$message.error("请选择日期范围");
                return;
            }
            let params = {
                createDate:{
                    $gte: this.searchForm['startDate'],
					$lte: this.searchForm['endDate']
                }
            }
            this.getList(params);
        },
		getList(match = {}) {
            this.gridList = [];
			this.listLoading = true;
			let condition = {
                type:'listData',
                collectionName: 'finance',
                data:{payType:2}
            }
            this.$axios.$post('mock/db', { data: condition }).then(res=>{
                this.gridList = res.list;
                if(this.gridList.length){
                    this.exportExcel()
                }else{
                    this.listLoading = false;
                }
            });

            /* let result = await this.$axios.$post('mock/db', { data: condition });
			this.total = result.total;
			console.log(result)
			this.gridList = result.list;
			this.listLoading = false; */
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

