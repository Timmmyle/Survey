export interface SurveyGroup {
  code: string;
  name: string;
  codePrefix: string;
}

export type SurveyQuestionType = 'likert' | 'checkbox' | 'textarea';

export interface SurveyQuestionConfig {
  id: string;
  text: string;
  type: SurveyQuestionType;
  options?: string[]; // For checkbox questions
  minSelect?: number; // Minimum boxes required to select
  maxSelect?: number; // Maximum boxes allowed to select
  allowOther?: boolean; // Has a "Khác: ..." text field
  required?: boolean;
}

// 1. THESIS & RESEARCH METADATA
export const THESIS_METADATA = {
  websiteTitle: "BẢNG KHẢO SÁT VÀ PHỎNG VẤN THU THẬP Ý KIẾN VỀ BỘ NHẬN DIỆN THƯƠNG HIỆU LIÊN ĐOÀN LÂN SƯ RỒNG VIỆT NAM",
  headerTitle: "PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA KHẢO SÁT/PHỎNG VẤN",
  thesisName: "“Ứng dụng hình tượng Lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam”",
  studentName: "Phạm Nguyễn Vân Anh",
  institution: "Trường Đại học Văn Lang",
  contact: {
    email: "anhpnv3@fe.edu.vn",
    phone: "0931343497"
  },
  instructions: [
    "Kính mời Ông/Bà tham gia khảo sát hoặc phỏng vấn nhằm thu thập ý kiến về yêu cầu nhận diện thương hiệu, khả năng ứng dụng hình tượng Lân thời Nguyễn và điều kiện sử dụng bộ nhận diện của Liên đoàn Lân Sư Rồng Việt Nam.",
    "Người tham gia có thể trả lời bảng hỏi trong khoảng 5-10 phút và/hoặc tham gia phỏng vấn trong khoảng 30-45 phút, trực tiếp hoặc trực tuyến.",
    "Việc tham gia hoàn toàn tự nguyện. Ông/Bà có quyền không trả lời bất kỳ câu hỏi nào hoặc dừng tham gia bất cứ lúc nào.",
    "Thông tin thu thập chỉ dùng cho mục đích học thuật, được mã hóa và không công bố danh tính nếu không có sự đồng ý.",
    "Bản ghi âm, nếu có, chỉ phục vụ việc đối chiếu và mã hóa nội dung phỏng vấn.",
  ]
};

// 2. PARTICIPANT GROUPS
export const SURVEY_GROUPS: SurveyGroup[] = [
  { code: 'QT-LĐ', name: 'Quản trị Liên đoàn Lân Sư Rồng Việt Nam', codePrefix: 'QT-LĐ' },
  { code: 'CĐ-TH', name: 'Cộng đồng thực hành Lân Sư Rồng', codePrefix: 'CĐ-TH' },
  { code: 'CG-MT', name: 'Chuyên gia mỹ thuật - di sản - văn hóa', codePrefix: 'CG-MT' },
  { code: 'CG-TK', name: 'Chuyên gia thiết kế đồ họa - nhận diện', codePrefix: 'CG-TK' },
  { code: 'KG-ĐT', name: 'Công chúng, khán giả, đối tác hoặc truyền thông', codePrefix: 'KG-ĐT' },
];

// LIKERT OPTIONS DEFINITION (😞 😐 🙂 😊 🤩 Scale)
export interface LikertScaleOption {
  value: number;
  emoji: string;
  label: string;
}

export const LIKERT_SCALE_OPTIONS: LikertScaleOption[] = [
  { value: 1, emoji: '😞', label: 'Yêu' },
  { value: 2, emoji: '😐', label: 'Tạm' },
  { value: 3, emoji: '🙂', label: 'Trung bình' },
  { value: 4, emoji: '😊', label: 'Tốt' },
  { value: 5, emoji: '🤩', label: 'Xuất sắc' },
];

// 3. COMMON QUESTIONS (PART A) - Likert Questions C1 to C7
export const COMMON_LIKERT_QUESTIONS: SurveyQuestionConfig[] = [
  {
    id: "C1",
    text: "C1. Liên đoàn Lân Sư Rồng Việt Nam cần một bộ nhận diện thương hiệu để thể hiện rõ vai trò của tổ chức ở phạm vi quốc gia.",
    type: 'likert',
    required: true
  },
  {
    id: "C2",
    text: "C2. Bộ nhận diện thương hiệu cần phản ánh phù hợp đặc điểm tổ chức, thể thao, văn hóa và cộng đồng của lĩnh vực Lân Sư Rồng.",
    type: 'likert',
    required: true
  },
  {
    id: "C3",
    text: "C3. Bộ nhận diện thương hiệu cần rõ ràng, dễ nhận biết và có khả năng ứng dụng trên nhiều môi trường sử dụng.",
    type: 'likert',
    required: true
  },
  {
    id: "C4",
    text: "C4. Hình tượng Lân trong mỹ thuật thời Nguyễn được xem xét như một nguồn tạo hình cho bộ nhận diện thương hiệu của Liên đoàn.",
    type: 'likert',
    required: true
  },
  {
    id: "C5",
    text: "C5. Rồng cần được thể hiện phù hợp trong biểu trưng hoặc bộ nhận diện thương hiệu để phản ánh phạm vi hoạt động của Liên đoàn.",
    type: 'likert',
    required: true
  },
  {
    id: "C6",
    text: "C6. Khi ứng dụng các yếu tố mỹ thuật truyền thống, thiết kế cần chuyển hóa có chọn lọc thay vì sao chép trực tiếp hiện vật.",
    type: 'likert',
    required: true
  },
  {
    id: "C7",
    text: "C7. Giải pháp nhận diện cần được lấy ý kiến từ Liên đoàn, cộng đồng thực hành và chuyên gia trước khi đề xuất triển khai.",
    type: 'likert',
    required: true
  }
];

// 4. GROUP-SPECIFIC QUESTIONS (PART B TO PART F)
export const GROUP_LIKERT_QUESTIONS: Record<string, SurveyQuestionConfig[]> = {
  // Part B: Dành cho nhóm Quản trị (QT1 - QT7)
  "QT-LĐ": [
    { id: "QT1", text: "QT1. Một sổ tay nhận diện có quy chuẩn rõ ràng sẽ hỗ trợ các đơn vị thành viên sử dụng hình ảnh Liên đoàn nhất quán hơn.", type: 'likert', required: true },
    { id: "QT2", text: "QT2. Bộ nhận diện thương hiệu cần đáp ứng yêu cầu sử dụng trong văn bản, giải đấu, sự kiện và hoạt động đối ngoại của Liên đoàn.", type: 'likert', required: true },
    { id: "QT3", text: "QT3. Biểu trưng và bộ nhận diện thương hiệu cần thể hiện được tính chính thống, uy tín và vị thế tổ chức của Liên đoàn.", type: 'likert', required: true },
    { id: "QT4", text: "QT4. Yếu tố tạo hình chủ đạo vẫn đại diện cho Liên đoàn nếu Lân, Sư và Rồng được phân cấp hợp lý trong toàn hệ thống.", type: 'likert', required: true },
    { id: "QT5", text: "QT5. Các hạng mục ưu tiên triển khai của tín hiệu nhận diện cần gồm biểu trưng, cờ, trang phục, huy chương, chứng nhận và truyền thông số.", type: 'likert', required: true },
    {
      id: "QT6",
      text: "QT6. Xin Anh/Chị chọn tối thiểu bốn giá trị cần được ưu tiên trong tín hiệu nhận diện của Liên đoàn",
      type: 'checkbox',
      options: [
        "Tính chính thống và uy tín tổ chức",
        "Tinh thần thượng võ và kỷ luật",
        "Tính chuyên nghiệp trong môi trường thể thao",
        "Sự gắn kết cộng đồng",
        "Tính trang trọng",
        "Tính năng động, hiện đại",
        "Sự liên hệ với di sản mỹ thuật Việt Nam",
        "Khả năng đại diện trong hoạt động quốc tế",
        "Khả năng nhận biết và ghi nhớ"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "QT7",
      text: "QT7. Xin Anh/Chị chọn tối thiểu bốn hạng mục cần được ưu tiên triển khai trước",
      type: 'checkbox',
      options: [
        "Biểu trưng và tên Liên đoàn",
        "Hệ màu và kiểu chữ",
        "Họa tiết/hệ đồ họa hỗ trợ",
        "Trang phục thi đấu và đồng phục",
        "Cờ, banner, backdrop và không gian giải đấu",
        "Huy chương, cúp, chứng nhận và thẻ",
        "Bài đăng mạng xã hội, video và đồ họa số",
        "Website hoặc nền tảng thông tin",
        "Sổ tay quy chuẩn nhận diện"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    }
  ],

  // Part C: Dành cho nhóm Cộng đồng thực hành (TH1 - TH7)
  "CĐ-TH": [
    { id: "TH1", text: "TH1. Biểu trưng cần được nhận biết rõ ở khoảng cách xa khi sử dụng trên cờ, banner và khu vực giải đấu.", type: 'likert', required: true },
    { id: "TH2", text: "TH2. Biểu trưng cần ứng dụng tốt trên trang phục, huy chương, thẻ và các vật phẩm có kích thước nhỏ.", type: 'likert', required: true },
    { id: "TH3", text: "TH3. Hệ màu và kiểu chữ cần rõ ràng, phù hợp với môi trường thi đấu, biểu diễn và truyền thông số.", type: 'likert', required: true },
    { id: "TH4", text: "TH4. Cờ, trang phục, huy chương, backdrop và bài đăng số là những điểm tiếp xúc cần được ưu tiên ứng dụng.", type: 'likert', required: true },
    { id: "TH5", text: "TH5. Một bộ nhận diện thương hiệu chung tăng cảm giác gắn kết và tự hào của người thực hành khi đại diện cho Liên đoàn.", type: 'likert', required: true },
    {
      id: "TH6",
      text: "TH6. Xin Anh/Chị chọn tối đa ba hạng mục cần được ưu tiên ứng dụng trước",
      type: 'checkbox',
      options: [
        "Biểu trưng và tên Liên đoàn",
        "Hệ màu và kiểu chữ",
        "Họa tiết/hệ đồ họa hỗ trợ",
        "Trang phục thi đấu và đồng phục",
        "Cờ, banner, backdrop và không gian giải đấu",
        "Huy chương, cúp, chứng nhận và thẻ",
        "Bài đăng mạng xã hội, video và đồ họa số",
        "Website hoặc nền tảng thông tin",
        "Sổ tay quy chuẩn nhận diện"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    },
    {
      id: "TH7",
      text: "TH7. Khi sử dụng tín hiệu nhận diện trong hoạt động thực tế, Anh/Chị cho rằng ba yêu cầu nào quan trọng nhất?",
      type: 'checkbox',
      options: [
        "Nhìn rõ từ xa",
        "Dễ nhận biết ở kích thước nhỏ",
        "Dễ in, thêu hoặc sản xuất trên vật liệu thực tế",
        "Có màu sắc rõ, tương phản tốt",
        "Thể hiện được tính chuyên nghiệp của Liên đoàn",
        "Thể hiện được tinh thần Lân Sư Rồng",
        "Tạo cảm giác tự hào và gắn kết cộng đồng",
        "Sử dụng đồng bộ giữa các đoàn và giải đấu"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    }
  ],

  // Part D: Dành cho nhóm Chuyên gia Mỹ thuật - Di sản - Văn hóa (DS1 - DS7)
  "CG-MT": [
    { id: "DS1", text: "DS1. Việc định danh Lân thời Nguyễn cần dựa trên tổ hợp dữ liệu gồm hình thái, chất liệu, vị trí xuất hiện, ngữ cảnh và tư liệu đối chiếu.", type: 'likert', required: true },
    { id: "DS2", text: "DS2. Cần phân biệt Lân với Nghê, Long Mã, sư tử trang trí và các linh vật gần nghĩa trước khi chuyển hóa dữ liệu tạo hình.", type: 'likert', required: true },
    { id: "DS3", text: "DS3. Các giá trị biểu tượng của Lân cần được diễn giải trên cơ sở hiện vật, không gian kiến trúc và nguồn tư liệu chuyên ngành.", type: 'likert', required: true },
    { id: "DS4", text: "DS4. Lân thời Nguyễn giữ vai trò hạt nhân tạo hình, trong khi Rồng được tích hợp như thành tố đại diện của tổ chức trong bộ nhận diện thương hiệu.", type: 'likert', required: true },
    { id: "DS5", text: "DS5. Giải pháp nhận diện cần duy trì mối liên hệ với di sản mỹ thuật Việt Nam nhưng không tạo cảm giác phục dựng hoặc mô phỏng cổ.", type: 'likert', required: true },
    {
      id: "DS6",
      text: "DS6. Xin Thầy/Cô chọn tối đa bốn nguyên tắc cần được ưu tiên khi chuyển hóa hình tượng Lân thời Nguyễn vào bộ nhận diện thương hiệu.",
      type: 'checkbox',
      options: [
        "Xác định đúng hình tượng nguồn",
        "Bảo đảm căn cứ từ hiện vật và tư liệu chuyên ngành",
        "Giữ cấu trúc tạo hình có khả năng nhận biết",
        "Tránh sao chép trực tiếp hiện vật cổ",
        "Giữ mối liên hệ với mỹ thuật cung đình Huế",
        "Giản lược phù hợp với môi trường đương đại",
        "Tránh nhầm lẫn Lân với Nghê, Long Mã hoặc sư tử trang trí",
        "Chuyển hóa thận trọng các giá trị biểu tượng",
        "Bảo đảm khả năng ứng dụng đa nền tảng"
      ],
      minSelect: 1,
      maxSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "DS7",
      text: "DS7. Xin Thầy/Cô chọn tối đa ba nhóm dữ liệu cần được ưu tiên trích xuất từ hệ mẫu Lân thời Nguyễn.",
      type: 'checkbox',
      options: [
        "Cấu trúc đầu và sừng",
        "Bờm, thân, chân và đuôi",
        "Nhịp đường nét và dáng thế",
        "Mây, lửa, hoa lá và mô-típ phụ trợ",
        "Bố cục chầu, đối xứng hoặc liên hoàn",
        "Chất liệu và quan hệ màu",
        "Vị trí xuất hiện trong kiến trúc cung đình",
        "Tầng nghĩa biểu tượng có căn cứ"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    }
  ],

  // Part E: Dành cho nhóm Chuyên gia Thiết kế (TK1 - TK7)
  "CG-TK": [
    { id: "TK1", text: "TK1. Các yếu tố tạo hình của Lân thời Nguyễn sau khi được giản lược cần đảm bảo khả năng nhận diện được linh vật này.", type: 'likert', required: true },
    { id: "TK2", text: "TK2. Biểu trưng cần vận hành hiệu quả trên các nền tảng được ứng dụng.", type: 'likert', required: true },
    { id: "TK3", text: "TK3. Hệ màu, kiểu chữ, họa tiết hỗ trợ và bố cục cần được phát triển theo một định hướng thị giác thống nhất.", type: 'likert', required: true },
    { id: "TK4", text: "TK4. Rồng nên được tích hợp như thành tố bổ trợ trong cấu trúc nhận diện, thay vì ghép hình minh họa ngang hàng với Lân và Sư.", type: 'likert', required: true },
    { id: "TK5", text: "TK5. Bộ nhận diện thương hiệu cần có quy chuẩn rõ để mở rộng trên ứng dụng thể thao, sự kiện, in ấn và truyền thông số.", type: 'likert', required: true },
    {
      id: "TK6",
      text: "TK6. Xin Anh/Chị chọn tối thiểu bốn tiêu chí cần được ưu tiên khi phát triển bộ nhận diện thương hiệu cho Liên đoàn.",
      type: 'checkbox',
      options: [
        "Tính đơn giản và khả năng ghi nhớ",
        "Tính khác biệt so với các tổ chức hoặc đoàn biểu diễn khác",
        "Mối liên hệ rõ với hình tượng Lân thời Nguyễn",
        "Khả năng tích hợp thành tố Rồng phù hợp",
        "Khả năng nhận biết ở kích thước nhỏ",
        "Khả năng sử dụng ở dạng đơn sắc",
        "Tính nhất quán giữa biểu trưng, màu, chữ và họa tiết",
        "Khả năng ứng dụng trên trang phục, cờ và không gian giải đấu",
        "Khả năng vận hành trên nền tảng số"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "TK7",
      text: "TK7. Xin Anh/Chị chọn tối thiểu bốn thành tố cần được ưu tiên phát triển trong bộ nhận diện thương hiệu.",
      type: 'checkbox',
      options: [
        "Biểu trưng chính và các phiên bản sử dụng",
        "Kiểu chữ và cấu trúc tên Liên đoàn",
        "Hệ màu nhận diện",
        "Họa tiết/hệ đồ họa hỗ trợ",
        "Hệ thống bố cục và lưới ứng dụng",
        "Quy chuẩn sử dụng biểu trưng",
        "Ứng dụng trang phục, cờ và huy chương",
        "Ứng dụng sự kiện: banner, backdrop, sân khấu",
        "Ứng dụng truyền thông số: mạng xã hội, video, website"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    }
  ],

  // Part F: Dành cho nhóm Công chúng, khán giả, đối tác và truyền thông (CT1 - CT5, P1 - P3)
  "KG-ĐT": [
    { id: "CT1", text: "CT1. Khi nhìn thấy tín hiệu nhận diện, tôi cần nhận ra nhanh đây là tổ chức Lân Sư Rồng Việt Nam.", type: 'likert', required: true },
    { id: "CT2", text: "CT2. Bộ nhận diện thương hiệu cần tạo cảm giác chính thống, chuyên nghiệp và đáng tin cậy", type: 'likert', required: true },
    { id: "CT3", text: "CT3. Biểu trưng và thông tin cần rõ ràng, dễ nhận biết trên mạng xã hội và các ấn phẩm số.", type: 'likert', required: true },
    { id: "CT4", text: "CT4. Bộ nhận diện thương hiệu cần gợi được mối liên hệ với văn hóa Việt Nam nhưng vẫn có cảm giác hiện đại.", type: 'likert', required: true },
    { id: "CT5", text: "CT5. Hình ảnh, màu sắc và kiểu chữ cần giúp phân biệt Liên đoàn với các đoàn biểu diễn hoặc tổ chức khác.", type: 'likert', required: true },
    {
      id: "P1",
      text: "P1. Theo Anh/Chị, xin chọn tối thiểu bốn giá trị cần được ưu tiên trong bộ nhận diện thương hiệu của Liên đoàn Lân Sư Rồng Việt Nam:",
      type: 'checkbox',
      options: [
        "Tính chính thống và uy tín tổ chức",
        "Tinh thần thượng võ và kỷ luật",
        "Tính chuyên nghiệp trong môi trường thể thao",
        "Sự gắn kết cộng đồng",
        "Tính trang trọng",
        "Tính năng động, hiện đại",
        "Sự liên hệ với di sản mỹ thuật Việt Nam",
        "Khả năng đại diện trong hoạt động quốc tế",
        "Khả năng nhận biết và ghi nhớ"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "P2",
      text: "P2. Theo Anh/Chị, xin chọn tối đa ba hạng mục cần được ưu tiên triển khai trong bộ nhận diện thương hiệu của Liên đoàn:",
      type: 'checkbox',
      options: [
        "Biểu trưng và tên Liên đoàn",
        "Hệ màu và kiểu chữ",
        "Họa tiết/hệ đồ họa hỗ trợ",
        "Trang phục thi đấu và đồng phục",
        "Cờ, banner, backdrop và không gian giải đấu",
        "Huy chương, cúp, chứng nhận và thẻ",
        "Bài đăng mạng xã hội, video và đồ họa số",
        "Website hoặc nền tảng thông tin",
        "Sổ tay quy chuẩn nhận diện"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    },
    {
      id: "P3",
      text: "P3. Anh/Chị có ý kiến hoặc đề xuất nào khác về bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam không?",
      type: 'textarea',
      required: false
    }
  ]
};

export const INTERVIEW_QUESTIONS: Record<string, SurveyQuestionConfig[]> = {
  "QT-LĐ": [
    { id: "QT-I01", text: "Câu 1. Theo Anh/Chị, trong giai đoạn 2023-2028, Liên đoàn ưu tiên những nhiệm vụ nào và muốn xây dựng hình ảnh tổ chức theo định hướng nào?\n(VD: Phát triển phong trào; Đào tạo vận động viên, huấn luyện viên và trọng tài; Tổ chức thi đấu; Chuẩn hóa chuyên môn; Kết nối đơn vị thành viên; Bảo tồn và phát huy giá trị văn hóa; Hợp tác, giao lưu quốc tế; Truyền thông và xây dựng hình ảnh tổ chức).", type: 'textarea', required: false },
    { id: "QT-I02", text: "Câu 2. Trong khoảng 5 năm tới, Anh/Chị mong muốn công chúng, hội viên, đối tác và cơ quan quản lý nhận biết Liên đoàn là một tổ chức như thế nào?\n(VD: Chính thống; Chuyên nghiệp; Kỷ luật; Thượng võ; Văn hóa; Gắn kết cộng đồng; Năng động; Hiện đại; Có năng lực hội nhập quốc tế).", type: 'textarea', required: false },
    { id: "QT-I03", text: "Câu 3. Theo Anh/Chị, bộ nhận diện thương hiệu và hoạt động truyền thông hiện hành của Liên đoàn có những yếu tố nào cần được kế thừa trong giải pháp mới?\n(VD: Tên gọi; Chữ viết tắt; Biểu trưng; Màu sắc; Dấu hiệu quốc gia; Hình ảnh Lân, Sư hoặc Rồng; Sự quen thuộc trong cộng đồng; Những ứng dụng đang được sử dụng hiệu quả).", type: 'textarea', required: false },
    { id: "QT-I04", text: "Câu 4. Trong việc sử dụng nhận diện hiện hành, Liên đoàn gặp những khó khăn nào tại hoạt động thi đấu, sự kiện, văn bản, kết nối đơn vị thành viên hoặc truyền thông số?\n(VD: Biểu trưng ở kích thước nhỏ; Cờ, banner và backdrop; Trang phục; Huy chương, chứng nhận, thẻ; Sự thống nhất giữa các giải đấu; Tính đồng bộ của đơn vị thành viên; Tốc độ triển khai thông tin trên nền tảng số; Thiếu quy chuẩn sử dụng).", type: 'textarea', required: false },
    { id: "QT-I05", text: "Câu 5. Theo Anh/Chị, biểu trưng chính thức của Liên đoàn cần thể hiện quan hệ giữa Lân, Sư và Rồng theo nguyên tắc nào?\n(VD: Có cần thể hiện đồng thời cả ba hình tượng trong biểu trưng chính không?; Thành tố nào cần là trọng tâm?; Rồng cần hiện diện ở mức độ nào?; Sư có cần thành hình tượng trực tiếp hay hiện diện qua tên gọi và hệ ứng dụng?; Có yếu tố nào cần tránh để biểu trưng không trở nên phức tạp?)", type: 'textarea', required: false },
    { id: "QT-I06", text: "Câu 6. Theo Anh/Chị, trong tên gọi và hoạt động thi đấu của Liên đoàn, Rồng nên được thể hiện ở mức độ nào trong biểu trưng hoặc bộ nhận diện thương hiệu của Liên đoàn??\n(VD: Hình tượng trực tiếp; Đường nét, chuyển động, thế bao hoặc khoảng âm; Dấu hiệu phụ hoặc họa tiết hỗ trợ; Hệ ứng dụng theo từng nhóm hoạt động; Quan hệ giữa Rồng trong biểu trưng và Rồng biểu diễn).", type: 'textarea', required: false },
    { id: "QT-I07", text: "Câu 7. Theo Anh/Chị, việc sử dụng Lân thời Nguyễn làm nguồn tạo hình cho bộ nhận diện thương hiệu có những điểm phù hợp và những giới hạn nào?\n(VD: Tính trang trọng, kỷ luật hoặc tinh thần văn hóa; Mức độ hiện đại hóa; Mối liên hệ giữa di sản và thể thao; Các yếu tố tạo hình hoặc biểu tượng cần tránh; Khả năng tiếp nhận của người thực hành và công chúng).", type: 'textarea', required: false },
    { id: "QT-I08", text: "Câu 8. Nếu bộ nhận diện thương hiệu được đánh giá phù hợp, Liên đoàn cần ưu tiên triển khai ở những hạng mục nào? Việc triển khai cần có những nhóm nào tham gia thẩm định, phê duyệt và quản lý sử dụng?\n(Biểu trưng; Cờ và backdrop; Trang phục; Huy chương và chứng nhận; Truyền thông số; Sổ tay nhận diện; Ban Chấp hành; Đại diện đơn vị thành viên; Cộng đồng thực hành; Chuyên gia thiết kế; Chuyên gia văn hóa - di sản; Cơ quan quản lý liên quan).", type: 'textarea', required: false },
    { id: "QT-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Anh/Chị có khuyến nghị nào khác để giải pháp nhận diện đề xuất phù hợp với định hướng phát triển và điều kiện hoạt động thực tế của Liên đoàn không?", type: 'textarea', required: false }
  ],
  "CĐ-TH": [
    { id: "TH-I01", text: "Câu 1. Anh/Chị đang tham gia hoạt động Lân Sư Rồng với vai trò nào? Trong công việc hoặc hoạt động của mình, Anh/Chị thường gặp hình ảnh, biểu trưng hoặc thông tin của Liên đoàn ở đâu?\n(VD: Tập luyện; Thi đấu; Biểu diễn; Tổ chức giải; Đào tạo; Truyền thông đoàn; Cờ, trang phục, huy chương, chứng nhận, banner hoặc bài đăng số).", type: 'textarea', required: false },
    { id: "TH-I02", text: "Câu 2. Trong những lần Anh/Chị tiếp xúc hoặc sử dụng sản phẩm nhận diện hiện hành của Liên đoàn, yếu tố nào dễ nhận ra hoặc có giá trị cần giữ lại? Yếu tố nào gây khó khăn khi sử dụng hoặc tiếp nhận?\n(VD: Tên gọi; Biểu trưng; Màu sắc; Cách đặt logo trên cờ, áo, banner; Độ rõ ở khoảng cách xa; Độ rõ trên màn hình điện thoại; Tính thống nhất giữa các giải hoặc đơn vị).", type: 'textarea', required: false },
    { id: "TH-I03", text: "Câu 3. Nếu Liên đoàn có bộ nhận diện thương hiệu mới, Anh/Chị cho rằng nên ưu tiên áp dụng trước ở những hạng mục nào? Vì sao?\n(VD: Cờ; Trang phục thi đấu; Huy chương và chứng nhận; Banner, backdrop, sân khấu; Poster và ấn phẩm giải đấu; Bài đăng mạng xã hội; Website hoặc nền tảng thông tin).", type: 'textarea', required: false },
    { id: "TH-I04", text: "Câu 4. Theo Anh/Chị, để sử dụng tốt trên cờ, trang phục, huy chương và không gian giải đấu, biểu trưng cần đáp ứng những yêu cầu nào?\n(VD: Nhìn rõ từ xa; Ít chi tiết; Dễ in, thêu hoặc sản xuất; Có màu tương phản tốt; Dễ nhận biết khi thu nhỏ; Sử dụng ở dạng đơn sắc; Phù hợp với chuyển động và không gian thi đấu).", type: 'textarea', required: false },
    { id: "TH-I05", text: "Câu 5. Theo Anh/Chị, khi nhìn vào biểu trưng hoặc bộ nhận diện thương hiệu của Liên đoàn, người thực hành cần nhận ra điều gì về Lân, Sư và Rồng? Có yếu tố nào cần được nhấn mạnh hoặc cần tránh?\n(VD: Lân là nguồn tạo hình chủ đạo; Rồng là thành tố đại diện hoạt động; Sư thể hiện qua tên gọi, nội dung và hệ ứng dụng; Cần hay không cần ba hình tượng xuất hiện đồng thời trong logo; Tránh nhầm lẫn với đầu đạo cụ Nam Sư hoặc Bắc Sư; Tránh biểu trưng quá nhiều chi tiết).", type: 'textarea', required: false },
    { id: "TH-I06", text: "Câu 6. Theo Anh/Chị, việc ứng dụng Lân trong mỹ thuật thời Nguyễn làm nguồn tạo hình cho nhận diện Liên đoàn có phù hợp và gần gũi với cộng đồng thực hành Lân Sư Rồng hiện nay không? Nếu có thì cần thể hiện như thế nào?\n(VD: Giữ sự trang trọng nhưng không quá cổ; Thể hiện tính năng động và tinh thần thể thao; Cần nhận ra Lân ở mức độ nào; Có cần gợi Rồng trong hệ đồ họa; Yếu tố nào khiến thiết kế trở nên xa lạ hoặc khó tiếp nhận).", type: 'textarea', required: false },
    { id: "TH-I07", text: "Câu 7. Anh/Chị có đề xuất nào khác để bộ nhận diện thương hiệu mới phù hợp hơn với người thực hành Lân Sư Rồng và các hoạt động thực tế của Liên đoàn không?\nAnh/Chị có muốn bổ sung hoặc điều chỉnh nội dung nào không?", type: 'textarea', required: false }
  ],
  "CG-MT": [
    { id: "DS-I01", text: "Câu 1. Theo Thầy/Cô, khi khảo sát một hiện vật hoặc đồ án trang trí thuộc thời Nguyễn, những căn cứ nào cần được ưu tiên để xác định hình tượng đó là Lân?\n(VD: Cấu trúc đầu, sừng, mắt, mũi, miệng, bờm; Thân, chân, móng, đuôi và dáng thế; Chất liệu và kỹ thuật tạo tác; Vị trí xuất hiện; Quan hệ với mô-típ hỗ trợ ;Hồ sơ hiện vật, văn bản hoặc nguồn nghiên cứu).", type: 'textarea', required: false },
    { id: "DS-I02", text: "Câu 2. Trong thực tế mỹ thuật Việt Nam có sự giao thoa về danh xưng và hình thái linh vật, việc phân biệt Lân thời Nguyễn với Nghê, Long Mã, sư tử trang trí hoặc các hình thức lai ghép cần lưu ý những vấn đề nào?\n(VD: Đặc điểm hình thái; Chức năng bảo hộ hoặc trang trí; Không gian cung đình, tín ngưỡng, dân gian; Bố cục và mô-típ đi kèm; Tư liệu đối chiếu; Những trường hợp không nên định danh quá sớm).", type: 'textarea', required: false },
    { id: "DS-I03", text: "Câu 3. Trong hệ mẫu Lân thời Nguyễn, theo Thầy/Cô, những nhóm đặc trưng tạo hình nào có giá trị nhận biết cao và cần được ưu tiên khảo sát?\n(VD: Đầu và sừng; Bờm, thân, chân, đuôi; Dáng đứng, dáng chầu, dáng chuyển động.\nĐường nét, nhịp điệu, tỷ lệ; Mây, lửa, hoa lá, quả hoặc mô-típ phụ trợ; Quan hệ giữa hình tượng với vật liệu và mặt kiến trúc).", type: 'textarea', required: false },
    { id: "DS-I04", text: "Câu 4. Theo Thầy/Cô, chất liệu, vị trí đặt và không gian kiến trúc tác động như thế nào đến việc nhận diện và diễn giải Lân thời Nguyễn?\n(VD: Tượng đồng, đá, gỗ; Nề vữa, đắp nổi, khảm sành sứ; Cung điện, lăng tẩm, miếu thờ; Cổng, bình phong, nhà bia, đầu hồi; Trục nghi lễ, không gian tưởng niệm, không gian trang trí).", type: 'textarea', required: false },
    { id: "DS-I05", text: "Câu 5. Theo Thầy/Cô, các ý nghĩa thường gắn với Lân như điềm lành, thời bình, đạo trị, trật tự cung đình hoặc lòng trung quân cần được diễn giải theo nguyên tắc nào để tránh suy diễn?\n(VD: Mối quan hệ giữa nghĩa chung của linh vật và nghĩa ở từng hiện vật; Căn cứ từ nguồn lịch sử mỹ thuật; Bối cảnh kiến trúc và chức năng công trình; Quan hệ với hệ Tứ linh; Những ý nghĩa không nên gán khi thiếu tư liệu).", type: 'textarea', required: false },
    { id: "DS-I06", text: "Câu 6. Theo Thầy/Cô, việc đối sánh Lân thời Nguyễn với kỳ lân trong một số tư liệu Hoa ngữ cần được thực hiện và giới hạn như thế nào?\n(VD: Tương đồng về tên gọi và cấu trúc hình thái; Sự tiếp nhận, lựa chọn và điều chỉnh trong mỹ thuật Việt Nam; Tránh cách hiểu nguồn gốc đơn tuyến; Không đồng nhất tương đồng với sao chép; Không xem mọi khác biệt là bằng chứng tuyệt đối của bản địa hóa).", type: 'textarea', required: false },
    { id: "DS-I07", text: "Câu 7. Theo Thầy/Cô, khi chuyển hóa hình tượng Lân thời Nguyễn vào bộ nhận diện thương hiệu, những yếu tố nào cần được bảo toàn, những yếu tố nào có thể giản lược và những yếu tố nào cần tránh?\n(Cấu trúc nhận biết; Nhịp đường nét; Tỷ lệ và dáng thế; Mô-típ hỗ trợ; Chất liệu, màu sắc và bề mặt; Giá trị biểu tượng; Nguy cơ sao chép, phục dựng hoặc mô phỏng bề mặt).", type: 'textarea', required: false },
    { id: "DS-I08", text: "Câu 8. Đề tài xác định Lân thời Nguyễn là nguồn tạo hình chủ đạo; Rồng là thành tố cần được xem xét để đáp ứng yêu cầu đại diện tổ chức; Sư được duy trì ở cấp độ tên gọi và hệ ứng dụng. Theo Thầy/Cô, cách tổ chức này có phù hợp không? Những vấn đề nào cần lưu ý khi tích hợp Rồng vào bộ nhận diện thương hiệu nhưng vẫn giữ vai trò hạt nhân của Lân thời Nguyễn?\n(Lân là hạt nhân nguồn; Rồng là thành tố đại diện tổ chức; Sư không nhất thiết thành hình tượng riêng trong logo; Tránh ghép ba đầu linh vật; Tránh sao chép đầu đạo cụ biểu diễn; Rồng xuất hiện qua nhịp nét, hướng chuyển động, thế bao hoặc đồ họa hỗ trợ).", type: 'textarea', required: false },
    { id: "DS-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Thầy/Cô có khuyến nghị nào khác về hệ mẫu hiện vật, cách phân tích hoặc hướng chuyển hóa hình tượng Lân thời Nguyễn trong đề tài này không?", type: 'textarea', required: false }
  ],
  "CG-TK": [
    { id: "TK-I01", text: "Câu 1. Theo Anh/Chị, một bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam cần giải quyết những bài toán chiến lược nào trước khi bắt đầu phát triển biểu trưng và hệ đồ họa?\n(VD: Vị thế tổ chức ở phạm vi quốc gia; Mối quan hệ giữa văn hóa, cộng đồng, thể thao và truyền thông; Khác biệt với đoàn biểu diễn, câu lạc bộ hoặc tổ chức Lân Sư Rồng khác; Tính chính thống, chuyên nghiệp và khả năng hội nhập; Nhóm công chúng và điểm tiếp xúc ưu tiên).", type: 'textarea', required: false },
    { id: "TK-I02", text: "Câu 2. Theo Anh/Chị, trong một dự án nhận diện cho tổ chức hoạt động đa nền tảng như Liên đoàn, các thành tố nào cần được xác lập trước và theo trình tự nào?\n(VD: Định hướng bản sắc; Biểu trưng; Hệ màu; Kiểu chữ; Họa tiết hoặc đồ họa hỗ trợ; Hệ thống bố cục; Quy chuẩn sử dụng; Ứng dụng tiêu biểu; Sổ tay nhận diện).", type: 'textarea', required: false },
    { id: "TK-I03", text: "Câu 3. Đề tài dự kiến trích xuất đặc trưng từ hình tượng Lân trong mỹ thuật thời Nguyễn để phát triển biểu trưng và hệ đồ họa. Theo Anh/Chị, quá trình này cần thực hiện theo nguyên tắc nào để vừa duy trì mối liên hệ với nguồn di sản, vừa bảo đảm tính đương đại?\n(VD: Chọn cấu trúc nhận biết thay vì sao chép hình ảnh; Phân rã đầu, sừng, bờm, thân, đuôi và nhịp đường nét; Xác định đặc trưng cốt lõi và đặc trưng phụ trợ; Giản lược tỷ lệ, mảng và chi tiết; Kiểm tra khả năng nhận biết ở kích thước nhỏ; Tránh mô phỏng hoa văn cổ như yếu tố trang trí bề mặt).", type: 'textarea', required: false },
    { id: "TK-I04", text: "Câu 4. Theo Anh/Chị, những loại dữ liệu nào nên được ưu tiên cho biểu trưng chính, và những loại dữ liệu nào phù hợp hơn để phát triển pattern, màu sắc, bố cục hoặc hệ đồ họa hỗ trợ?\n(VD: Cấu trúc đầu, sừng, bờm; Đường cong thân, đuôi và nhịp vận động; Mây, lửa, hoa lá và mô-típ phụ trợ; Chất liệu khảm sành sứ, pháp lam hoặc đồng; Bố cục chầu, đối xứng hoặc liên hoàn; Giá trị biểu tượng và thông điệp).", type: 'textarea', required: false },
    { id: "TK-I05", text: "Câu 5. Theo Anh/Chị, nguyên tắc lấy Lân thời Nguyễn làm chủ đạo, Rồng đại diện cho Liên đoàn, và Sư qua tên gọi/ứng dụng có phù hợp không? Nên tích hợp Rồng thế nào để tránh biến biểu trưng thành bộ minh họa nhiều linh vật?\n(VD: Đường uốn, hướng chuyển động, thế bao hoặc khoảng âm; Họa tiết hoặc dấu hiệu phụ; Dấu hiệu dùng trong hệ ứng dụng thay vì biểu trưng chính; Mức độ nhận biết cần thiết của Rồng; Tránh ghép ba đầu linh vật ngang hàng; Tránh sao chép đầu Rồng biểu diễn).", type: 'textarea', required: false },
    { id: "TK-I06", text: "Câu 6. Theo Anh/Chị, những rủi ro tạo hình nào thường xuất hiện khi thiết kế nhận diện từ chất liệu truyền thống và linh vật văn hóa?\n(VD: Quá nhiều chi tiết; Khó nhận biết ở kích thước nhỏ; Lạm dụng mô-típ trang trí; Lẫn lộn giữa linh vật truyền thống và đạo cụ biểu diễn; Pha trộn quá nhiều biểu tượng; Thiếu khác biệt với biểu trưng của các đoàn hoặc giải đấu; Màu sắc và kiểu chữ không thống nhất; Hệ ứng dụng không có khả năng mở rộng).", type: 'textarea', required: false },
    { id: "TK-I07", text: "Câu 7. Theo Anh/Chị, biểu trưng và bộ nhận diện thương hiệu cần đáp ứng những điều kiện kỹ thuật nào để vận hành ổn định trên trang phục, cờ, huy chương, banner, backdrop, chứng nhận và nền tảng số?\n(VD: Kích thước tối thiểu; Phiên bản ngang, dọc, rút gọn; Phiên bản đơn sắc và âm bản; Tỷ lệ logo - chữ; Tương phản màu; Khả năng in, thêu, cắt decal hoặc gia công; Khả năng hiển thị trên màn hình nhỏ; Hệ lưới và phân cấp thông tin).", type: 'textarea', required: false },
    { id: "TK-I08", text: "Câu 8. Theo Anh/Chị, một giải pháp nhận diện ứng dụng từ di sản cần được đánh giá theo những tiêu chí nào? Những nhóm đối tượng nào cần tham gia kiểm chứng trước khi hoàn thiện?\n(VD: Tính thẩm mỹ; Tính bản sắc; Khả năng nhận biết; Tính đại diện tổ chức ;Khả năng ứng dụng; Tính nhất quán; Khả năng mở rộng; Đại diện Liên đoàn ;Cộng đồng thực hành; Chuyên gia mỹ thuật, di sản; Chuyên gia thiết kế, truyền thông; Công chúng tiếp nhận).", type: 'textarea', required: false },
    { id: "TK-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Anh/Chị có khuyến nghị nào khác về chiến lược, nguyên tắc tạo hình hoặc điều kiện triển khai bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam không?", type: 'textarea', required: false }
  ]
};
