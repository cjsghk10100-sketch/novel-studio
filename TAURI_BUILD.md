# Novel Studio - Tauri 데스크톱 앱 빌드 가이드

## 사전 요구사항

### 1. Rust 설치
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Tauri CLI 설치
```bash
cargo install tauri-cli --version "^2.0"
```

### 3. 시스템 의존성

**macOS:**
```bash
xcode-select --install
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

**Windows:**
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 설치
- [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) 설치

### 4. Node.js 의존성
```bash
cd frontend
npm install
cd ..
```

## 개발 모드 실행

```bash
cd src-tauri
cargo tauri dev
```

이 명령은:
1. `frontend/`에서 Vite 개발 서버를 실행합니다
2. Tauri 데스크톱 창을 열어 개발 서버에 연결합니다
3. 코드 변경 시 핫 리로드가 작동합니다

## 프로덕션 빌드

```bash
cd src-tauri
cargo tauri build
```

빌드 결과물:
- **macOS**: `src-tauri/target/release/bundle/dmg/Novel Studio_0.1.0_aarch64.dmg`
- **Windows**: `src-tauri/target/release/bundle/nsis/Novel Studio_0.1.0_x64-setup.exe`
- **Linux**: `src-tauri/target/release/bundle/deb/novel-studio_0.1.0_amd64.deb`

## 프로젝트 구조

```
novel-studio/
├── frontend/          # React + Vite SPA (기존 웹 앱)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src-tauri/         # Tauri 데스크톱 래퍼
│   ├── src/
│   │   └── main.rs    # Rust 진입점
│   ├── Cargo.toml     # Rust 의존성
│   ├── tauri.conf.json # Tauri 설정
│   └── build.rs
├── package.json       # 루트 스크립트
└── TAURI_BUILD.md     # 이 문서
```

## 앱 아이콘 생성

1024x1024 PNG 아이콘을 준비한 후:
```bash
cargo tauri icon path/to/app-icon.png
```

이 명령이 `src-tauri/icons/` 폴더에 모든 플랫폼용 아이콘을 자동 생성합니다.

## 번들 크기

- **macOS .dmg**: ~3-5MB
- **Windows .exe**: ~3-5MB
- **Linux .deb**: ~3-5MB

Electron (~150MB) 대비 매우 가벼운 번들 크기입니다.

## 데이터 저장

Novel Studio는 **localStorage** 기반으로 데이터를 저장합니다.
Tauri 앱에서도 동일하게 동작하며, 데이터는 시스템 WebView의 localStorage에 영속됩니다.

저장 위치:
- **macOS**: `~/Library/WebKit/com.novelstudio.app/`
- **Windows**: `%APPDATA%/com.novelstudio.app/`
- **Linux**: `~/.local/share/com.novelstudio.app/`
