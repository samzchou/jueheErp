<template>
	<section class="order-main">
		<div class="head-title">
			<div>
				<div v-if="!isEdit">
					<span :class="{'inactive':needSource}" @click="setOrderParams(true)">蒂森生产订单</span>
					<span :class="{'inactive':!needSource}" @click="setOrderParams(false)">珏合生产订单</span>
				</div>
				<div v-else>
					<span>订单编辑</span>
				</div>
			</div>
			<div>
				<span v-if="!isEdit">
					<el-button @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增珏合生产订单</el-button>
					<el-button v-if="gridList.length" @click="showDetail" type="text" size="medium" icon="el-icon-document">制定全部生产订单</el-button>
				</span>
				<span v-else>
					<el-button @click="cancelBack" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
				</span>
			</div>
		</div>
		<!--表格内容-->
		<div class="grid-container" v-if="!isEdit">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="蒂森订单号：" prop="sourceserial" v-if="needSource">
						<el-input v-model="searchForm.sourceserial" clearable style="width:100px" />
					</el-form-item>
					<el-form-item label="珏合订单号：" prop="serial" v-else>
						<el-input v-model="searchForm.serial" clearable style="width:100px" />
					</el-form-item>
					<el-form-item label="客户：" prop="crmId">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable>
							<el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="产品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="项目号：" prop="projectNo">
						<el-input v-model="searchForm.projectNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="箱号：" prop="boxNo" v-if="needSource">
						<el-input v-model="searchForm.boxNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="型号/梯号：" prop="modelNo" v-if="needSource">
						<el-input v-model="searchForm.modelNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="物料号/版本号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="制单日期：" prop="orderDate">
						<el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item label="交付日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<el-table v-loading="listLoading" ref="listTable" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column prop="sourceserial" :label="needSource?'蒂森订单号':'珏合订单号'" width="150">
					<template slot-scope="scope">
						<a v-if="needSource" href="javascript:void(0)" @click="showSourceOrder(scope.row)">{{scope.row.sourceserial}}</a>
						<span v-else>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="projectName" label="项目名称" />
				<el-table-column prop="materialNo" label="物料号/版本号">
					<template slot-scope="scope">
						<span>{{scope.row.materialNo}}</span>
						<span v-if="needSource" style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="crmName" label="客户名称" v-if="!needSource">
					<template slot-scope="scope">
						<span>{{scope.row.crmName}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="productName" label="订单产品名称">
					<template slot-scope="scope">
						<span>{{scope.row.productName}}</span>
						<span v-if="needSource" style="margin-left:5px; color:#CCC">等...</span>
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
				<el-table-column label="操作" fixed="right" align="center" :width="needSource?'120':'170'">
					<template slot-scope="scope">
						<div v-if="scope.row.flowStateId<7">
							<span>
								<el-button size="mini" type="text" icon="el-icon-document" @click="makeOrder(scope.row)">制单</el-button>
								<el-button v-if="!needSource" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
								<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
							</span>
						</div>
						<div v-else>已入库</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container" style="padding: 10px 0;">
				<div>共有{{total}}个采购订单，请点击订单号操作下单流程</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"></el-pagination>
			</div>
		</div>
		<!--订单录入-->
		<div class="form-container" v-else>
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
				<el-form-item label="产品分类" prop="ptypeId">
					<el-select v-model="ruleForm.ptypeId" placeholder="请选择" filterable clearable @change="setPtype">
						<el-option v-for="ptype in ptypeList" :key="ptype.id" :label="ptype.name" :value="ptype.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="产品名称" prop="productId">
					<el-select v-model="ruleForm.productId" placeholder="请选择" filterable @change="setProduct" style="width:300px">
						<el-option v-for="product in proList" :key="product.id" :label="product.name+'('+product.materialNo+')'" :value="product.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="订单编号" prop="serial">
					<el-input v-model="ruleForm.serial" style="width:300px">
						<template slot="append">
							<el-button type="text" style="padding: 0 10px" @click="handleSerial">自动生成</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="客户名称" prop="crmName">
					<el-select v-model="ruleForm.crmId" placeholder="请选择" filterable @change="getCrmName" style="width:300px">
						<el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="客户ID" prop="crmNo">
					<el-input v-model="ruleForm.crmNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="制单日期" prop="orderDate">
					<el-date-picker v-model="ruleForm.orderDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:200px" />
				</el-form-item>
				<el-form-item label="交付日期" prop="deliveryDate">
					<el-date-picker v-model="ruleForm.deliveryDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:200px" />
				</el-form-item>
				<el-form-item label="规格/梯型" prop="model">
					<el-input v-model="ruleForm.model" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="型号/梯号" prop="modelNo">
					<el-input v-model="ruleForm.modelNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="箱号" prop="boxNo">
					<el-input v-model="ruleForm.boxNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="项目名称" prop="projectName">
					<el-input v-model="ruleForm.projectName" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="项目号" prop="projectNo">
					<el-input v-model="ruleForm.projectNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="物料号/版本号" prop="materialNo">
					<el-input v-model="ruleForm.materialNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="图号/版本号" prop="caselNo">
					<el-input v-model="ruleForm.caselNo" placeholder="请输入" style="width:200px" />
				</el-form-item>
				<el-form-item label="订单数量" prop="count">
					<el-input v-model="ruleForm.count" placeholder="请输入" style="width:100px" />
				</el-form-item>
				<el-form-item label="单位" prop="util">
					<el-input v-model="ruleForm.util" placeholder="请输入" style="width:100px" />
				</el-form-item>
				<el-form-item label="订单单价" prop="price">
					<el-input-number v-model="ruleForm.price" controls-position="right" :min="0" :step="0.1"  placeholder="请输入" style="width:120px" />
				</el-form-item>
				<el-form-item label="生产单价" prop="metaprice">
					<el-input-number v-model="ruleForm.metaprice" controls-position="right" :min="0" :step="0.1"  placeholder="请输入" style="width:120px" />
				</el-form-item>
				<el-form-item label="备注说明" prop="content">
					<el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 3, maxRows: 10}" placeholder="请输入内容"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" size="medium" @click="submitForm">提交保存</el-button>
					<el-button type="infor" size="medium" @click="isEdit=false">取消返回</el-button>
				</el-form-item>
			</el-form>
		</div>
		<!--制定全部订单-->
		<el-dialog :title="needSource?'蒂森生产订单':'珏合生产订单'" append-to-body :visible.sync="openDialogVisible" width="80%">
			<div class="form-dialog">
				<el-form :inline="true" :model="dialogForm" ref="dialogForm" size="mini">
					<el-form-item label="按客户：" prop="crmId">
						<el-select v-model="dialogForm.crmId" placeholder="请选择" style="width:300px" @change="dialogSearch">
							<el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="按交付日期：" prop="deliveryDate">
						<el-date-picker v-model="dialogForm.deliveryDate" type="date" value-format="timestamp" placeholder="选择日期" style="width:140px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="dialogSearch" icon="el-icon-search" :loading="searchLoading" :disabled="!dialogForm.crmId">查询</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div class="compare" ref="printTable" v-if="currItem">
				<div class="order-title">
					<span>客户：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
				</div>
				<div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
					<span style="font-weight:bold">订单总价：{{parseAllOrderMoney(crmOrderList)}}</span>
				</div>
				<el-table class="detail-table" :data="crmOrderList" @selection-change="handleSelectionOrders" border fit highlight-current-row stripe size="mini" max-height="350" v-loading="searchLoading" ref="crmorder">
					<el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-row :gutter="20" v-for="(item,idx) in props.row.children" :key="item.id">
								<el-col :span="3">{{idx+1}}.订单号：{{needSource?item.sourceserial:item.serial}}</el-col>
								<el-col :span="3">项目名称:{{item.projectName}}</el-col>
								<el-col :span="2">规格/梯型:{{item.model}}</el-col>
								<el-col :span="2">梯号:{{item.modelNo}}</el-col>
								<el-col :span="2">数量:{{item.count}} {{item.util}}</el-col>
								<el-col :span="3">订单单价:{{item.price}}</el-col>
								<el-col :span="3">生产单价:{{item.metaprice}}</el-col>
								<el-col :span="3">制单日期:{{parseDate(item.orderDate)}}</el-col>
								<el-col :span="3">交付日期:{{parseDate(item.deliveryDate)}}</el-col>
							</el-row>
						</template>
					</el-table-column>
					<el-table-column :prop="needSource?'sourceserial':'serial'" :label="needSource?'蒂森生产订单':'珏合生产订单'" />
					<el-table-column prop="materialNo" label="型号/物料号" width="120"/>
					<el-table-column prop="productName" label="产品名称" />
					<el-table-column prop="count" label="订单量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.count}} {{scope.row.util}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="storeCount" label="库存量" width="60" />
                    <el-table-column label="已制单未入库参考">
                        <template slot-scope="scope">
                            <div v-if="scope.$index<crmOrderList.length-1">
                                <span>订单量：{{scope.row.storeIn && scope.row.storeIn.count}}；</span>
                                <span>实际量：{{scope.row.storeIn && scope.row.storeIn.incount}}</span>
                            </div>
                        </template>
                    </el-table-column>
					<el-table-column prop="releaseCount" label="实际生产量" width="120">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-input-number size="mini" controls-position="right" :min="0" @change="checkReleaseCount(scope.row, crmOrderList)" v-model="scope.row.releaseCount" style="width:100" />
							</div>
							<div v-else>{{scope.row.releaseCount}}</div>
						</template>
					</el-table-column>
					<el-table-column prop="price" label="订单单价" width="80" />
					<el-table-column label="生产单价" prop="metaprice" width="100">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-input-number size="mini" controls-position="right" :min="0" :step="0.1" v-model="scope.row.metaprice" @change="setRowMetaPrice(scope.row)" style="width:80px" />
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="allPrice" label="订单金额" width="100">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
							<span v-else>{{scope.row.allPrice | currency}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="deliveryDate" label="交付日期" width="100">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.deliveryDate)}}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="btns" v-if="crmOrderList.length">
				<div>共有{{crmOrderList.length-1}}个生产订单</div>
				<div>
					<span>制单交货日期：</span>
                    <el-date-picker size="small" v-model="finishedDate" value-format="timestamp" :clearable="false" type="date" placeholder="选择日期" style="width:150px;margin-right:10px"/>
                    <el-button type="success" @click="exportOrder(crmOrderList)" icon="el-icon-document" :loading="exportLoading">制单生产</el-button>
				</div>
			</div>
		</el-dialog>
		<!--根据蒂森订单号-->
		<el-dialog :title="'蒂森订单：'+currSerial" append-to-body :visible.sync="openSourceVisible" width="80%">
			<div class="detail-container">
				<el-row :gutter="20" v-if="detailItem">
					<el-col :span="12">
						<div>
							<span class="tl">系统订单号：</span>
							{{splitSerial(detailItem.serial)}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">项目号：</span>
							{{detailItem.projectNo}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">项目名称：</span>
							{{detailItem.projectName}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">制单日期：</span>
							{{parseDate(detailItem.orderDate)}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">交货日期：</span>
							{{parseDate(detailItem.deliveryDate)}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">订单总数：</span>
							{{sourceData.length-1}}
						</div>
					</el-col>
					<el-col :span="12">
						<div>
							<span class="tl">备注：</span>
							{{detailItem.content}}
						</div>
					</el-col>
				</el-row>
			</div>
			<el-table size="mini" class="detail-table" ref="exportTable" :data="sourceData" border highlight-current-row fit stripe max-height="350" @selection-change="handleSelectionOrders" style="width:100%">
				<el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
				<el-table-column label="物料号" prop="materialNo" width="120" />
				<el-table-column label="产品名称" prop="productName" />
				<el-table-column label="图号/版本号" prop="caselNo" />
				<el-table-column label="梯型" prop="model" width="100" />
				<el-table-column label="梯号" prop="modelNo" width="80" />
				<el-table-column label="订单量" prop="count" width="70">
					<template slot-scope="scope">
						<span>{{scope.row.count}} {{scope.row.util}}</span>
					</template>
				</el-table-column>
				<el-table-column label="库存" prop="storeCount" width="60" />
                <el-table-column label="已制单未入库参考">
                        <template slot-scope="scope">
                            <div v-if="scope.$index<sourceData.length-1">
                                <span>订单量：{{scope.row.storeIn && scope.row.storeIn.count}}；</span>
                                <span>实际量：{{scope.row.storeIn && scope.row.storeIn.incount}}</span>
                            </div>
                        </template>
                    </el-table-column>
				<el-table-column prop="releaseCount" label="实际生产量" width="100">
					<template slot-scope="scope">
						<div v-if="scope.$index<sourceData.length-1">
							<el-input-number v-if="scope.row.flowStateId==5" size="mini" controls-position="right" :min="0" @change="checkReleaseCount(scope.row, sourceData)" v-model="scope.row.releaseCount" style="width:80px" />
							<span v-else>{{scope.row.store.incount}}</span>
						</div>
						<div v-else>{{scope.row.releaseCount}}</div>
					</template>
				</el-table-column>
				<el-table-column label="订单单价" prop="price" width="80" />
                <el-table-column label="生产单价" prop="metaprice" width="100">
					<template slot-scope="scope">
						<div v-if="scope.$index<sourceData.length-1">
							<el-input-number size="mini" controls-position="right" :min="0" :step="0.1" v-model="scope.row.metaprice" @change="setMetaPrice(scope.row, sourceData)" style="width:80px" />
						</div>
					</template>
				</el-table-column>
				<el-table-column label="订单金额" prop="allPrice" width="100">
					<template slot-scope="scope">
						<span v-if="scope.$index<sourceData.length-1">{{parseReleaseMoney(scope.row)}}</span>
						<span v-else>{{scope.row.allPrice | currency}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" width="80">
					<template slot-scope="scope">
						<span v-if="scope.row.flowStateId==5">
							<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row, sourceData)">删除</el-button>
						</span>
						<span v-else>--</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="btns" v-if="sourceData.length">
				<div>
					<el-button v-if="detailItem.flowStateId==5" type="danger" size="mini" @click="handleDeleteBySerial(detailItem)">删除该订单({{currSerial}})</el-button>
					<span v-else>该订单已制单生产</span>
				</div>
				<div>
					<el-form size="mini" :inline="true" :model="updateForm" :rules="updateRules">
						<el-form-item label="交付日期：" prop="deliveryDate">
							<el-date-picker v-model="updateForm.deliveryDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:130px" @change="setFinishedDate"/>
						</el-form-item>
						<el-form-item>
							<el-button type="warning" @click="updateDeliveryDate(sourceData)" :disabled="!updateForm.deliveryDate">修改交付日期</el-button>
							<el-button v-if="detailItem.flowStateId==5" type="primary" @click="exportOrder(sourceData)" :loading="exportLoading">制单生产</el-button>
							<el-button @click="openSourceVisible=false">取消关闭</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</el-dialog>
	</section>
</template>
<script>
export default {
	name: "role",
	data() {
		return {
			needSource: true,
			openDialogVisible: false,
			currItem: null,
			crmOrderList: [],
			sourceCrmOrderList: [],
			isMergeSerial: false,
			dialogForm: {
				crmId: 4,
				deliveryDate: ""
			},
			setting: {},
			isEdit: false,
			listLoading: false,
			typeList: [], //settings.type,
			ptypeList: [],
			flowList: [], //settings.flowState,
			crmList: [],
			productList: [],
			proList: [],
			query: {
				page: 1,
				pagesize: 50
			},
			gridList: [],
			total: 0,
			dataId: undefined,
			editRow: null,
			searchForm: {
				serial: "",
				sourceserial: "",
				crmId: "",
				productName: "",
				projectNo: "",
				boxNo: "",
				modelNo: "",
				materialNo: "",
				orderDate: "",
				deliveryDate: ""
			},
			ruleForm: {
				typeId: 1,
				flowStateId: 5,
				ptypeId: "",
				serial: "",
				productId: "",
				productName: "",
				orderDate: new Date().getTime(),
				deliveryDate: "",
				model: "",
				modelNo: "",
				boxNo: "",
				projectName: "",
				projectNo: "",
				materialNo: "",
				caselNo: "",
				crmId: "",
				crmName: "",
				crmNo: "",
				count: "",
				util: "",
				price: "",
				metaprice:"",
				content: ""
			},
			rules: {
				serial: [
					{ required: true, message: "请输入订单编号", trigger: "change" }
				],
				productName: [
					{ required: true, message: "请选择产品", trigger: "change" }
				],
				orderDate: [
					{ required: true, message: "请输入制单日期", trigger: "change" }
				],
				deliveryDate: [
					{ required: true, message: "请输入交付日期", trigger: "change" }
				],
				count: [{ required: true, message: "请输入订单数量", trigger: "blur" }],
				price: [{ required: true, message: "请输入订单单价", trigger: "blur" }],
				metaprice: [{ required: true, message: "请输入生产单价", trigger: "blur" }]
			},
			updateForm: {
				deliveryDate: ""
			},
			updateRules: {
				deliveryDate: [
					{ required: true, message: "请选择日期", trigger: "change" }
				]
			},
			lastId: 0,
			storeLastId: 0,
			openSourceVisible: false,
			detailItem: null,
			currSerial: "",
			sourceData: [],
			searchLoading: false,
			exportLoading: false,
            exportOrders: [],
            orderSerial:'',
            finishedDate:new Date().getTime(),
		};
	},
	methods: {
		checkSelectable(row) {
			if(row.id){
                let rc = row.storeIn.incount - row.storeIn.count + row.releaseCount + row.storeCount;
                return rc >= row.count;
            }
		},
		handleSelectionOrders(orders) {
			this.exportOrders = orders;
		},
		splitSerial(serial) {
			let s = serial.split("-");
			return s.length ? s[1] : serial;
        },
        setFinishedDate(val){
            this.finishedDate = val;
        },
		makeOrder(row) {
			//console.log("row", row);
			if (this.needSource) {
				this.showSourceOrder(row);
				return;
			}
			this.dialogForm.crmId = row.crmId;
			this.dialogForm.flowStateId = 5;
			this.showDetail(row);
		},
		parseReleaseMoney(row) {
			if (row.flowStateId == 5) {
				row.allPrice = parseInt(row.releaseCount) * row.metaprice;
			} else {
				row.allPrice = parseInt(row.store.incount) * row.store.metaprice;
			}
			return this.$options.filters["currency"](row.allPrice);
		},
		parseAllOrderMoney(dataList) {
			let money = 0;
			dataList.forEach((item, index) => {
				if (index < dataList.length - 1) {
					money += parseInt(item.releaseCount) * item.metaprice;
				}
			});
			dataList[dataList.length - 1]["allPrice"] = money;
			return this.$options.filters["currency"](money);
		},
		setRowMetaPrice(row){
			//console.log(row);
			if(row.children && row.children.length){
				row.children.forEach(item=>{
					item.metaprice = row.metaprice;
				})
			}
		},
		setMetaPrice(row, dataList){
			let money = 0;
			dataList.forEach((item, index) => {
				if (index < dataList.length - 1) {
					money += parseInt(item.releaseCount) * item.metaprice;
				}
			});
			dataList[dataList.length - 1]["allPrice"] = money;
		},
		checkReleaseCount(row, dataList) {
			if (row) {
				row.releaseCount = !row.releaseCount ? 0 : row.releaseCount;
			}
			let releaseCount = 0, count = 0, money = 0;
			dataList.forEach((item, index) => {
				if (index < dataList.length - 1) {
					money += parseInt(item.releaseCount) * item.metaprice;
					releaseCount += parseInt(item.releaseCount);
					count += parseInt(item.count);
				}
			});
			dataList[dataList.length - 1]["count"] = count;
			dataList[dataList.length - 1]["releaseCount"] = releaseCount;
			dataList[dataList.length - 1]["allPrice"] = money;
		},
		totalReleaseCount(dataList) {
			let count = 0;
			dataList.forEach((item, index) => {
				if (index < dataList.length - 1) {
					count += parseInt(item.releaseCount);
				}
			});
			return count;
		},
		// 修改蒂森订单的交货日期
		updateDeliveryDate(dataList) {
			this.$confirm("此操作将修改订单号为:" + this.detailItem.sourceserial + "所有数据的交货日期(包括采购订单), 是否继续?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				let condition = {
					type: "updateData",
					collectionName: "order",
					multi: true,
					updateDate: true,
					condition: { sourceserial: this.detailItem.sourceserial },
					data: { deliveryDate: this.updateForm.deliveryDate }
				};
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					this.gridList.forEach(item => {
						if (item.sourceserial == this.detailItem.sourceserial) {
							item.deliveryDate = this.updateForm.deliveryDate;
						}
					});
					dataList.forEach(item => {
						if (item.deliveryDate) {
							item.deliveryDate = this.updateForm.deliveryDate;
						}
					});
				});
			}).catch();
		},
		// 删除蒂森订单
		handleDeleteBySerial(item) {
			this.$confirm("此操作将删除订单号为:" + (this.needSource ? item.sourceserial : item.serial) + "所有数据(包括采购订单), 是否继续?", "特别提示：请谨慎操作删除", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				let condition = {
					type: "removeData",
					collectionName: "order",
					data: { serial: item.serial }
				};
				if (this.needSource) {
					condition.data = { sourceserial: item.sourceserial };
				}
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					this.$message({
						type: "success",
						message: "删除成功!"
					});
					this.submitSearch(true);
					this.openSourceVisible = false;
					this.detailItem = null;
				});
			}).catch();
		},
		// 显示原始订单列表
		showSourceOrder(row) {
			this.detailItem = { ...row };
			this.detailItem.crmOrderMoney = 0;
            this.updateForm.deliveryDate = row.deliveryDate;
            this.finishedDate = row.deliveryDate;
			this.sourceData = [];
			let serial = row.serial.split("-");
			this.currSerial = this.needSource ? row.sourceserial : serial[1];
			let match = this.needSource ? { sourceserial: row.sourceserial } : { seriral: row.serial };
			let condition = {
				type: "aggregate",
				collectionName: "order",
				data: _.merge({ flowStateId: row.flowStateId }, match),
				aggregate: [
					{
						$lookup: {
							from: "store",
							localField: "materialNo",
							foreignField: "materialNo",
							as: "store"
						}
                    },
                    {
                        "$lookup":{
                            "from":"storeIn",
                            "localField":"materialNo",
                            "foreignField":"materialNo",
                            "as":"storeIn"
                        }
                    },
					{
						$unwind: {
							// 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{ $match: _.merge({ flowStateId: row.flowStateId }, match) },
					{ $sort: { deliveryDate: 1 } }
				]
			};
			this.$axios.$post("mock/db", { data: condition }).then(result => {
				let list = [], allcount = 0;
				list = this.mergeOrder(result.list);
				//console.log("listData", list);
				list.forEach(item => {
					item.allPrice = item.count * item.metaprice;
					allcount += item.count;
					this.detailItem.crmOrderMoney += item.allPrice;
				});
				list.push({
					materialNo: "合计",
					count: allcount,
					releaseCount: allcount,
					allPrice: this.detailItem.crmOrderMoney
				});
				this.sourceData = list;
				this.$nextTick(() => {
					this.checkedOrder("exportTable", this.sourceData); //每次更新了数据，触发这个函数即可。
				});
			});
			this.openSourceVisible = true;
        },
        setOrderSerial(){
            let now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			now = now.split(" ");
			let dd = now[0].split("-");
			let tt = now[1].split(":");
			let serial = "JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1] + "" + tt[2];
			return serial;
        },

		exportOrder(dataList) {
			this.exportOrderIds = [];
            let exportData = [], allCount = 0, allMoney = 0;
            this.orderSerial = this.setOrderSerial();
			this.exportOrders.forEach(item => {
				if (item && item.id && item.releaseCount>=0) {
					this.exportOrderIds = this.exportOrderIds.concat(
						this.getChildrenByid(item.children)
					);
					allCount += item.releaseCount;
                    allMoney += item.allPrice;
                    item.orderSerial = this.orderSerial;
                    item.finishedDate = this.finishedDate;
					exportData.push(item);
				}
			});
			if (!exportData.length) {
				this.$message.error("请勾选需要制定的生产订单");
				return;
			}
			let excelData = _.cloneDeep(exportData);
			excelData.push({
				orderSerial: "合计",
				releaseCount: allCount,
				allPrice: allMoney
			});
			this.exportLoading = true;
			import("@/components/Export2Excel").then(excel => {
				const tHeader = ["制单号","型号/物料号", "产品名称", "交付日期", "数量", "单价", "合计"];
				const filterVal = ["orderSerial","materialNo", "productName", "finishedDate", "releaseCount", "metaprice", "allPrice"];
				//tHeader.unshift("系统订单号");
				//filterVal.unshift("serial");
				const data = this.formatJson(filterVal, excelData);
				const now = moment(new Date()).format("YYYYMMDD");
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: (this.needSource ? "蒂森生产订单-" : "珏合生产订单-") + now,
					autoWidth: true,
					bookType: "xlsx"
				});
				this.updateOrderByCrm(exportData);
			});
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v =>
				filterVal.map(j => {
					if (j == "finishedDate") {
						v[j] = this.parseDate(v[j]);
					}
					return v[j];
				})
			);
		},
		getChildrenByid(arr, id) {
			let ids = [];
			if (arr && arr.length) {
				arr.forEach(item => {
					ids.push(item.id);
				});
			} else {
				ids.push(id);
			}
			return ids;
		},

		// 更新客户订单状态（已发单）
		updateOrderByCrm(dataList) {
			// 更新订单状态参数
			let cn = {
				type: "updatePatch",
				collectionName: "order",
				notNotice: true,
				param: {
					crmId: this.dialogForm.crmId,
					id: { $in: this.exportOrderIds }
				},
				set: { $set: { flowStateId: 6 } }
			};
			let storeData = [];
			//let orderIds = [], serials = [], storeData = [];
			dataList.forEach(item => {
				if (item.id) {
					this.storeLastId++;
					storeData.push({
						id: this.storeLastId,
						isAdded: false,
						typeId: item.typeId,
						orderId: item.id,
                        orderIds: this.getChildrenByid(item.children, item.id),
                        orderSerial:this.orderSerial,
						serial: item.serial,
						sourceserial: item.sourceserial,
						crmId: item.crmId,
						crmName: item.crmName,
						productId: item.productId,
						productName: item.productName,
						materialNo: item.materialNo,
						model: item.model,
						projectName: item.projectName,
						price: item.price,
						metaprice: item.metaprice,
						util: item.util,
						count: item.count,
						incount: item.releaseCount,
                        deliveryDate: item.deliveryDate,
                        finishedDate: this.finishedDate,
						createByUser: this.$store.state.user.name
					});
				}
			});
			//debugger
			console.log("storeData", storeData);
			this.$axios.$post("mock/db", { data: cn }).then(result => {
				// 注意此处需保存数据到仓库中
				let condition = {
					type: "addPatch",
					collectionName: "storeIn",
					data: storeData
				};
				//debugger
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					this.openSourceVisible = false;
					this.exportLoading = false;
					this.exportOrders = [];
					this.crmOrderIds = [];
					this.crmOrderList = [];
					this.submitSearch(true);
				});
			});
		},
		showDetail(row) {
			this.crmOrderList = [];
			if (row && row.crmId) {
				let crm = _.find(this.crmList, { id: row.crmId });
				this.dialogForm.crmId = row.crmId;
				this.currItem = _.merge(row, {
					address: crm.address,
					contactName: crm.contactName,
					contactPhone: crm.contactPhone,
					crmName: crm.name
				});
				let match = { crmId: row.crmId, flowStateId: row.flowStateId };
				if (!this.needSource) {
					match.id = row.id;
				}
				this.listOrderByCrm(match);
			} else {
				this.dialogSearch();
			}
			this.openDialogVisible = true;
		},
		dialogSearch() {
			let params = {
				flowStateId: this.dialogForm.flowStateId,
				crmId: this.dialogForm.crmId
			};
			if (this.dialogForm.deliveryDate) {
				params.deliveryDate = this.dialogForm.deliveryDate;
			}
			let crm = _.find(this.crmList, { id: this.dialogForm.crmId });
			this.currItem = {
				address: crm.address,
				contactName: crm.contactName,
				contactPhone: crm.contactPhone,
				crmName: crm.name
			};
			this.listOrderByCrm(params);
		},
		async listOrderByCrm(match = {}) {
			this.searchLoading = true;
			this.crmOrderList = [];

			let bySerial = { sourceserial: { $ne: "" } };
			if (!this.needSource) {
				bySerial = { sourceserial: "" };
				if (this.currItem && this.currItem.serial) {
					bySerial = _.merge(bySerial, { serial: this.currItem.serial });
				}
			}
			match = _.merge({ flowStateId: 5 }, bySerial, match);
			let params = {
				type: "aggregate",
				collectionName: "order",
				data: match,
				aggregate: [
					{
						$lookup: {
							"from": "store",
							"localField": "materialNo",
							"foreignField": "materialNo",
							"as": "store"
						}
                    },
                    {
                        "$lookup":{
                            "from":"storeIn",
                            "localField":"materialNo",
                            "foreignField":"materialNo",
                            "as":"storeIn"
                        }
                    },
					{
						$unwind: {
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{ $match: match },
					{ $sort: { deliveryDate: 1 } }
				]
			};
            let data = await this.$axios.$post("mock/db", { data: params });
            //debugger
			this.sourceCrmOrderList = this.mergeOrder(data.list);
			if (data.list.length) {
				this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList));
			}
			this.searchLoading = false;
		},
		// 合并订单数量,根据类型，产品名称，物料号，价格，梯形、梯号、项目号
		mergeOrder(lists) {
			let listData = [];
			lists.forEach(item => {
				item.children = [];
				item.storeCount = item.store ? item.store.count : 0; // 默认库存 0
				let dataIndex = _.findIndex(listData, {
					productId: item.productId,
					materialNo: item.materialNo,
					price: item.price
				});
				if (!!~dataIndex) {
					listData[dataIndex]["children"].push(item);
					listData[dataIndex]["sourceserial"] += "," + item.sourceserial;
					listData[dataIndex]["projectNo"] += "," + item.projectNo;
					listData[dataIndex]["count"] += item.count;
					listData[dataIndex]["releaseCount"] += item.count;
				} else {
                    let storeIn = this.uionStore(item.storeIn);
                    item.storeIn = storeIn;
					item.children.push(_.cloneDeep(item));
					item.serial = item.serial.includes("-") ? item.serial.split("-")[1] : item.serial;
					item.releaseCount = item.count;
					listData.push(item);
				}
			});
			return listData;
        },
        uionStore(storeInArr){
            let obj = {count : 0, incount : 0};
            if(storeInArr.length){
                storeInArr.forEach(item=>{
                    if(!item.isAdded){
                        obj.count += item.count;
                        obj.incount += item.incount;
                    }
                });
            }
            return obj;
        },
		filterCrmOrderList(arr) {
			let list = [], allcount = 0;
			arr.forEach(item => {
				item.allPrice = item.count * item.metaprice;
				allcount += item.count;
				list.push(item);
			});

			this.currItem.crmOrderMoney = 0;
			list.forEach(item => {
				this.currItem.crmOrderMoney += item.allPrice;
			});
			list.push({
				serial: "合计",
				count: allcount,
				releaseCount: allcount,
				allPrice: this.currItem.crmOrderMoney
			});
			this.crmOrderList = list;
			this.$nextTick(() => {
				this.checkedOrder("crmorder", this.crmOrderList); //每次更新了数据，触发这个函数即可。
			});
		},
		checkedOrder(table, arr) {
			if (!table) return;
			arr.forEach((item, i) => {
				if (item.id) {
					this.$refs[table].toggleRowSelection(arr[i], true);
				}
			});
		},

		initProduct() {
			this.ptypeList = _.filter(this.setting.ptype, { typeId: 2 });
			this.crmList = _.filter(this.setting.crm, { typeId: 2 });
			this.productList = _.filter(this.setting.product, { typeId: 2 });
			this.proList = { ...this.productList };
		},
		setPtype(ptypeId) {
			this.ruleForm.productId = "";
			this.ruleForm.crmId = "";
			if (ptypeId == "") {
				this.proList = { ...this.productList };
			} else {
				this.proList = _.filter(this.productList, { ptypeId: ptypeId });
			}
		},
		setProduct(id) {
			let product = _.find(this.productList, { id: id });
			let obj = {
				productName: product.name,
				model: product.model,
				modelNo: product.modelNo,
				materialNo: product.materialNo,
				util: product.util,
				price: product.price,
				metaprice:product.price
			};
			this.getCrmName(product.crmId);
			this.ruleForm = _.merge({}, this.ruleForm, obj);
			console.log("this.ruleForm", this.ruleForm);
		},
		getCrmName(id) {
			let crm = _.find(this.crmList, { id: id });
			if (!crm) return;
			this.ruleForm.crmId = id;
			this.ruleForm.crmName = crm.name;
			this.ruleForm.crmNo = crm.crmNo;
		},
		handleSerial(flag) {
			let now = moment(new Date()).format("YYYY-MM-DD HH:mm");
			now = now.split(" ");
			let dd = now[0].split("-");
			let tt = now[1].split(":");
			//let no = this.editRow?this.editRow.id:this.lastId;
			let serial =
				"JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1];
			if (flag == true) {
				return serial;
			} else {
				this.ruleForm.serial = serial;
			}
		},
		cancelBack() {
			this.editRow = null;
			this.isEdit = false;
		},
		handleAdd() {
			this.isEdit = true;
			this.editRow = null;
			this.dataId = undefined;
			this.ruleForm = {
				typeId: 2,
				flowStateId: 5,
				ptypeId: "",
				serial: this.handleSerial(true),
				productId: "",
				productName: "",
				orderDate: new Date().getTime(),
				deliveryDate: new Date().getTime() + 10 * 24 * 3600 * 1000,
				model: "",
				modelNo: "",
				boxNo: "",
				projectName: "",
				projectNo: "",
				materialNo: "",
				caselNo: "",
				crmId: "",
				crmName: "",
				crmNo: "",
				count: "",
				util: "",
				price: "",
				content: ""
			};
			this._getLastId();
		},
		handleUpdate(row) {
			this.openSourceVisible = false;
			this.editRow = row;
			this.dataId = row.id;
			this.isEdit = true;
			this.ruleForm = {
				typeId: row.typeId,
				flowStateId: row.flowStateId,
				ptypeId: row.ptypeId || "",
				serial: row.serial,
				productId: row.productId || "",
				productName: row.productName,
				orderDate: row.orderDate,
				deliveryDate: row.deliveryDate,
				model: row.model,
				modelNo: row.modelNo,
				boxNo: row.boxNo,
				projectName: row.projectName,
				projectNo: row.projectNo,
				materialNo: row.materialNo,
				caselNo: row.caselNo,
				crmId: row.crmId || "",
				crmName: row.crmName,
				crmNo: row.crmNo || "",
				count: row.count,
				util: row.util,
				price: row.price,
				metaprice: row.metaprice,
				content: row.content
			};
			this.isEdit = true;
		},
		handleDelete(row, dataList) {
			if (this.needSource) {
				this.handleDeleteBySerial(row);
				return;
			}
			this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				let condition = {
					type: "removeData",
					collectionName: "order",
					data: { id: row.id }
				};
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					this.$message({
						type: "success",
						message: "删除成功!"
					});
					if (this.needSource) {
						let index = _.findIndex(dataList, { id: row.id });
						dataList.splice(index, 1);
						if (dataList.length == 1) {
							dataList = [];
						} else {
							this.checkReleaseCount(null, dataList);
						}
					}
					this.submitSearch(true);
				});
			}).catch();
		},
		parseFlow(id) {
			if (!id) return "";
			let flow = _.find(this.setting.flowState, { id: id });
			return flow ? flow.name : "";
		},
		parseDate(date, format) {
			if (!date) return "";
			return moment(date).format(format || "YYYY-MM-DD");
		},
		parseMoney(row) {
			return this.$options.filters["currency"](row.count * row.price);
		},
		parsePtype(id) {
			if (!id) return "";
			let type = _.find(this.ptypeList, { id: id });
			return type ? type.name : "";
		},
		parseCrm(id) {
			if (!id) return "";
			let crm = _.find(this.setting.crm, { id: id });
			return crm ? crm.name : "";
		},
		_setValue(key, value) {
			switch (key) {
				case "orderDate":
					return new Date(value).getTime();
				case "deliveryDate":
					return new Date(value).getTime();
				case "count":
					return Number(value);
				case "price":
					return Number(value);
				default:
					return String(value);
			}
		},
		submitForm() {
			this.$refs["ruleForm"].validate(valid => {
				if (valid) {
					let loadingMask = this.$loading({ background: "rgba(0, 0, 0, 0.5)" });
					let condition = {
						type: "addData",
						collectionName: "order",
						data: { ...this.ruleForm }
					};
					if (this.dataId) {
						condition.type = "updateData";
						condition.data.id = this.dataId;
						condition.updateDate = true;
					}
					condition.data.createByUser = this.$store.state.user.name;
					this.$axios.$post("mock/db", { data: condition }).then(result => {
						loadingMask.close();
						this.isEdit = false;
						this.needSource = false;
						this.getList();
						this.dataId = undefined;
						this._getLastId();
					});
				}
			});
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != "" && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (
						_.isArray(this.searchForm[k]) &&
						(k === "deliveryDate" || k === "orderDate")
					) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1]
						};
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] };
					} else {
						params[k] = { $regex: this.searchForm[k] };
					}
				}
			}
			if (!flag) {
				this.query = {
					page: 1,
					pagesize: 20
				};
			}
			this.getList(params);
		},
		handleSizeChange(val) {
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val) {
			this.query.page = val;
			this.submitSearch(true);
		},
		setOrderParams(flag) {
			this.searchForm.flowStateId = "";
			this.query.page = 1;
			this.needSource = flag;
			this.getList();
		},
		async getList(match = {}) {
			this.listLoading = true;
			let groupId = { sourceserial: "$sourceserial" };
			let bySerial = { sourceserial: { $ne: "" } };
			if (!this.needSource) {
				bySerial = { sourceserial: "" };
				groupId = { serial: "$serial" };
			}
			match = _.merge({ typeId: 2, flowStateId: 5 }, bySerial, match);
			let condition = {
				type: "groupList",
				collectionName: "order",
				data: match,
				distinct: "sourceserial",
				groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
				],
				aggregate: [
					{ $match: match },
					{
						$group: {
							_id: groupId, // 按订单号字段分组
							id: { $first: "$id" },
							typeId: { $first: "$typeId" },
							ptypeId: { $first: "$ptypeId" },
							flowStateId: { $first: "$flowStateId" },
							serial: { $first: "$serial" },
							sourceserial: { $first: "$sourceserial" },
							materialNo: { $first: "$materialNo" },
							projectNo: { $first: "$projectNo" },
							projectName: { $first: "$projectName" },
							productId: { $first: "$productId" },
							productName: { $first: "$productName" },
							crmId: { $first: "$crmId" },
							crmName: { $first: "$crmName" },
							boxNo: { $first: "$boxNo" },
							model: { $first: "$model" },
							modelNo: { $first: "$modelNo" },
							caselNo: { $first: "$caselNo" },
							util: { $first: "$util" },
							price: { $first: "$price" },
							metaprice: { $first: "$metaprice" },
							count: { $first: "$count" },
							orderDate: { $first: "$orderDate" },
							deliveryDate: { $first: "$deliveryDate" },
							content: { $first: "$content" },
							flowState: { $sum: "$flowStateId" },
							total: { $sum: 1 }
						}
					},
					{ $sort: { deliveryDate: 1, crmId: 1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			this.total = result.total;
			this.gridList = _.orderBy(result.list, ["crmId"], ["asc"]);
			this.listLoading = false;
		},
		async _getLastId() {
			let condition = {
				type: "getId",
				data: {
					model: "order"
				}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				this.lastId = result;
			}
			// 仓库Id
			let cn = {
				type: "getId",
				data: {
					model: "storeIn"
				}
			};
			let res = await this.$axios.$post("mock/db", { data: cn });
			//debugger
			if (res) {
				console.log("lastId-storeId", res);
				this.storeLastId = res;
			}
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				//console.log('getSetting',result)
				this.setting = result.content;
				this.typeList = this.setting.type;
				this.flowList = _.filter(this.setting.flowState, item => {
					return item.id > 4;
				});
				this.initProduct();
				this.getList();
			}
		}
	},
	created() {
		this.getSetting();
	},
	mounted() {
		this._getLastId();
	}
};
</script>


<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>




