# 物流任務局 · Logistics Quest

學生可用手機操作的物流英語學習遊戲，附完整教學資源。

**[開始遊戲](https://ij-teacher.github.io/logistics-vocabulary-game/)**

![遊戲 QR code](assets/game-qr.svg)

## 功能

- 五類 40 組中英詞彙，包含縮寫與簡單英文解釋。
- 翻卡學習、雙向詞彙選擇、英文定義、24 題實務情境題庫。
- 每回合最多 10 題，隨機選項、即時解說、錯題複習。
- 手機與桌面皆可使用；首頁 QR code 可下載、列印。
- 不需登入；學生可將姓名與成績提交至老師的私人試算表。

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

完成後按「提交姓名＋成績」可保存紀錄；重新整理會清除尚未提交的遊戲進度。


## 物流接接樂

[開始五大分類接物遊戲](https://ij-teacher.github.io/logistics-vocabulary-game/catch.html)：參考會計接接樂，把掉落的英文卡片移到正確分類。支援鍵盤、觸控、立即接住、固定每題8秒、暫停、固定20題（每類4題、所有同學同題同順序）及錯題重練。核心檢查：node verify-catch.cjs。專屬QR code：assets/catch-qr.svg。
