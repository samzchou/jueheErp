<template>
    <div class="head-form">
        <input id="excel-upload-input" ref="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
        <el-form :inline="true"> 
            <el-form-item v-if="excelData.header">
                <el-button type="primary" size="mini" @click="$emit('saveData')">保存数据</el-button>
            </el-form-item>
            <el-form-item>
                <el-button :loading="loading" size="mini" type="danger" @click="handleUpload">
                    {{!loading?'选择EXCEL文件上传':'正在上传处理中...'}}
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import XLSX from 'xlsx'
export default {
    props: {
        beforeUpload: Function, // eslint-disable-line
        onSuccess: Function     // eslint-disable-line
    },
    data() {
        return {
            loading: false,
            orderType:1,
            excelData: {
                header: null,
                results: null
            }
        }
    },
    methods: {
        generateData({ header, results }) {
            this.excelData.header = header;
            this.excelData.results = results;
            this.onSuccess && this.onSuccess(this.excelData);
        },
        handleUpload() {
            document.getElementById('excel-upload-input').click();
        },
        handleClick(e) {
            const files = e.target.files;
            const rawFile = files[0]; // only use files[0]
            if (!rawFile || !this.isExcel(rawFile)) {
                this.$message.error('文件不符合要求');
                return;
            };
            this.upload(rawFile);
        },
        upload(rawFile) {
            this.$refs['excel-upload-input'].value = null;
            if (!this.beforeUpload) {
                this.readerData(rawFile);
                return;
            }
            const before = this.beforeUpload(rawFile);
            if (before) {
                this.readerData(rawFile);
            }
        },
        readerData(rawFile) {
            this.loading = true;
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => {
                    const data = e.target.result;
                    const fixedData = this.fixData(data);
                    const workbook = XLSX.read(btoa(fixedData), { type: 'base64' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const header = this.getHeaderRow(worksheet);
                    const results = XLSX.utils.sheet_to_json(worksheet);
                    this.generateData({ header, results });
                    resolve();
                }
                this.loading = false;
                reader.readAsArrayBuffer(rawFile);
            })
        },
        fixData(data) {
            let o = '';
            let l = 0;
            const w = 10240;
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        },
        getHeaderRow(sheet) {
            const headers = [];
            const range = XLSX.utils.decode_range(sheet['!ref']);
            let C;
            const R = range.s.r;
            /* start in the first row */
            for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
                const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
                /* find the cell in the first row */
                let hdr = 'UNKNOWN ' + C;// <-- replace with your desired default
                if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
                headers.push(_.trim(hdr));
            }
            return headers;
        },
        isExcel(file) {
            return /\.(xlsx|xls|csv)$/.test(file.name);
        }
    }
}
</script>

<style lang="scss" scoped>
    .head-form{
        border-bottom: 1px solid #DDD;
        padding-bottom: 10px;
        margin-bottom: 15px;
        /deep/ .el-form{
            .el-form-item{
                padding:0;
                margin-bottom: 0;
            }
        }
    }
    #excel-upload-input{
        display: none;
        z-index: -9999;
    }
</style>

