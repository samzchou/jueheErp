const dbConfig = require('./files/dbConfig.json');
module.exports = {
	// 服务器环境
	env:{
		server_url: 'http://localhost',
		HOST: '0.0.0.0',
		PORT: 2222,
	},
	// 远程数据接口
	apiUrl:{
		valueSet:'api/dict/getValueSetByDictId',
		dataSource:'api/dashboard/getDataSources',
		dataFields:'api/dashboard/getDataSourceFields'
	},
	dbConect:{
		"dataUrl":"127.0.0.1",
		"dataPort":"27017",
		"dataName":"test",
		"username":"",
		"password":""
	}
}