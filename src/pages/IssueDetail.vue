<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { issues as mockIssues } from '@/data/mockData'
import { fetchIssueById } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const issue = ref(null)
const VITE_MODE = import.meta.env.VITE_MODE

// 날짜 포맷 함수 (같은 함수 사용)
function formatDate(isoString) {
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 최종 상태인지 (완료/취소 상태는 수정 버튼 비활성화)
const isFinalStatus = computed(() => {
  if (!issue.value) return false
  return issue.value.status === 'COMPLETED' || issue.value.status === 'CANCELLED'
})

// 이슈 로드
async function loadIssue() {
  const id = Number(route.params.id)
  if (VITE_MODE === 'DEV') {
    const found = mockIssues.find((i) => i.id === id)
    if (found) {
      issue.value = { ...found }
    } else {
      alert('이슈를 찾을 수 없습니다.')
      router.push({ name: 'IssueList' })
    }
  } else {
    try {
      const data = await fetchIssueById(id)
      issue.value = data
    } catch {
      alert('이슈를 불러오지 못했습니다.')
      router.push({ name: 'IssueList' })
    }
  }
}

onMounted(loadIssue)
</script>

<template>
  <div class="container mx-auto p-4 max-w-lg">
    <h1 class="text-xl font-bold mb-4">이슈 상세</h1>
    <div v-if="issue" class="border rounded p-4 bg-white shadow">
      <p><strong>제목:</strong> {{ issue.title }}</p>
      <p class="mt-2"><strong>설명:</strong></p>
      <p class="ml-2">{{ issue.description }}</p>
      <p class="mt-2"><strong>상태:</strong> {{ issue.status }}</p>
      <p class="mt-2">
        <strong>담당자:</strong>
        {{ issue.user ? issue.user.name : '미할당' }}
      </p>
      <p class="mt-2"><strong>생성일:</strong> {{ formatDate(issue.createdAt) }}</p>
      <p class="mt-2"><strong>업데이트일:</strong> {{ formatDate(issue.updatedAt) }}</p>

      <div class="mt-6 flex justify-between">
        <router-link to="/issues">
          <button class="px-4 py-2 border rounded">목록으로</button>
        </router-link>
        <router-link :to="{ name: 'IssueEdit', params: { id: issue.id } }" v-if="!isFinalStatus">
          <button class="px-4 py-2 bg-yellow-500 text-white rounded">수정</button>
        </router-link>
      </div>
    </div>
    <div v-else>
      <p>이슈를 불러오는 중...</p>
    </div>
  </div>
</template>
