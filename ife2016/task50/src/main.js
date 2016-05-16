// main.js
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./Components/App.vue";
import queslist from "./Components/QuestionnaireList";
import editques from "./Components/EditQuestionnaire";
import viewques from "./Components/ViewQuestionnaire";
import viewcharts from "./Components/ViewCharts";

// Vue.config.debug = true;
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

router.beforeEach(function () {
  window.scrollTo(0, 0)
});

router.start(App,"#app");
