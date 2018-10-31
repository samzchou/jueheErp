<template>
    <section>
        <div class="page-title">
            <div>
                <span>采购订单列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增采购订单':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" label-width="100px" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="产品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="箱号：" prop="boxNo">
                        <el-input v-model="searchForm.boxNo" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="型号/梯号：" prop="modelNo">
                        <el-input v-model="searchForm.modelNo" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="物料号/版本号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels/>
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
                <el-table-column prop="isuse" label="流程状态">
                    <template slot-scope="scope">
                        <span>{{parseFlow(scope.row.flowStateId)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="serial" label="订单编号" width="150px"></el-table-column>
                <el-table-column prop="orderDate" label="制单日期" width="100px">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.orderDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="model" label="规格/梯型" width="100px"></el-table-column>
                <el-table-column prop="modelNo" label="型号/梯号" width="100px"></el-table-column>
                <el-table-column prop="projectName" label="项目名称" width="150px"></el-table-column>
                <el-table-column prop="projectNo" label="项目号" width="150px"></el-table-column>
                <el-table-column prop="materialNo" label="物料号/版本号" width="150px"></el-table-column>
                <el-table-column prop="caselNo" label="图号/版本号" width="150px"></el-table-column>
                <el-table-column prop="crmName" label="客户名称" width="150px"></el-table-column>
                <el-table-column prop="productName" label="订单产品名称" width="150px"></el-table-column>
                <el-table-column prop="count" label="订单数量"></el-table-column>
                <el-table-column prop="util" label="单位"></el-table-column>
                <el-table-column prop="price" label="单价" width="100px">
                    <template slot-scope="scope">
                        {{scope.row.price | currency}}
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="总价" width="150px">
                    <template slot-scope="scope">
                        {{parseMoney(scope.row)}}
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="备注说明" width="250px"></el-table-column>
                <el-table-column prop="createByUser" label="创建人"></el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="sizes, prev, pager, next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div class="form-container" v-else>
            <div>
                <upload-excel-component @saveData="saveData" :on-success="handleSuccess" :before-upload="beforeUpload"/>
            </div>
            <div v-if="tableData.length">
                <el-table size="mini" :data="uploadList" border highlight-current-row style="width: 100%;margin-top:20px;" height="400">
                    <el-table-column label="No." width="100px" align="center" type="index"/>
                    <el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item" width="300"/>
                </el-table>
                <div class="page-container" style="padding: 10px 0;">
                    <el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange" :current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200]" :page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal">
                    </el-pagination>
                </div>
            </div>
            <el-form v-else :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="产品分类" prop="ptypeId">
                    <el-select v-model="ruleForm.ptypeId" placeholder="请选择" filterable clearable  @change="setPtype">
                        <el-option v-for="(ptype,idx) in ptypeList" :key="ptype.id" :label="ptype.name" :value="ptype.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="产品名称" prop="productId">
                    <el-select v-model="ruleForm.productId" placeholder="请选择" filterable @change="setProduct">
                        <el-option v-for="product in proList" :key="product.id" :label="product.name" :value="product.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="订单编号" prop="serial">
                    <el-input v-model="ruleForm.serial" style="width:300px">
                        <template slot="append">
                            <el-button type="text" style="padding: 0 10px" @click="handleSerial">自动生成</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="制单日期" prop="orderDate">
                    <el-date-picker v-model="ruleForm.orderDate" type="date" placeholder="选择日期"/>
                </el-form-item>
                <el-form-item label="交付日期" prop="deliveryDate">
                    <el-date-picker v-model="ruleForm.deliveryDate" type="date" placeholder="选择日期"/>
                </el-form-item>
                <el-form-item label="规格/梯型" prop="model">
                    <el-input v-model="ruleForm.model" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="型号/梯号" prop="modelNo">
                    <el-input v-model="ruleForm.modelNo" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="ruleForm.projectName" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="项目号" prop="projectNo">
                    <el-input v-model="ruleForm.projectNo" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="物料号/版本号" prop="materialNo">
                    <el-input v-model="ruleForm.materialNo" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="图号/版本号" prop="caselNo">
                    <el-input v-model="ruleForm.caselNo" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="客户名称" prop="crmName">
                     <el-select v-model="ruleForm.crmId" placeholder="请选择" filterable @change="getCrmName">
                        <el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户ID" prop="crmNo">
                    <el-input v-model="ruleForm.crmNo" placeholder="请输入"/>
                </el-form-item>
                <el-form-item label="订单数量" prop="count">
                    <el-input v-model="ruleForm.count" placeholder="请输入" style="width:100px"/>
                </el-form-item>
                <el-form-item label="单位" prop="util">
                    <el-input v-model="ruleForm.util" placeholder="请输入" style="width:100px"/>
                </el-form-item>
                <el-form-item label="单价" prop="price">
                    <el-input v-model="ruleForm.price" placeholder="请输入" style="width:100px"/>
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
import UploadExcelComponent from '@/components/UploadExcel'
export default {
    name:'role',
    components: { UploadExcelComponent },
    data(){
        return {
            isEdit:false,
            listLoading:false,
            typeList:[],
            ptypeList:[],
            flowList:[],
            crmList:[],
            productList:[],
            proList:[],
            query:{
                page:1,
                pagesize:20,
            },
            gridList:[],
            total:0,
            dataId:undefined,
            editRow:null,
            searchForm:{
                name:'',
                typeId:'',
                ptypeId:''
            },
            ruleForm:{
                typeId:1,
                flowStateId:1,
                ptypeId:'',
                serial:'',
                productId:'',
                productName:'',
                orderDate:'',
                deliveryDate:'',
                model:'',
                modelNo:'',
                projectName:'',
                projectNo:'',
                materialNo:'',
                caselNo:'',
                crmId:'',
                crmName:'',
                crmNo:'',
                count:'',
                util:'',
                price:'',
                content:''
            },
            rules:{
                serial: [
                    { required: true, message: '请输入订单编号', trigger: 'change'},
                ],
                productName: [
                    { required: true, message: '请选择产品', trigger: 'change'},
                ],
                orderDate: [
                    { required: true, message: '请输入制单日期', trigger: 'change'},
                ],
                deliveryDate: [
                    { required: true, message: '请输入交付日期', trigger: 'change'},
                ],
                count: [
                    { required: true, message: '请输入订单数量', trigger: 'blur'},
                ],
                price: [
                    { required: true, message: '请输入单价', trigger: 'blur'},
                ]
            },
            uploadTotal:0,
            queryUpload:{
                page:1,
                pagesize:20
            },
            lastId:0,
            uploadList:[],
            tableData: [],
            tableHeader: []
        }
    },
    methods:{
        beforeUpload(file) {
            const isLt1M = file.size / 1024 / 1024 < 1
            if (isLt1M) {
                return true;
            }
            this.$message({
                message: '文件大小不能超过1M',
                type: 'warning'
            })
            return false;
        },
        handleSuccess({results, header}) {
            this.tableData = results;
            this.tableHeader = header;
            this.uploadTotal = results.length;
            this.setUploadData();
        },
        setUploadData(){
            this.uploadList = [];
            let s = (this.queryUpload.page - 1) * this.queryUpload.pagesize;
            let e = this.queryUpload.page * this.queryUpload.pagesize;
            for(let i=s; i<e; i++){
                this.uploadList.push(this.tableData[i])
            }
        },
        uploadSizeChange(val){
            this.queryUpload.pagesize = val;
            this.setUploadData();
        },
        uploadCurrentChange(val){
            this.queryUpload.page = val;
            this.setUploadData();
        },
        setPtype(ptypeId){
            this.ruleForm.productId = '';
            if(ptypeId == ''){
                this.proList = {...this.productList};
            }else{
                this.proList = _.filter(this.productList, {ptypeId:ptypeId});
            }
        },
        setProduct(id){
            let product = _.find(this.productList, {id:id});
            let obj = {
                productName:product.name,
                model:product.model,
                modelNo:product.modelNo,
                materialNo:product.materialNo,
                util:product.util,
                price:product.price,
                crmId:product.crmId
            }
            this.getCrmName(product.crmId);
            this.ruleForm = _.merge({}, this.ruleForm, obj);
            console.log('this.ruleForm', this.ruleForm);
        },
        getCrmName(id){
            let crm = _.find(this.crmList, {id:id});
            this.ruleForm.crmName = crm.name;
            this.ruleForm.crmNo = crm.crmNo;
        },
        handleSerial(){
            this.ruleForm.serial = Math.random().toString(36).substr(2).toLocaleUpperCase();
        },
        handleAdd(){
            this.tableData = [];
            this.tableHeader = [];
            this.isEdit = !this.isEdit;
            this.editRow = null;
            this.ruleForm = {
                typeId:1,
                flowStateId:1,
                ptypeId:'',
                serial:'',
                productId:'',
                productName:'',
                orderDate:'',
                deliveryDate:'',
                model:'',
                modelNo:'',
                projectName:'',
                projectNo:'',
                materialNo:'',
                caselNo:'',
                crmId:'',
                crmName:'',
                crmNo:'',
                count:'',
                util:'',
                price:'',
                content:''
            }
        },
        handleUpdate(row){
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                typeId:1,
                flowStateId:1,
                ptypeId:row.ptypeId,
                serial:row.serial,
                productId:row.productId,
                productName:row.productName,
                orderDate:row.orderDate,
                deliveryDate:row.deliveryDate,
                model:row.model,
                modelNo:row.modelNo,
                projectName:row.projectName,
                projectNo:row.projectNo,
                materialNo:row.materialNo,
                caselNo:row.caselNo,
                crmId:row.crmId,
                crmName:row.crmName,
                crmNo:row.crmNo,
                count:row.count,
                util:row.util,
                price:row.price,
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
                });
            }).catch();
        },
        parseFlow(id){
            if(!id) return '';
            let flow = _.find(this.flowList, {'id':id});
            return flow.name;
        },
        parseDate(date){
            return moment(date).format('YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parsePtype(id){
            if(!id) return '';
            let type = _.find(this.ptypeList, {'id':id});
            return type.name;
        },
        parseCrm(id){
            if(!id) return '';
            let crm = _.find(this.crmList, {'id':id});
            return crm.name;
        },
        async saveData(){
            let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
            const keys = [
                {label:'订单编号',value:'serial'},
                {label:'梯型',value:'model'},
                {label:'项目号',value:'projectNo'},
                {label:'梯号',value:'modelNo'},
                {label:'箱号',value:'boxNo'},
                {label:'制单日期',value:'orderDate'},
                {label:'交货日期',value:'deliveryDate'},
                {label:'供应商名称',value:'crmName'},
                {label:'物料号/版本号',value:'materialNo'},
                {label:'图号/版本号',value:'caselNo'},
                {label:'产品名称',value:'productName'},
                {label:'数量',value:'count'},
                {label:'单位',value:'util'},
                {label:'单价',value:'price'},
                {label:'供应商ID',value:'crmNo'},
                {label:'项目名称',value:'projectName'},
                {label:'备注',value:'content'}
            ]
            console.log(this.tableData,this.tableHeader);
            let dataList = this.tableData.map((item, index)=>{
                let id = this.lastId + index + 1;
                let obj = {id:id,typeId:1,flowStateId:1,createByUser:this.$store.state.user.name};
                for(let key in item){
                    let o = _.find(keys, {label:key});
                    if(o){
                        let k = o.value;
                        let val = this._setValue(k, item[key]);
                        obj[k] = val;
                    }
                };
                return obj;
            });
            console.log('dataList', dataList);
            let condition = {
                type:'addPatch',
                collectionName: 'order',
                data:dataList
            }
            this.$axios.$post('mock/db', {data:condition}).then(result=>{
                loadingMask.close();
                //this.gridList.concat(dataList);
                this.isEdit = false;
                this.query.page = 1;
                this.getList();
            });
        },
        _setValue(key, value){
            switch(key){
                case 'orderDate':
                    return new Date(value);
                case 'deliveryDate':
                    return new Date(value);
                case 'count':
                    return Number(value);
                case 'price':
                    return Number(value);
                default:
                    return  String(value);
            }
        },
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'order',
                        data:{...this.ruleForm}
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                        condition.updateDate = true;
                    }
                    condition.data.createByUser = this.$store.state.user.name;
                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
                        if(this.dataId){
                            let index = _.findIndex(this.gridList, {id:this.dataId});
                            this.$set(this.gridList, index, _.merge(this.editRow, this.ruleForm));
                        }else{
                            this.gridList.push(_.merge(result));
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
                collectionName: 'product',
                updateDate:true,
                data:{
                    id:row.id,
                    isuse:row.isuse
                }
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
        },
        async getPtypeList(){
            let condition = {
                type:'listData',
                collectionName: 'ptype',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.ptypeList = result.list;
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
        async getFlowList(){
            let condition = {
                type:'listData',
                collectionName: 'flowState',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.flowList = result.list;
        },
        async getProductList(){
            let condition = {
                type:'listData',
                collectionName: 'product',
                data:{typeId:1}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.productList = result.list;
            this.proList = {...this.productList};
        },
        async getCrmList(){
            let condition = {
                type:'listData',
                collectionName: 'crm',
                data:{}
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.crmList = result.list;
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
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch();
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch();
        },
        async getList(match = {}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',
                collectionName: 'order',
                aggregate:[
                    {
                        $lookup:{
                            from: "flowStates",
                            localField: "flowStateId",
                            foreignField: "id",
                            as: "flowState"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$flowState",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {
                        $addFields: {flowStateName:"$flowState.name"}
                    },
                    {$sort:{id:1}}
                ]
            };
            if(!_.isEmpty(match)){
                condition.aggregate.push({
                    $match:match
                })
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            //console.log('getList',result)
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
        },
        async _getLastId(){
            let condition = {
                type:"getId",
                data:{
                    model:'order'
                }
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            console.log('_getLastId',result);
            if(result){
                this.lastId = result;
            }
        }
    },
    created(){
        this.getCrmList();
        this.getPtypeList();
        this.getProductList();
        this.getTypeList();
        this.getFlowList();

        this._getLastId()
    },
    mounted(){
        this.getList();
    }
}
</script>



