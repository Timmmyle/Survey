// ============================================================
// surveyData_v2.ts — VÒNG KIỂM CHỨNG
// 5 phiếu, semantic differential 1-5 scale
// ============================================================

// ---------------------------------------------------------------------------
// Local interface definitions (mirrors ../types additions)
// ---------------------------------------------------------------------------
export interface V2Question {
  id: string;
  text: string;
  type: 'semantic' | 'open' | 'recognition';
  lowLabel?: string;
  highLabel?: string;
  hasNote?: boolean;
  images?: string[];
  notaApply?: boolean;   // show "Không đủ cơ sở đánh giá" option
  options?: string[];    // for recognition multiple-choice
}

export interface V2PhieuConfig {
  phieuId: string;
  groupCode: string;
  name: string;
  estimatedMinutes: string;
  specialistNote: string;
  questions: V2Question[];
  partCOpen?: V2Question;
  interviewQuestions?: V2Question[];
  requiresImageViewer?: boolean;
  allImagesForViewer?: string[];
}

// ---------------------------------------------------------------------------
// 1. THESIS METADATA
// ---------------------------------------------------------------------------
export const V2_THESIS_METADATA = {
  websiteTitle: "VÒNG KIỂM CHỨNG: BẢNG HỎI VÀ PHỎNG VẤN ĐÁNH GIÁ BỘ NHẬN DIỆN THƯƠNG HIỆU",
  websiteTitleEn: "VALIDATION ROUND: QUESTIONNAIRE AND INTERVIEW FOR BRAND IDENTITY EVALUATION",
  headerTitle: "PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA KHẢO SÁT/PHỎNG VẤN — VÒNG KIỂM CHỨNG",
  headerTitleEn: "INFORMATION AND CONSENT FORM — VALIDATION ROUND",
  thesisName: "\u201cỨng dụng hình tượng Lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam\u201d",
  thesisNameEn: "\u201cApplying the Lion (Lan) Image in Nguyen Dynasty Fine Arts to the Design of the Brand Identity for the Vietnam Lion and Dragon Dance Federation\u201d",
  studentName: "Phạm Nguyễn Vân Anh",
  studentNameEn: "Pham Nguyen Van Anh",
  institution: "Trường Đại học Văn Lang",
  institutionEn: "Van Lang University",
  university: "Trường Đại học Văn Lang",
  title: "Ứng dụng hình tượng lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam",
  subtitle: "VÒNG KIỂM CHỨNG: BẢNG HỎI VÀ PHỎNG VẤN ĐÁNH GIÁ BỘ NHẬN DIỆN THƯƠNG HIỆU",
  researcher: "Phạm Nguyễn Vân Anh",
  advisors: "Khoa Mỹ thuật & Thiết kế",
  major: "Mỹ thuật ứng dụng",
  contact: {
    email: "anhpnv3@fe.edu.vn",
    phone: "0931343497",
  },
  instructions: [
    "Kính mời Ông/Bà tham gia vòng kiểm chứng (vòng 2) phục vụ luận văn cao học về thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam. Ở vòng này, chúng tôi trình bày bộ nhận diện đề xuất và mong nhận được đánh giá cụ thể của Ông/Bà.",
    "Ý kiến của Ông/Bà sẽ giúp kiểm chứng mức độ đáp ứng tiêu chí thiết kế và khả năng ứng dụng thực tế. Bảng hỏi cần khoảng 5–10 phút; phỏng vấn chuyên sâu (nếu có) kéo dài khoảng 15–20 phút.",
    "Việc tham gia hoàn toàn tự nguyện. Thông tin chỉ được sử dụng cho mục đích học thuật, được bảo mật và chỉ nêu danh tính khi có sự đồng ý của Ông/Bà.",
  ],
  instructionsEn: [
    "We invite you to participate in the validation round (Round 2) for a master's thesis on designing the brand identity for the Vietnam Lion and Dragon Dance Federation. In this round, the proposed identity is presented for your specific evaluation.",
    "Your feedback will help verify how well the design meets established criteria and its practical applicability. The questionnaire takes about 5–10 minutes; the in-depth interview (if any) lasts about 15–20 minutes.",
    "Participation is entirely voluntary. Information is used solely for academic purposes, kept confidential, and your identity will only be disclosed with your consent.",
  ],
};

// ---------------------------------------------------------------------------
// 2. PHIẾU CONFIGS
// ---------------------------------------------------------------------------

// ── PHIẾU 1: CG-MT — Chuyên gia Mỹ thuật - Di sản - Văn hóa ───────────────
const PHIEU_1_CGMT: V2PhieuConfig = {
  phieuId: 'P1',
  groupCode: 'CG-MT',
  name: 'Chuyên gia Mỹ thuật - Di sản - Văn hóa',
  estimatedMinutes: '10–15',
  specialistNote:
    'Phiếu dành cho chuyên gia mỹ thuật, di sản và văn hóa. Phần A thu thập thông tin nền; Phần B đánh giá bộ nhận diện đề xuất; Phần C ghi nhận đề xuất tự do; phần Phỏng vấn dành cho phỏng vấn chuyên sâu.',

  // Part B questions — D3 shown BEFORE sơ đồ phân vai, then D1, D4, D5, D2
  questions: [
    {
      id: 'D3',
      text: 'D3. Biểu trưng gợi liên hệ với hình tượng lân trong mỹ thuật thời Nguyễn ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không gợi liên hệ',
      highLabel: 'Gợi liên hệ rõ',
      hasNote: true,
      images: ['H1a'],
      notaApply: true,
    },
    {
      id: 'D1',
      text: 'D1. Cấu trúc và tỷ lệ của biểu trưng chính đạt mức nào?',
      type: 'semantic',
      lowLabel: 'Rời rạc, mất cân đối',
      highLabel: 'Chặt chẽ, cân đối',
      hasNote: true,
      images: ['H1'],
      notaApply: true,
    },
    {
      id: 'D4',
      text: 'D4. Cách đưa yếu tố di sản vào bộ nhận diện nghiêng về phía nào?',
      type: 'semantic',
      lowLabel: 'Sao chép, mang cảm giác phục dựng',
      highLabel: 'Chuyển hóa đương đại, vẫn giữ căn cứ di sản',
      hasNote: true,
      images: ['H1', 'H4', 'H6'],
      notaApply: true,
    },
    {
      id: 'D5',
      text: 'D5. Bộ nhận diện giúp phân biệt lân sư rồng Việt Nam với lân sư rồng của nước ngoài ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không phân biệt được',
      highLabel: 'Phân biệt rõ',
      hasNote: true,
      images: ['H1', 'H6', 'H8'],
      notaApply: true,
    },
    {
      id: 'D2',
      text: 'D2. Tổng thể bộ nhận diện truyền tải tinh thần thể thao - văn hóa của lân sư rồng ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không truyền tải được',
      highLabel: 'Truyền tải rõ',
      hasNote: true,
      images: ['H1', 'H8', 'H9'],
      notaApply: true,
    },
  ],

  // Part C
  partCOpen: {
    id: 'C_open',
    text: 'Nếu chỉ được thay đổi một điều trong bộ nhận diện này, Thầy/Cô sẽ thay đổi điều gì? Vì sao?',
    type: 'open',
    hasNote: true,
  },

  // Interview
  interviewQuestions: [
    {
      id: 'INT1',
      text: 'Câu 1. Chi tiết nào trong biểu trưng khiến Thầy/Cô liên tưởng, hoặc không liên tưởng, tới lân trong mỹ thuật thời Nguyễn?',
      type: 'open',
      hasNote: true,
    },
    {
      id: 'INT2',
      text: 'Câu 2. Phần diễn giải ý nghĩa và tham chiếu màu (sơn son thếp vàng, men lam, khảm sành sứ) trong sổ tay có chỗ nào cần sửa để tránh suy diễn?',
      type: 'open',
      hasNote: true,
    },
  ],
};

// ── PHIẾU 2: CG-TK — Chuyên gia Thiết kế Đồ họa - Nhận diện ──────────────
const PHIEU_2_CGTK: V2PhieuConfig = {
  phieuId: 'P2',
  groupCode: 'CG-TK',
  name: 'Chuyên gia Thiết kế Đồ họa - Nhận diện',
  estimatedMinutes: '10–15',
  specialistNote:
    'Phiếu dành cho chuyên gia thiết kế đồ họa và nhận diện thương hiệu. Vui lòng xem toàn bộ hệ thống hình ảnh trước khi trả lời (nhấn "Tôi đã xem, tiếp tục").',
  requiresImageViewer: true,
  allImagesForViewer: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11'],

  questions: [
    {
      id: 'D1',
      text: 'D1. Cấu trúc và tỷ lệ của biểu trưng chính đạt mức nào?',
      type: 'semantic',
      lowLabel: 'Rời rạc, mất cân đối',
      highLabel: 'Chặt chẽ, cân đối',
      hasNote: true,
      images: ['H1', 'H3'],
      notaApply: true,
    },
    {
      id: 'D2',
      text: 'D2. Tổng thể bộ nhận diện truyền tải tinh thần thể thao - văn hóa của lân sư rồng ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không truyền tải được',
      highLabel: 'Truyền tải rõ',
      hasNote: true,
      images: ['H1', 'H8', 'H9', 'H11'],
      notaApply: true,
    },
    {
      id: 'D9',
      text: 'D9. Ở cỡ nhỏ (huy hiệu, thẻ đeo, ảnh đại diện mạng xã hội), biểu trưng còn nhận ra được ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không nhận ra',
      highLabel: 'Nhận ra rõ',
      hasNote: true,
      images: ['H2', 'H3', 'H8', 'H11'],
      notaApply: true,
    },
    {
      id: 'D10',
      text: 'D10. So với biểu trưng của các đoàn, câu lạc bộ và liên đoàn lân sư rồng khác, biểu trưng dễ phân biệt ở mức nào?',
      type: 'semantic',
      lowLabel: 'Dễ nhầm lẫn',
      highLabel: 'Phân biệt rõ',
      hasNote: true,
      images: ['SO_SANH'],
      notaApply: true,
    },
    {
      id: 'D11',
      text: 'D11. Biểu trưng, màu, chữ và họa tiết liên kết thành một hệ thống ở mức nào?',
      type: 'semantic',
      lowLabel: 'Rời rạc',
      highLabel: 'Thống nhất',
      hasNote: true,
      images: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
      notaApply: true,
    },
    {
      id: 'D12',
      text: 'D12. Qua các nhóm ứng dụng (văn phòng, giải đấu, trang phục, truyền thông), nhận diện được giữ nhất quán ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không nhất quán',
      highLabel: 'Nhất quán',
      hasNote: true,
      images: ['H7', 'H8', 'H9', 'H10', 'H11'],
      notaApply: true,
    },
    {
      id: 'D14',
      text: 'D14. Trước khi gia công (thêu, in, dập nổi), bộ nhận diện cần chỉnh sửa ở mức nào để phù hợp với kỹ thuật và chi phí của Liên đoàn?',
      type: 'semantic',
      lowLabel: 'Cần làm lại phần lớn',
      highLabel: 'Dùng được ngay',
      hasNote: true,
      images: ['H3', 'H8', 'H9', 'H10'],
      notaApply: true,
    },
  ],

  // Interview — design system coherence & production readiness
  interviewQuestions: [
    {
      id: 'INT1',
      text: 'Câu 1. Nhìn toàn bộ hệ thống (biểu trưng, màu sắc, kiểu chữ, họa tiết và ứng dụng), Anh/Chị đánh giá sự liên kết nội tại của bộ nhận diện ở điểm nào mạnh nhất và điểm nào còn lỏng lẻo nhất?',
      type: 'open',
      hasNote: true,
    },
    {
      id: 'INT2',
      text: 'Câu 2. Với ưu tiên gia công trong năm đầu (thêu huy hiệu, in băng-rôn giải đấu, dập nổi kỷ niệm chương), Anh/Chị đề xuất điều chỉnh kỹ thuật cụ thể nào để bộ nhận diện đảm bảo chất lượng mà vẫn trong ngân sách phù hợp với Liên đoàn?',
      type: 'open',
      hasNote: true,
    },
  ],
};

// ── PHIẾU 3: QT-LĐ — Quản trị Liên đoàn ──────────────────────────────────
const PHIEU_3_QTLD: V2PhieuConfig = {
  phieuId: 'P3',
  groupCode: 'QT-LĐ',
  name: 'Quản trị Liên đoàn Lân Sư Rồng Việt Nam',
  estimatedMinutes: '7–10',
  specialistNote:
    'Phiếu dành cho Ban lãnh đạo và cán bộ quản trị Liên đoàn. Đánh giá bộ nhận diện đề xuất từ góc độ quản lý, đại diện và vận hành tổ chức.',

  questions: [
    {
      id: 'QT_D1',
      text: 'QT-D1. Bộ nhận diện thể hiện hình ảnh chính thống và uy tín của Liên đoàn ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không chính thống, thiếu uy tín',
      highLabel: 'Chính thống, uy tín cao',
      hasNote: true,
      images: ['H1', 'H8'],
      notaApply: true,
    },
    {
      id: 'QT_D2',
      text: 'QT-D2. Bộ nhận diện đủ linh hoạt để các đơn vị thành viên (tỉnh/thành, câu lạc bộ) sử dụng thống nhất ở mức nào?',
      type: 'semantic',
      lowLabel: 'Rất khó thống nhất',
      highLabel: 'Dễ áp dụng thống nhất',
      hasNote: true,
      images: ['H8', 'H9'],
      notaApply: true,
    },
    {
      id: 'QT_D3',
      text: 'QT-D3. Bộ nhận diện phù hợp với các bối cảnh sử dụng chính thức (giải đấu, sự kiện, văn bản hành chính) ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không phù hợp',
      highLabel: 'Phù hợp hoàn toàn',
      hasNote: true,
      images: ['H7', 'H8', 'H9'],
      notaApply: true,
    },
    {
      id: 'QT_D4',
      text: 'QT-D4. Hệ thống biểu trưng thể hiện đúng thứ bậc Lân – Sư – Rồng trong hoạt động Liên đoàn ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không thể hiện được',
      highLabel: 'Thể hiện rõ, hợp lý',
      hasNote: true,
      images: ['H1', 'H4', 'H6'],
      notaApply: true,
    },
    {
      id: 'QT_D5',
      text: 'QT-D5. Các hạng mục ưu tiên gia công đầu tiên (huy hiệu, băng-rôn, kỷ niệm chương) có thể triển khai ngay từ bộ nhận diện này ở mức nào?',
      type: 'semantic',
      lowLabel: 'Chưa thể triển khai',
      highLabel: 'Triển khai được ngay',
      hasNote: true,
      images: ['H8', 'H9'],
      notaApply: true,
    },
  ],
};

// ── PHIẾU 4: CĐ-TH — Cộng đồng thực hành ─────────────────────────────────
const PHIEU_4_CDTH: V2PhieuConfig = {
  phieuId: 'P4',
  groupCode: 'CĐ-TH',
  name: 'Cộng đồng thực hành Lân Sư Rồng',
  estimatedMinutes: '7–10',
  specialistNote:
    'Phiếu dành cho huấn luyện viên, vận động viên, trưởng đoàn và thành viên các đoàn lân sư rồng. Đánh giá bộ nhận diện đề xuất từ góc độ sử dụng thực tế tại sân thi đấu và sinh hoạt câu lạc bộ.',

  questions: [
    {
      id: 'CD_D1',
      text: 'CĐ-D1. Biểu trưng nhìn thấy và nhận ra được từ xa (sân thi đấu, khán đài) ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không nhìn thấy / nhận ra',
      highLabel: 'Nhìn thấy và nhận ra rõ',
      hasNote: true,
      images: ['H1', 'H8'],
      notaApply: true,
    },
    {
      id: 'CD_D2',
      text: 'CĐ-D2. Ở kích thước nhỏ (huy hiệu, thẻ đeo, ảnh đại diện), biểu trưng vẫn đọc được ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không đọc được',
      highLabel: 'Đọc rõ, không bị rối',
      hasNote: true,
      images: ['H1', 'H9'],
      notaApply: true,
    },
    {
      id: 'CD_D3',
      text: 'CĐ-D3. Bộ nhận diện truyền tải được tinh thần thể thao, kỷ luật và tự hào của người tập lân sư rồng ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không truyền tải được',
      highLabel: 'Truyền tải rất rõ',
      hasNote: true,
      images: ['H1', 'H8', 'H9'],
      notaApply: true,
    },
    {
      id: 'CD_D4',
      text: 'CĐ-D4. Bộ nhận diện tạo cảm giác tự hào và gắn kết cho thành viên khi mặc đồng phục, đeo huy hiệu ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không tạo được cảm giác đó',
      highLabel: 'Tạo cảm giác tự hào, gắn kết rõ',
      hasNote: true,
      images: ['H8', 'H9'],
      notaApply: true,
    },
    {
      id: 'CD_D5',
      text: 'CĐ-D5. Nhận diện được giữ nhất quán trên trang phục và vật phẩm của các đội/đoàn khác nhau trong cùng Liên đoàn ở mức nào?',
      type: 'semantic',
      lowLabel: 'Rất khác nhau, không nhất quán',
      highLabel: 'Nhất quán, dễ nhận ra là cùng hệ thống',
      hasNote: true,
      images: ['H8', 'H9'],
      notaApply: true,
    },
  ],
};

// ── PHIẾU 5: KG-ĐT — Công chúng, phép thử nhận biết ──────────────────────
const PHIEU_5_KGDT: V2PhieuConfig = {
  phieuId: 'P5',
  groupCode: 'KG-ĐT',
  name: 'Công chúng — Phép thử nhận biết',
  estimatedMinutes: '3',
  specialistNote:
    'Phiếu dành cho công chúng phổ thông. Chỉ hiển thị hình ảnh ở kích thước cố định (không phóng to). Người trả lời chọn một đáp án cho mỗi câu.',

  questions: [
    {
      id: 'REC1',
      text: 'Nhìn vào hình trên, đây là biểu trưng của tổ chức nào?',
      type: 'recognition',
      hasNote: false,
      images: ['REC_TEST_1'],
      options: [
        'Liên đoàn Lân Sư Rồng Việt Nam',
        'Đoàn lân biểu diễn tư nhân',
        'Liên đoàn thể thao võ thuật',
        'Tổ chức văn hóa khác',
        'Không nhận ra',
      ],
    },
    {
      id: 'REC2',
      text: 'Màu sắc và hình ảnh trong bộ nhận diện gợi liên tưởng đến điều gì nhất?',
      type: 'recognition',
      hasNote: false,
      images: ['REC_TEST_2'],
      options: [
        'Văn hóa - di sản Việt Nam',
        'Thể thao - thi đấu chuyên nghiệp',
        'Lễ hội dân gian',
        'Tổ chức quốc tế',
        'Khác',
      ],
    },
    {
      id: 'REC3',
      text: 'Biểu trưng tạo cảm giác chuyên nghiệp và đáng tin cậy ở mức nào?',
      type: 'semantic',
      lowLabel: 'Không chuyên nghiệp',
      highLabel: 'Rất chuyên nghiệp',
      hasNote: true,
      images: ['H1'],
      // notaApply intentionally omitted — no "Không đủ cơ sở" for public
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. MASTER EXPORT ARRAY
// ---------------------------------------------------------------------------
export const V2_PHIEU_CONFIGS: V2PhieuConfig[] = [
  PHIEU_1_CGMT,
  PHIEU_2_CGTK,
  PHIEU_3_QTLD,
  PHIEU_4_CDTH,
  PHIEU_5_KGDT,
];

// ---------------------------------------------------------------------------
// 4. LOOKUP HELPER
// ---------------------------------------------------------------------------
export function getV2PhieuByGroup(groupCode: string): V2PhieuConfig | undefined {
  return V2_PHIEU_CONFIGS.find((p) => p.groupCode === groupCode);
}
