export const supportedLanguages = ["en", "he", "th"] as const;

export const resources = {
  en: {
    translation: {
      app: {
        title: "Connect 4"
      },
      language: {
        label: "Language"
      },
      setup: {
        title: "New game",
        gameMode: "Mode",
        vsAi: "Human vs AI",
        localPlayers: "Local players",
        redName: "Red player",
        yellowName: "Yellow player",
        aiName: "AI name",
        difficulty: "Difficulty",
        starter: "Starts",
        start: "Start game",
        redStarts: "Red",
        yellowStarts: "Yellow",
        randomStarts: "Random"
      },
      difficulty: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        very_hard: "Very hard"
      },
      game: {
        board: "Connect 4 board",
        turn: "{{player}} turn",
        aiThinking: "{{player}} thinking",
        winner: "{{player}} wins",
        draw: "Draw",
        starter: "Started: {{player}}",
        restart: "Restart",
        newGame: "New game",
        column: "Column {{column}}",
        dropColumn: "Drop in column {{column}}"
      },
      players: {
        red: "Red",
        yellow: "Yellow",
        ai: "AI"
      }
    }
  },
  he: {
    translation: {
      app: {
        title: "ארבע בשורה"
      },
      language: {
        label: "שפה"
      },
      setup: {
        title: "משחק חדש",
        gameMode: "מצב",
        vsAi: "שחקן מול מחשב",
        localPlayers: "שני שחקנים מקומיים",
        redName: "שחקן אדום",
        yellowName: "שחקן צהוב",
        aiName: "שם המחשב",
        difficulty: "רמה",
        starter: "מי מתחיל",
        start: "התחל משחק",
        redStarts: "אדום",
        yellowStarts: "צהוב",
        randomStarts: "אקראי"
      },
      difficulty: {
        easy: "קל",
        medium: "בינוני",
        hard: "קשה",
        very_hard: "קשה מאוד"
      },
      game: {
        board: "לוח ארבע בשורה",
        turn: "התור של {{player}}",
        aiThinking: "{{player}} חושב",
        winner: "{{player}} ניצח",
        draw: "תיקו",
        starter: "התחיל: {{player}}",
        restart: "התחל מחדש",
        newGame: "משחק חדש",
        column: "עמודה {{column}}",
        dropColumn: "הנח בעמודה {{column}}"
      },
      players: {
        red: "אדום",
        yellow: "צהוב",
        ai: "מחשב"
      }
    }
  },
  th: {
    translation: {
      app: {
        title: "เรียงสี่"
      },
      language: {
        label: "ภาษา"
      },
      setup: {
        title: "เกมใหม่",
        gameMode: "โหมด",
        vsAi: "ผู้เล่นปะทะ AI",
        localPlayers: "ผู้เล่นในเครื่อง",
        redName: "ผู้เล่นแดง",
        yellowName: "ผู้เล่นเหลือง",
        aiName: "ชื่อ AI",
        difficulty: "ระดับความยาก",
        starter: "เริ่มก่อน",
        start: "เริ่มเกม",
        redStarts: "แดง",
        yellowStarts: "เหลือง",
        randomStarts: "สุ่ม"
      },
      difficulty: {
        easy: "ง่าย",
        medium: "ปานกลาง",
        hard: "ยาก",
        very_hard: "ยากมาก"
      },
      game: {
        board: "กระดานเรียงสี่",
        turn: "ตาของ {{player}}",
        aiThinking: "{{player}} กำลังคิด",
        winner: "{{player}} ชนะ",
        draw: "เสมอ",
        starter: "เริ่มโดย: {{player}}",
        restart: "เริ่มใหม่",
        newGame: "เกมใหม่",
        column: "คอลัมน์ {{column}}",
        dropColumn: "หย่อนในคอลัมน์ {{column}}"
      },
      players: {
        red: "แดง",
        yellow: "เหลือง",
        ai: "AI"
      }
    }
  }
} as const;
