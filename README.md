# 物流任務局 · Logistics Quest

學生可用手機操作的物流英語學習遊戲，附完整教學資源。

**[開始遊戲](https://ij-teacher.github.io/logistics-vocabulary-game/)**

![遊戲 QR code](assets/game-qr.svg)

## 功能

- 五類 40 組中英詞彙，包含縮寫與簡單英文解釋。
- 翻卡學習、雙向詞彙選擇、英文定義、24 題實務情境題庫。
- 每回合最多 10 題，隨機選項、即時解說、錯題複習。
- 手機與桌面皆可使用；首頁 QR code 可下載、列印。
- 不需登入、不收集學生資料。

## 教學資源

- [中英詞彙表 CSV](resources/vocabulary.csv)
- [詞彙與情境題庫](resources/vocabulary.js)
- [教師指南](resources/teacher-guide.md)
- [用語註解與參考來源](resources/sources.md)
- [QR code](assets/game-qr.svg)

## 本機使用與部署

直接開啟 index.html 即可使用，無須安裝套件。或執行 `python -m http.server 8000`。

GitHub Pages：Settings → Pages → Deploy from a branch → main → / (root)。

內容檢查：`node verify.cjs`。更新詞彙後：`python build_resources.py`。QR code 是固定遊戲網址的本機 SVG，學生不需連接第三方 QR code 服務。

成績不持久保存；重新整理會開始新的一次練習。
