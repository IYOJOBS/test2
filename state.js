window.state = {
  isAdmin: false,

  // BJ 목록
  bjList: [],

  // 현재 선택된 BJ
  currentBj: null,

  // BJ별 데이터 저장소
  bjData: {}
}

/* ===== BJ 데이터 기본값 생성 ===== */
function createDefaultBjData() {
  return {
    bingo: {
      cols: 3,
      rows: 3,
      backgroundUrl: ""
    },

    bingoStyle: {
      numberFontSize: 28,
      numberColor: "#111111",
      missionFontSize: 16,
      missionColor: "#333333",
      stampSize: 70
    },

    bingoBoards: [
      {
        numbers: [10, 10, 20, 20, 30, 40, 100, 100, 100],
        missions: ["", "", "", "", "", "", "", "", ""],
        checked: {}
      }
    ],

    currentBingoIndex: 0
  }
}

/* ===== 저장 ===== */
function saveState() {
  localStorage.setItem("soop_mission_state", JSON.stringify(state))
}

/* ===== 불러오기 ===== */
function loadState() {
  const saved = localStorage.getItem("soop_mission_state")
  if (!saved) return

  const parsed = JSON.parse(saved)
  Object.assign(state, parsed)
}

/* ===== BJ 추가 ===== */
function addBj(bjId) {
  if (state.bjList.includes(bjId)) return

  state.bjList.push(bjId)
  state.bjData[bjId] = createDefaultBjData()

  // 첫 BJ면 자동 선택
  if (!state.currentBj) {
    state.currentBj = bjId
  }

  saveState()
}

/* ===== BJ 삭제 ===== */
function removeBj(bjId) {
  state.bjList = state.bjList.filter(id => id !== bjId)
  delete state.bjData[bjId]

  if (state.currentBj === bjId) {
    state.currentBj = state.bjList[0] || null
  }

  saveState()
}

/* ===== 현재 BJ 데이터 ===== */
function getCurrentBjData() {
  if (!state.currentBj) return null
  return state.bjData[state.currentBj]
}

/* ===== 현재 빙고 ===== */
function getCurrentBingo() {
  const bj = getCurrentBjData()
  if (!bj) return null
  return bj.bingoBoards[bj.currentBingoIndex]
}

/* ===== 초기 로딩 ===== */
window.addEventListener("load", () => {
  loadState()

  // 기존 데이터에 bjData 없을 경우 대비
  state.bjList.forEach(bjId => {
    if (!state.bjData[bjId]) {
      state.bjData[bjId] = createDefaultBjData()
    }
  })
})
