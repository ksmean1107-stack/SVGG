export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // URL에서 글자 받아오기 (줄바꿈은 %0A)
  const text1 = url.searchParams.get("text1") ?? "Text 1"
  const text2 = url.searchParams.get("text2") ?? ""
  const text3 = url.searchParams.get("text3") ?? ""

  // 배경 이미지 고정
  const bgUrl = "https://i.ibb.co/dscFT01L/IMG-4459.png"

  // 텍스트 색상 고정
  const color1 = "#ffffff"
  const color2 = "#e6f7ff"
  const color3 = "#dddddd"

  // 외부 이미지 Base64 변환 (앱/모바일 호환)
  let bgBase64 = ""
  try {
    const fetchRes = await fetch(bgUrl)
    const buffer = await fetchRes.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ""
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const sub = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, sub)
    }
    bgBase64 = "data:" + fetchRes.headers.get("content-type") + ";base64," + btoa(binary)
  } catch (e) {
    console.log("이미지 로딩 실패:", e)
  }

  // SVG 생성
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">
  <image href="${bgBase64}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
  ${renderMultilineText(text1, "50%", 90, 42, color1, 36)}
  ${renderMultilineText(text2, "50%", 150, 32, color2, 24)}
  ${renderMultilineText(text3, "50%", 210, 26, color3, 18)}
</svg>
`

  res.setHeader("Content-Type", "image/svg+xml")
  res.setHeader("Cache-Control", "no-cache")
  res.status(200).send(svg)
}

// 여러 줄 텍스트 렌더링
function renderMultilineText(text, x, startY, lineHeight, color, fontSize) {
  const lines = decodeURIComponent(text).split("\n")
  return `
    <text x="${x}" y="${startY}" text-anchor="middle" fill="${color}" font-size="${fontSize}" font-family="sans-serif">
      ${lines.map((line,i)=>`<tspan x="${x}" dy="${i===0?0:lineHeight}">${escapeXML(line)}</tspan>`).join("")}
    </text>
  `
}

// XML 이스케이프
function escapeXML(str) {
  return str.replace(/[<>&'"]/g, c => ({
    "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;"
  }[c]))
}
