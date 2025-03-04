import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * 不需要权限的基础路由
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  {
    path: '/content',
    component: Layout,
    redirect: '/content/announcement',
    name: 'ContentGeneration',
    meta: { title: '内容生成', icon: 'el-icon-document' },
    children: [
      {
        path: 'announcement',
        component: () => import('@/views/content/announcement'),
        name: 'Announcement',
        meta: { title: '日常公告生成', icon: 'el-icon-bell' }
      },
      {
        path: 'meeting',
        component: () => import('@/views/content/meeting'),
        name: 'MeetingMinutes',
        meta: { title: '会议纪要生成', icon: 'el-icon-notebook-1' }
      },
      {
        path: 'promotion',
        component: () => import('@/views/content/promotion'),
        name: 'Promotion',
        meta: { title: '宣传文案与海报', icon: 'el-icon-picture-outline' }
      }
    ]
  },
  {
    path: '/image',
    component: Layout,
    redirect: '/image/generation',
    name: 'ImageProcessing',
    meta: { title: '图像处理', icon: 'el-icon-picture' },
    children: [
      {
        path: 'generation',
        component: () => import('@/views/image/generation'),
        name: 'ImageGeneration',
        meta: { title: '图像生成', icon: 'el-icon-magic-stick' }
      }
    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    redirect: '/knowledge/base',
    name: 'KnowledgeCenter',
    meta: { title: '知识中心', icon: 'el-icon-collection' },
    children: [
      {
        path: 'base',
        component: () => import('@/views/knowledge/base'),
        name: 'KnowledgeBase',
        meta: { title: '知识库管理', icon: 'el-icon-folder' }
      },
      {
        path: 'qa',
        component: () => import('@/views/knowledge/qa'),
        name: 'CustomerService',
        meta: { title: '客户服务问答', icon: 'el-icon-chat-line-round' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    name: 'SystemManagement',
    meta: { title: '系统管理', icon: 'el-icon-setting', roles: ['admin'] },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user'),
        name: 'UserManagement',
        meta: { title: '用户角色管理', icon: 'el-icon-user' }
      },
      {
        path: 'audit',
        component: () => import('@/views/system/audit'),
        name: 'ContentAudit',
        meta: { title: '内容审核', icon: 'el-icon-view' }
      },
      {
        path: 'monitor',
        component: () => import('@/views/system/monitor'),
        name: 'SystemMonitor',
        meta: { title: '系统监控', icon: 'el-icon-monitor' }
      },
      {
        path: 'log',
        component: () => import('@/views/system/log'),
        name: 'LogManagement',
        meta: { title: '日志管理', icon: 'el-icon-document-copy' }
      }
    ]
  },
  // 404 页必须放在最后
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
