<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { issues as mockIssues } from '@/data/mockData'
import { fetchIssues } from '@/utils/api'

const statusFilter = ref('')
const issues = ref([])
const router = useRouter()

const VITE_MODE = import.meta.env.VITE_MODE

function formatDate(isoString) {
  const date = new Date(isoString)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function loadIssues() {
  if (VITE_MODE === 'DEV') {
    if (!statusFilter.value) {
      issues.value = mockIssues
    } else {
      issues.value = mockIssues.filter((i) => i.status === statusFilter.value)
    }
  } else {
    try {
      const data = await fetchIssues(statusFilter.value || undefined)
      issues.value = data
    } catch {
      issues.value = []
    }
  }
}

function goToDetail(id) {
  router.push({ name: 'IssueDetail', params: { id } })
}

onMounted(loadIssues)
watch(statusFilter, loadIssues)
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">이슈 목록</h1>
      <router-link to="/issues/new">
        <button class="px-4 py-2 bg-blue-500 text-white rounded">새 이슈 생성</button>
      </router-link>
    </div>

    <!-- 상태별 필터링 -->
    <div class="mb-4">
      <select v-model="statusFilter" class="border px-2 py-1 rounded">
        <option value="">전체</option>
        <option value="PENDING">PENDING</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
    </div>

    <!-- 이슈 목록 -->
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">제목</th>
          <th class="border px-2 py-1">상태</th>
          <th class="border px-2 py-1">담당자</th>
          <th class="border px-2 py-1">생성일</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="issue in issues"
          :key="issue.id"
          class="hover:bg-gray-50 cursor-pointer"
          @click="goToDetail(issue.id)"
        >
          <td class="border px-2 py-1">{{ issue.title }}</td>
          <td class="border px-2 py-1">{{ issue.status }}</td>
          <td class="border px-2 py-1">{{ issue.user ? issue.user.name : '-' }}</td>
          <td class="border px-2 py-1">{{ formatDate(issue.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
