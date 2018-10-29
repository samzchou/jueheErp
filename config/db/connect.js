const dbServer = require('./index');
const mongoose = require('mongoose');
// 连接数据库
var myUri = 'mongodb://'+dbServer.dbConect.dataUrl+':'+dbServer.dbConect.dataPort+'/'+dbServer.dbConect.dataName;
if(dbServer.dbConect.username && dbServer.dbConect.password){
    myUri = myUri = 'mongodb://'+dbServer.dbConect.username+':'+dbServer.dbConect.password+'@'+dbServer.dbConect.dataUrl+':'+dbServer.dbConect.dataPort+'/'+dbServer.dbConect.dataName;
}
const optionsMongoose = {
    useNewUrlParser: true
}; 

mongoose.Promise = Promise;
mongoose.connect(myUri, optionsMongoose);

// 为这次连接绑定事件
const connect = mongoose.connection;
connect.once('error', (err) => console.log('Mongo connection error', myUri, err));
connect.once('open', () => console.log('Mongo connection successed', myUri));

/**cnpm install mongoose@5.2.8 --save 需要此版本 否则会有警告*/
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connect);
var Schema = mongoose.Schema;

/*----------图表列表数据-----------*/
var userScheme = new Schema(dbServer.collections.user);
userScheme.plugin(autoIncrement.plugin, {               //自增ID配置
    model: 'user',
    field: 'id',
    startAt: 2,
    incrementBy: 1
});
exports.user = connect.model('user', userScheme);


exports.connect = connect;
