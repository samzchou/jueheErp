/**
 * mongoDB数据处理后台接口
 */

const mongoDB = require('../config/db/connect');
const dbConfig = require('../config/db'); 
const crypto = require('crypto');
const _ = require('lodash');
const tokenPrefix = 'samz.com';
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');

const dbFun = {
    /*--------列出数据--------*/
    async listData(params){
        const tn = params.collectionName;
        let condition = params.data || {};
		let sortCondition = {};
		let sortby = params.sortby ? params.sortby : '_id';
		let ascby = params.ascby ? params.ascby : 1;
        var page = params.page ? parseInt(params.page)-1 : 0;
        var pagesize = params.pagesize ? parseInt(params.pagesize) : 0;
        var skips = page * pagesize;
        sortCondition[sortby] = ascby;

        let total = await mongoDB[tn].find(condition).countDocuments();
        let list =  await mongoDB[tn].find(condition).sort(sortCondition).skip(skips).limit(pagesize);
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },
    /*--------添加数据--------*/
    async addData(params){
        let tn = params.collectionName;
        let data = params.data;
        let result =  await mongoDB[tn].create(data);
        return {
            success:true,
            msgDesc:'数据添加成功',
            response:result
        }
    },
    /*--------更新数据--------*/
    async updateData(params){
        let tn = params.collectionName;
        let data = params.data;
        let condition = {id:data.id};
        let update = {$set : data};
        let options = {upsert : true};
        let total = await mongoDB[tn].count(condition);
        let result = null;
        if(total){
            result =  await mongoDB[tn].update(condition, update, options);
        }
        return {
            success:result?true:false,
            msgDesc:result?'数据更新成功':'数据更新失败'
        }
    },
    /*--------获取单条数据--------*/
    async getData(params){
        let tn = params.collectionName;
        let data = params.data;
        let result =  await mongoDB[tn].findOne(data);
        return {
            success:result?true:false,
            msgDesc:result?null:'获取数据失败',
            response:result
        }
    },
    /*--------删除数据--------*/
    async removeData(params){
        let tn = params.collectionName;
        let data = params.data;
        let result =  await mongoDB[tn].remove(data);
        return {
            success:result['n']==1?true:false,
            msgDesc:result['n']==1?null:'删除数据失败'
        }
    },
    async captcha(params){
        //console.log('captcha', params)
        let captcha = svgCaptcha.create({ 
            inverse: false, 
            color:true,
            background: '#cc9966',
            fontSize: 36, 
            noise: 2, 
            width: 90, 
            height: 36, 
        }); 
        return {
            success:true,
            msgDesc:'',
            response:{svg:captcha.data,text:captcha.text}
        }
    },
    _setHash(str){
        var hash = crypto.createHash("md5");
        hash.update(new Buffer(str, "binary"));
        str = hash.digest('hex');
        return str;
    },
    async login(params){
        let tn = params.collectionName;
        let data = params.data;
        let content = {'name':data.username}; // 要生成token的主题信息
        let token = jwt.sign(content, tokenPrefix, {
            expiresIn: 60*60*1  // 1小时过期
        });
        if(data.password){
            data.password = this._setHash(data.password);
        }
        console.log('login condisti', data);

        let result =  await mongoDB[tn].findOne(data);

        console.log('login',result)
    },
    async logout(){

    }

}

module.exports = ({data}) => {
    return new Promise((resolve, reject)=>{
        dbFun[data.type](data).then(result=>{
            //console.log('result',result);
            resolve(result);
        });     
    });
}
