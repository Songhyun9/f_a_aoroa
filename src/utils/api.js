import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

export function fetchIssues(status) {
  const url = status ? `${BASE_URL}/issues?status=${status}` : `${BASE_URL}/issues`
  return axios.get(url).then((res) => res.data.issues)
}

export function fetchIssueById(id) {
  return axios.get(`${BASE_URL}/issue/${id}`).then((res) => res.data)
}

export function createIssue(payload) {
  return axios.post(`${BASE_URL}/issue`, payload).then((res) => res.data)
}

export function updateIssue(id, payload) {
  return axios.patch(`${BASE_URL}/issue/${id}`, payload).then((res) => res.data)
}
