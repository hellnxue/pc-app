import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/login-apple',
    name: 'LoginApple',
    component: () => import('../views/LoginApple.vue')
  },
  {
    path: '/login-cursor',
    name: 'LoginCursor',
    component: () => import('../views/LoginCursor.vue')
  },
  {
    path: '/info-add',
    name: 'InfoAdd',
    component: () => import('../views/InfoAdd.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  // 新增：添加测试人员列表页面的路由
  {
    path: '/test-person-list',
    name: 'TestPersonList',
    component: () => import('../views/TestPersonList.vue')
  },
  {
    path: '/strategyList',
    name: 'StrategyList',
    component: () => import('../views/StrategyList.vue')
  },
  {
    path: '/futuresPersonnelList',
    name: 'FuturesPersonnelList',
    component: () => import('../views/FuturesPersonnelList.vue')
  }
];

const router = new VueRouter({
  routes
})

export default router