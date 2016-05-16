// main.js
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./src/Components/App.vue";
import queslist from "./src/Components/QuestionnaireList";
import editques from "./src/Components/EditQuestionnaire";
import viewques from "./src/Components/ViewQuestionnaire";
import viewcharts from "./src/Components/ViewCharts"

// var Vue = require("vue");
// var VueRouter = require("vue-router");
// var App = require("./src/Components/App.vue");

Vue.config.debug = true;
Vue.use(VueRouter);
var router = new VueRouter();

// 每条路由规则应该映射到一个组件
router.map({
	"/":{
		component:queslist
	},
	"/editques/:qid":{
		name:"editques",
		component:editques
	},
	"/viewques/:qid":{
		name:"viewques",
		component:viewques
	},
	"/viewcharts/:qid":{
		name:"viewcharts",
		component:viewcharts
	}
});

router.start(App,"#app");