function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name)
}

function getCurrentBjData() {
  if (!state.currentBj) return null
  return state.bjData[state.currentBj]
}

function getCurrentBingo() {
  if (!state.currentBj) return null

  const bj = state.bjData[state.currentBj]
  if (!bj) return null

  if (!bj.bingoBoards || !bj.bingoBoards.length) {
    bj.bingoBoards = [{
      numbers: [],
      missions: [],
      checked: {}
    }]
    bj.currentBingoIndex = 0
  }

  if (bj.currentBingoIndex == null) {
    bj.currentBingoIndex = 0
  }

  return bj.bingoBoards[bj.currentBingoIndex]
}

console.log("mission.js loaded")

/* ===== DOM ===== */
const bingoCols = document.getElementById("bingo-cols")
const bingoRows = document.getElementById("bingo-rows")
const bingoBgUrl = document.getElementById("bingo-bg-url")

const btnCalendar = document.getElementById("btn-calendar")
const btnBingo = document.getElementById("btn-bingo")
const btnSettings = document.getElementById("btn-settings")

const overlay = document.getElementById("settings-overlay")
const modal = document.getElementById("settings-modal")

const calendarSettings = document.getElementById("calendar-settings")
const bingoSettings = document.getElementById("bingo-settings")

/* ===== 관리자 ===== */
const btnOpenAdmin = document.getElementById("btn-open-admin")
const adminOverlay = document.getElementById("admin-overlay")
const adminPanel = document.getElementById("admin-panel")
const adminPwInput = document.getElementById("admin-password")
const adminLoginBtn = document.getElementById("btn-admin-login")
const adminCloseBtn = document.getElementById("btn-admin-close")

/* BJ */
const btnAddBj = document.getElementById("btn-add-bj")
const bjConfigList = document.getElementById("bj-config-list")

/* ===== 빙고 프리뷰 ===== */
const bingoPreviewGrid = document.getElementById("bingo-preview-grid")

/* ===== 스타일 ===== */
const numColor = document.getElementById("bingo-number-color")
const numSize = document.getElementById("bingo-number-size")
const missionColor = document.getElementById("bingo-mission-color")
const missionSize = document.getElementById("bingo-mission-size")
const stampSize = document.getElementById("bingo-stamp-size")

const btnSettingsSave = document.getElementById("settings-save")
const btnSettingsClose = document.getElementById("settings-close")

/* ===== 상태 초기화 ===== */
if (state.isAdmin == null) state.isAdmin = false
if (!state.bjList) state.bjList = []
if (!state.bjData) state.bjData = {}

/* ===== 관리자 UI ===== */
/* FIX 1: admin 페이지에서만 관리자 버튼/패널이 보이도록 강제 */
function updateAdminUI() {
  const isAdminPage = getQueryParam("admin") === "1"

  // BJ 페이지
  if (!isAdminPage) {
    btnOpenAdmin.style.display = "none"
    adminPanel.style.display = "none"
    adminOverlay.style.display = "none"
    return
  }

  // 관리자 페이지 + 로그인 전
  if (!state.isAdmin) {
    btnOpenAdmin.style.display = "none"
    adminPanel.style.display = "none"
    adminOverlay.style.display = "flex"
    return
  }

  // 관리자 페이지 + 로그인 후
  btnOpenAdmin.style.display = "inline-block"
  adminPanel.style.display = "block"
  adminOverlay.style.display = "none"
}


  // 🔑 로그인 전에는 로그인 모달 유지
  if (getQueryParam("admin") === "1" && adminOverlay) {
    adminOverlay.style.display = "flex"
  }

/* ===== 관리자 설정 버튼 → 로그인 모달 ===== */
/* FIX 2: admin 페이지일 때만 로그인 모달 열리게 */
if (btnOpenAdmin && adminOverlay) {
  btnOpenAdmin.onclick = () => {
    const isAdminPage = getQueryParam("admin") === "1"
    if (!isAdminPage) return
    adminOverlay.style.display = "flex"
  }
}

/* ===== 관리자 로그인 ===== */
/* FIX 3: 비번 성공해야만 state.isAdmin true */
if (adminLoginBtn) {
  adminLoginBtn.onclick = () => {
    const isAdminPage = getQueryParam("admin") === "1"
    if (!isAdminPage) {
      alert("관리자 페이지에서만 로그인 가능합니다")
      return
    }

    if (adminPwInput.value === "1234") {
      state.isAdmin = true
      saveState()

      adminOverlay.style.display = "none"
      adminPwInput.value = ""

      updateAdminUI()
      renderBjList()
      render()

      alert("관리자 로그인 성공")
    } else {
      alert("비밀번호 틀림")
    }
  }
}

/* ===== 관리자 로그인 닫기 ===== */
if (adminCloseBtn) {
  adminCloseBtn.onclick = () => {
    adminOverlay.style.display = "none"
  }
}

if (adminOverlay) {
  adminOverlay.onclick = e => {
    // 🔒 관리자 로그인 중이면 닫히지 않게
    if (getQueryParam("admin") === "1" && !state.isAdmin) return

    if (e.target === adminOverlay) {
      adminOverlay.style.display = "none"
    }
  }
}

/* ===== BJ 리스트 ===== */
/* FIX 4: 링크복사 버튼이 renderBjList 밖에 있던 문제 해결 (스코프 정상화) */
function renderBjList() {
  if (!bjConfigList) return
  bjConfigList.innerHTML = ""

  state.bjList.forEach((bjId, index) => {
    const row = document.createElement("div")
    row.className = "bj-row"

    const span = document.createElement("span")
    span.textContent = bjId

    const delBtn = document.createElement("button")
    delBtn.textContent = "삭제"
    delBtn.onclick = () => {
      if (!state.isAdmin) {
        alert("관리자 로그인 후 사용 가능합니다")
        return
      }

      state.bjList.splice(index, 1)
      delete state.bjData[bjId]
      saveState()
      renderBjList()
    }

    // ✅ 링크 복사 (관리자만)
    const linkBtn = document.createElement("button")
    linkBtn.textContent = "링크 복사"
    linkBtn.onclick = () => {
      if (!state.isAdmin) {
        alert("관리자 로그인 후 사용 가능합니다")
        return
      }
      const url = `${location.origin}${location.pathname}?bj=${bjId}`
      navigator.clipboard.writeText(url)
      alert("BJ 전용 링크 복사됨")
    }

    row.appendChild(span)
    row.appendChild(delBtn)

    // 관리자만 링크복사 버튼 노출
    if (state.isAdmin) row.appendChild(linkBtn)

    bjConfigList.appendChild(row)
  })
}

/* ===== BJ 추가 (관리자만 가능) ===== */
if (btnAddBj) {
  btnAddBj.onclick = () => {
    if (!state.isAdmin) {
      alert("관리자 로그인 후 사용 가능합니다")
      return
    }

    const bjId = prompt("BJ 아이디 입력")
    if (!bjId) return
    if (state.bjList.includes(bjId)) {
      alert("이미 추가된 BJ입니다")
      return
    }

    state.bjList.push(bjId)

    // bjData 기본값 없으면 생성
    if (!state.bjData[bjId]) {
      state.bjData[bjId] = createDefaultBjData()
    }

    saveState()
    renderBjList()
  }
}

/* ===== 설정 열기 ===== */
if (btnSettings) {
  btnSettings.onclick = () => {
    const bj = getCurrentBjData()
    if (!bj) {
      alert("BJ를 먼저 선택하세요")
      return
    }

    calendarSettings.style.display = "none"
    bingoSettings.style.display = "none"

    // 설정 열릴 때 BJ 패널은 항상 숨김
if (adminPanel && !state.isAdmin) {
  adminPanel.style.display = "none"
}

    bingoCols.value = bj.bingo.cols
    bingoRows.value = bj.bingo.rows
    bingoBgUrl.value = bj.bingo.backgroundUrl
    stampSize.value = bj.bingoStyle.stampSize

    bingoSettings.style.display = "block"
    numColor.value = bj.bingoStyle.numberColor
    numSize.value = bj.bingoStyle.numberFontSize
    missionColor.value = bj.bingoStyle.missionColor
    missionSize.value = bj.bingoStyle.missionFontSize

    renderBingoPreview()
    updateAdminUI()
    overlay.style.display = "flex"
  }
}

/* ===== 설정 닫기 ===== */
if (btnSettingsClose) {
  btnSettingsClose.onclick = () => overlay.style.display = "none"
}

if (overlay) {
  overlay.onclick = e => {
    if (e.target === overlay) overlay.style.display = "none"
  }
}

if (modal) {
  modal.onclick = e => e.stopPropagation()
}

/* ===== 설정 저장 (BJ 기준) ===== */
if (btnSettingsSave) {
  btnSettingsSave.onclick = () => {
    const bj = getCurrentBjData()
    if (!bj) return

    bj.bingo.cols = Number(bingoCols.value)
    bj.bingo.rows = Number(bingoRows.value)
    bj.bingo.backgroundUrl = bingoBgUrl.value

    bj.bingoStyle.numberColor = numColor.value
    bj.bingoStyle.numberFontSize = Number(numSize.value)
    bj.bingoStyle.missionColor = missionColor.value
    bj.bingoStyle.missionFontSize = Number(missionSize.value)
    bj.bingoStyle.stampSize = Number(stampSize.value)

    const total = bj.bingo.cols * bj.bingo.rows
    const board = getCurrentBingo()
    if (!board) return

    while (board.numbers.length < total) board.numbers.push("")
    board.numbers = board.numbers.slice(0, total)

    // missions 길이도 맞춰주기
    if (!board.missions) board.missions = []
    while (board.missions.length < total) board.missions.push("")
    board.missions = board.missions.slice(0, total)

    saveState()
    overlay.style.display = "none"
    render()
  }
}

/* ===== 빙고 프리뷰 ===== */
function renderBingoPreview() {
  if (!bingoPreviewGrid) return

  const bj = getCurrentBjData()
  const board = getCurrentBingo()
  if (!bj || !board) return

  bingoPreviewGrid.innerHTML = ""
  bingoPreviewGrid.style.gridTemplateColumns =
    `repeat(${bj.bingo.cols}, 1fr)`

  board.numbers.forEach((num, idx) => {
    const cell = document.createElement("div")
    cell.className = "bingo-preview-cell"
    cell.textContent = num || ""

    cell.onclick = () => {
      cell.innerHTML = ""
      const input = document.createElement("input")
      input.type = "number"
      input.value = num || ""

      input.onblur = () => {
        board.numbers[idx] = input.value
        saveState()
        renderBingoPreview()
        render()
      }

      input.onkeydown = e => {
        if (e.key === "Enter") input.blur()
      }

      cell.appendChild(input)
      input.focus()
    }

    bingoPreviewGrid.appendChild(cell)
  })
}

/* =========================
   BJ 기준 빙고 네비 버튼
   ========================= */
const btnPrevBingo = document.getElementById("btn-prev-bingo")
if (btnPrevBingo) {
  btnPrevBingo.onclick = () => {
    const bj = getCurrentBjData()
    if (!bj) return
    if (bj.currentBingoIndex > 0) {
      bj.currentBingoIndex--
      saveState()
      render()
    }
  }
}

const btnNextBingo = document.getElementById("btn-next-bingo")
if (btnNextBingo) {
  btnNextBingo.onclick = () => {
    const bj = getCurrentBjData()
    if (!bj) return

    const cur = getCurrentBingo()
    if (!cur) return

    bj.bingoBoards.push({
      numbers: [...cur.numbers],
      missions: [...(cur.missions || [])],
      checked: {}
    })

    bj.currentBingoIndex = bj.bingoBoards.length - 1
    saveState()
    render()
  }
}

const btnResetBingo = document.getElementById("btn-reset-bingo")
if (btnResetBingo) {
  btnResetBingo.onclick = () => {
    const board = getCurrentBingo()
    if (!board) return
    board.checked = {}
    saveState()
    render()
  }
}

const btnResetAll = document.getElementById("btn-reset-all")
if (btnResetAll) {
  btnResetAll.onclick = () => {
    const bj = getCurrentBjData()
    if (!bj) return

    const ok = confirm("현재 BJ의 모든 빙고를 초기화할까요?")
    if (!ok) return

    bj.bingoBoards = [{
      numbers: [],
      missions: [],
      checked: {}
    }]
    bj.currentBingoIndex = 0

    saveState()
    render()
  }
}

/* ===== 최초 로딩 ===== */
/* FIX 5: admin=1 만으로 isAdmin true 하지 않음 (비번 필수) */
window.addEventListener("load", () => {
  const adminFlag = getQueryParam("admin")
  const bjId = getQueryParam("bj")
// 🔐 관리자 페이지면 로그인 모달 자동 표시
if (getQueryParam("admin") === "1" && !state.isAdmin) {
  if (adminOverlay) {
    adminOverlay.style.display = "flex"
  }
}
  // 관리자 페이지 진입
  if (adminFlag === "1") {
    state.currentBj = null
    state.isAdmin = false
    saveState()
  }

  // BJ 페이지 진입
  if (bjId) {
    state.currentBj = bjId
    state.isAdmin = false

    if (!state.bjData[bjId]) {
      state.bjData[bjId] = createDefaultBjData()
    }

    saveState()
  }

  updateAdminUI()
  renderBjList()
  if (state.currentBj) {
  render()
}

})

/* ===== 아래에 있던 중복/충돌 코드들은 삭제 대신 “무력화” 처리 ===== */
/* (삭제 금지 조건 때문에 남겨두되 실행되지 않게만 처리) */
if (false) {
  if (btnOpenAdmin) {
    btnOpenAdmin.onclick = () => {
      if (!state.isAdmin) {
        alert("관리자만 접근 가능합니다")
        return
      }
      adminOverlay.style.display = "flex"
    }
  }

  if (adminCloseBtn) {
    adminCloseBtn.onclick = () => {
      adminOverlay.style.display = "none"
    }
  }

  if (getQueryParam("bj")) {
    state.isAdmin = false
  }

  const adminBtn = document.getElementById("btn-open-admin")
  if (getQueryParam("bj")) {
    state.isAdmin = false
    if (adminBtn) adminBtn.style.display = "none"
  }
}

