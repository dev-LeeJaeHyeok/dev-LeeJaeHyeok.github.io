# 이재혁 · Backend Engineer Portfolio

스위스 타이포그래피 스타일 기반의 원페이지 개발자 포트폴리오.

## 파일 구조

```
portfolio/
├── index.html          구조
├── style.css           스타일 (색·폰트는 :root 변수로 관리)
├── data.js             프로젝트·스킬 모달 내용  ← 주로 수정할 파일
├── script.js           모달·TOC·모바일 메뉴
└── assets/
    ├── img/
    │   ├── profile.jpg       프로필 사진 (정사각형 권장, 400×400)
    │   ├── project-1~3.jpg   프로젝트 썸네일 (가로형, 600×400)
    │   ├── arch-legacy.svg   레거시 아키텍처 (직접 제작)
    │   └── arch-nextgen.svg  차세대 아키텍처 (직접 제작)
    └── docs/
        └── resume.pdf        이력서
```

## GitHub Pages 배포

1. `{username}.github.io` 이름으로 저장소를 만듭니다.
2. 이 폴더의 파일을 전부 올립니다.
3. Settings → Pages → Source를 `main` 브랜치 `/ (root)`로 지정합니다.
4. 몇 분 뒤 `https://{username}.github.io` 로 접속됩니다.

## 수정 가이드

### 연락처
`index.html`의 CONTACT 섹션에서 `your@email.com`, `github.com/yourid`를 바꿉니다.

### 프로젝트·스킬 내용
`data.js`만 수정하면 됩니다. HTML은 건드릴 필요가 없습니다.

### 아키텍처 다이어그램 넣기
`data.js`에서 `img: null`을 파일 경로로 바꿉니다.

```js
asis: {
  img: "assets/img/arch-legacy.svg",   // null → 경로
  placeholder: "...",
  caption: "..."
}
```

### 색상 변경
`style.css` 최상단 `:root`에서:

| 변수 | 용도 | 현재 값 |
|---|---|---|
| `--bg` | 배경 | `#0d0e10` |
| `--accent` | 포인트 | `#6b93c4` |
| `--text` | 본문 | `#f0f2f5` |

## 이미지가 없을 때

`profile.jpg`, `project-*.jpg`가 없으면 자동으로 플레이스홀더가 표시됩니다.
파일을 넣으면 바로 반영됩니다.

## 기술 로고 넣기

다이어그램에 Spring·Redis 등 공식 로고를 쓰려면
각 프로젝트 브랜드 페이지나 [Simple Icons](https://simpleicons.org)에서
SVG를 받아 `assets/img/`에 두고 다이어그램에서 참조합니다.
