<template>
	<section>
		<div class="page-title">
			<div>
					<span>采购订单导入（注：导入的订单如有涉及为生产订单的请选择客户后分开保存数据）</span>
			</div>
		</div>
		<div class="form-container">
			<div class="upload-container">
				<el-form :inline="true" :model="tableForm" ref="tableForm" size="mini" v-if="sourceData.length">
          <el-form-item label="筛选客户：" prop="crmId">
						<el-select v-model="tableForm.crmId" placeholder="请选择客户" filterable clearable  style="width:250px" @change="filterByCrm">
							<el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="saveTable" v-if="tableData.length" :loading="uploading">保存数据</el-button>
            <el-button type="" @click="sourceData=[]">重新上传</el-button>
						<el-button type="" @click="removeRepeat" v-if="repeatCount">删除重复梯号、项目号的订单(共：{{repeatCount}})</el-button>
						<el-button type="" @click="removeNotIn" v-if="notInList.length" :disabled="openDialogNotin">显示无法匹配元数据的订单(共：{{notInList.length}})</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" :on-success="handleSuccess" :before-upload="beforeUpload"/>
			</div>
      <div v-if="uploading">正在导入订单中，请等待处理完成...</div>
			<!--批量导入-->
			<div v-if="tableData.length">
				<el-table size="mini"
				:data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)"
				border highlight-current-row fit @selection-change="selectionChange">
          <el-table-column type="selection" fixed="left" align="center"></el-table-column>
					<el-table-column label="No." fixed="left" width="70px" align="center">
							<template slot-scope="scope">
									<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}} </span>
							</template>
					</el-table-column>
					<el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item" v-if="item!=='物料描述'" :width="(item=='客户名称'||item=='产品名称'||item=='备注')?250:150">
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
						<template slot-scope="scope">
								<el-button size="mini" type="text" @click="handleDelete(scope.row)">移除</el-button>
                <el-button size="mini" type="text" v-if="scope.row.notin" @click="handleEdit(scope.row)">编辑</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="page-container" style="padding: 10px 0;">
						<el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange" :current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal">
						</el-pagination>
				</div>
			</div>
		</div>

    <el-dialog title="无法匹配元数据的订单列表" :visible.sync="openDialogNotin" append-to-body width="60%">
      <el-table size="mini" :data="notInList" border highlight-current-row fit max-height="500">
        <el-table-column label="订单类型" prop="isMake" width="70">
          <template slot-scope="scope">
            <span v-if="scope.row['isMake']">生产</span>
            <span v-else>采购</span>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="产品名称"/>
        <el-table-column label="物料号/版本号" prop="物料号/版本号" width="120"/>
        <el-table-column label="梯型" prop="梯型" width="100"/>
        <el-table-column label="梯号" prop="梯号" width="80"/>
        <el-table-column label="项目号" prop="项目号" width="120"/>
        <el-table-column label="单价" prop="单价" width="100"/>
        <el-table-column label="操作" fixed="right" align="center" width="100">
          <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)" v-if="scope.row.notin">加入产品</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="新增产品" :visible.sync="openDialogVisible" append-to-body>
      <editProduct :editRow="product" :setting="setting" @back="finishedEdit"/>
    </el-dialog>

	</section>
</template>
<script>
import editProduct from '@/components/editProduct';
//import settings from '@/config/files/dataList.json';
import UploadExcelComponent from '@/components/UploadExcel'
export default {
	name:'role',
	components: { editProduct, UploadExcelComponent },
	data(){
		return {
      tableKeys : [
        {label:'isMake',value:'isMake'},
        {label:'isRepeat',value:'isRepeat'},
        {label:'客户名称',value:'crmName'},
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
				crmId:''
      },
      openDialogVisible:false,
      editRow:null,
      product:{},
			repeatCount:0,
			checkOut:0,
			uploadRepeatCount:0,
      uploadTable:[],
			sourceData:[],
			tableData: [],
      tableHeader: [],
      openDialogNotin:false,
      notInList:[],
		}
	},
	methods:{
    filterByCrm(){
      if(this.tableForm.crmId){
        this.tableData = _.filter(this.sourceData,{crmId:this.tableForm.crmId});
      }else{
        this.tableData = _.cloneDeep(this.sourceData);
      }

      this.uploadTotal = this.tableData.length;
    },
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
    // 新增产品后处理
    finishedEdit(row){
      this.openDialogVisible = false;
      if(row){
        row.productName = row.name;
        //console.log('finishedEdit',row);
        for(let key in row){
          let obj = _.find(this.tableKeys, {'value':key});
          if(obj){
            let k = obj.label;
            if(this.editRow[k]){
              this.editRow[k] = row[key];
            }
          }
        }
        console.log('finishedEdit',this.editRow);
        // 列出所有匹配row属性的订单，统一处理
        let lists = _.filter(this.sourceData,{'typeId':this.editRow['typeId'],'产品名称':this.editRow['产品名称'],'物料号/版本号':this.editRow['物料号/版本号']});
        lists.forEach(item=>{
          let index = _.findIndex(this.sourceData, {'index': item.index});
          if(index>-1){
            //delete item.notin;
            let crm = _.find(this.setting.crm, {'id':row.crmId});
            item.notin = false;
            item['crmId'] = crm.id;
            item['crmNo'] = crm.crmNo;
            item['客户名称'] = crm.name;
            item['ptypeId'] = row.ptypeId;
            item['元数据匹配'] = '匹配产品:ID=' + row.id;
            item['元数据产品单价'] = row.price;
            this.$set(this.sourceData, index, item);
            let notIndex = _.findIndex(this.notInList, {'index': item.index});
            if(notIndex>-1){
              this.notInList.splice(notIndex, 1);
            }
          }
        })
        this.tableData = _.cloneDeep(this.sourceData);
        this.$message.success('已添加产品，同步完成订单的产品匹配');

        //let index = _.findIndex(this.sourceData, {'index': this.editRow.index});

      }
    },
    // 编辑订单（新建产品数据）
    handleEdit(row){
      this.editRow = row;
      console.log('handleEdit',row);
      let product = {typeId:row.typeId};
      for(let key in row){
        let obj = _.find(this.tableKeys, {'label':key});
        if(obj){
          let k = obj.value;
          product[k] = this._setValue(k, row[key]);
        }
      }
      this.openDialogVisible = true;
      this.product = product;
      console.log('handleEdit',product)
    },
		removeRepeat(){
			let list = [];
			this.sourceData.forEach(item=>{ //sourceData
				if(!item['isRepeat']){
					list.push(item);
				}
      });
      this.tableForm.crmId = '';
			this.repeatCount = 0;
			this.sourceData = list;
			this.tableData = list;
			this.uploadTotal = list.length;
		},
		// 移除无法匹配元数据的点单
		removeNotIn(){
			this.notInList = _.orderBy(this.notInList,['产品名称'],['asc'])
      this.openDialogNotin = true;
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
      this.$confirm('确定删除该订单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let index = _.findIndex(this.sourceData, {'index':row.index})
        this.sourceData.splice(index, 1);
        this.tableData = _.cloneDeep(this.sourceData);
        this.uploadTotal = this.tableData.length;
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch();
		},
    checkSerial(){
      let serial = this.handleSerial(true);
      if(this.serialList.includes(serial)){
        serial = this.checkSerial();
      }
      return serial;
    },
		handleSuccess({results, header}) {
      this.crmList = [];
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
            item['产品名称'] = item[k];
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
              let crm = _.find(this.setting.crm,{'id':product.crmId});
              if(crm){
                item['客户名称'] = crm.name;
                item['crmId'] = crm.id;
                item['crmNo'] = crm.crmNo;
                if(_.findIndex(this.crmList,{id:crm.id})<0){
                  this.crmList.push(crm);
                }
              }
              item['productId'] = product.id;
              item['ptypeId'] = product.ptypeId;
							item['元数据匹配'] = '匹配产品:ID='+product.id;
							item['元数据产品单价'] = product.price;
            }else{
              this.notInList.push(item);
							item.notin = true;
						}
					}else if(k ==='梯号' && this.checkModelNo(item)){
            item['isRepeat'] = '订单梯号、项目号重复';
          }
				}
				return item;
			});
			this.sourceData = _.orderBy(results,['isMake','isRepeat'],['asc']);
			this.tableData = _.cloneDeep(this.sourceData);
			this.checkRepeat(this.tableData);
			this.uploadTotal = this.sourceData.length;
      this.uploading = false;
		},
    checkModelNo(row){
      if(_.find(this.modelNoList, {'modelNo':row['梯号'],'projectNo':row['项目号'],'materialNo':row['物料号/版本号']}) ){
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
      if(!this.uploadTable.length){
        this.$alert('请勾选需要保存的数据行');
        return;
      }
      if(this.uploadRepeatCount>0){
        this.$alert('有'+this.uploadRepeatCount+'个重复的梯号和项目号的订单，请清理后再提交保存！');
        return;
      }
      if(this.checkOut>0){
        this.$alert('提交订单中有'+this.checkOut+'个无法匹配元数据的产品，请处理后再提交保存！');
        return;
      }
      this.saveData();
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
			//let crm = _.find(this.setting.crm,{'id':this.tableForm.crmId});
			let indexs = [];
			let dataList = this.uploadTable.map((item, index)=>{
				indexs.push(item.index)
        this.lastId = this.lastId + index + 1;
        //let obj = {'id':this.lastId,'typeId':1,'flowStateId':1,'crmId':crm.id,'crmName':crm.name,'crmNo':crm.crmNo,'createByUser':this.$store.state.user.name};
        let obj = {'id':this.lastId,'typeId':1,'flowStateId':1,'createByUser':this.$store.state.user.name};
				for(let key in item){
					if(key === 'isMake'){
						obj = _.merge(obj, {typeId:2,flowStateId:4});
          }
          // 判断KEY
          if(!['crmId','productId','ptypeId','crmNo'].includes(key)){
            let o = _.find(this.tableKeys, {label:key});
            if(o){
              let k = o.value;
						  obj[k] = this._setValue(k, item[key]);
            }
          }else{
            obj[key] = item[key];
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
      //return;
			this.$axios.$post('mock/db', {data:condition}).then(result=>{
        indexs.forEach(i=>{
					let index = _.findIndex(this.sourceData,{'index':i}); //this.sourceData
					this.sourceData.splice(index,1);
				});
        this.uploadTable = [];
        // 根据客户过滤
        this.filterByCrm();
				this.getModelNoList();
				//this._getLastId();
				this.uploading = false;
				loadingMask.close();
			});
		},
		// 获取所有订单列表,列出梯号,校验是否重复
		async getModelNoList(match = {}){
			let condition = {
				type:"getColumns",
				collectionName: 'order',
				cols:{modelNo:1,crmId:1,serial:1, projectNo:1,materialNo:1}
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
				this.setting = result.content;
				this.typeList = this.setting.type;
        this.productList = this.setting.product;
        //this.crmList = _.clone(this.setting.crm);
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

