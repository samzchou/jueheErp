/**
 * mongoDB数据处理后台接口
 */
const dbServer = require('../config/db/');
const mongoDB = require('../config/db/connect');
const mongoose = require('mongoose');
//const dbConfig = require('../config/db'); 
const crypto = require('crypto');
const _ = require('lodash');
const tokenPrefix = 'samz.com';
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');

const dbFun = {
    async initDB(){
        // 列出所有集合
        let cols = await mongoose.connection.db.collections();
        let colStrArr = [];
        for(let c of cols){
            colStrArr.push(c.s.name);
        }
        var keys = Object.keys(dbServer.collections);
        for(var i=0; i<keys.length; i++){
            let tn = keys[i];
            let counters =  await mongoDB.counters.findOne({'model':tn});
            if(!colStrArr.includes(tn) && !counters){ // 如果不存则创建集合
                //let res = await mongoose.connection.db.createCollection(tn);
                await mongoDB.counters.create({'model':tn, 'count':0});
            }
        }
        return {
            success:true
        }
    },
    /**
     * --------多表联合查询数据--------
     * aggregate:[
                    {
                        $lookup:{// 左连接
                            from: "orgs", // // 关联到的表
                            localField: "orgId", //主表关联的字段
                            foreignField: "id", //外联表关联的字段
                            as: "org" // 隐射到特定字段
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$org", //隐射的特定字段
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    }
                ]
     *  */
    async aggregate(params){
        const tn = params.collectionName;
        let condition = params.data || {};
        //console.log('aggregate',params.aggregate)
        let total = await mongoDB[tn].find(condition).countDocuments();
        let list = await mongoDB[tn].aggregate(params.aggregate);
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },

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
        let list = [];
        if(pagesize){
            list =  await mongoDB[tn].find(condition).sort(sortCondition).skip(skips).limit(pagesize);
        }else{
            list =  await mongoDB[tn].find(condition).sort(sortCondition);
        }
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },
    /*--------批量添加数据--------*/
    async addPatch(params){
        let tn = params.collectionName;
        let data = params.data;
        let result = mongoDB[tn].insertMany(data);
        //console.log('addPatch',result)
        let counters =  await mongoDB.counters.findOne({'model':tn});
        await mongoDB.counters.findOneAndUpdate({_id: counters._id}, {$inc:{count:data.length}});

        return {
            success:true,
            msgDesc:'数据导入成功',
            response:result
        }
    },
    /*--------添加数据--------*/
    async addData(params){
        let tn = params.collectionName;
        let data = params.data;
        if(data.password){
            data.password = this._setHash(data.password);
        }
        // 计数器
        let counters =  await mongoDB.counters.findOne({'model':tn});
        data.id = counters.count + 1;
        //console.log('addData', data);
        let result =  await mongoDB[tn].create(data);
        if(result){
            await mongoDB.counters.findOneAndUpdate({_id: counters._id}, {$inc:{count:1}});
        }
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
        if(params.updateDate){
            data.updateDate = new Date();
        }
        let update = {$set : data};
        let options = {upsert : true};
        let total = await mongoDB[tn].countDocuments(condition);
        let result = null;
        if(total){
            // updateMany
            result =  await mongoDB[tn].updateOne(condition, update, options);
        }
        return {
            success:result?true:false,
            msgDesc:result?'数据更新成功':'数据更新失败'
        }
    },
    /*--------获取数据最后的ID--------*/
    async getId(params){
        let result =  await mongoDB.counters.findOne(params.data);
        return {
            success:true,
            response:result.count
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
        let result =  await mongoDB[tn].findOne(data);
        if(result){
            result.token = token;
            this.updateData({collectionName:tn,data:result})
        }
        return {
            success:result?true:false,
            msgDesc:result?'':'登录失败',
            response:result
        }
    },
    async logout(){

    }
}

module.exports = ({data}) => {
    return new Promise((resolve, reject)=>{
        dbFun[data.type](data).then(result=>{
            resolve(result);
        });     
    });
}
