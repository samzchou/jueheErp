<template>
    <section>
        <div class="page-title">
            <div>
                <span>客户列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增客户':'取消返回'}}</el-button>
            </div>
        </div>
        
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="分类：" prop="typeId">
                        <el-select v-model="searchForm.typeId" placeholder="请选择" multiple clearable  style="width:100px">
                            <el-option v-for="(type,idx) in typeList" :key="idx" :label="type.name" :value="type.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="客户名称：" prop="name">
                        <el-input v-model="searchForm.name" clearable  style="width:200px"/>
                    </el-form-item>
                    <el-form-item label="客户ID：" prop="crmNo">
                        <el-input v-model="searchForm.crmNo" clearable  style="width:200px"/>
                    </el-form-item>
                    <el-form-item label="联系人：" prop="contactName">
                        <el-input v-model="searchForm.contactName" clearable style="width:100px"/>
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
            style="width: 100%">
                <el-table-column label="No." width="50px" align="center" type="index"></el-table-column>
                <el-table-column prop="typeName" label="所属类别" width="80px"></el-table-column>
                <el-table-column prop="isuse" label="状态" width="80px">
                    <template slot-scope="scope">
                        <el-switch size="mini" v-model="scope.row.isuse" @change="changeIsUse(scope.row)"/>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="客户名称" width="150px"></el-table-column>
                <el-table-column prop="crmNo" label="客户ID" width="150px"></el-table-column>
                <el-table-column prop="revenueNo" label="税号" width="150px"></el-table-column>
                <el-table-column prop="bank" label="开户银行" width="100px"></el-table-column>
                <el-table-column prop="bankNo" label="银行账号" width="150px"></el-table-column>
                <el-table-column prop="address" label="联系地址" width="150px"></el-table-column>
                <el-table-column prop="contactName" label="联系人" width="100px"></el-table-column>
                <el-table-column prop="contactPhone" label="联系电话" width="100px"></el-table-column>
                <el-table-column prop="payTypeId" label="付款方式" width="80px">
                    <template slot-scope="scope">
                        <span>{{parsePayType(scope.row.payTypeId)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="payTimes" label="付款期" width="80px">
                    <template slot-scope="scope">
                        <span>{{scope.row.payTimes}} 天</span>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="备注"></el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="业务分类" prop="typeId">
                    <el-radio-group v-model="ruleForm.typeId">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="客户名称" prop="name">
                    <el-input v-model="ruleForm.name" style="width:200px"/>
                </el-form-item>
                <el-form-item label="客户ID" prop="crmNo">
                    <el-input v-model="ruleForm.crmNo" style="width:200px"/>
                </el-form-item>
                <el-form-item label="税号" prop="revenueNo">
                    <el-input v-model="ruleForm.revenueNo" style="width:200px"/>
                </el-form-item>
                <el-form-item label="开户银行" prop="bank">
                    <el-input v-model="ruleForm.bank" style="width:200px"/>
                </el-form-item>
                <el-form-item label="银行账号" prop="bankNo">
                    <el-input v-model="ruleForm.bankNo"/>
                </el-form-item>
                <el-form-item label="联系地址" prop="address">
                    <el-input v-model="ruleForm.address"/>
                </el-form-item>
                <el-form-item label="联系人" prop="contactName">
                    <el-input v-model="ruleForm.contactName" style="width:120px"/>
                </el-form-item>
                <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="ruleForm.contactPhone" style="width:120px"/>
                </el-form-item>
                <el-form-item label="付款方式" prop="payTypeId">
                    <el-select v-model="ruleForm.payTypeId" placeholder="请选择"  style="width:120px">
                        <el-option v-for="pay in payTypeList" :key="pay.id" :label="pay.name" :value="pay.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="付款期" prop="payTimes">
                    <el-input v-model="ruleForm.payTimes" style="width:120px">
                        <template slot="append">
                            <span>天</span>
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
export default {
    name:'role',
    data(){
        return {
            isEdit:false,
            listLoading:false,
            payTypeList:[],
            typeList:[],
            query:{},
            gridList:[],
            dataId:undefined,
            editRow:null,
            searchForm:{
                name:'',
                crmNo:'',
                typeId:'',
                contactName:''
            },
            ruleForm:{
                typeId:'',
                crmNo:'',
                name:'',
                revenueNo:'',
                bank:'',
                bankNo:'',
                address:'',
                contactName:'',
                contactPhone:'',
                payTypeId:'',
                payTimes:'',
                content:''
            },
            rules:{
                typeId: [
                    { required: true, message: '请选择业务分类', trigger: 'change'},
                ],
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur'},
                ],
                contactName: [
                    { required: true, message: '请输入联系人', trigger: 'blur'},
                ],
                contactPhone: [
                    { required: true, message: '请输入联系人电话', trigger: 'blur'},
                ],
                payTypeId:[
                    { required: true, message: '请选择付款方式', trigger: 'change'},
                ]

            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.editRow = null;
            this.ruleForm = {
                typeId:this.typeList[0]['id'],
                name:'',
                crmNo:'',
                revenueNo:'',
                bank:'',
                bankNo:'',
                address:'',
                contactName:'',
                contactPhone:'',
                payTypeId:'',
                payTimes:'',
                content:''
            }
        },
        handleUpdate(row){
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                typeId:row.typeId,
                crmNo:row.crmNo,
                name:row.name,
                revenueNo:row.revenueNo,
                bank:row.bank,
                bankNo:row.bankNo,
                address:row.address,
                contactName:row.contactName,
                contactPhone:row.contactPhone,
                payTypeId:row.payTypeId,
                payTimes:row.payTimes,
                content:row.content
            }
            this.isEdit = true;
        },
        handleDelete(row){
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type:'removeData',
                    collectionName: 'crm',
                    data:{id:row.id}
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.gridList.splice(index, 1);
                });
            }).catch();
        },
        parsePayType(id){
            if(!id) return '';
            let type = _.find(this.payTypeList, {'id':id});
            return type.name;
        },
        parsePos(row){
            if(row.posName){
                return row.posName;
            }else if(row.posId){
                let pos = _.find(this.posList, {'id':row.posId});
                return pos.name;
            }
        },
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'crm',
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
                        this.dataId = undefined;
                    });
                } else {
                    this.$message.error('保存失败！请联系管理员');
                    return false;
                }
            });
        },
        async changeIsUse(row){
            let condition = {
                type:'updateData',
                collectionName: 'crm',
                updateDate:true,
                data:{
                    id:row.id,
                    isuse:row.isuse
                }
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
        },
        async getPayTypeList(){
            let condition = {
                type:'listData',
                collectionName: 'payType',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.payTypeList = result.list;
        },
        async getTypeList(){
            let condition = {
                type:'listData',
                collectionName: 'type',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.typeList = result.list;
        },
        submitSearch(){
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
            //console.log('submitSearch',params);
            this.getList(params)
        },
        async getList(match = {}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',
                collectionName: 'crm',
                aggregate:[
                    {
                        $lookup:{
                            from: "types",
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
                    {$sort:{id:1}}
                ]
            };
            if(!_.isEmpty(match)){
                condition.aggregate.push({
                    $match:match
                })
            }
            //console.log('aggregate', condition.aggregate)

            let result = await this.$axios.$post('mock/db', {data:condition});
            console.log('getList',result)
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
        },
    },
    created(){
        //this.getList();
        this.getPayTypeList();
        this.getTypeList();
    },
    mounted(){
        this.getList();
    }
}
</script>



