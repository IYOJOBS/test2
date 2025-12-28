console.log("render.js loaded")

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name)
}

const adminBtn = document.getElementById("btn-open-admin")

// 🔐 BJ 페이지에서는 관리자 버튼 무조건 숨김
if (getQueryParam("bj") && adminBtn) {
  adminBtn.style.display = "none"
}

function getCurrentBjData() {
if (!state.currentBj && getQueryParam("admin") !== "1")
  return state.bjData[state.currentBj]
}

function render() {
  const header = document.getElementById("header")
  const calendarBoard = document.getElementById("calendar-board")
  const bingoBoard = document.getElementById("bingo-board")
  const btnResetAll = document.getElementById("btn-reset-all")

  if (!header || !calendarBoard || !bingoBoard) return

// 🔴 BJ 선택 안 된 상태 (관리자 페이지 제외)
if (!state.currentBj && getQueryParam("admin") !== "1") {
  header.innerText = "BJ를 선택하세요"
  calendarBoard.style.display = "none"
  bingoBoard.style.display = "none"
  if (btnResetAll) btnResetAll.style.display = "none"
  return
}


  const bj = getCurrentBjData()
  if (!bj) return

  if (state.mode === "calendar") {
    calendarBoard.style.display = "block"
    bingoBoard.style.display = "none"
    if (btnResetAll) btnResetAll.style.display = "none"
    header.innerText = "달력 모드"
    calendarBoard.innerHTML = "<p style='text-align:center'>달력은 다음 단계</p>"
  } else {
    calendarBoard.style.display = "none"
    bingoBoard.style.display = "block"
    if (btnResetAll) btnResetAll.style.display = "inline-block"
    renderBingo(bingoBoard, header)
  }
}

function renderBingo(bingoBoard, header) {
  const bj = getCurrentBjData()
  if (!bj) return

  const indexEl = document.getElementById("bingo-index")
  if (indexEl) {
    indexEl.innerText = `${bj.currentBingoIndex + 1} / ${bj.bingoBoards.length}`
  }

  header.innerText = "빙고 모드"
  bingoBoard.innerHTML = ""

  const wrapper = document.createElement("div")
  wrapper.className = "bingo-bg-wrapper"

  if (bj.bingo.backgroundUrl) {
    wrapper.style.backgroundImage = `url(${bj.bingo.backgroundUrl})`
    wrapper.style.backgroundSize = "cover"
    wrapper.style.backgroundPosition = "center"
  }

  const grid = document.createElement("div")
  grid.id = "bingo-grid"
  grid.style.setProperty("--bingo-cols", bj.bingo.cols)

  const board = getCurrentBingo()
  if (!board) return

  const numbers = board.numbers || []
  const checked = board.checked || {}

  if (!board.missions || board.missions.length !== numbers.length) {
    board.missions = Array(numbers.length).fill("")
  }

  numbers.forEach((n, idx) => {
    const cell = document.createElement("div")
    cell.className = "bingo-cell"

    const num = document.createElement("div")
    num.className = "bingo-number"
    num.innerText = n
    num.style.color = bj.bingoStyle.numberColor
    num.style.fontSize = bj.bingoStyle.numberFontSize + "px"

    const mission = document.createElement("div")
    mission.className = "bingo-mission"
    mission.innerText = board.missions[idx] || ""
    mission.style.color = bj.bingoStyle.missionColor
    mission.style.fontSize = bj.bingoStyle.missionFontSize + "px"

    mission.onclick = e => {
      e.stopPropagation()
      const input = document.createElement("input")
      input.type = "text"
      input.value = board.missions[idx] || ""
      input.onblur = () => {
        board.missions[idx] = input.value
        saveState()
        render()
      }
      input.onkeydown = ev => {
        if (ev.key === "Enter") input.blur()
        if (ev.key === "Escape") render()
      }
      cell.appendChild(input)
      input.focus()
    }

    if (checked[idx]) {
      const stamp = document.createElement("div")
      stamp.className = "stamp"
      stamp.innerHTML = `<img src="stamp-kkosomi.png" style="width:${bj.bingoStyle.stampSize}px;">`
      cell.appendChild(stamp)
    }

    cell.onclick = () => {
      checked[idx] = !checked[idx]
      board.checked = checked
      saveState()
      render()
    }

    cell.appendChild(num)
    cell.appendChild(mission)
    grid.appendChild(cell)
  })

  wrapper.appendChild(grid)
  bingoBoard.appendChild(wrapper)
}

setTimeout(render, 0)

function getCurrentBingo() {
  const bj = getCurrentBjData()
  if (!bj) return null

  if (!bj.bingoBoards || !bj.bingoBoards.length) {
    bj.bingoBoards = [{
      numbers: [],
      missions: [],
      checked: {}
    }]
    bj.currentBingoIndex = 0
  }

  return bj.bingoBoards[bj.currentBingoIndex]
}
