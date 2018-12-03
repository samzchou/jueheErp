<template>
    <section class="order-main">
        <div class="page-title">
            <div>
                <span>
                    {{!isEdit?'采购订单列表':'采购订单编辑'}}
                </span>
            </div>
            <div>
                <el-button v-if="!isEdit" @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增采购订单</el-button>
                <el-button v-else @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
               </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="订单编号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="订单状态：" prop="flowStateId">
                        <el-select v-model="searchForm.flowStateId" placeholder="请选择" clearable>
                            <el-option v-for="(flow,idx) in flowList" :key="idx" :label="flow.name" :value="flow.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="供应商：" prop="crmId">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" clearable>
                            <el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="箱号：" prop="boxNo">
                        <el-input v-model="searchForm.boxNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="型号/梯号：" prop="modelNo">
                        <el-input v-model="searchForm.modelNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="物料号/版本号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="制单日期：" prop="orderDate">
                        <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels  style="width:250px"/>
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels  style="width:250px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading"
            :data="gridList"
            border fit highlight-current-row
            size="mini">
                <el-table-column label="No." width="70px" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="80px"/>
                <el-table-column prop="isPayed" label="付款状态" width="100">
                    <template slot-scope="scope">
                        <span>{{scope.row.isPayed?'已结算':'未结算'}}</span>
                    </template>
                </el-table-column>
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
                <el-table-column prop="materialNo" label="物料号/版本号" width="150px"></el-table-column>
                <el-table-column prop="crmName" label="客户名称" width="180px">
                    <template slot-scope="scope">
                        <el-button title="点击查看客户的订单汇总" type="text" @click="showDetail(scope.row)">{{scope.row.crmName}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="productName" label="订单产品名称" width="250px"></el-table-column>
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
                <el-table-column prop="caselNo" label="图号/版本号" width="150px"></el-table-column>
                <el-table-column prop="model" label="规格/梯型" width="100px"></el-table-column>
                <el-table-column prop="modelNo" label="型号/梯号" width="100px"></el-table-column>
                <el-table-column prop="boxNo" label="箱号" width="100px"></el-table-column>
                <el-table-column prop="projectName" label="项目名称" width="150px"></el-table-column>
                <el-table-column prop="projectNo" label="项目号" width="150px"></el-table-column>
                <el-table-column prop="content" label="备注说明" width="250px"></el-table-column>
                <el-table-column prop="createByUser" label="创建人"></el-table-column>
                <el-table-column prop="updateDate" label="最后更新" width="150px">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.updateDate, 'YYYY-MM-DD hh:mm:ss')}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <span  v-if="scope.row.flowStateId==1">
                            <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                            <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                        </span>
                        <span v-else style="color:#CCC">已采购入库</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <!--订单录入-->
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="产品分类" prop="ptypeId">
                    <el-select v-model="ruleForm.ptypeId" placeholder="请选择" filterable clearable  @change="setPtype">
                        <el-option v-for="ptype in ptypeList" :key="ptype.id" :label="ptype.name" :value="ptype.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="产品名称" prop="productId">
                    <el-select v-model="ruleForm.productId" placeholder="请选择" filterable @change="setProduct" style="width:300px">
                        <el-option v-for="product in proList" :key="product.id" :label="product.name+'('+product.materialNo+')'" :value="product.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户名称" prop="crmName">
                     <el-select v-model="ruleForm.crmId" placeholder="请选择" filterable @change="getCrmName" style="width:200px">
                        <el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户ID" prop="crmNo">
                    <el-input v-model="ruleForm.crmNo" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="订单编号" prop="serial">
                    <el-input v-model="ruleForm.serial" style="width:300px">
                        <template slot="append">
                            <el-button type="text" style="padding: 0 10px" @click="handleSerial">自动生成</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="制单日期" prop="orderDate">
                    <el-date-picker v-model="ruleForm.orderDate" value-format="timestamp" type="date" placeholder="选择日期"/>
                </el-form-item>
                <el-form-item label="交付日期" prop="deliveryDate">
                    <el-date-picker v-model="ruleForm.deliveryDate" value-format="timestamp" type="date" placeholder="选择日期"/>
                </el-form-item>
                <el-form-item label="规格/梯型" prop="model">
                    <el-input v-model="ruleForm.model" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="型号/梯号" prop="modelNo">
                    <el-input v-model="ruleForm.modelNo" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="箱号" prop="boxNo">
                    <el-input v-model="ruleForm.boxNo" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="ruleForm.projectName" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="项目号" prop="projectNo">
                    <el-input v-model="ruleForm.projectNo" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="物料号/版本号" prop="materialNo">
                    <el-input v-model="ruleForm.materialNo" placeholder="请输入" style="width:200px"/>
                </el-form-item>
                <el-form-item label="图号/版本号" prop="caselNo">
                    <el-input v-model="ruleForm.caselNo" placeholder="请输入" style="width:200px"/>
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
        <el-dialog title="供应商采购清单" :visible.sync="openDialogVisible" width="65%">
            <div class="form-dialog">
                <el-form :inline="true" :model="dialogForm" ref="dialogForm" size="mini">
                    <el-form-item label="供应商：" prop="crmId">
                        <el-select v-model="dialogForm.crmId" placeholder="请选择" style="width:300px">
                            <el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="订单状态：" prop="flowStateId">
                        <el-select v-model="dialogForm.flowStateId" placeholder="请选择">
                            <el-option v-for="(flow,idx) in flowList" :key="idx" :label="flow.name" :value="flow.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="dialogSearch">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="compare" id="printTable" ref="printTable" v-if="currItem">
                <div class="order-title">
                    <span>供应商：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
                </div>
                <div class="order-title" style="padding:10px 0">
                    <span style="font-weight:bold">订单总价：{{currItem.crmOrderMoney | currency}} 【*注：根据物料号，系统自动整合订单量】</span>
                    <el-button type="primary" size="mini" v-if="isMergeSerial" @click="splitCrmOrderList">拆分订单号</el-button>
                </div>
                <el-table
                :data="crmOrderList"
                border fit highlight-current-row
                size="mini" max-height="400">
                    <el-table-column prop="serial" label="订单号" width="120px"/>
                    <el-table-column prop="materialNo" label="型号/物料号" width="150px"/>
                    <el-table-column prop="productName" label="物料名称" width="250px"/>
                    <el-table-column prop="model" label="规格型号"/>
                    <el-table-column prop="util" label="单位"/>
                    <el-table-column prop="count" label="数量"/>
                    <el-table-column prop="price" label="单价"/>
                    <el-table-column prop="allPrice" label="合计"/>
                    <el-table-column prop="deliveryDate" label="交货日期">
                      <template slot-scope="scope">
                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                    </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="btns">
                <el-button type="success" @click="exportOrder">导出采购单</el-button>
                <el-button type="infor" size="medium" icon="el-icon-plus" v-print="'#printTable'">打印采购单</el-button>
            </div>
        </el-dialog>
    </section>
</template>
<script>
export default {
    name:'role',
    data(){
        return {
            openDialogVisible:false,
            dialogTitle:'订单明细查阅',
            currItem:null,
            crmOrderList:[],
            sourceCrmOrderList:[],
            isMergeSerial:false,
            dialogForm:{
                crmId:'',
                flowStateId:1,
            },
            setting:{},
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
                serial:'',
                productName:'',
                crmId:'',
                projectNo:'',
                boxNo:'',
                modelNo:'',
                materialNo:'',
                flowStateId:'',
                orderDate:'',
                deliveryDate:''
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
                boxNo:'',
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
            lastId:0,
            tableForm:{
				crmId:'',
				typeId:1
			},
			tableRules:{
				crmId:[{ required: true, message: '请选择客户', trigger: 'change'}]
			},
        }
    },
    methods:{
        exportOrder(){
            import ('@/components/Export2Excel').then(excel=>{
              const tHeader = ['订单号', '型号/物料号', '物料名称', '规格型号','数量', '单价', '合计','交货日期'];
              const filterVal = ['serial', 'materialNo', 'productName', 'model','count', 'price', 'allPrice','deliveryDate'];
              const data = this.formatJson(filterVal, this.crmOrderList);
              console.log('exportOrder', data);
              excel.export_json_to_excel({
                header: tHeader,
                data,
                filename: this.currItem.crmName + '-' + new Date().getTime(),
                autoWidth: true,
                bookType: 'xlsx'
              })
            })
        },
        formatJson(filterVal, jsonData) {
          return jsonData.map(v => filterVal.map(j => {
            if(j == 'deliveryDate'){
              v[j] = this.parseDate(v[j]);
            }
            return v[j];
          }))
        },
        // 查看供应商订单汇总
        showDetail(row){
          let crm = _.find(this.crmList, {'id':row.crmId});
          this.dialogForm.crmId = row.crmId;
          this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
          this.openDialogVisible = true;
          console.log('showDetail',row, crm);
          // group 供应商订单
          this.listOrderByCrm({crmId:row.crmId});
        },
        dialogSearch(){
          let crm = _.find(this.crmList, {'id':this.dialogForm.crmId});
          this.listOrderByCrm(this.dialogForm);
          this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
          this.listOrderByCrm(this.dialogForm);
        },
        async listOrderByCrm(match={}){
          let params = {
            type:'listData',
            collectionName: 'order',
            data:_.merge({flowStateId:1}, match)
          }
          let data = await this.$axios.$post('mock/db', {data:params});

          console.log('listOrderByCrm', data.list);
          this.sourceCrmOrderList = data.list;
          this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList), true);
        },
        splitCrmOrderList(){
          this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList), false);
        },
        filterCrmOrderList(arr,split){
            let list = [];
            this.isMergeSerial = false;
            arr.forEach(item=>{
                let index = _.findIndex(list, {'materialNo':item.materialNo});
                //debugger
                if(index>-1 && split){
                    this.isMergeSerial = true;
                    list[index]['count'] += item.count;
                    list[index]['serial'] += '；'+item.serial;
                    list[index]['allPrice'] = list[index]['count'] * list[index]['price'];
                }else{
                    item.allPrice = item.count * item.price;
                    list.push(item);
                }
            });
            console.log('list', list);
            this.currItem.crmOrderMoney = 0;
            list.forEach(item=>{
                this.currItem.crmOrderMoney += item.allPrice;
            });
            this.crmOrderList = list;
        },

        initProduct(){
            this.ptypeList = _.filter(this.setting.ptype,{typeId:1});
            this.crmList = _.filter(this.setting.crm,{typeId:1});
            this.productList = _.filter(this.setting.product, {typeId:1});
            this.proList = {...this.productList};
        },
        setPtype(ptypeId){
            this.ruleForm.productId = '';
            this.ruleForm.crmId = '';
            if(ptypeId == ''){
                this.proList = {...this.productList};
            }else{
                this.proList = _.filter(this.productList, {ptypeId:ptypeId, typeId:1});
            }
        },
        setProduct(id){
            let product = _.find(this.productList, {id:id});
            //debugger
            let obj = {
                productName:product.name,
                model:product.model,
                modelNo:product.modelNo,
                materialNo:product.materialNo,
                util:product.util,
                price:product.price
            }
            this.getCrmName(product.crmId);
            this.ruleForm = _.merge({}, this.ruleForm, obj);
            console.log('this.ruleForm', this.ruleForm);
        },
        getCrmName(id){
            let crm = _.find(this.crmList, {id:id});
            if(!crm) return;
            this.ruleForm.crmId = id;
            this.ruleForm.crmName = crm.name;
            this.ruleForm.crmNo = crm.crmNo;
        },
        handleSerial(flag){
			let serial = Math.random().toString(36).substr(2).toLocaleUpperCase();
            this.ruleForm.serial = serial;
        },
        handleAdd(){
            this._getLastId();
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
                boxNo:'',
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
            this.isEdit = true;
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                typeId:row.typeId,
                flowStateId:row.flowStateId,
                ptypeId:row.ptypeId||'',
                serial:row.serial,
                productId:row.productId||'',
                productName:row.productName,
                orderDate:row.orderDate,
                deliveryDate:row.deliveryDate,
                model:row.model,
                modelNo:row.modelNo,
                boxNo:row.boxNo,
                projectName:row.projectName,
                projectNo:row.projectNo,
                materialNo:row.materialNo,
                caselNo:row.caselNo,
                crmId:row.crmId||'',
                crmName:row.crmName,
                crmNo:row.crmNo||'',
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
                    collectionName: 'order',
                    data:{id:row.id}
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.gridList.splice(index, 1);
                    this.total -= 1;
                });
            }).catch();
        },
        parseFlow(id){
            if(!id) return '';
            let flow = _.find(this.flowList, {'id':id});
            return flow.name;
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
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
                        this._getLastId();
                    });
                }
            });
        },

        submitSearch(flag){
            let params = {};
            for(let k in this.searchForm){
                if(this.searchForm[k] != '' && this.searchForm[k]){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && ( k==='deliveryDate' ||  k==='orderDate')){
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
                type:'aggregate',
                collectionName: 'order',
                data:_.merge({typeId:1},match),
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
                    {$match:_.merge({typeId:1},match)},
                    {
                        $addFields: {flowStateName:"$flowState.name"}
                    },
                    {$sort:{_id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = _.orderBy(result.list,['crmId'], ['asc']);
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
                console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.flowList = _.filter(this.setting.flowState, item=>{
                    return item.id<4;
                });

                this.initProduct();
                this.getList({flowStateId:{'$lte':3}});//{flowStateId:1}
            }
        }
    },
    created(){
        this.getSetting();
    },
    mounted(){
        /* this.initProduct();
        this.getList();
        console.log('testFile', testFile) */
    }
}
</script>

<style lang="scss" scoped>
    .order-main{
        /deep/ .el-dialog{
            .el-dialog__body{
                padding:10px 20PX;

                .compare{
                    .order-title{
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-top: 1px solid #DDD;
                    }
                }
                .btns{
                    padding:10px 0;
                    text-align: right;
                }
            }
        }
    }

</style>




