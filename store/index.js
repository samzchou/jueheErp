
//import storage from 'good-storage';

export const state = () => ({
    //user: this.app.$storage.session.get('user')?this.app.$storage.session.get('user'):null,
    lang:'zh-cn',
    /* role : storage.session.get('data_role')?storage.session.get('data_role'):[],
    org:storage.session.get('data_org')?storage.session.get('data_org'):[],
    pos:storage.session.get('data_pos')?storage.session.get('data_pos'):[],
    storeNo:storage.session.get('data_storeNo')?storage.session.get('data_storeNo'):[],
    type:storage.session.get('data_type')?storage.session.get('data_type'):[],
    sex:[{id:1,name:'男'},{id:2,name:'女'}],
    flowState:storage.session.get('data_flowState')?storage.session.get('data_flowState'):[],
    payType:storage.session.get('data_payType')?storage.session.get('data_payType'):[],
    crm:storage.session.get('data_crm')?storage.session.get('data_crm'):[],
    userList:[],
    storeSource:[{id:1,name:'货品采购'},{id:2,name:'产品入库'},{id:3,name:'销售退货'}],
    storeTarget:[{id:1,name:'车间生产'},{id:2,name:'出厂销售'},{id:3,name:'报废售卖'}],
    // 入库结算状态
    storeInState:[{id:0,name:'--'},{id:1,name:'已入库'},{id:2,name:'已付款'}],
    // 出库结算状态
    storeOutState:[{id:0,name:'--'},{id:1,name:'已出库'},{id:2,name:'已收款'}] */
});

export const mutations = {
    UPDATE_USER(state, data) {
        state.user = data;
        console.log('UPDATE_USER', data);
        //this.app.$storage.session.set('user', data);
    },
    /* 
    UPDATE_CUSTOMER:(state, data)=>{
        state.customer = data;
    },
    UPDATE_LANG:(state, lang)=>{
        state.lang = lang;
    },
    UPDATE_DATA:(state, data)=>{
        this.app.$storage.session.set('data_'+data.name, data.list);
        state[data.name]= data.list;
    }, */
};

export const actions = {
	async nuxtServerInit ({ commit }, {req, app}) {
        let user = null;
        if (req.cookies.token) {
            user = await this.$axios.$post('mock/db', {
                data: { 
                    type: 'getData',
                    collectionName: 'user',
                    data:{
                        token:req.cookies.token
                    }
                }
            });
            commit('UPDATE_USER', user);
        }
    },
    INIT(state){
		if(!process.server){
			console.log('storage',this.$storage)  
		}
	},

};

export const getters = {
    /* setDataState : state => state.setData,
    enginerState : state => state.enginer,
    tagsViewState : state => state.tagsView, */
}
