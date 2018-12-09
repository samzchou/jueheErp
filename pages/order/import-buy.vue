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
						<el-select v-model="tableForm.crmId" placeholder="请选择" filterable clearable  style="width:250px" @change="filterByForm">
							<el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
          <el-form-item label="筛选类型：" prop="crmId">
						<el-select v-model="tableForm.typeId" placeholder="请选择" filterable clearable  @change="filterByForm">
							<el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"/>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="saveTable" v-if="tableData.length" :loading="uploading">保存数据</el-button>
            <el-button type="" @click="sourceData=[]">重新上传</el-button>
						<el-button type="" @click="removeRepeat" v-if="repeatCount">删除重复梯号、项目号的订单(共：{{repeatCount}})</el-button>
						<el-button type="" @click="openDialogNotin=true" v-if="notInList.length" :disabled="openDialogNotin">显示无法匹配元数据的订单(共：{{notInList.length}})</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" :on-success="handleSuccess" :before-upload="beforeUpload"/>
			</div>
      <div v-if="uploading">正在导入订单中，请等待处理完成...</div>
			<!--批量导入-->
			<div>
				<el-table size="mini"
				:data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)"
				border highlight-current-row fit @selection-change="selectionChange" max-height="500" v-loading="uploading">
          <el-table-column type="selection" fixed="left" align="center"></el-table-column>
					<el-table-column label="No." fixed="left" width="70px" align="center">
							<template slot-scope="scope">
									<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}} </span>
							</template>
					</el-table-column>
          <!--订单数据列表-->
					<el-table-column v-for="item of tableKeys" :prop="item.value" :label="item.label" :key="item.value" :width="item.width">
            <template slot-scope="scope">
              <div class="row-list" :title="scope.row[item.value]">
                <span>{{parseStr(scope.row,item.value)}}</span>
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
        <el-table-column label="订单类型" prop="typeId" width="70">
          <template slot-scope="scope">
            <span>{{parseStr(scope.row,'typeId')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="物料描述" prop="productName"/>
        <el-table-column label="物料号/版本号" prop="materialNo" width="120"/>
        <el-table-column label="梯型" prop="model" width="100"/>
        <el-table-column label="梯号" prop="modelNo" width="80"/>
        <el-table-column label="项目号" prop="projectNo" width="120"/>
        <el-table-column label="单价" prop="price" width="100"/>
        <el-table-column label="操作" fixed="right" align="center" width="100">
          <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)" v-if="scope.row.notin">加入产品</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="新增产品" :visible.sync="openDialogVisible" append-to-body>
      <editProduct :editRow="editRow" :setting="setting" @back="finishedEdit"/>
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
        {label:'订单类型',value:'typeId',width:80},
        {label:'重复订单',value:'isRepeat',width:80},
        {label:'客户名称',value:'crmName',width:200},
        {label:'订单编号',value:'sourceserial',width:100},
				{label:'物料描述',value:'productName',width:200},
        {label:'物料号/版本号',value:'materialNo',width:120},
        {label:'项目号',value:'projectNo',width:120},
        {label:'梯型',value:'model',width:100},
        {label:'梯号',value:'modelNo',width:60},
       	{label:'数量',value:'count',width:50},
        {label:'单位',value:'util',width:50},
				{label:'单价',value:'price',width:80},
				{label:'元单价',value:'metaprice',width:80},
        {label:'箱号',value:'boxNo',width:70},
        {label:'制单日期',value:'orderDate',width:100},
        {label:'交货日期',value:'deliveryDate',width:100},
        {label:'图号/版本号',value:'caselNo',width:120},
        {label:'项目名称',value:'projectName',width:150},
        {label:'备注',value:'content',width:150}
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
        typeId:''
      },
      openDialogVisible:false,
      editRow:null,
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
    parseStr(row, field){
      switch(field){
        case 'typeId':
          let type = _.find(this.typeList,{id:row[field]});
          return type.name;
        default:
          return row[field];
      }
    },
    filterByForm(){
      let filterObj = {};
      for(let k in this.tableForm){
        if(this.tableForm[k]){
          filterObj[k] = this.tableForm[k];
        }
      }
      if(!_.isEmpty(filterObj)){
        this.tableData = _.filter(this.sourceData, filterObj);
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
      if(row){
        let crm = _.find(this.setting.crm, {'id':row.crmId});
        this.editRow.typeId = row.typeId;
        this.editRow.materialNo = row.materialNo;
        this.editRow.productId = row.id;
        this.editRow.productName = row.name;
        this.editRow.price = row.price;
        this.editRow.util = row.util;
        this.editRow.metaprice = row.price;
        this.editRow.ptypeId = row.ptypeId;
        this.editRow.model = row.model;
        this.editRow.modelNo = row.modelNo;
        this.editRow.crmId = row.crm;
        this.editRow.crmName = crm.name;
        delete this.editRow.notin;
        //console.log(row);
        let index = _.findIndex(this.sourceData, {'index': this.editRow.index});
        if(index>-1){
          this.$set(this.sourceData, index, this.editRow);
        }
        let tindex = _.findIndex(this.tableData, {'index': this.editRow.index});
        if(tindex>-1){
          this.$set(this.tableData, tindex, this.editRow);
        }
        this.$message.success('已添加产品，同步完成订单的产品匹配');
        let notIndex = _.findIndex(this.notInList, {'index': this.editRow.index});
        if(notIndex>-1){
          this.notInList.splice(notIndex, 1);
        }
      }
      this.openDialogVisible = false;
    },
    // 编辑订单（新建产品数据）
    handleEdit(row){
      this.editRow = row;
      this.openDialogVisible = true;
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
    checkSerial(index){
      let now =  moment(new Date()).format('YYYY-MM-DD HH:mm');
      now = now.split(' ');
      let dd = now[0].split('-');
      let tt = now[1].split(':')
      let serial = index+'-JH' + dd[0] +''+ dd[1] +''+ dd[2]+''+tt[0]+''+tt[1];
      return serial;
    },
		handleSuccess({results, header}) {
      this.crmList = [];
			// 处理列名
      this.tableHeader = [];//['isMake','isRepeat'];
      this.notInList = [];
      // 重复订单量
      this.uploadRepeatCount = 0;
      /* this.tableKeys.forEach(item=>{
        this.tableHeader.push(item.label);
      }) */
      let listData = [];
      results.forEach((item, index)=>{
        let obj = {'index':index+1};
        for(let k in item){
          let value = item[k];
          k = k.replace(/(^\s+)|(\s+$)/g,""); // 去除空格
          let head = _.find(this.tableKeys,{'label':k});
          if(head){
            obj[head.value] = value;
            //生产订单
            if(head.value == 'productName'){
              if(value.includes('轿顶防护栏') || value.includes('线槽') || value.includes('挂钩') || value.includes('救援装置柜')){
                obj.typeId = 2;
                obj.flowStateId = 5;
              }else{
                obj.typeId = 1;
                obj.flowStateId = 1;
              }
            }
          }
        }
        // 判断采购订单是否相同并合并数量
        let dataIndex = _.findIndex(listData,{'typeId':obj.typeId,'productName':obj.productName,'materialNo':obj.materialNo,'price':obj.price,'caselNo':obj.caselNo})
        if(dataIndex>-1){ // && !obj.isMake
          listData[dataIndex]['sourceserial'] += ','+obj.sourceserial;
          if(listData[dataIndex]['projectNo'].indexOf(obj.projectNo)<0){
            listData[dataIndex]['projectNo'] += ','+obj.projectNo;
          }
          listData[dataIndex]['count'] += obj.count;
        }else{
          // 匹配产品分类和产品ID
          let product = _.find(this.productList,{'name':obj.productName,'materialNo':obj.materialNo,'typeId':obj.typeId});
          if(product){
            let crm = _.find(this.setting.crm,{'id':product.crmId});
            if(_.findIndex(this.crmList,{id:product.crmId})<0){
              this.crmList.push(crm);
            }
            obj = _.merge(obj,{
              metaprice:product.price,
              productId:product.id,
              ptypeId:product.ptypeId,
              crmId:product.crmId,
              crmName:crm.name,
            })
          }else{
            obj.notin = true;
            this.notInList.push(obj);
          }
          // 检查重复订单 notInList
          if(this.checkModelNo(obj)){
            obj.isRepeat = "是";
            this.uploadRepeatCount += 1;
          }
          listData.push(obj);
        }
      });

      this.sourceData = listData; //_.orderBy(listData,['typeId'],['desc']);
      this.tableData = _.cloneDeep(this.sourceData);
			this.uploadTotal = this.sourceData.length;
      this.uploading = false;
		},
    checkModelNo(row){
      if(_.find(this.modelNoList, {'productName':row.productName,'modelNo':row.modelNo,'projectNo':row.projectNo,'materialNo':row.materialNo}) ){
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

		saveTable(){
      if(!this.uploadTable.length){
        this.$alert('请勾选需要保存的数据行');
        return;
      }
      if(this.uploadRepeatCount>0){
        this.$alert('有'+this.uploadRepeatCount+'个重复的梯号和项目号的订单，请清理后再提交保存！');
        return;
      }
      // 检查订单的完善
      let checkNotIn = _.filter(this.uploadTable,{'notin':true})
      if(checkNotIn.length){
        this.$alert('提交订单中有'+checkNotIn.length+'个无法匹配元数据的产品，请处理后再提交保存！');
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
				indexs.push(item.index);
        this.lastId = this.lastId + index + 1;
        let serial = this.checkSerial(item.index);
        let obj = _.merge(item,{'id':this.lastId,'serial':serial,'createByUser':this.$store.state.user.name});
        obj.orderDate = new Date(obj.orderDate).getTime();
        obj.deliveryDate = new Date(obj.deliveryDate).getTime();
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
        this.filterByForm();
				//this.getModelNoList();
				this.uploading = false;
				loadingMask.close();
			});
		},
		// 获取所有订单列表,列出梯号,校验是否重复
		async getModelNoList(match = {}){
      let now = new Date();
      let sd = new Date(now.setDate(now.getDate() -1));
		  let ed = new Date(now.setDate(now.getDate() + 6));
			let params = {
				type:"getColumns",
        collectionName: 'order',
        condition:{
          flowStateId:{$in:[1,5]},
          updateDate:{'$gte':sd.getTime(),'$lte':ed.getTime()},
        },
				cols:{productName:1,modelNo:1,crmId:1,serial:1, projectNo:1,materialNo:1}
      }

			let result = await this.$axios.$post('mock/db', {data:params});
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

  .row-list{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.warning{
      color:red;
    }
  }
</style>

