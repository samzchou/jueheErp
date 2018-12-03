/**
 * eslint-disable
 * eachrt组件类型
 */
export default {
    "public":{
        "title":{
			"text":"图表示例",
			"textStyle":{
				"fontSize":14,
				},
			"subtext":"",
			"x":"left",
			"y":"top"
		},
        "span":8,
        "cheight":300,
		"padding":["15","15","15","15"],
		"legend": {
			"type":"scroll",
			"orient":"horizontal",
			"x":"center",
			"y":"bottom"
		},
        "tooltip":{// 提示框组件
            "trigger": "item"
        },
        "toolbox":{// 工具栏.导出图片
            "feature" : {
                "saveAsImage" : {"show": true}
            }
        },
        "color":["#7179cb","#4dceff","#8dd06a","#ffb65d","#fc7255","#ac92ec","#7fdcff","#5bdb95","#fdde7b","#fa5f93","#5d90f7"],
        "xAxis":{// 直角坐标系 grid 中的 x 轴
            "type":"category",
            "data":[]
        },
        "yAxis": {// 直角坐标系 grid 中的 y 轴
            "type":"value"
        },
		"grid":{
			"top":"15%",
			"right":"15%",
			"bottom":"15%",
			"left":"15%",
			"containLabel": true
		},
		"dataZoom":{
			"show":false
		},
		"export":true
    },
    "line":{
        "standard":{ // 标准折线
            "componentName":"标准折线图示例",
			"legendData":["支出","收入"],
            "xAxis":{
                "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            "yAxis" : [
                {
                    "type" : "value"
                }
            ],
            "series":  [
                {
                    "name":"收入",
                    "type":"line",
                    "data":[110, 110, 150, 130, 120, 130, 100]
                },
                {
                    "name":"支出",
                    "type":"line",
                    "data":[10, 30, 40, 50, 30, 20, 10]
                }
            ],
			"seriesParams":{
				"average":false,
				"areaStyle":false
			}
        }
    },
    "bar":{
        "standard":{
            "componentName":"标准柱状图示例",
			"legendData":["支出","收入"],
            "xAxis":[
                {
                    "data" : ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
                    "axisTick": {
                        "alignWithLabel": true
                    }
                }
            ],
            "series" : [
                {
					"name":"支出",
					"type":"bar",
					"data":[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
					"markLine" : {
						"data" : [
							{"type" : "average", "name": "平均值"}
						]
					}
                },
				{
					"name":"收入",
					"type":"bar",
					"data":[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
					"markLine" : {
						"data" : [
							{"type" : "average", "name" : "平均值"}
						]
					}
				}
            ],
			"seriesParams":{
				"average":true,
				"labelshow":false
			}
        },
		"plus":{
            "componentName":"正负条形图示例",
			"legendData":["利润", "支出", "收入"],
			"yAxis" : [
				{
					"type" : "category",
					"axisTick" : {"show": false},
					"data" : ["周一","周二","周三","周四","周五","周六","周日"]
				}
			],
            "xAxis" : [
				{
					"type" : "value"
				}
			],
            "series" : [
                {
					"name":"利润",
					"type":"bar",
					"label": {
						"normal": {
							"show": true,
							"position": "inside"
						}
					},
					"data":[200, 170, 240, 244, 200, 220, 210]
				},
				{
					"name":"收入",
					"type":"bar",
					"stack": "总量",
					"label": {
						"normal": {
							"show": true
						}
					},
					"data":[320, 302, 341, 374, 390, 450, 420]
				},
				{
					"name":"支出",
					"type":"bar",
					"stack": "总量",
					"label": {
						"normal": {
							"show": true,
							"position": "left"
						}
					},
					"data":[-120, -132, -101, -134, -190, -230, -210]
				}
            ],
			"seriesParams":{
				"average":true,
				"labelshow":true
			}
        }
    }


}