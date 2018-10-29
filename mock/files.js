const Mock = require('mockjs');
const fs = require("fs");
const mongoose = require('mongoose');

const filedFun = {
    dbConnect(params, callback){
        var condition = params.data;
        var myUri = 'mongodb://'+condition.dataUrl+':'+condition.dataPort+'/'+condition.dataName;;
        if(condition.username && condition.password){
            myUri = myUri = 'mongodb://'+condition.username+':'+condition.password+'@'+condition.dataUrl+':'+condition.dataPort+'/'+condition.dataName;
        }
        const optionsMongoose = {
            poolSize: 10, 
            bufferMaxEntries: 0,
            connectTimeoutMS: 3000, 
            socketTimeoutMS: 4000,
            family: 4,
            useNewUrlParser: true
        }; 
        mongoose.connect(myUri, optionsMongoose, (error, res)=>{
            if(error){
                callback && callback({success:false,msgDesc:'mongoDB数据库连接失败',response:false});
            }else{
                callback && callback({success:true,msgDesc:'mongoDB数据库连接成功',response:true});
            }
        });
    },
    getPath(path){
        return './'+path;
    },
    // 判断文件是否存在
    existsFile(path){
        try{
            fs.accessSync(path,fs.F_OK);
        }catch(e){
            return false;
        };
        return true;
    },
    // 读取文件
    readFile(params){
        let path = this.getPath(params.path);
		if(this.existsFile(path) === false){
			return  {
				success:false,
				msgDesc:'文件不存在'
			};
		}
        try{
            let file = fs.readFileSync(params.path,'utf-8');
			return {
				success:true,
				response:file
			};
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件读取失败'
			};
        };
    },
    // 写入文件
    writeFile(params){
        let path = this.getPath(params.path);
		if(this.existsFile(path) === false && !params.create){
			return  {
				success:false,
				msgDesc:'文件不存在'
			};
        }
        
        try{
			fs.writeFileSync(path, params.data);
			return  {
				success:true,
				msgDesc:'文件写入成功'
			};
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件写入失败'
			};
        };
    },
    // 删除文件
    removeFile(params){
        let path = this.getPath(params.path);
		if(this.existsFile(path) === false){
			return  {
				success:false,
				msgDesc:'文件不存在'
			};
        }
        try{
            fs.unlinkSync(path)
            return {
                success:true,
				msgDesc:'文件删除成功'
            };
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件删除错误！'
			};
        };
    },
};

module.exports = ({data}) => {
    return new Promise(function (resolve, reject) {
        //let result = filedFun[data.type](data);
        if(data.type === 'dbConnect'){
            filedFun[data.type](data, (result)=>{
                resolve(result);
            })
        }else{
            let result = filedFun[data.type](data);
            resolve(result);
        }
        
    });
}
