<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { issues as mockIssues, users as mockUsers } from '@/data/mockData'
import { fetchIssueById, createIssue, updateIssue } from '@/utils/api'

const route = useRoute()
const router = useRouter()

const VITE_MODE = import.meta.env.VITE_MODE
const isEdit = Boolean(route.params.id)

// 사용자 목록
const users = ref([])

// 폼 데이터 초기화
const form = reactive({
  title: '',
  description: '',
  userId: null, // 숫자 또는 null
  status: 'PENDING',
})

// 최종 상태(완료/취소)인지
const isStatusFinal = computed(() => {
  return form.status === 'COMPLETED' || form.status === 'CANCELLED'
})

// 상태 변경 가능 여부
const canEditStatus = computed(() => {
  // 담당자가 지정되지 않았다면 PENDING만 가능
  if (!form.userId) {
    return form.status === 'PENDING'
  }
  // 담당자가 있으면 모든 상태 변경 가능
  return true
})

// 사용자 목록 로드 (Mock 또는 API)
function loadUsers() {
  if (VITE_MODE === 'DEV') {
    users.value = mockUsers
  } else {
    // 실제 API로 가져오는 로직이 없다면, mockUsers로 대체 가능
    users.value = mockUsers
  }
}

// 편집 모드라면 기존 이슈 데이터를 불러와 form에 채움
async function loadIssueForEdit() {
  if (!isEdit) return

  if (VITE_MODE === 'DEV') {
    const found = mockIssues.find((i) => i.id === Number(route.params.id))
    if (found) {
      form.title = found.title
      form.description = found.description
      form.userId = found.user ? found.user.id : null
      form.status = found.status
    }
  } else {
    try {
      const data = await fetchIssueById(route.params.id)
      form.title = data.title
      form.description = data.description
      form.userId = data.user ? data.user.id : null
      form.status = data.status
    } catch (e) {
      console.error(e)
      alert('이슈를 불러오지 못했습니다.')
      router.push({ name: 'IssueList' })
    }
  }
}

// 제출 핸들러
async function handleSubmit() {
  // 비즈니스 로직: 이슈 생성 시 userId가 없으면 상태는 PENDING, 있으면 IN_PROGRESS
  const payload = {
    title: form.title,
    description: form.description,
  }

  if (form.userId) {
    payload.userId = form.userId
    // 수정인 경우, 상태를 사용자가 지정한 상태로 넘겨줌
    payload.status = form.status
  } else {
    if (!isEdit) {
      payload.status = 'PENDING'
    } else {
      // 수정 모드에서 담당자 없는 상태라면 status는 무조건 PENDING
      payload.status = 'PENDING'
    }
  }

  if (isEdit) {
    // PATCH /issue/:id
    if (VITE_MODE === 'DEV') {
      // Mock 수정: 간단하게 배열에서 찾아서 바꿔치기
      const idx = mockIssues.findIndex((i) => i.id === Number(route.params.id))
      if (idx !== -1) {
        mockIssues[idx] = {
          ...mockIssues[idx],
          title: form.title,
          description: form.description,
          status: payload.status,
          user: form.userId ? users.value.find((u) => u.id === form.userId) : null,
          updatedAt: new Date().toISOString(),
        }
        alert('이슈가 수정되었습니다.')
        router.push({ name: 'IssueDetail', params: { id: route.params.id } })
      }
    } else {
      try {
        await updateIssue(route.params.id, payload)
        alert('이슈가 수정되었습니다.')
        router.push({ name: 'IssueDetail', params: { id: route.params.id } })
      } catch {
        alert('수정 중 오류가 발생했습니다.')
      }
    }
  } else {
    // POST /issue
    if (VITE_MODE === 'DEV') {
      // Mock 생성: id 채번
      const newId = Math.max(...mockIssues.map((i) => i.id)) + 1
      const newIssue = {
        id: newId,
        title: form.title,
        description: form.description,
        status: payload.status || 'PENDING',
        user: form.userId ? users.value.find((u) => u.id === form.userId) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockIssues.push(newIssue)
      alert('이슈가 생성되었습니다.')
      router.push({ name: 'IssueList' })
    } else {
      try {
        await createIssue(payload)
        alert('이슈가 생성되었습니다.')
        router.push({ name: 'IssueList' })
      } catch {
        alert('생성 중 오류가 발생했습니다.')
      }
    }
  }
}

onMounted(() => {
  loadUsers()
  if (isEdit) loadIssueForEdit()
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-lg">
    <h1 class="text-xl font-bold mb-4">
      {{ isEdit ? '이슈 수정' : '새 이슈 생성' }}
    </h1>

    <form @submit.prevent="handleSubmit">
      <!-- 제목 -->
      <div class="mb-3">
        <label class="block mb-1">제목</label>
        <input v-model="form.title" type="text" class="w-full border px-2 py-1 rounded" required />
      </div>

      <!-- 설명 -->
      <div class="mb-3">
        <label class="block mb-1">설명</label>
        <textarea
          v-model="form.description"
          class="w-full border px-2 py-1 rounded"
          rows="4"
        ></textarea>
      </div>

      <!-- 담당자 -->
      <div class="mb-3">
        <label class="block mb-1">담당자</label>
        <select
          v-model="form.userId"
          class="w-full border px-2 py-1 rounded"
          :disabled="isStatusFinal"
        >
          <option :value="null">미할당</option>
          <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>

      <!-- 상태 -->
      <div class="mb-3">
        <label class="block mb-1">상태</label>
        <select
          v-model="form.status"
          class="w-full border px-2 py-1 rounded"
          :disabled="!canEditStatus"
        >
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <!-- 버튼 -->
      <div class="flex justify-between mt-6">
        <router-link to="/issues">
          <button type="button" class="px-4 py-2 border rounded">목록으로</button>
        </router-link>
        <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">
          {{ isEdit ? '저장' : '생성' }}
        </button>
      </div>
    </form>
  </div>
</template>
