<template>
	<section>
		<div class="page-title">
			<div>
					<span>采购订单导入（注：导入的订单如有涉及为生产订单的请选择客户后分开保存数据）</span>
			</div>
		</div>
		<div class="form-container">
			<div class="upload-container">
				<el-form :inline="true" :model="tableForm" :rules="tableRules" ref="tableForm" size="mini" v-if="sourceData.length">
					<el-form-item label="订单类型：" prop="typeId">
            <el-checkbox-group v-model="tableForm.typeId" @change="tableFilter">
              <el-checkbox v-for="item in typeList" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
            </el-checkbox-group>
					</el-form-item>
          <el-form-item label="客户名称：" prop="crmId">
						<el-select v-model="tableForm.crmId" placeholder="请选择客户" filterable style="width:250px">
							<el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="saveTable" v-if="tableData.length" :loading="uploading">保存数据</el-button>
            <el-button type="" @click="sourceData=[]">重新上传</el-button>
						<el-button type="" @click="removeRepeat" v-if="repeatCount">过滤重复梯号的订单</el-button>
						<el-button type="" @click="removeNotIn" v-if="notinCount">过滤无法匹配元数据的订单(共：{{notinCount}})</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" :on-success="handleSuccess" :before-upload="beforeUpload"/>
			</div>
      <div v-if="uploading">正在导入订单中，请等待处理完成...</div>
			<!--批量导入-->
			<div v-if="sourceData.length">
				<el-table size="mini"
				:data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)"
				border highlight-current-row fit max-height="400" @selection-change="selectionChange">
          <el-table-column type="selection" fixed="left" align="center"></el-table-column>
					<el-table-column label="No." fixed="left" width="70px" align="center">
							<template slot-scope="scope">
									<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}} </span>
							</template>
					</el-table-column>
					<el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item" v-if="item!=='物料描述'" :width="(item=='产品名称'||item=='备注')?250:150">
						<template slot-scope="scope">
							<div v-if="item=='元数据匹配'">
								<span :class="{'warning':!scope.row[item]}">
									{{!scope.row[item]?'无法匹配元数据':scope.row[item]}}
								</span>
							</div>
							<div v-else-if="item=='产品名称'">
								<span>
									{{scope.row['产品名称']?scope.row['产品名称']:scope.row['物料描述']}}
								</span>
							</div>
							<div v-else-if="item=='元数据产品单价'">
								<span :class="{'warning':!scope.row[item]}">
									{{!scope.row[item]?'无法匹配元数据':scope.row[item]}}
								</span>
							</div>
							<div v-else>
								<span :class="{'warning':(item=='isMake'||item=='isRepeat')}">
									{{scope.row[item]}}
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="100">
						<template slot-scope="scope" v-if="scope.row.isRepeat">
								<el-button size="mini" type="text" @click="handleDelete(scope.row)">移除</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="page-container" style="padding: 10px 0;">
						<el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange" :current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal">
						</el-pagination>
				</div>
			</div>
		</div>
	</section>
</template>
<script>
//import settings from '@/config/files/dataList.json';
import UploadExcelComponent from '@/components/UploadExcel'
export default {
	name:'role',
	components: { UploadExcelComponent },
	data(){
		return {
      tableKeys : [
        {label:'isMake',value:'isMake'},
        {label:'isRepeat',value:'isRepeat'},
        {label:'订单编号',value:'serial'},
				{label:'产品名称',value:'productName'},
				{label:'物料描述',value:'productName'},
				{label:'元数据匹配',value:'meta'},
				{label:'物料号/版本号',value:'materialNo'},
        {label:'梯型',value:'model'},
        {label:'梯号',value:'modelNo'},
       	{label:'数量',value:'count'},
        {label:'单位',value:'util'},
				{label:'单价',value:'price'},
				{label:'元数据产品单价',value:'metaprice'},
        {label:'项目号',value:'projectNo'},
        {label:'箱号',value:'boxNo'},
        {label:'制单日期',value:'orderDate'},
        {label:'交货日期',value:'deliveryDate'},
        {label:'图号/版本号',value:'caselNo'},
        {label:'项目名称',value:'projectName'},
        {label:'备注',value:'content'}
      ],
			uploading:false,
			setting:{},
			typeList:[],
      crmList:[],
			productList:[],
			modelNoList:[],
      serialList:[],
			uploadTotal:0,
			queryUpload:{
				page:1,
				pagesize:100
			},
			lastId:0,
			tableForm:{
				crmId:'',
				typeId:[1,2]
			},
			tableRules:{
				crmId:[{ required: true, message: '请选择客户', trigger: 'change'}],
        typeId:[{ required: true, message: '请选择订单类型', trigger: 'change'}]
			},
			repeatCount:0,
			notinCount:0,
			checkOut:0,
			uploadRepeatCount:0,
      uploadTable:[],
			sourceData:[],
			tableData: [],
			tableHeader: []
		}
	},
	methods:{
    selectionChange(selection){
			this.uploadTable = selection;
			this.uploadRepeatCount= 0;
			this.checkOut = 0;
			selection.forEach(item=>{
				if(item.isRepeat !== undefined){
					this.uploadRepeatCount++;
				}
				if(!item['元数据匹配']){
					this.checkOut++;
				}
			})
			console.log('this.uploadRepeatCount', this.uploadRepeatCount, this.checkOut);
    },
		tableFilter(){
      let list = _.cloneDeep(this.sourceData);
      // 过滤订单类型
      list = _.filter(list, (item)=>{
        return this.tableForm.typeId.includes(item.typeId);//this.tableForm.typeId == item.typeId;
      });
      // 筛选客户
      let crmList = _.cloneDeep(this.setting.crm);
      this.crmList = _.filter(crmList,(item)=>{
				return this.tableForm.typeId.includes(item.typeId);//{'typeId':this.tableForm.typeId}
			});
      this.tableData = list;
			this.uploadTotal = this.tableData.length;
		},
		removeRepeat(){
			let list = [];
			this.sourceData.forEach(item=>{ //sourceData
				if(!item['isRepeat']){
					list.push(item);
				}
			});
			this.repeatCount = 0;
			this.sourceData = list;
			this.tableData = list;
			this.uploadTotal = list.length;
		},
		// 移除无法匹配元数据的点单
		removeNotIn(){
			let list = [];
			this.sourceData.forEach(item=>{
				if(!item.notin){
					list.push(item);
				}
			});
			this.notinCount = 0;
			this.sourceData = list;
			this.tableData = list;
			this.uploadTotal = list.length;
		},
		// 检查订单梯号是否重复
    checkRepeat(arr){
			//this.repeatCount = 0;
			let counts = 0;
      arr.forEach(item=>{
				if(item.isRepeat !== undefined){
					counts++;
				}
			})
			this.repeatCount = counts;
    },
		beforeUpload(file) {
			this.tableData = [];
			const isLt1M = file.size / 1024 / 1024 < 1
			if (isLt1M) {
        this.uploading = true;
				return true;
			}
			this.$message({
				message: '文件大小不能超过1M',
				type: 'warning'
			})
			return false;
		},
		handleDelete(row){
			console.log('handleDelete',row);
      let index = _.findIndex(this.tableData, {'index':row.index})
      this.tableData.splice(index, 1);
      this.uploadTotal = this.tableData.length;
		},
    checkSerial(){
      let serial = this.handleSerial(true);
      if(this.serialList.includes(serial)){
        serial = this.checkSerial();
      }
      return serial;
    },
		handleSuccess({results, header}) {
			this.notinCount = 0;
			// 处理列名
			this.tableHeader = [];//['isMake','isRepeat'];
      // 重复订单量
      this.tableKeys.forEach(item=>{
        this.tableHeader.push(item.label);
      })
			//处理导入的数据
      var index = 1;
			results = results.map(item=>{
        index += 1;
        let obj = {};
				for(let k in item){
          item.index = index;
					if(k === '订单编号'){
            let serial = this.checkSerial();
            this.serialList.push(serial);
						item[k] = serial;
					}else if(k ==='产品名称'|| k ==='物料描述'){
						let str = item[k].replace(/\s+/g, "");
            if(str.indexOf('轿顶防护栏')>-1 || str.indexOf('线槽')>-1 || str.indexOf('挂钩')>-1 || str.indexOf('救援装置柜')>-1){
              item['isMake'] = '属于生产订单';
              item.typeId = 2;
            }else{
              item.typeId = 1;
            }
            // 匹配产品分类和产品ID
						let product = _.find(this.productList,(p)=>{
							if(p['name'].replace(/\s+/g, "") == str && p['materialNo'] == item['物料号/版本号'] && p.typeId == item.typeId){
								return p;
							}
						});
            if(product){
							item['元数据匹配'] = '匹配产品:ID='+product.id;
							item['元数据产品单价'] = product.price;
            }else{
							item.notin = true;
							this.notinCount += 1;
						}
					}else if(k ==='梯号' && this.checkModelNo(item[k])){ 
            item['isRepeat'] = '订单梯号重复';
          }
				}
				return item;
			});
			//debugger
			this.sourceData = _.orderBy(results,['isMake','isRepeat'],['asc']);
			this.tableData = _.cloneDeep(this.sourceData);
			this.checkRepeat(this.tableData);
			this.uploadTotal = this.sourceData.length;
      this.uploading = false;
		},
    checkModelNo(no){
      if(_.find(this.modelNoList, {'modelNo':no})){
        return true;
      }
      return false;
    },
		uploadSizeChange(val){
			this.queryUpload.pagesize = val;
		},
		uploadCurrentChange(val){
			this.queryUpload.page = val;
		},
		handleSerial(flag){
			return Math.random().toString(36).substr(2).toLocaleUpperCase();
		},
		saveTable(){
      this.$refs['tableForm'].validate((valid) => {
				if(valid){
          if(!this.uploadTable.length){
            this.$alert('请勾选需要保存的数据行');
            return;
					}
					if(this.uploadRepeatCount>0){
						this.$alert('提交订单中有'+this.uploadRepeatCount+'个与之前订单中重复的梯号，请清理后再提交保存！');
						return;
					}
					if(this.checkOut>0){
						this.$alert('提交订单中有'+this.checkOut+'个无法匹配元数据的产品，请处理后再提交保存！');
						return;
					}
					this.saveData();
				}
			});
		},
		_setValue(key, value){
			switch(key){
				case 'orderDate':
					return new Date(value).getTime();
				case 'deliveryDate':
					return new Date(value).getTime();
				case 'count':
					return Number(value);
				case 'price':
					return Number(value);
				default:
					return  _.trim(String(value));
			}
		},
		async saveData(){
			this.uploading = true;
			let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
			let crm = _.find(this.setting.crm,{'id':this.tableForm.crmId});
			let indexs = [];
			debugger
			let dataList = this.uploadTable.map((item, index)=>{
				indexs.push(item.index)
				let id = this.lastId + index + 1;
				let obj = {id:id,typeId:1,flowStateId:1,crmId:crm.id,crmName:crm.name,crmNo:crm.crmNo,createByUser:this.$store.state.user.name};
				for(let key in item){
					if(key === 'isMake'){
						obj = _.merge(obj, {typeId:2,flowStateId:4});
					}
					let o = _.find(this.tableKeys, {label:key});
					if(o){
						let k = o.value;
						let val = this._setValue(k, item[key]);
            if(k === 'productName'){
							let product = _.find(this.productList,(p)=>{
								if(p['name'].replace(/\s+/g, "") == val.replace(/\s+/g, "")){
									return p;
								}
							});
							if(product){
								obj.ptypeId = product.ptypeId;
								obj.productId = product.id;
							}
						}
						obj[k] = val;
					}
				};
				return obj;
			});
			let condition = {
				type:'addPatch',
				collectionName: 'order',
				data:dataList
			};
			console.log(condition);
			this.$axios.$post('mock/db', {data:condition}).then(result=>{
				indexs.forEach(i=>{
					let index = _.findIndex(this.sourceData,{'index':i}); //this.sourceData
					this.sourceData.splice(index,1);
				});

				//this.tableData = _.cloneDeep(this.sourceData);
				this.tableData = _.filter(this.sourceData, item=>{
					return this.tableForm.typeId.includes(item.typeId);
				})
				//this.tableForm.crmId = '';
        this.uploadTable = [];
        this.uploadTotal = this.tableData.length;

				this.getModelNoList();
				this._getLastId();
				this.uploading = false;
				loadingMask.close();
			});
		},
		// 获取所有订单列表,列出梯号,校验是否重复
		async getModelNoList(match = {}){
			let condition = {
				type:"getColumns",
				collectionName: 'order',
				cols:{modelNo:1,crmId:1,serial:1}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			//console.log('getModelNoList',result);
			this.modelNoList = result;
      result.forEach(item=>{
        this.serialList.push(item.serial);
      });
      //console.log('serialList',this.serialList);
		},
		async _getLastId(){
			let condition = {
				type:"getId",
				data:{
						model:'order'
				}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			if(result){
				console.log('lastId',result)
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
				console.log('getSetting',result);
				this.setting = result.content;
				this.typeList = this.setting.type;
        this.productList = this.setting.product;
        this.crmList = _.clone(this.setting.crm);
				this.getModelNoList();
			}
		}
	},
	created(){
		this.getSetting();
		this._getLastId();
	},
	mounted(){

	}
}
</script>

<style lang="scss" scoped>
	.upload-container{
		display:flex;
		align-item:center;
	}
	.warning{
		color:red;
	}
</style>

