export const supportedLanguages = ["en", "he", "th"] as const;

export const resources = {
  en: {
    translation: {
      app: {
        title: "4 in a Row"
      },
      language: {
        label: "Language"
      },
      setup: {
        title: "New game",
        yourColor: "Your color",
        difficulty: "Difficulty",
        starter: "Starts",
        start: "Start game",
        redStarts: "Red",
        yellowStarts: "Yellow",
        randomStarts: "Random",
        humanStarts: "Human",
        aiStarts: "AI",
        veryHardAiStartsNote:
          "On Very Hard, when the AI starts, it is virtually unbeatable."
      },
      difficulty: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        very_hard: "Very hard"
      },
      game: {
        board: "4 in a Row board",
        turn: "{{player}}'s turn",
        yourTurn: "Your turn",
        aiThinking: "{{player}} is thinking",
        winner: "{{player}} wins",
        youWin: "You win",
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
        you: "You",
        player1: "Player 1",
        player2: "Player 2",
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
        yourColor: "הצבע שלך",
        difficulty: "רמה",
        starter: "מי מתחיל",
        start: "התחל משחק",
        redStarts: "אדום",
        yellowStarts: "צהוב",
        randomStarts: "אקראי",
        humanStarts: "שחקן",
        aiStarts: "מחשב",
        veryHardAiStartsNote:
          "ברמה קשה מאוד, כשהמחשב מתחיל, הוא כמעט בלתי ניתן להבסה."
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
        yourTurn: "התור שלך",
        aiThinking: "{{player}} חושב",
        winner: "{{player}} ניצח",
        youWin: "ניצחת",
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
        you: "אתה",
        player1: "שחקן 1",
        player2: "שחקן 2",
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
        yourColor: "สีของคุณ",
        difficulty: "ระดับความยาก",
        starter: "เริ่มก่อน",
        start: "เริ่มเกม",
        redStarts: "แดง",
        yellowStarts: "เหลือง",
        randomStarts: "สุ่ม",
        humanStarts: "ผู้เล่น",
        aiStarts: "AI",
        veryHardAiStartsNote:
          "ในระดับยากมาก เมื่อ AI เริ่มก่อน จะแทบเอาชนะไม่ได้"
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
        yourTurn: "ตาของคุณ",
        aiThinking: "{{player}} กำลังคิด",
        winner: "{{player}} ชนะ",
        youWin: "คุณชนะ",
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
        you: "คุณ",
        player1: "ผู้เล่น 1",
        player2: "ผู้เล่น 2",
        ai: "AI"
      }
    }
  }
} as const;
