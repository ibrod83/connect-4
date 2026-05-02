import { useEffect } from "react";
import { Link } from "react-router-dom";
import { applyDocumentLanguage } from "../i18n";

const PAGE_TITLE = "הצהרת נגישות - ארבע בשורה";

export function AccessibilityPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    applyDocumentLanguage("he");
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="mx-auto box-border w-full max-w-[760px] px-4 pt-6 pb-10">
      <Link
        to="/"
        className="mb-4 inline-block font-bold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
      >
        חזרה למשחק
      </Link>

      <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2.25rem]">
          הצהרת נגישות
        </h1>
        <p className="mt-4 text-[0.95rem] text-zinc-600">עודכן לאחרונה: 02.05.2026</p>

        <p className="mt-4 text-base leading-[1.75]">
          אתר "ארבע בשורה" הוא משחק דפדפן חינמי. אנו פועלים כדי שהמשחק יהיה נגיש
          ונוח לשימוש עבור אנשים עם מוגבלות, בהתאם לעקרונות תקן הנגישות הישראלי
          ת"י 5568 ולהנחיות WCAG ברמת AA.
        </p>

        <h2 className="mt-7 text-lg font-semibold">התאמות שבוצעו באתר</h2>
        <ul className="mt-2 list-disc space-y-1 ps-6 text-base leading-[1.75]">
          <li>ניתן להפעיל את פעולות המשחק המרכזיות באמצעות מקלדת.</li>
          <li>עמודות הלוח חשופות ככפתורים נגישים לטכנולוגיות מסייעות.</li>
          <li>מצב המשחק, כולל תור וניצחון, נמסר באזור חי לקוראי מסך.</li>
          <li>האתר תומך בעברית ובכיוון תצוגה מימין לשמאל.</li>
          <li>לוח המשחק עצמו נשאר בכיוון שמאל לימין כדי לשמור על מיפוי עמודות עקבי.</li>
          <li>קיימת תמיכה בהעדפת הפחתת תנועה באנימציות המרכזיות.</li>
          <li>שופרו ניגודיות סימוני מיקוד וגבולות סמני צבע.</li>
        </ul>

        <h2 className="mt-7 text-lg font-semibold">התאמות שעדיין בבדיקה</h2>
        <ul className="mt-2 list-disc space-y-1 ps-6 text-base leading-[1.75]">
          <li>בדיקת שימוש ידנית מלאה באמצעות מקלדת בלבד.</li>
          <li>בדיקה עם קוראי מסך נפוצים.</li>
          <li>בדיקת תצוגה במסכים קטנים ובהגדלת תצוגה של 200%.</li>
          <li>בדיקה נוספת של ניגודיות רכיבי המשחק במצבי תצוגה שונים.</li>
        </ul>

        <h2 className="mt-7 text-lg font-semibold">הערה</h2>
        <p className="mt-2 text-base leading-[1.75]">
          בשלב זה הצהרה זו אינה כוללת פרטי יצירת קשר. הפרטים יתווספו בהמשך כאשר
          ייקבע ערוץ פנייה מתאים.
        </p>
      </article>
    </main>
  );
}
