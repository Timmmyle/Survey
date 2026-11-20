// ============================================================
// surveyData_v2.ts — BẢNG HỎI VÀ PHỎNG VẤN VÒNG KIỂM CHỨNG
// Đề án Thạc sĩ: Ứng dụng hình tượng lân trong mỹ thuật thời Nguyễn
// vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam
// ============================================================

export interface V2ParticipantGroup {
  code: 'CG-MT' | 'CG-TK' | 'QT-LD' | 'CD-TH' | 'KG-DT';
  phieuId: 'Phiếu 1' | 'Phiếu 2' | 'Phiếu 3' | 'Phiếu 4' | 'Phiếu 5';
  name: string;
  shortName: string;
  timeEstimate: string; // e.g. "khoảng 10 phút: Phiếu 1"
  badgeTime: string;
  description: string;
}

export const V2_PARTICIPANT_GROUPS: V2ParticipantGroup[] = [
  {
    code: 'CG-MT',
    phieuId: 'Phiếu 1',
    name: 'Chuyên gia mỹ thuật - di sản - văn hóa (CG-MT)',
    shortName: 'Chuyên gia Mỹ thuật - Di sản - Văn hóa',
    timeEstimate: ', khoảng 10 phút: Phiếu 1',
    badgeTime: 'Khoảng 10 phút',
    description: 'Đánh giá tính kế thừa di sản thời Nguyễn, cấu trúc tạo hình và ý nghĩa biểu trưng.',
  },
  {
    code: 'CG-TK',
    phieuId: 'Phiếu 2',
    name: 'Chuyên gia thiết kế đồ họa - nhận diện (CG-TK)',
    shortName: 'Chuyên gia Thiết kế Đồ họa - Nhận diện',
    timeEstimate: '12 - 15 phút: Phiếu 2',
    badgeTime: '12 - 15 phút',
    description: 'Đánh giá tính hệ thống, khả năng ứng dụng thực tế, nhận diện cỡ nhỏ và khả năng gia công.',
  },
  {
    code: 'QT-LD',
    phieuId: 'Phiếu 3',
    name: 'Quản trị Liên đoàn Lân Sư Rồng Việt Nam (QT-LD)',
    shortName: 'Quản trị Liên đoàn Lân Sư Rồng Việt Nam',
    timeEstimate: 'khoảng 15 phút: Phiếu 3',
    badgeTime: 'Khoảng 15 phút',
    description: 'Đánh giá nhu cầu thực tế, phân vai lân - sư - rồng, tính đại diện và khả năng tự áp dụng của Liên đoàn.',
  },
  {
    code: 'CD-TH',
    phieuId: 'Phiếu 4',
    name: 'Cộng đồng thực hành lân sư rồng (CD-TH)',
    shortName: 'Cộng đồng thực hành Lân Sư Rồng',
    timeEstimate: '15 - 18 phút: Phiếu 4',
    badgeTime: '15 - 18 phút',
    description: 'Đánh giá nhu cầu sử dụng thực tế, phép thử nhận biết nhanh và ứng dụng thi đấu, biểu diễn.',
  },
  {
    code: 'KG-DT',
    phieuId: 'Phiếu 5',
    name: 'Công chúng, khán giả (KG-DT)',
    shortName: 'Công chúng, khán giả',
    timeEstimate: 'chỉ làm phép thử nhận biết, khoảng 3 phút: Phiếu 5',
    badgeTime: 'Khoảng 3 phút',
    description: 'Thực hiện phép thử nhận biết nhanh biểu trưng ở các khoảng cách và kích thước khác nhau.',
  },
];

export const V2_THESIS_METADATA = {
  institution: "TRƯỜNG ĐẠI HỌC VĂN LANG",
  thesisLevel: "ĐỀ ÁN THẠC SĨ",
  thesisName: "Ứng dụng hình tượng lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam",
  formTitle: "PHIẾU ĐÁNH GIÁ BỘ NHẬN DIỆN THƯƠNG HIỆU ĐỀ XUẤT",
  studentName: "Phạm Nguyễn Vân Anh",
  major: "Mỹ thuật ứng dụng",
  introText: "Bộ nhận diện đề xuất đã được hoàn thiện. Xin Quý Ông/Bà, Anh/Chị xem bộ hình và cho ý kiến đánh giá.",
  contact: {
    email: "anhpnv3@fe.edu.vn",
    phone: "0931343497"
  },
  consentIntro: [
    "Kính chào Quý Ông/Bà, Anh/Chị,",
    "Phiếu này thuộc đề án thạc sĩ nêu trên. Bộ nhận diện thương hiệu đề xuất cho Liên đoàn Lân Sư Rồng Việt Nam đã được hoàn thiện; Quý Ông/Bà, Anh/Chị được mời xem bộ hình và cho ý kiến đánh giá độc lập.",
    "Phỏng vấn ngắn sau phiếu, nếu Quý Ông/Bà, Anh/Chị đồng ý.",
    "Việc tham gia là tự nguyện; người tham gia có quyền dừng bất cứ lúc nào. Thông tin thu thập chỉ phục vụ mục đích học thuật, được trình bày bằng mã người tham gia và không công bố danh tính."
  ],
  instructionsHtml: [
    { level: 1, text: "Gần với mô tả ở đầu thấp của câu" },
    { level: 2, text: "Nghiêng về đầu thấp" },
    { level: 3, text: "Ở giữa" },
    { level: 4, text: "Nghiêng về đầu cao" },
    { level: 5, text: "Gần với mô tả ở đầu cao của câu" },
    { level: 'na', text: "Không đủ cơ sở đánh giá: Câu nằm ngoài chuyên môn hoặc hình chưa đủ thông tin; lượt này không tính vào kết quả" },
  ],
  instructionNote: "Mỗi câu có ô ghi chú dùng được cho mọi mức điểm. Hình liên quan hiển thị ngay trên câu hỏi và có thể bấm để phóng to, trừ hình của phép thử nhận biết. Từ khi bắt đầu xem bộ hình, phiếu không cho quay lại phần trước."
};

// ---------------------------------------------------------------------------
// Color options for N6 with exact HEX colors
// ---------------------------------------------------------------------------
export const COLOR_OPTIONS_N6 = [
  { name: 'Đỏ son', hex: '#C4302B', border: '#991B1B' },
  { name: 'Vàng kim', hex: '#D4AF37', border: '#B45309' },
  { name: 'Xanh lam', hex: '#0F52BA', border: '#1D4ED8' },
  { name: 'Đen', hex: '#1A1A1A', border: '#000000' },
  { name: 'Trắng', hex: '#F8FAFC', border: '#CBD5E1' },
  { name: 'Xanh lá', hex: '#2E8B57', border: '#15803D' },
];

// ---------------------------------------------------------------------------
// Documentation photos for N2 (TL-a to TL-d)
// ---------------------------------------------------------------------------
export const DOCUMENTATION_PHOTOS_N2 = [
  { id: 'TL-a', label: 'TL-a: Cặp lân đồng chầu án thờ, điện Biểu Đức, lăng Thiệu Trị (Hình 2.9a)' },
  { id: 'TL-b', label: 'TL-b: Lân khảm sành sứ ở cổng chính cung An Định (Hình 2.9b)' },
  { id: 'TL-c', label: 'TL-c: Cặp lân khảm sành sứ hai bên cổng vòm, lăng Kiên Thái Vương (Hình 2.9c)' },
  { id: 'TL-d', label: 'TL-d: Lân trong bình phong Tứ linh phía sau Ích Khiêm Các, lăng Tự Đức (Hình 2.9e)' },
];

export const ALL_VIEWER_IMAGES_H1_H11 = [
  { id: 'H1', label: 'H1. Biểu trưng chính và phân vai lân - rồng - sư (Hình 3.8)' },
  { id: 'H2', label: 'H2. Biến thể và huy hiệu (Hình 3.9)' },
  { id: 'H3', label: 'H3. Quy chuẩn dựng hình (Hình 3.7, 3.10)' },
  { id: 'H4', label: 'H4. Hệ màu (Hình 3.11)' },
  { id: 'H5', label: 'H5. Kiểu chữ (Hình 3.12)' },
  { id: 'H6', label: 'H6. Họa tiết (Hình 3.13)' },
  { id: 'H7', label: 'H7. Văn phòng (Hình 3.14)' },
  { id: 'H8', label: 'H8. Ứng dụng giải đấu (Hình 3.15)' },
  { id: 'H9', label: 'H9. Trang phục (Hình 3.16)' },
  { id: 'H10', label: 'H10. Vinh danh (Hình 3.17)' },
  { id: 'H11', label: 'H11. Truyền thông (Hình 3.18)' },
];
