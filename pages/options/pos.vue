<template>
    <section>
        <div class="page-title">
            <div>
                <span>职务列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增职务':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <el-table v-loading="listLoading" 
            :data="gridList" 
            border fit highlight-current-row 
            size="mini" 
            max-height="400" 
            style="width: 100%">
                <el-table-column label="No." width="50px" align="center" type="index"></el-table-column>
                <el-table-column prop="name" label="职务名称" width="200px"></el-table-column>
                <el-table-column prop="orgName" label="所属部门" width="200px"></el-table-column>
                <el-table-column prop="content" label="描述"></el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" size="mini">
                <el-form-item label="职务名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="所属部门" prop="orgId">
                    <el-select v-model="ruleForm.orgId" placeholder="请选择所属部门">
                        <el-option v-for="org in orgList" :key="org.id" :label="org.name" :value="org.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="描述内容" prop="content">
                    <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 2, maxRows: 6}" placeholder="请输入内容"></el-input>
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
            setting:{},
            orgList:[],
            query:{},
            gridList:[],
            dataId:undefined,
            ruleForm:{
                name:'',
                orgId:'',
                content:''
            },
            rules:{
                name: [
                    { required: true, message: '请输入部门名称', trigger: 'blur'},
                ]
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.ruleForm = {
                name:'',
                orgId:'',
                content:''
            }
        },
        handleUpdate(row){
            this.dataId = row.id;
            this.ruleForm = {
                name:row.name,
                orgId:row.orgId,
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
                    collectionName: 'pos',
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
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'pos',
                        data:this.ruleForm
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                    }
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
                        let orgName = _.find(this.orgList, {id:this.ruleForm.orgId}).name;
                        if(this.dataId){
                            let index = _.findIndex(this.gridList, {id:this.dataId});
                            this.$set(this.gridList, index, _.merge(this.ruleForm,{'orgName':orgName}));
                        }else{
                            result.orgName = orgName;
                            this.gridList.push(result);
                        }
                        this.dataId = undefined;
                        this.writeFile();
                    });
                    
                } 
            });
        },
        async writeFile(){
            let params = {
                type:'listData',
                collectionName: 'pos',
                data:{}
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            let condition = {
                type:'updateSetting',
                collectionName: 'pos',
                data:data.list
            }
            await this.$axios.$post('mock/db', {data:condition});
        },
        //orgList
        async getSetting() {
            let condition = {
                type: "getData",
                collectionName: "setting",
                data: {}
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            if (result) {
                this.setting = result.content;
                this.orgList = this.setting.org;
                this.getList();
            }
        },
        async getList(){
            this.listLoading = true;
            let condition = _.merge(this.query,{
                type:'aggregate',
                collectionName: 'pos',
                aggregate:[
                    {
                        $lookup:{
                            from: "orgs",
                            localField: "orgId",
                            foreignField: "id",
                            as: "org"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$org",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {
                        $addFields: {orgName:"$org.name"}
                    },
                    {$project:{"org":0}}
                ]
            });
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            console.log('getList',this.gridList);
        },
    },
    created(){
        this.getSetting();
    }
}
</script>



