function connectDonationSocket(bjId, bingoIndex) {
  const url = `ws://103.244.118.3:24107?platformId=afreeca&bjId=${bjId}`
  const ws = new WebSocket(url)

  ws.onopen = () => {
    console.log(`✅ 별풍 WebSocket 연결됨 : ${bjId} → 빙고 ${bingoIndex + 1}`)
  }

  ws.onmessage = e => {
    try {
      const data = JSON.parse(e.data)
      console.log("별풍 수신", bjId, data)

      // ⚠️ 실제 별풍 개수 필드명은 상황별 대응
      const count =
        data?.donationCnt ??
        data?.count ??
        data?.balloon ??
        data?.amount

      if (count != null) {
        // ✅ BJ별 지정된 빙고판에만 자동 체크
        autoCheckByNumberForBingo(count, bingoIndex)
      }
    } catch (err) {
      console.warn("메시지 파싱 실패", e.data)
    }
  }

  ws.onerror = err => {
    console.error("❌ WebSocket 오류", bjId, err)
  }

  ws.onclose = () => {
    console.warn(`🔌 WebSocket 종료 (${bjId}), 5초 후 재연결`)
    setTimeout(() => {
      connectDonationSocket(bjId, bingoIndex)
    }, 5000)
  }

  return ws
}
