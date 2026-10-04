// 테스트가 쓰는 가짜 값과 가짜 파일.
//
// 저장소에 바이너리를 커밋하지 않는다. 전부 실행할 때 만든다.
// 메일 주소·도메인도 전부 테스트 전용이며 실존하지 않는다
// (.test 는 RFC 2606이 테스트용으로 비워 둔 TLD다).

/* ---------------- 가짜 도메인·주소 ---------------- */

// 하네스의 ALLOWED_ORIGIN과 테스트가 보내는 Origin이 같은 값을 써야 한다.
const SITE_ORIGIN = "https://www.saegyeol.test";
const SITE_ORIGIN_ALT = "https://saegyeol.test";

// 서버가 From에 쓰는 보내는 주소(= 운영의 SMTP_USER 자리)
const MAIL_FROM = "noreply@saegyeol.test";

// 공격자가 "우리 쪽 사람인 척" 쓰는 주소. 도메인만 우리 것처럼 보이면 된다.
const SPOOFED_INTERNAL = "ceo@saegyeol.test";

// 바깥 공격자
const ATTACKER = "attacker@evil.example";

// 평범한 제출자
const VISITOR = "visitor@example.test";

/* ---------------- 가짜 파일 ---------------- */

// 확장자·MIME과 내용이 어긋나는지 보는 용도. 실행 파일이 아니다.
//
// "MZ"는 DOS 실행 파일의 머리 두 글자다. 서버의 판별기는 앞 4바이트만
// 보므로 그 이상은 필요 없다. PE 헤더도, 진입점도, 코드도 없어서
// 어떤 환경에서도 실행되지 않는다. 바이러스 백신이 잡을 만한 서명도 없다.
const fakeExecutable = () => Buffer.from([0x4d, 0x5a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

// 진짜 PNG·PDF의 머리 부분만. 역시 내용은 비어 있다.
const fakePng = () => Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32),
]);
const fakePdf = () => Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(32)]);

// 허용되지 않는 형식(.svg) 거부를 보는 용도.
// 서버는 확장자·MIME 단계에서 막으므로 내용은 아무것도 아니어도 된다.
// 실제로 동작하는 스크립트를 저장소에 두지 않으려고 무해한 문자열만 쓴다.
const inertSvg = () => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');

/* ---------------- 최소 ZIP 빌더 ---------------- */
// docx/pptx 판별이 [Content_Types].xml 과 word/ · ppt/ 를 보는지 확인한다.
// 압축 없이(stored) 넣으므로 외부 의존성이 없다.

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const data = Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data, "utf8");
    const crc = crc32(data);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 8);          // method = stored
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26);
    locals.push(lh, name, data);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);

    offset += lh.length + name.length + data.length;
  }

  const central = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(central.length, 12);
  eocd.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, central, eocd]);
}

const CT = '<?xml version="1.0"?><Types/>';
const fakeDocx = () => buildZip([
  { name: "[Content_Types].xml", data: CT },
  { name: "word/document.xml", data: "<w:document/>" },
]);
const fakePptx = () => buildZip([
  { name: "[Content_Types].xml", data: CT },
  { name: "ppt/presentation.xml", data: "<p:presentation/>" },
]);
// 이름만 .docx인 맨 zip — OPC 구조가 없으므로 거부되어야 한다
const fakePlainZip = () => buildZip([{ name: "readme.txt", data: "hello" }]);
// xlsx 구조 — 축소안에서 허용하지 않는 종류
const fakeXlsxLike = () => buildZip([
  { name: "[Content_Types].xml", data: CT },
  { name: "xl/workbook.xml", data: "<workbook/>" },
]);

module.exports = {
  SITE_ORIGIN, SITE_ORIGIN_ALT, MAIL_FROM, SPOOFED_INTERNAL, ATTACKER, VISITOR,
  fakeExecutable, fakePng, fakePdf, inertSvg,
  buildZip, fakeDocx, fakePptx, fakePlainZip, fakeXlsxLike,
};
