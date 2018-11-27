<template>
    <section>
        <div class="page-title">
            <div>
                <span>{{isEdit?'产品编辑':'产品列表'}}</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增产品':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="业务分类：">
                        <el-select v-model="searchForm.typeId" placeholder="请选择" clearable  style="width:100px" @change="filterPtypeBySearch">
                            <el-option v-for="(type,idx) in typeList" :key="idx" :label="type.name" :value="type.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品分类：">
                        <el-select v-model="searchForm.ptypeId" placeholder="请选择" multiple clearable>
                            <el-option v-for="(ptype,idx) in searchptypeList" :key="idx" :label="ptype.name" :value="ptype.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品名称：">
                        <el-input v-model="searchForm.name" clearable  style="width:200px"/>
                    </el-form-item>
                    <el-form-item label="规格/梯形：">
                        <el-input v-model="searchForm.model" clearable  style="width:100px"/>
                    </el-form-item>
					          <el-form-item label="型号/梯号：">
                        <el-input v-model="searchForm.modelNo" clearable  style="width:100px"/>
                    </el-form-item>
					          <el-form-item label="套件物料号：">
                        <el-input v-model="searchForm.parentMater" clearable  style="width:100px"/>
                    </el-form-item>
					          <el-form-item label="物料/版本号：">
                        <el-input v-model="searchForm.materialNo" clearable  style="width:100px"/>
                    </el-form-item>
                    <el-form-item label="关联客户：" prop="crmId">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" multiple clearable>
                            <el-option v-for="(crm,idx) in searchCrmList" :key="idx" :label="crm.name" :value="crm.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table v-loading="listLoading"
            :data="gridList"
            border fit highlight-current-row
            size="mini"
            height="450"
            style="width: 100%">
                <el-table-column label="No." width="50px" align="center" type="index">
                  <template slot-scope="scope">{{scope.$index+(query.page - 1) * query.pagesize + 1}} </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="80px"/>
                <el-table-column prop="isuse" label="状态" width="80px">
                    <template slot-scope="scope">
                        <el-switch size="mini" v-model="scope.row.isuse" @change="changeIsUse(scope.row)"/>
                    </template>
                </el-table-column>
                <el-table-column prop="typeName" label="业务分类" width="80px"/>
                <el-table-column prop="ptypeId" label="产品分类" width="150px">
                    <template slot-scope="scope">
                        {{parsePtype(scope.row.ptypeId)}}
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="产品名称" width="250px"></el-table-column>
                <el-table-column prop="crmId" label="关联客户" width="250px">
                    <template slot-scope="scope">
                        {{parseCrm(scope.row.crmId)}}
                    </template>
                </el-table-column>
                <el-table-column prop="model" label="规格/梯型" width="100px"></el-table-column>
                <el-table-column prop="modelNo" label="型号/梯号" width="150px"></el-table-column>
                <el-table-column prop="parentMater" label="父级套件物料号" width="150px"></el-table-column>
				        <el-table-column prop="materialNo" label="物料号/版本号" width="150px"></el-table-column>
                <el-table-column prop="caselNo" label="图号/版本号" width="150px"></el-table-column>
                <el-table-column prop="util" label="单位"></el-table-column>
                <el-table-column prop="price" label="单价" width="100px">
                    <template slot-scope="scope">
                        {{scope.row.price | currency}}
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="备注说明"></el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="业务分类" prop="typeId">
                    <el-radio-group v-model="ruleForm.typeId" @change="filterPtype">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="产品分类" prop="ptypeId">
                    <el-select v-model="ruleForm.ptypeId" placeholder="请选择" style="width:200px">
                        <el-option v-for="ptype in pList" :key="ptype.id" :label="ptype.name" :value="ptype.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="ruleForm.name" style="width:200px"/>
                </el-form-item>
                <el-form-item label="关联客户" prop="crmId">
                    <el-select v-model="ruleForm.crmId" placeholder="请选择" style="width:200px">
                        <el-option v-for="crm in formCrmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="规格/梯型" prop="model">
                    <el-input v-model="ruleForm.model" style="width:200px"/>
                </el-form-item>
                <el-form-item label="型号/梯号" prop="modelNo">
                    <el-input v-model="ruleForm.modelNo" style="width:200px"/>
                </el-form-item>
                <el-form-item label="父级物料号" prop="parentMater">
                    <el-select v-model="ruleForm.parentMater" filterable clearable placeholder="父级物料号" style="width:200px">
                        <el-option v-for="s in materialNoList" :key="s" :value="s" :label="s"/>
                    </el-select>
					<span>* 如属套件内，请选择已有的父级物料号,否则请直接输入</span>
                </el-form-item>
				<el-form-item label="物料号/版本号" prop="materialNo">
                    <el-input placeholder="请输入物料号" v-model="ruleForm.materialNo" style="width:200px"/>
                </el-form-item>
                <el-form-item label="图号/版本号" prop="caselNo">
                    <el-input v-model="ruleForm.caselNo" style="width:200px"/>
                </el-form-item>
                 <el-form-item label="单位" prop="util">
                    <el-input v-model="ruleForm.util"  style="width:120px"/>
                </el-form-item>
                <el-form-item label="单价" prop="price">
                    <el-input v-model="ruleForm.price" style="width:150px">
                        <template slot="append">
                            <span>元</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="备注说明" prop="content">
                    <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 3, maxRows: 10}" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="medium"  @click="submitForm">提交保存</el-button>
                    <el-button type="infor" size="medium" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
        </div>
    </section>
</template>
<script>
//import settings from '@/config/files/dataList.json';
export default {
    name:'role',
    data(){
        return {
            isEdit:false,
            listLoading:false,
            typeList:[],
            ptypeList:[],
            searchptypeList:[],
			pList:[],
            crmList:[],
            searchCrmList:[],
            formCrmList:[],
            query:{page:1,pagesize:20},
            gridList:[],
            total:0,
            dataId:undefined,
            editRow:null,
            searchForm:{
                name:'',
                typeId:'',
                ptypeId:'',
                crmId:'',
				model:'',
				modelNo:'',
				parentMater:'',
                materialNo:''
            },
			materialNoList:[],
            ruleForm:{
                typeId:'',
                ptypeId:'',
                crmId:'',
                name:'',
                model:'',
				modelNo:'',
				parentMater:'',
                materialNo:'',
                caselNo:'',
                util:'',
                price:'',
                content:''
            },
            rules:{
                typeId: [
                    { required: true, message: '请选择业务分类', trigger: 'change'},
                ],
                ptypeId: [
                    { required: true, message: '请选择产品分类', trigger: 'change'},
                ],
                crmId: [
                    { required: true, message: '请选择客户', trigger: 'change'},
                ],
                name: [
                    { required: true, message: '请输入产品名称', trigger: 'blur'},
                ],
                util: [
                    { required: true, message: '请输入单位', trigger: 'blur'},
                ],
                price: [
                    { required: true, message: '请输入单价', trigger: 'blur'},
                ]
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.editRow = null;
            this.ruleForm = {
                typeId:this.isEdit?this.typeList[0]['id']:'',
                ptypeId:'',
                crmId:'',
                name:'',
                model:'',
                modelNo:'',
				parentMater:'',
                materialNo:'',
                caselNo:'',
                util:'',
                price:'',
                content:''
            };
			this.searchForm.typeId = '';
            this.filterPtype(this.isEdit?1:'');
            this.filterCrm(1);
        },
        handleUpdate(row){
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                typeId:row.typeId,
                ptypeId:row.ptypeId,
                crmId:row.crmId,
                name:row.name,
                model:row.model,
                modelNo:row.modelNo,
				parentMater:row.parentMater,
                materialNo:row.materialNo,
                caselNo:row.caselNo,
                util:row.util,
                price:row.price,
                content:row.content
            }
            this.isEdit = true;
            this.filterCrm(row.typeId);
        },
        handleDelete(row){
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type:'removeData',
                    collectionName: 'product',
                    data:{id:row.id}
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.gridList.splice(index, 1);
                    this.writeFile();
                });
            }).catch();
        },
        parsePtype(id){
            if(!id) return '';
            let type = _.find(this.ptypeList, {'id':id});
            return type?type.name:'';
        },
        parseCrm(id){
            if(!id) return '';
            let crm = _.find(this.crmList, {'id':id});
            return crm?crm.name:'';
        },
        filterPtypeBySearch(val){
			if(val != ''){
                this.searchptypeList = _.filter(this.ptypeList,{typeId:val});
                this.searchCrmList = _.filter(this.crmList,{typeId:val});
			}else{
                this.searchptypeList = _.cloneDeep(this.ptypeList);
                this.searchCrmList = _.cloneDeep(this.crmList);
			}
        },

        filterCrm(typeId){
            this.formCrmList = _.filter(this.crmList,{typeId:typeId});
        },

		filterPtype(val){
            this.ruleForm.ptypeId = '';
            this.ruleForm.crmId = '';
			if(val != ''){
                this.pList = _.filter(this.ptypeList,{typeId:val});
                this.filterCrm(val);
			}else{
				this.pList = _.cloneDeep(this.ptypeList);
			}
		},
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'product',
                        data:{...this.ruleForm}
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                        condition.updateDate = true;
                    }
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
                        let typeObj = {typeName:_.find(this.typeList,{id:this.ruleForm.typeId}).name};
                        if(this.dataId){
                            let index = _.findIndex(this.gridList, {id:this.dataId});
                            this.$set(this.gridList, index, _.merge(this.editRow, this.ruleForm, typeObj));
                        }else{
                            this.gridList.push(_.merge(result, typeObj));
                        }
                        this.writeFile();
                        this.dataId = undefined;
                        this.filterPtype('');

                    });
                }
            });
        },
        async writeFile(){
            let params = {
                type:'listData',
                collectionName: 'product',
                data:{}
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            let condition = {
                type:'updateSetting',
                collectionName: 'product',
                data:data.list
            }
            await this.$axios.$post('mock/db', {data:condition});
        },
        async changeIsUse(row){
            let condition = {
                type:'updateData',
                collectionName: 'product',
                updateDate:true,
                data:{
                    id:row.id,
                    isuse:row.isuse
                }
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.writeFile();
        },
        submitSearch(flag){
            let params = {};
            for(let k in this.searchForm){
                if(this.searchForm[k] != '' && this.searchForm[k]){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && _.isDate(this.searchForm[k][0])){
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
        async getList(match = {}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',//'aggregate' listData,
                collectionName: 'product',
                data:match,
                aggregate:[
                    {
                        $lookup:{
                          from: "type",
                          localField: "typeId",
                          foreignField: "id",
                          as: "type"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                          path: "$type",
                          preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {
                      $addFields: {typeName:"$type.name"}
                    },
                    {$sort:{id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            if(!_.isEmpty(match)){
                condition.aggregate.unshift({
                  $match:match
                })
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            //console.log('getLists',result, match);
            this.total = result.total;
            this.gridList = _.orderBy(result.list,['name','crmId'],['asc']); //result.list;
            this.listLoading = false;
		},
		// 获取已设定的基础数据和元数据
        async getSetting(){
            let condition = {
                type:"getData",
                collectionName:"setting",
                data:{}
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                //console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.ptypeList = this.setting.ptype;
				        this.crmList = this.setting.crm;

                // 父级物料号
                let materialNoList = [];
                    this.setting.product.forEach(item=>{
                  if(item.parentMater && !materialNoList.includes(item.parentMater)){// 如存在父级
                    materialNoList.push(item.parentMater);
                  }else{
                    if(item.materialNo && !materialNoList.includes(item.materialNo)){
                      materialNoList.push(item.materialNo);
                    }
                  }
                });
                this.materialNoList = materialNoList;
                //console.log('materialNoList', this.materialNoList);
                this.getList();
                this.filterPtypeBySearch('');
            }
        }
    },
    created(){
        this.getSetting();
    }
}
</script>



