import { createRouter, createWebHistory } from 'vue-router'
import IssueList from '@/pages/IssueList.vue'
import IssueForm from '@/pages/IssueForm.vue'
import IssueDetail from '@/pages/IssueDetail.vue'

const routes = [
  { path: '/', redirect: '/issues' },
  {
    path: '/issues',
    name: 'IssueList',
    component: IssueList,
  },
  {
    path: '/issues/new',
    name: 'IssueCreate',
    component: IssueForm,
    props: { isEdit: false },
  },
  {
    path: '/issues/:id',
    name: 'IssueDetail',
    component: IssueDetail,
    props: true,
  },
  {
    path: '/issues/:id/edit',
    name: 'IssueEdit',
    component: IssueForm,
    props: (route) => ({ isEdit: true, id: Number(route.params.id) }),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
