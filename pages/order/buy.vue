<template>
	<section class="order-main">
		<div class="head-title">
			<div>
				<div v-if="!isEdit">
					<span :class="{'inactive':needSource}" @click="setOrderParams(true)">蒂森采购订单</span>
					<span :class="{'inactive':!needSource}" @click="setOrderParams(false)">珏合采购订单</span>
				</div>
				<div v-else>
					<span>订单编辑</span>
				</div>
			</div>
			<div>
				<span v-if="!isEdit">
					<el-button @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增珏合采购订单</el-button>
					<el-button v-if="gridList.length" @click="showDetail(null)" type="text" size="medium" icon="el-icon-document">导出采购订单</el-button>
				</span>
				<span v-else >
					<el-button @click="isEdit=false" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
				</span>
			</div>
		</div>
		<div class="grid-container" v-if="!isEdit">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="蒂森订单号：" v-if="needSource" prop="sourceserial">
						<el-input v-model="searchForm.sourceserial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="珏合订单号：" v-else prop="serial">
						<el-input v-model="searchForm.serial" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="订单状态：" prop="flowStateId">
						<el-select v-model="searchForm.flowStateId" placeholder="请选择">
							<el-option v-for="flow in flowList.filter(o=>o.typeId==1 && o.id<3)" :key="flow.id" :label="flow.name" :value="flow.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="供应商：" prop="crmId">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable>
						<el-option v-for="crm in crmList.filter(o=>o.typeId==1)" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="产品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="项目号：" prop="projectNo" v-if="needSource">
						<el-input v-model="searchForm.projectNo" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="箱号：" prop="boxNo" v-if="needSource">
						<el-input v-model="searchForm.boxNo" clearable  style="width:150px"/>
					</el-form-item>
					<el-form-item label="型号/梯号：" prop="modelNo" v-if="needSource">
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
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList"
			border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column prop="isuse" label="订单状态" width="90">
					<template slot-scope="scope">
						<div v-if="needSource">
							<span>已出单:{{scope.row.flowState-scope.row.total}} 件</span>
						</div>
						<div v-else>{{parseFlow(scope.row.flowStateId)}}</div>
					</template>
				</el-table-column>
				<el-table-column :label="needSource?'蒂森订单号':'珏合订单号'" width="150">
					<template slot-scope="scope">
						<a v-if="needSource" href="javascript:void(0)" @click="showSourceOrder(scope.row)">{{scope.row.sourceserial}}</a>
						<span v-else>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="projectName" label="项目名称"/>
				<el-table-column prop="materialNo" label="物料号/版本号">
					<template slot-scope="scope">
						<span>{{scope.row.materialNo}}</span><span v-if="needSource" style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="crmName" label="供应商" width="250px">
					<template slot-scope="scope">
						<el-button title="导出客户的订单汇总" v-if="scope.row.flowStateId<=2" type="text" @click.stop="showDetail(scope.row)">{{scope.row.crmName}}</el-button>
						<span v-else>{{scope.row.crmName}}</span>
						<span v-if="needSource" style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="productName" label="订单产品名称">
					<template slot-scope="scope">
						<span>{{scope.row.productName}}</span><span v-if="needSource" style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="count" :label="needSource?'订单总量':'订单数量'" width="80px">
					<template slot-scope="scope">
						<span v-if="needSource">{{scope.row.total}} 件</span>
						<span v-else>{{scope.row.count}} {{scope.row.util}}</span>
					</template>
				</el-table-column>
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
				<el-table-column label="操作" fixed="right" align="center" width="80">
					<template slot-scope="scope">
						<div v-if="scope.row.flowStateId == 1">
							<span v-if="needSource">
								<el-button size="mini" type="text" @click="handleDeleteBySerial(scope.row)" icon="el-icon-delete">删除</el-button>
							</span>
							<span v-else>
								<el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
								<el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
							</span>
						</div>
						<span v-else style="color:#CCC">{{parseFlow(scope.row.flowStateId)}}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container">
				<div>共有{{total}}个采购订单，请点击供应商名称或导出采购订单操作流程</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"/>
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
					<span v-if="editRow && editRow.deliveryDate!==ruleForm.deliveryDate"> * 将同步更新生产订单的交付日期</span>
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
		<el-dialog :title="'供应商采购清单--'+(needSource?'蒂森采购清单':'珏合采购清单')" append-to-body :visible.sync="openDialogVisible" width="80%">
			<div class="form-dialog">
				<el-form :inline="true" :model="dialogForm" ref="dialogForm" size="mini">
					<el-form-item label="订单状态：" prop="flowStateId">
						<el-select v-model="dialogForm.flowStateId" placeholder="请选择" style="width:100px" @change="dialogSearch">
							<el-option v-for="flow in flowList.filter(o=>{return [1,2].includes(o.id)})" :key="flow.id" :label="flow.name" :value="flow.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="供应商：" prop="crmId">
						<el-select v-model="dialogForm.crmId" placeholder="请选择" filterable style="width:200px" @change="dialogSearch">
							<el-option v-for="(crm,idx) in orderCrmList" :key="idx" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="交货日期" prop="deliveryDate">
						<el-date-picker v-model="dialogForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels  style="width:250px"/>
					</el-form-item >
					<el-form-item>
						<el-button type="primary" @click="dialogSearch" icon="el-icon-search" :loading="searchLoading" :disabled="!dialogForm.crmId">查询</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div class="compare" id="printTable" ref="printTable">
				<div class="order-title">
					<span v-if="currItem">供应商：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
					<span v-else>请选择供应商，查询所分发的采购订单</span>
				</div>
				<div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
					<span style="font-weight:bold">订单总价：{{crmOrderList[crmOrderList.length-1]['allPrice'] | currency}}</span>
				</div>
				<el-table ref="exportTable" :data="crmOrderList" border fit highlight-current-row stripe size="mini" max-height="350" v-loading="searchLoading" style="width:100%">
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-row :gutter="20" v-for="(item,idx) in props.row.children" :key="item.id">
								<el-col :span="5" :title="item.sourceserial">
									<span style="width:30px">{{idx+1}}、</span>
									<span>原始订单号：{{item.sourceserial}}</span>
								</el-col>
								<el-col :span="5" :title="item.projectNo">项目号：{{item.projectNo}}</el-col>
								<el-col :span="3">订单量：{{item.count}} {{item.util}}</el-col>
								<el-col :span="3">订单单价：{{item.price}}</el-col>
								<el-col :span="4">制单日期：{{parseDate(item.orderDate)}}</el-col>
								<el-col :span="4">交货日期：{{parseDate(item.deliveryDate)}}</el-col>
							</el-row>
						</template>
					</el-table-column>
					<el-table-column prop="flowStateId" label="订单状态" width="70px">
						<template slot-scope="scope">
							<span>{{parseFlow(scope.row.flowStateId)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="serial" label="订单编号" width="120px"/>
					<el-table-column prop="materialNo" label="物料号" width="120px"/>
					<el-table-column prop="productName" label="物料名称"/>
					<el-table-column prop="model" label="规格型号" width="100px"/>
					<el-table-column prop="count" label="采购数量" width="80px"/>
					<el-table-column prop="storeInCount" label="当前库存" width="70px">
						<template slot-scope="scope">
							<span>{{scope.row.storeInCount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="releaseCount" label="实际采购量" width="100px">
						<template slot-scope="scope">
							<div v-if="scope.row.flowStateId==1">
								<div v-if="scope.$index<crmOrderList.length-1">
									<el-input-number size="mini" controls-position="right" :min="0" v-model="scope.row.releaseCount" @change="checkReleaseCount(scope.row,crmOrderList)" style="width:80px"/>
								</div>
								<div v-else>{{parseAllOrderCount()}}</div>
							</div>
							<div v-else>
								<div v-if="scope.$index<crmOrderList.length-1">
									<span>{{scope.row.store && scope.row.store.incount}}</span>
								</div>
								<div v-else>{{parseAllOrderCount()}}</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="采购单价" width="100px">
						<template slot-scope="scope">
							<div v-if="scope.row.flowStateId==1">
								<div v-if="scope.$index<crmOrderList.length-1">
									<el-input-number size="mini" controls-position="right" :min="0" :step="0.1" v-model="scope.row.price" style="width:80px"/>
								</div>
							</div>
							<div v-else>{{scope.row.store && scope.row.store.price}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="allPrice" label="采购金额" width="100px">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
							<span v-else>{{parseAllOrderMoney()}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="deliveryDate" label="交货日期" width="160px">
						<template slot-scope="scope">
							<div v-if="scope.row.flowStateId==1">
								<div v-if="scope.$index<crmOrderList.length-1">
									<el-date-picker size="mini" v-if="dialogForm.flowStateId==1" v-model="scope.row.deliveryDate"  type="date" value-format="timestamp" placeholder="选择日期" 
									:clearable="false" style="width:125px"/>
								</div>
							</div>
							<div v-else>{{scope.row.store && parseDate(scope.row.store.deliveryDate)}}</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="70" v-if="dialogForm.flowStateId==1">
						<template slot-scope="scope">
							<el-button v-if="scope.$index<crmOrderList.length-1" size="mini" type="text" @click="removeCrmOrder(scope.row)" icon="el-icon-delete">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="btns" v-if="crmOrderList.length">
				<div>
					<span>合计：共{{crmOrderList.length-1}}个采购订单；</span>
					<span v-if="dialogForm.flowStateId==2">已出单，如需再次制单，请至采购订单管理中操作</span>
				</div>
				<div>
					<el-button type="success" @click="exportOrder" icon="el-icon-document" :disabled="dialogForm.flowStateId==2">制单采购</el-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog :title="'蒂森订单：'+sourceserial" append-to-body :visible.sync="openSourceVisible" width="80%">
			<div class="detail-container">
				<el-row :gutter="20" v-if="detailItem">
					<el-col :span="12">
						<div><span class="tl">项目号：</span>{{detailItem.projectNo}}</div>
					</el-col>
					<el-col :span="12">
						<div><span class="tl">项目名称：</span>{{detailItem.projectName}}</div>
					</el-col>
					<el-col :span="12">
						<div><span class="tl">制单日期：</span>{{parseDate(detailItem.orderDate)}}</div>
					</el-col>
					<el-col :span="12">
						<div><span class="tl">交货日期：</span>{{parseDate(detailItem.deliveryDate)}}</div>
					</el-col>
					<el-col :span="24">
						<div><span class="tl">备注：</span>{{detailItem.content}}</div>
					</el-col>
				</el-row>
			</div>
			<el-table size="mini" class="detail-table" ref="detailTable" border :data="sourceData" highlight-current-row fit stripe max-height="350">
				<el-table-column type="index" width="50"/>
				<el-table-column label="状态" width="70">
					<template slot-scope="scope">
						<span>{{parseFlow(scope.row.flowStateId)}}</span>
					</template>
				</el-table-column>
				<el-table-column label="项目号" prop="projectNo" width="120"/>
				<el-table-column label="物料号" prop="materialNo" width="120"/>
				<el-table-column label="产品名称" prop="productName"/>
				<el-table-column label="图号/版本号" prop="caselNo"/>
				<el-table-column label="梯型" prop="model" width="100"/>
				<el-table-column label="梯号" prop="modelNo" width="80"/>
				<el-table-column label="供应商" prop="crmName">
					<template slot-scope="scope">
						<el-button type="text" @click="showDetail(scope.row)">{{scope.row.crmName}}</el-button>
					</template>
				</el-table-column>
				<el-table-column label="数量" prop="count" width="80">
					<template slot-scope="scope">
						<span>{{scope.row.count}} {{scope.row.util}}</span>
					</template>
				</el-table-column>
				<el-table-column label="单价" prop="price" width="80"/>
				<el-table-column label="合计" width="100">
					<template slot-scope="scope">
						<span>{{parseMoney(scope.row)}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <span v-if="scope.row.flowStateId<7">
                            <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                            <el-button size="mini" type="text" @click="handleDelete(scope.row, sourceData)">删除</el-button>
                        </span>
                    </template>
                </el-table-column>
			</el-table>
			<div class="update-form">
				<div><el-button type="danger" size="mini" @click="handleDeleteBySerial(detailItem)">删除蒂森订单({{sourceserial}})</el-button></div>
				<div>
					<el-form size="mini" :inline="true" :model="updateForm" :rules="updateRules">
						<el-form-item label="修改交付日期：" prop="deliveryDate">
							<el-date-picker v-model="updateForm.deliveryDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:130px"/>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="updateDeliveryDate">修改订单</el-button>
							<el-button @click="openSourceVisible=false">取消关闭</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</el-dialog>
	</section>
</template>
<script>
import orderRow from './order-row';
export default {
	name:'role',
	components:{orderRow},
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
				deliveryDate:''
			},
			setting:{},
			isEdit:false,
			listLoading:false,
			typeList:[],
			ptypeList:[],
			flowList:[],
			crmList:[],
			orderCrmList:[],
			productList:[],
			proList:[],
			query:{
				page:1,
				pagesize:100,
			},
			gridList:[],
			total:0,
			dataId:undefined,
			editRow:null,
			searchForm:{
				serial:'',
				sourceserial:'',
				productName:'',
				crmId:'',
				projectNo:'',
				boxNo:'',
				modelNo:'',
				materialNo:'',
				flowStateId:1,
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
				materialNo:[
					{ required: true, message: '请输入物料号或版本号', trigger: 'blur'},
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
			updateForm:{
				deliveryDate:'',
			},
			updateRules:{
				deliveryDate:[{ required: true, message: '请选择日期', trigger: 'change'}]
			},
			openSourceVisible:false,
			detailItem:null,
			sourceserial:'',
			sourceData:[],
			crmOrderIds:[],
			crmSerials:[],
			searchLoading:false,
			needSource:true,
			storeLastId:0,
		}
	},
	methods:{
		removeCrmOrder(row){
			this.$confirm('仅删除该采购订单，是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let index = _.findIndex(this.crmOrderList, {id:row.id});
				this.crmOrderList.splice(index, 1);
				//debugger
				if(this.crmOrderList.length == 1){
					this.crmOrderList = [];
				}else{
					this.checkReleaseCount(null, this.crmOrderList);
				}
			}).catch(() => {});
		},
		parseReleaseMoney(row){
			if(row.flowStateId == 1){
				row.allPrice = parseInt(row.releaseCount)*row.price;
			}else{
				row.allPrice = parseInt(row.store.incount)*row.store.price;
			}
			return this.$options.filters['currency'](row.allPrice);
		},
		parseAllOrderCount(){
			let count = 0;
			this.crmOrderList.forEach((item,index)=>{
				if(index < this.crmOrderList.length-1){
					if(item.flowStateId == 1){
						count += parseInt(item.releaseCount);
					}else{
						count += item.store.incount;
					}
				}
			});
			return count;
			//this.crmOrderList[this.crmOrderList.length-1]['allPrice'] = money;
		},
		parseAllOrderMoney(){
			let money = 0;
			this.crmOrderList.forEach((item,index)=>{
				if(index < this.crmOrderList.length-1){
					if(item.flowStateId == 1){
						money += parseInt(item.releaseCount)*item.price;
					}else{
						money += item.store.incount*item.store.price;
					}
				}
			});
			this.crmOrderList[this.crmOrderList.length-1]['allPrice'] = money;
			return this.$options.filters['currency'](money);
		},
		totalReleaseCount(){
			let count = 0;
			this.crmOrderList.forEach((item,index)=>{
				if(index < this.crmOrderList.length-1){
					count += parseInt(item.releaseCount);
				}
			})
			return count;
		},
		checkReleaseCount(row, dataList){
			if(row){
				row.releaseCount = !row.releaseCount?0:row.releaseCount;
			}
			let count = 0, releaseCount= 0, money = 0;
			dataList.forEach((item,index)=>{
				if(index < dataList.length-1){
					money += parseInt(item.releaseCount)*item.price;
					releaseCount += parseInt(item.releaseCount);
					count += parseInt(item.count);
				}
			});
			dataList[dataList.length-1]['allPrice'] = money;
			dataList[dataList.length-1]['count'] = count;
			dataList[dataList.length-1]['releaseCount'] = releaseCount;
        },
		async getDetailOrder(row){
			let condition = {
				type:"listData",
				collectionName:'orderUpload',
				data:{
					crmId:row.crmId,
					materialNo:row.materialNo,
					orderDate:row.orderDate
				}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			return result.list;
		},

		listRowClick(row){
			row.extend = !row.extend?true:false;
			this.$refs['listTable'].toggleRowExpansion(row, row.extend);
		},
		detailRowClick(row){
			row.extend = !row.extend?true:false;
			this.$refs['detailTable'].toggleRowExpansion(row, row.extend);
		},
		// 显示原始订单列表
		showSourceOrder(row){
			this.detailItem = row;
			this.sourceData = [];
			this.sourceserial = row.sourceserial;
			let condition = {
				type:"listData",
				collectionName:"order",
				data:{'sourceserial':this.sourceserial,'typeId':1,'flowStateId':this.searchForm.flowStateId}
			}
			this.$axios.$post('mock/db', {data:condition}).then(result=>{
				this.sourceData = result.list;
			});
			this.updateForm.deliveryDate = row.deliveryDate;
			this.openSourceVisible = true;
		},
		exportOrder(){
			import ('@/components/Export2Excel').then(excel=>{
				const tHeader = ['订单编号','物料号','物料名称','规格型号','数量','单价','金额','交货日期'];
				const filterVal = ['serial','materialNo','productName','model','releaseCount','price','allPrice','deliveryDate'];
				const data = this.formatJson(filterVal, _.cloneDeep(this.crmOrderList));
				const now =  moment(new Date()).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: this.currItem.crmName + '-' + now
				});
				this.updateOrderByCrm(this.crmOrderList);
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
		// 更新客户订单状态（已发单）
		updateOrderByCrm(arr){
			let cn = {
				type:'updatePatch',
				collectionName: 'order',
				notNotice:true,
				param:{'crmId':this.dialogForm.crmId,'id':{$in:this.crmOrderIds}},
				set:{$set:{'flowStateId':2}}
			}
			let storeData = [];
			arr.map(item=>{
				if(item.id){
					this.storeLastId++;
					storeData.push({
						'id':this.storeLastId,
						'typeId':item.typeId,
						'orderId':item.id,
						'orderIds':this.getChildrenByid(item.children),
						'serial':item.serial,
						'sourceserial':item.sourceserial,
						'crmId':item.crmId,
						'crmName':item.crmName,
						'productName':item.productName,
						'materialNo':item.materialNo,
						'price':item.price,
						'util':item.util,
						'count':item.count,
						'incount':item.releaseCount,
						'deliveryDate':item.deliveryDate,
						'createByUser':this.$store.state.user.name
					});
				}
			});
			console.log('storeData', storeData);
			this.$axios.$post('mock/db', {data:cn}).then(result=>{
				// 注意此处需保存数据到仓库中				
				let condition = {
					type:'addPatch',
					collectionName: 'store',
					data:storeData
				};
				//debugger
				// 订单保存
				this.$axios.$post('mock/db', {data:condition}).then(result=>{
					this.crmOrderIds = [];
					this.crmOrderList = [];
					this.getList({flowStateId:{$in:[1]}});
				});
			});
		},
		getChildrenByid(arr){
			let ids = [];
			if(arr && arr.length){
				arr.forEach(item=>{
					ids.push(item.id);
				});
			}
			return ids;
		},
		// 查看供应商订单汇总
		showDetail(row){
			if(row){
				let crm = _.find(this.setting.crm, {'id':row.crmId});
				this.dialogForm.crmId = row.crmId;
				this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
				this.listOrderByCrm({crmId:row.crmId});
			}
			this.dialogForm.flowStateId = 1;
			this.openSourceVisible = false;
			this.openDialogVisible = true;
		},
		dialogSearch(){
			if(!this.dialogForm.crmId) return;
			let crm = _.find(this.setting.crm, {'id':this.dialogForm.crmId});
			this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
			let params = {};
			for(let k in this.dialogForm){
				if(this.dialogForm[k] != '' && this.dialogForm[k]){
					if(_.isNumber(this.dialogForm[k])){
						params[k] = Number(this.dialogForm[k]);
					}else if(_.isArray(this.dialogForm[k]) && k==='deliveryDate'){
						params[k] = {
						$gte:this.dialogForm[k][0],
						$lte:this.dialogForm[k][1]
						}
					}else if(_.isArray(this.dialogForm[k])){
						params[k] = {$in:this.dialogForm[k]}
					}else{
						params[k] = {$regex:this.dialogForm[k]};
					}
				}
			};
			this.listOrderByCrm(params);
		},
		// 加载客户的采购订单
		async listOrderByCrm(match={}){
			this.searchLoading = true;
			this.crmOrderList = [];
			let bySerial = {'sourceserial':{$ne:''}};
			if(!this.needSource){
                bySerial = {'sourceserial':''};
            } 
			match = _.merge(match, bySerial);
			let params = {
				type:'aggregate',
				collectionName: 'order',
				data:_.merge({flowStateId:{'$in':[1]}}, match),
				aggregate:[
					{
						$lookup:{
							from: "store",
							localField: "id", //materialNo
							foreignField: "orderId", //materialNo
							as: "store"
						}
					},
					{
						$unwind: { // 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{$match:_.merge({flowStateId:{'$in':[1]}}, match)},
					/* {
						$addFields: {storeInCount:"$store.incount"}
					}, */
					{$sort:{deliveryDate:1}}
				]
			}
			let data = await this.$axios.$post('mock/db', {data:params});
			//debugger
			this.sourceCrmOrderList = this.mergeOrder(data.list);
			if(this.sourceCrmOrderList.length){
				this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList));
			}
			this.searchLoading = false;
		},
		// 合并订单数量,根据类型，产品名称，物料号，价格
		mergeOrder(lists){
			let listData = [];
			this.crmOrderIds = [];
			this.crmSerials = [];
			lists.forEach(item=>{
				this.crmOrderIds.push(item.id);
				if(!this.crmSerials.includes(item.sourceserial)){
					this.crmSerials.push(item.sourceserial);
				}
				item.children = [];
				item.storeInCount = 0;
				if(item.store){
					if(item.store.storeTypeId){
						item.storeInCount = item.store.incount;
					}
				}
				let dataIndex = _.findIndex(listData,{'productName':item.productName,'materialNo':item.materialNo,'price':item.price});
				if(dataIndex>-1){
					listData[dataIndex]['children'].push(item);
					listData[dataIndex]['sourceserial'] += ','+item.sourceserial;
					listData[dataIndex]['projectNo'] += ','+item.projectNo;
					listData[dataIndex]['count'] += item.count;
					if(item.flowStateId == 1){
						let releaseCount = listData[dataIndex]['count'] - item.storeInCount;
						listData[dataIndex]['releaseCount'] = releaseCount<0?0:releaseCount;
					}
				}else{
					item.children.push(_.cloneDeep(item));
					item.serial = item.serial.includes('-')?item.serial.split('-')[1]:item.serial;
					let releaseCount = item.count - item.storeInCount;
					item.releaseCount = releaseCount<0?0:releaseCount;
					if(item.flowStateId !== this.dialogForm.flowStateId){
						this.dialogForm.flowStateId = item.flowStateId;
					}
					listData.push(item);
				}
			});
			return listData;
		},
		filterCrmOrderList(arr){
			let list = [], allcount = 0;
			arr.forEach(item=>{
				item.allPrice = item.count * item.price;
				allcount += item.count;
				list.push(item);
			});
			this.currItem.crmOrderMoney = 0;
			list.forEach(item=>{
				this.currItem.crmOrderMoney += item.allPrice;
			});
			list.push({
				serial:'合计',
				count:allcount,
				releaseCount:allcount,
				allPrice:this.currItem.crmOrderMoney
			})
			console.log('this.crmOrderList',list);
			//debugger
			this.crmOrderList = list;
		},
		initProduct(){
			this.ptypeList = _.filter(this.setting.ptype,{typeId:1});
			//this.crmList = _.filter(this.setting.crm,{typeId:1});
			this.productList = _.filter(this.setting.product, {typeId:1});
			this.proList = {...this.productList};
			
			// 获取订单客户（未下单）
			let condition = {
				type:'distinctData',
				collectionName: 'order',
				distinct:'crmId',
				data:{flowStateId:{'$in':[1,2]},typeId:1}
			};
			this.$axios.$post('mock/db', {data:condition}).then(result=>{
				result.forEach(id=>{
					let crm = _.find(this.setting.crm,{'id':id});
					if(crm){
						this.orderCrmList.push(crm);
					}
				});
			});
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
			let crm = _.find(this.setting.crm, {id:id});
			if(!crm) return;
			this.ruleForm.crmId = id;
			this.ruleForm.crmName = crm.name;
			this.ruleForm.crmNo = crm.crmNo;
		},
		handleSerial(){
			let now =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
			now = now.split(' ');
			let dd = now[0].split('-');
			let tt = now[1].split(':');
			let serial = 'JH' + dd[0] +''+ dd[1] +''+ dd[2]+''+tt[0]+''+tt[1]+''+tt[2];
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
			this.openSourceVisible = false;
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
		// 修改蒂森订单的交货日期
		updateDeliveryDate(){
			this.$confirm('此操作将修改订单号为:'+this.detailItem.sourceserial+'所有数据的交货日期(包括生产订单), 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let condition = {
					type:'updateData',
					collectionName: 'order',
					multi:true,
					updateDate:true,
					condition:{sourceserial:this.detailItem.sourceserial},
					data:{deliveryDate:this.updateForm.deliveryDate}
				};
				this.$axios.$post('mock/db', {data:condition}).then(result=>{
					this.gridList.forEach(item=>{
						if(item.sourceserial == this.detailItem.sourceserial){
							item.deliveryDate = this.updateForm.deliveryDate;
						}
					})
					this.openSourceVisible = false;
					this.detailItem = null;
				});
			}).catch();
		},
		// 删除蒂森订单
		handleDeleteBySerial(item){
			this.$confirm('此操作将删除订单号为:'+item.sourceserial+'所有数据(包括生产订单), 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let condition = {
					type:'removeData',
					collectionName: 'order',
					data:{sourceserial:item.sourceserial}
				};
				this.$axios.$post('mock/db', {data:condition}).then(result=>{
					this.$message({
						type: 'success',
						message: '删除成功!'
					});
					let index = _.findIndex(this.gridList, {sourceserial:item.sourceserial});
					if(index > -1){
						this.gridList.splice(index, 1);
					}
					this.total--;
					this.openSourceVisible = false;
					this.detailItem = null;
				});
			}).catch();
		},
		handleDelete(row, dataList){
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
					if(this.needSource){
                        let index = _.findIndex(dataList, {id:row.id});
                        dataList.splice(index, 1);
                    }
                    this.getList({flowStateId:this.searchForm.flowStateId});
				});
			}).catch();
		},
		parseFlow(id){
			if(!id) return '';
			let flow = _.find(this.flowList, {'id':id});
			return flow?flow.name:'';
		},
		parseDate(date, format){
			return date?moment(date).format(format||'YYYY-MM-DD'):'';
		},
		parseMoney(row){
			return this.$options.filters['currency'](row.count*row.price);
		},
		parsePtype(id){
			if(!id) return '';
			let type = _.find(this.ptypeList, {'id':id});
			return type?type.name:'';
		},
		parseCrm(id){
			if(!id) return '';
			let crm = _.find(this.setting.crm, {'id':id});
			return crm?crm.name:'';
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
						this.getList({flowStateId:{$in:[1]}});
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
					pagesize:100
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
		setOrderParams(flag){
			this.query.page = 1;
			this.needSource = flag;
			this.getList({flowStateId:this.searchForm.flowStateId});
		},
		async getList(match = {}){
			this.listLoading = true;
			let groupId = {"sourceserial":"$sourceserial"};
            let bySerial = {'sourceserial':{$ne:''}};
			if(!this.needSource){
                bySerial = {'sourceserial':''};
				groupId = {"serial":"$serial"};
            } 
			match = _.merge(bySerial, match);
			
			let condition = {
				type:'groupList',
				collectionName: 'order',
				data:_.merge({typeId:1},match),
				distinct:"sourceserial",
				aggregate:[
					{"$match":_.merge({typeId:1},match)},
					{ 
						"$group": {
							"_id": groupId, // 按字段分组
							"id":{"$first" :"$id"},
							"typeId":{"$first" :"$typeId"},
							"ptypeId":{"$first" :"$ptypeId"},
							"flowStateId":{"$first" :"$flowStateId"},
							"serial":{"$first":"$serial"},
							"sourceserial":{"$first" :"$sourceserial"},
							"materialNo":{"$first" :"$materialNo"},
							"projectNo":{"$first" :"$projectNo"},
							"projectName":{"$first" :"$projectName"},
							"productId":{"$first" :"$productId"},
							"productName":{"$first" :"$productName"},
							"crmId":{"$first" :"$crmId"},
							"crmName":{"$first" :"$crmName"},
							"boxNo":{"$first" :"$boxNo"},
							"model":{"$first" :"$model"},
							"modelNo":{"$first" :"$modelNo"},
							"caselNo":{"$first" :"$caselNo"},
							"util":{"$first" :"$util"},
							"price":{"$first" :"$price"},
							"count":{"$first" :"$count"},
							"orderDate":{"$first" :"$orderDate"},
							"deliveryDate":{"$first" :"$deliveryDate"},
							"content":{"$first" :"$content"},
							"flowState": {$sum:"$flowStateId"},
							"total": { $sum: 1 }
						}
					},
					{"$sort":{'deliveryDate':1,'crmId':1}},
					{"$skip":(this.query.page-1)*this.query.pagesize},
					{"$limit":this.query.pagesize}
				]
			};
			
			let result = await this.$axios.$post('mock/db', {data:condition});
			this.total = result.total;
			this.gridList = _.orderBy(result.list,['crmId'], ['asc']);
			this.listLoading = false;
		},
		async _getLastId(){
			// 订单Id
			let condition = {
				type:"getId",
				data:{
					model:'order'
				}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			if(result){
				console.log('lastId-orderId',result);
				this.lastId = result;
			}
			// 仓库Id
			let cn = {
				type:"getId",
				data:{
					model:'store'
				}
			}
			let res = await this.$axios.$post('mock/db', {data:cn});
			//debugger
			if(res){
				console.log('lastId-storeId',res);
				this.storeLastId = res;
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
				this.crmList = this.setting.crm;
				this.flowList = _.orderBy(this.setting.flowState,['id'],['asc']);
				this.initProduct();
				this.getList({flowStateId:{$in:[1]}});//{flowStateId:1}
			}
		}
	},
	created(){
		this.getSetting();
	},
	mounted(){
		this._getLastId();
	}
}
</script>

<style lang="scss" scoped>
	@import '~/assets/scss/order.scss';
</style>




