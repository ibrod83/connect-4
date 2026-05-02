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
        boardInstructions:
          "Use the column buttons or number keys 1 through {{columns}} to drop a piece.",
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
        columnFull: "Column {{column}} is full",
        columnUnavailable: "Column {{column}} is unavailable",
        dropColumn: "Drop in column {{column}}",
        dropAnimation: "Drop animation"
      },
      players: {
        red: "Red",
        yellow: "Yellow",
        you: "You",
        player1: "Player 1",
        player2: "Player 2",
        ai: "AI"
      },
      share: {
        title: "Share",
        inviteHeading: "Invite a friend",
        beatAi: "I beat the {{difficulty}} AI at 4 in a Row — can you?",
        invite: "Come play 4 in a Row",
        whatsapp: "Share on WhatsApp",
        x: "Share on X",
        telegram: "Share on Telegram",
        copy: "Copy link",
        copied: "Link copied"
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
        boardInstructions:
          "השתמש בכפתורי העמודות או במקשי המספרים 1 עד {{columns}} כדי להניח דיסקית.",
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
        columnFull: "עמודה {{column}} מלאה",
        columnUnavailable: "עמודה {{column}} אינה זמינה",
        dropColumn: "הנח בעמודה {{column}}",
        dropAnimation: "אנימציית נפילה"
      },
      players: {
        red: "אדום",
        yellow: "צהוב",
        you: "אתה",
        player1: "שחקן 1",
        player2: "שחקן 2",
        ai: "מחשב"
      },
      share: {
        title: "שיתוף",
        inviteHeading: "הזמינו חבר",
        beatAi: "ניצחתי את המחשב ברמה {{difficulty}} בארבע בשורה — תצליחו גם?",
        invite: "בואו לשחק ארבע בשורה",
        whatsapp: "שתף בוואטסאפ",
        x: "שתף ב-X",
        telegram: "שתף בטלגרם",
        copy: "העתק קישור",
        copied: "הקישור הועתק"
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
        boardInstructions:
          "ใช้ปุ่มคอลัมน์หรือปุ่มตัวเลข 1 ถึง {{columns}} เพื่อหย่อนหมาก",
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
        columnFull: "คอลัมน์ {{column}} เต็มแล้ว",
        columnUnavailable: "คอลัมน์ {{column}} ไม่พร้อมใช้งาน",
        dropColumn: "หย่อนในคอลัมน์ {{column}}",
        dropAnimation: "แอนิเมชันการหย่อน"
      },
      players: {
        red: "แดง",
        yellow: "เหลือง",
        you: "คุณ",
        player1: "ผู้เล่น 1",
        player2: "ผู้เล่น 2",
        ai: "AI"
      },
      share: {
        title: "แชร์",
        inviteHeading: "ชวนเพื่อนมาเล่น",
        beatAi: "ฉันเอาชนะ AI ระดับ{{difficulty}}ในเกมเรียงสี่ — คุณทำได้ไหม?",
        invite: "มาเล่นเรียงสี่กัน",
        whatsapp: "แชร์ผ่าน WhatsApp",
        x: "แชร์บน X",
        telegram: "แชร์บน Telegram",
        copy: "คัดลอกลิงก์",
        copied: "คัดลอกลิงก์แล้ว"
      }
    }
  }
} as const;
