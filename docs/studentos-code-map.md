# อ่านโค้ด StudentOS เทียบกับสิ่งที่เรียน

เริ่มจาก [calendar-code-guide.md](calendar-code-guide.md) ถ้าต้องอธิบายงาน Calendar ที่สร้างและย้ายนัดหมาย

| เนื้อหาในสไลด์ | ตัวอย่างในโปรเจกต์ |
| --- | --- |
| Week 1–2: HTML และ CSS | JSX ใน `src/pages/` แสดงโครงหน้า ส่วน `src/styles/` กำหนดหน้าตา |
| Week 4–5: JavaScript | `filter`, `map`, เงื่อนไข และฟังก์ชันในหน้าต่าง ๆ ใช้เลือกข้อมูลที่จะแสดง |
| Week 6–7: เหตุการณ์จากผู้ใช้และ DOM | `onClick`, `onSubmit`, `onDragStart`, `onDrop` ใน React รับการกดฟอร์มและการลากรายการ |
| Week 8: Asynchronous JavaScript และ API | ข้อมูลบัญชีถูกอ่านและบันทึกแบบ asynchronous ใน `src/services/workspace.js` ผ่าน Firebase SDK; โปรเจกต์นี้ไม่ได้ใช้ตัวอย่าง `fetch` จากสไลด์ |
| Week 9: Node.js และ npm | `package.json` มีคำสั่งรันและ build; โฟลเดอร์ `server/` เป็นส่วนของระบบแอปที่เพิ่มมาภายหลัง |
| Week 10: React, JSX, components, props | `CalendarPage` ส่งวันและรายการให้ `CalendarMonth` ผ่าน props |
| Week 11: state และ context | `useState` เก็บสถานะหน้าที่เปิดอยู่; `useWorkspace()` อ่านข้อมูลร่วมกันจาก `WorkspaceContext` |
| Week 12: useEffect และ Firebase | `WorkspaceContext` โหลดข้อมูลบัญชีและบันทึกการเปลี่ยนแปลงผ่าน Firebase |
| Week 13: React Router | `src/routes/AppRoutes.jsx` เลือกว่าพาธไหนแสดงหน้าใด |

## หน้าที่ของไฟล์หลัก

- `src/pages/`: หน้าเต็ม เช่น Calendar, Today, Tasks, Courses, Finance และ Notes แต่ละหน้าควรอ่านจาก **ข้อมูลที่ใช้ → ข้อมูลที่กรอง/คำนวณ → ฟังก์ชันรับการกด → JSX ที่แสดงผล**
- `src/components/`: ส่วนหน้าจอที่หน้าต่าง ๆ เรียกใช้ซ้ำ เช่น `CalendarMonth`, `PlanSection`, `TodayClasses` และ `BudgetSummary`
- `src/components/AssistantWidget.jsx`: ตัวละคร Kaito เป็นฟีเจอร์ต่อยอด ไม่เกี่ยวกับเงื่อนไขงาน Calendar
- `src/context/WorkspaceContext.jsx`: จุดรวมข้อมูลและคำสั่งเพิ่ม/แก้/ลบ; มีส่วนการบันทึกบัญชีที่ซับซ้อนกว่างาน Calendar พื้นฐาน
- `src/services/workspace.js`: ติดต่อ Firestore เพื่ออ่านและบันทึกข้อมูลบัญชี

Week 7 ในสไลด์กำหนดฟอร์ม appointment ที่มี Date, Time, Title, Description แล้วแสดงในปฏิทินรายเดือน ส่วน Week 8 ให้ใช้ API สร้างมุมมองปฏิทิน โปรเจกต์ปัจจุบันใช้ React และ Firebase ตามเนื้อหาช่วงหลัง และมีความสามารถย้ายนัดหมายเพิ่มตามโจทย์ที่ได้รับ

ถ้าอธิบายต่ออาจารย์ ให้เริ่มจากงาน Calendar ก่อน: `EventEditor` รับข้อมูล, `saveEvent` บันทึก, `CalendarMonth` แสดงแต่ละวัน, `moveEvent` เปลี่ยนวันที่ ฟีเจอร์อื่นเป็นสิ่งที่ออกแบบเพื่อพัฒนา StudentOS ต่อ
