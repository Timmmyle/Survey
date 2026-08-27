export interface SurveyGroup {
  code: string;
  name: string;
  nameEn: string;
  codePrefix: string;
}

export type SurveyQuestionType = 'likert' | 'checkbox' | 'textarea';

export interface SurveyQuestionConfig {
  id: string;
  text: string;
  textEn?: string;
  type: SurveyQuestionType;
  options?: string[]; // For checkbox questions
  optionsEn?: string[]; // For checkbox questions (English)
  minSelect?: number; // Minimum boxes required to select
  maxSelect?: number; // Maximum boxes allowed to select
  allowOther?: boolean; // Has a "Khác: ..." text field
  required?: boolean;
}

// 1. THESIS & RESEARCH METADATA
export const THESIS_METADATA = {
  websiteTitle: "BẢNG KHẢO SÁT VÀ PHỎNG VẤN THU THẬP Ý KIẾN VỀ BỘ NHẬN DIỆN THƯƠNG HIỆU LIÊN ĐOÀN LÂN SƯ RỒNG VIỆT NAM",
  websiteTitleEn: "SURVEY AND INTERVIEW FOR FEEDBACK ON THE BRAND IDENTITY OF THE VIETNAM LION AND DRAGON DANCE FEDERATION",
  headerTitle: "PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA KHẢO SÁT/PHỎNG VẤN",
  headerTitleEn: "INFORMATION AND CONSENT FORM FOR SURVEY/INTERVIEW",
  thesisName: "“Ứng dụng hình tượng Lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam”",
  thesisNameEn: "“Applying the Lion (Lan) Image in Nguyen Dynasty Fine Arts to the Design of the Brand Identity for the Vietnam Lion and Dragon Dance Federation”",
  studentName: "Phạm Nguyễn Vân Anh",
  studentNameEn: "Pham Nguyen Van Anh",
  institution: "Trường Đại học Văn Lang",
  institutionEn: "Van Lang University",
  contact: {
    email: "anhpnv3@fe.edu.vn",
    phone: "0931343497"
  },
  instructions: [
    "Kính mời Ông/Bà tham gia khảo sát/ phỏng vấn phục vụ luận văn cao học về thiết kế bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam. Nghiên cứu tìm hiểu nhu cầu và yêu cầu thực tế đối với bộ nhận diện của Liên đoàn; đồng thời xem xét việc lấy cảm hứng từ hình tượng lân trong mỹ thuật thời Nguyễn để phát triển giải pháp thiết kế phù hợp.",
    "Ý kiến của Ông/Bà sẽ góp phần xác định tiêu chí thiết kế và đánh giá khả năng ứng dụng thực tế của giải pháp đề xuất. Bảng hỏi cần khoảng 5-7 phút. Phỏng vấn, nếu có, kéo dài khoảng 15-20 phút.",
    "Việc tham gia hoàn toàn tự nguyện. Thông tin chỉ được sử dụng cho mục đích học thuật, được bảo mật và chỉ nêu danh tính khi có sự đồng ý của Ông/Bà. Bản ghi âm/ ghi hình, nếu có, chỉ dùng để tổng hợp nội dung phỏng vấn."
  ],
  instructionsEn: [
    "We cordially invite you to participate in a survey/interview for a master's thesis on designing the brand identity for the Vietnam Lion and Dragon Dance Federation. The research aims to explore the Federation's practical needs and requirements for its brand identity, while considering inspiration from the Nguyen Dynasty Lion (Lan) image to develop a suitable design solution.",
    "Your opinions will contribute to defining the design criteria and evaluating the practical applicability of the proposed solution. The questionnaire takes about 5-7 minutes. The interview, if any, lasts about 15-20 minutes.",
    "Participation is entirely voluntary. The collected information will be used solely for academic purposes, kept strictly confidential, and your identity will only be disclosed with your consent. Audio/video recordings, if any, will only be used to summarize the interview content."
  ]
};

// 2. PARTICIPANT GROUPS
export const SURVEY_GROUPS: SurveyGroup[] = [
  { code: 'QT-LĐ', name: 'Quản trị Liên đoàn Lân Sư Rồng Việt Nam', nameEn: 'Management of the Vietnam Lion and Dragon Dance Federation', codePrefix: 'QT-LĐ' },
  { code: 'CĐ-TH', name: 'Cộng đồng thực hành Lân Sư Rồng', nameEn: 'Lion and Dragon Dance Practicing Community', codePrefix: 'CĐ-TH' },
  { code: 'CG-MT', name: 'Chuyên gia mỹ thuật - di sản - văn hóa', nameEn: 'Fine Arts - Heritage - Culture Experts', codePrefix: 'CG-MT' },
  { code: 'CG-TK', name: 'Chuyên gia thiết kế đồ họa - nhận diện', nameEn: 'Graphic Design - Identity Experts', codePrefix: 'CG-TK' },
  { code: 'KG-ĐT', name: 'Công chúng, khán giả, đối tác hoặc truyền thông', nameEn: 'Public, Audience, Partners or Media', codePrefix: 'KG-ĐT' },
];

// LIKERT OPTIONS DEFINITION (😞 😐 🙂 😊 🤩 Scale)
export interface LikertScaleOption {
  value: number;
  emoji: string;
  label: string;
  labelEn: string;
}

export const LIKERT_SCALE_OPTIONS: LikertScaleOption[] = [
  { value: 1, emoji: '😞', label: 'Hoàn toàn không đồng ý', labelEn: 'Strongly disagree' },
  { value: 2, emoji: '😐', label: 'Không đồng ý', labelEn: 'Disagree' },
  { value: 3, emoji: '🙂', label: 'Trung lập', labelEn: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Đồng ý', labelEn: 'Agree' },
  { value: 5, emoji: '🤩', label: 'Hoàn toàn đồng ý', labelEn: 'Strongly agree' },
];

// 3. COMMON QUESTIONS (PART A) - Likert Questions C1 to C7
export const COMMON_LIKERT_QUESTIONS: SurveyQuestionConfig[] = [
  {
    id: "C1",
    text: "C1. Liên đoàn Lân Sư Rồng Việt Nam cần một bộ nhận diện thương hiệu để thể hiện rõ vai trò của tổ chức ở quy mô quốc gia.",
    textEn: "C1. The Vietnam Lion and Dragon Dance Federation needs a brand identity to clearly demonstrate the role of the organization at the national level.",
    type: 'likert',
    required: true
  },
  {
    id: "C2",
    text: "C2. Bộ nhận diện thương hiệu cần phản ánh phù hợp đặc điểm tổ chức, thể thao, văn hóa và cộng đồng của lĩnh vực Lân Sư Rồng.",
    textEn: "C2. The brand identity needs to appropriately reflect the organizational, sporting, cultural, and community characteristics of the Lion and Dragon Dance field.",
    type: 'likert',
    required: true
  },
  {
    id: "C3",
    text: "C3. Bộ nhận diện thương hiệu cần rõ ràng, dễ nhận biết và có khả năng ứng dụng trên nhiều môi trường sử dụng.",
    textEn: "C3. The brand identity needs to be clear, easily recognizable, and applicable across multiple environments.",
    type: 'likert',
    required: true
  },
  {
    id: "C4",
    text: "C4. Hình tượng Lân trong mỹ thuật thời Nguyễn được xem xét như một nguồn tạo hình cho bộ nhận diện thương hiệu của Liên đoàn.",
    textEn: "C4. The Lion (Lan) image in Nguyen Dynasty fine arts is considered as a source of design for the Federation's brand identity.",
    type: 'likert',
    required: true
  },
  {
    id: "C5",
    text: "C5. Rồng cần được thể hiện phù hợp trong biểu trưng hoặc bộ nhận diện thương hiệu để phản ánh phạm vi hoạt động của Liên đoàn.",
    textEn: "C5. The Dragon needs to be appropriately represented in the logo or brand identity to reflect the Federation's scope of activities.",
    type: 'likert',
    required: true
  },
  {
    id: "C6",
    text: "C6. Khi ứng dụng các yếu tố mỹ thuật truyền thống, thiết kế cần chuyển hóa có chọn lọc thay vì sao chép trực tiếp hiện vật.",
    textEn: "C6. When applying traditional art elements, the design should selectively transform rather than directly copy artifacts.",
    type: 'likert',
    required: true
  },
  {
    id: "C7",
    text: "C7. Giải pháp nhận diện cần được lấy ý kiến từ Liên đoàn, cộng đồng thực hành và chuyên gia trước khi đề xuất triển khai.",
    textEn: "C7. The identity solution needs to be consulted with the Federation, the practicing community, and experts before proposing implementation.",
    type: 'likert',
    required: true
  }
];

// 4. GROUP-SPECIFIC QUESTIONS (PART B TO PART F)
export const GROUP_LIKERT_QUESTIONS: Record<string, SurveyQuestionConfig[]> = {
  // Part B: Dành cho nhóm Quản trị (QT1 - QT7)
  "QT-LĐ": [
    { id: "QT1", text: "QT1. Một sổ tay nhận diện có quy chuẩn rõ ràng sẽ hỗ trợ các đơn vị thành viên sử dụng hình ảnh Liên đoàn nhất quán hơn.", textEn: "QT1. An identity manual with clear guidelines will support member units in using the Federation's imagery more consistently.", type: 'likert', required: true },
    { id: "QT2", text: "QT2. Bộ nhận diện thương hiệu cần đáp ứng yêu cầu sử dụng trong văn bản, giải đấu, sự kiện và hoạt động đối ngoại của Liên đoàn.", textEn: "QT2. The brand identity needs to meet the usage requirements in documents, tournaments, events, and external affairs of the Federation.", type: 'likert', required: true },
    { id: "QT3", text: "QT3. Biểu trưng và bộ nhận diện thương hiệu cần thể hiện được tính chính thống, uy tín và vị thế tổ chức của Liên đoàn.", textEn: "QT3. The logo and brand identity need to express the official status, prestige, and organizational position of the Federation.", type: 'likert', required: true },
    { id: "QT4", text: "QT4. Yếu tố tạo hình chủ đạo vẫn đại diện cho Liên đoàn nếu Lân, Sư và Rồng được phân cấp hợp lý trong toàn hệ thống.", textEn: "QT4. The dominant visual element will still represent the Federation if Lion, Sư, and Dragon are reasonably prioritized across the system.", type: 'likert', required: true },
    { id: "QT5", text: "QT5. Các hạng mục ưu tiên triển khai của tín hiệu nhận diện cần gồm biểu trưng, cờ, trang phục, huy chương, chứng nhận và truyền thông số.", textEn: "QT5. Priority implementation items for identity signals should include the logo, flag, uniforms, medals, certificates, and digital media.", type: 'likert', required: true },
    {
      id: "QT6",
      text: "QT6. Xin Anh/Chị chọn tối thiểu bốn giá trị cần được ưu tiên trong tín hiệu nhận diện của Liên đoàn",
      textEn: "QT6. Please select at least four values that should be prioritized in the Federation's identity signals",
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
      optionsEn: [
        "Official status and organizational prestige",
        "Martial spirit and discipline",
        "Professionalism in sporting environment",
        "Community engagement",
        "Solemnity / Formality",
        "Dynamism and modernity",
        "Connection with Vietnamese art heritage",
        "Representability in international activities",
        "Recognizability and memorability"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "QT7",
      text: "QT7. Xin Anh/Chị chọn tối thiểu bốn hạng mục cần được ưu tiên triển khai trước",
      textEn: "QT7. Please select at least four items that need to be prioritized for early implementation",
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
      optionsEn: [
        "Logo and Federation name",
        "Color system and typography",
        "Supporting patterns/graphics",
        "Tournament attire and uniforms",
        "Flags, banners, backdrops, and tournament spaces",
        "Medals, trophies, certificates, and badges",
        "Social media posts, videos, and digital graphics",
        "Website or information platforms",
        "Identity guidelines manual"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    }
  ],

  // Part C: Dành cho nhóm Cộng đồng thực hành (TH1 - TH7)
  "CĐ-TH": [
    { id: "TH1", text: "TH1. Biểu trưng cần được nhận biết rõ ở khoảng cách xa khi sử dụng trên cờ, banner và khu vực giải đấu.", textEn: "TH1. The logo needs to be clearly recognized from a distance when used on flags, banners, and tournament areas.", type: 'likert', required: true },
    { id: "TH2", text: "TH2. Biểu trưng cần ứng dụng tốt trên trang phục, huy chương, thẻ và các vật phẩm có kích thước nhỏ.", textEn: "TH2. The logo needs to apply well on uniforms, medals, cards, and small-sized items.", type: 'likert', required: true },
    { id: "TH3", text: "TH3. Hệ màu và kiểu chữ cần rõ ràng, phù hợp với môi trường thi đấu, biểu diễn và truyền thông số.", textEn: "TH3. The color system and typography need to be clear and suitable for tournament, performance, and digital environments.", type: 'likert', required: true },
    { id: "TH4", text: "TH4. Cờ, trang phục, huy chương, backdrop và bài đăng số là những điểm tiếp xúc cần được ưu tiên ứng dụng.", textEn: "TH4. Flags, uniforms, medals, backdrops, and digital posts are touchpoints that should be prioritized for application.", type: 'likert', required: true },
    { id: "TH5", text: "TH5. Một bộ nhận diện thương hiệu chung tăng cảm giác gắn kết và tự hào của người thực hành khi đại diện cho Liên đoàn.", textEn: "TH5. A shared brand identity increases the sense of connection and pride of practitioners when representing the Federation.", type: 'likert', required: true },
    {
      id: "TH6",
      text: "TH6. Xin Anh/Chị chọn tối đa ba hạng mục cần được ưu tiên ứng dụng trước",
      textEn: "TH6. Please select up to three items to be prioritized for application first",
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
      optionsEn: [
        "Logo and Federation name",
        "Color system and typography",
        "Supporting patterns/graphics",
        "Tournament attire and uniforms",
        "Flags, banners, backdrops, and tournament spaces",
        "Medals, trophies, certificates, and badges",
        "Social media posts, videos, and digital graphics",
        "Website or information platforms",
        "Identity guidelines manual"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    },
    {
      id: "TH7",
      text: "TH7. Khi sử dụng tín hiệu nhận diện trong hoạt động thực tế, Anh/Chị cho rằng ba yêu cầu nào quan trọng nhất?",
      textEn: "TH7. When using identity signals in actual practice, which three requirements do you think are most important?",
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
      optionsEn: [
        "Visible from a distance",
        "Easily recognizable at small sizes",
        "Easy to print, embroider, or produce on physical materials",
        "Clear colors with good contrast",
        "Showing the Federation's professionalism",
        "Showing the Lion Sư Dragon spirit",
        "Creating a sense of pride and community cohesion",
        "Synchronized use across teams and tournaments"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    }
  ],

  // Part D: Dành cho nhóm Chuyên gia Mỹ thuật - Di sản - Văn hóa (DS1 - DS7)
  "CG-MT": [
    { id: "DS1", text: "DS1. Việc định danh Lân thời Nguyễn cần dựa trên tổ hợp dữ liệu gồm hình thái, chất liệu, vị trí xuất hiện, ngữ cảnh và tư liệu đối chiếu.", textEn: "DS1. Identifying the Nguyen Dynasty Lion (Lan) should be based on a combination of data including morphology, material, location of occurrence, context, and comparative documents.", type: 'likert', required: true },
    { id: "DS2", text: "DS2. Cần phân biệt Lân với Nghê, Long Mã, sư tử trang trí và các linh vật gần nghĩa trước khi chuyển hóa dữ liệu tạo hình.", textEn: "DS2. It is necessary to distinguish Lion (Lan) from Nghê, Long Ma, decorative lions, and close semantically related creatures before transforming visual data.", type: 'likert', required: true },
    { id: "DS3", text: "DS3. Các giá trị biểu tượng của Lân cần được diễn giải trên cơ sở hiện vật, không gian kiến trúc và nguồn tư liệu chuyên ngành.", textEn: "DS3. The symbolic values of the Lion need to be interpreted based on artifacts, architectural spaces, and specialized literature.", type: 'likert', required: true },
    { id: "DS4", text: "DS4. Lân thời Nguyễn giữ vai trò hạt nhân tạo hình, trong khi Rồng được tích hợp như thành tố đại diện của tổ chức trong bộ nhận diện thương hiệu.", textEn: "DS4. The Nguyen Dynasty Lion plays the role of the visual core, while the Dragon is integrated as a representative element of the organization in the brand identity.", type: 'likert', required: true },
    { id: "DS5", text: "DS5. Giải pháp nhận diện cần duy trì mối liên hệ với di sản mỹ thuật Việt Nam nhưng không tạo cảm giác phục dựng hoặc mô phỏng cổ.", textEn: "DS5. The identity solution needs to maintain a connection with Vietnamese art heritage but without creating a feeling of historical restoration or ancient replication.", type: 'likert', required: true },
    {
      id: "DS6",
      text: "DS6. Xin Thầy/Cô chọn tối đa bốn nguyên tắc cần được ưu tiên khi chuyển hóa hình tượng Lân thời Nguyễn vào bộ nhận diện thương hiệu.",
      textEn: "DS6. Please select up to four principles to be prioritized when transforming the Nguyen Dynasty Lion image into the brand identity.",
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
        "Bảo đảm khả năng vận hành trên các nhóm ứng dụng"
      ],
      optionsEn: [
        "Identify the correct source image",
        "Ensure basis on artifacts and specialized literature",
        "Keep recognizable visual structures",
        "Avoid direct copying of ancient artifacts",
        "Maintain connection with Hue imperial fine arts",
        "Simplify appropriately for contemporary environments",
        "Avoid confusing the Lion with Nghê, Long Ma, or decorative lions",
        "Cautiously transform symbolic values",
        "Ensure effective operation on application groups"
      ],
      minSelect: 1,
      maxSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "DS7",
      text: "DS7. Xin Thầy/Cô chọn tối đa ba nhóm dữ liệu cần được ưu tiên trích xuất từ hệ mẫu Lân thời Nguyễn.",
      textEn: "DS7. Please select up to three groups of data that should be prioritized for extraction from the Nguyen Dynasty Lion pattern system.",
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
      optionsEn: [
        "Head and horn structure",
        "Mane, body, legs, and tail",
        "Rhythm of lines and posture",
        "Clouds, fire, foliage, and auxiliary motifs",
        "Adoration, symmetrical, or continuous compositions",
        "Material and color relationships",
        "Location of appearance in imperial architecture",
        "Grounded layers of symbolic meaning"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    }
  ],

  // Part E: Dành cho nhóm Chuyên gia Thiết kế (TK1 - TK7)
  "CG-TK": [
    { id: "TK1", text: "TK1. Các yếu tố tạo hình của Lân thời Nguyễn sau khi được giản lược cần đảm bảo khả năng nhận diện được linh vật này.", textEn: "TK1. The simplified visual elements of the Nguyen Dynasty Lion must ensure that this mythical creature remains recognizable.", type: 'likert', required: true },
    { id: "TK2", text: "TK2. Biểu trưng cần vận hành hiệu quả trên các nhóm ứng dụng.", textEn: "TK2. The identity system needs to operate effectively on the application groups.", type: 'likert', required: true },
    { id: "TK3", text: "TK3. Hệ màu, kiểu chữ, họa tiết hỗ trợ và bố cục cần được phát triển theo một định hướng thị giác thống nhất.", textEn: "TK3. The color system, typography, supporting patterns, and layouts must be developed under a unified visual direction.", type: 'likert', required: true },
    { id: "TK4", text: "TK4. Rồng nên được tích hợp như thành tố bổ trợ trong cấu trúc nhận diện, thay vì ghép hình minh họa ngang hàng với Lân và Sư.", textEn: "TK4. The Dragon should be integrated as an auxiliary component in the identity structure, rather than juxtaposing it as an equal illustration with Lion and Sư.", type: 'likert', required: true },
    { id: "TK5", text: "TK5. Bộ nhận diện thương hiệu cần có quy chuẩn rõ để mở rộng trên ứng dụng thể thao, sự kiện, in ấn và truyền thông số.", textEn: "TK5. The brand identity needs to have clear standards to expand to sports applications, events, print, and digital media.", type: 'likert', required: true },
    {
      id: "TK6",
      text: "TK6. Xin Anh/Chị chọn tối thiểu bốn tiêu chí cần được ưu tiên khi phát triển bộ nhận diện thương hiệu cho Liên đoàn.",
      textEn: "TK6. Please select at least four criteria to be prioritized when developing the brand identity for the Federation.",
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
        "Khả năng vận hành trên nhóm ứng dụng số"
      ],
      optionsEn: [
        "Simplicity and memorability",
        "Difference from other organizations or performance teams",
        "Clear connection with the Nguyen Dynasty Lion image",
        "Ability to integrate the Dragon component appropriately",
        "Recognizability at small sizes",
        "Ability to be used in monochrome",
        "Consistency between logo, colors, typography, and patterns",
        "Applicability on uniforms, flags, and tournament spaces",
        "Operation on digital application groups"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "TK7",
      text: "TK7. Xin Anh/Chị chọn tối thiểu bốn thành tố cần được ưu tiên phát triển trong bộ nhận diện thương hiệu.",
      textEn: "TK7. Please select at least four components to be prioritized for development in the brand identity.",
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
      optionsEn: [
        "Primary logo and its versions",
        "Typography and Federation name structure",
        "Identity color system",
        "Supporting patterns/graphics",
        "Layout system and application grid",
        "Standards for logo usage",
        "Uniform, flag, and medal applications",
        "Event applications: banners, backdrops, stage",
        "Digital media applications: social media, video, website"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    }
  ],

  // Part F: Dành cho nhóm Công chúng, khán giả, đối tác và truyền thông (CT1 - CT5, P1 - P3)
  "KG-ĐT": [
    { id: "CT1", text: "CT1. Khi nhìn thấy tín hiệu nhận diện, tôi cần nhận ra nhanh đây là tổ chức Lân Sư Rồng Việt Nam.", textEn: "CT1. When seeing the identity signal, I need to quickly recognize it as the Vietnam Lion Sư Dragon Federation.", type: 'likert', required: true },
    { id: "CT2", text: "CT2. Bộ nhận diện thương hiệu cần tạo cảm giác chính thống, chuyên nghiệp và đáng tin cậy", textEn: "CT2. The brand identity needs to create an official, professional, and reliable feeling.", type: 'likert', required: true },
    { id: "CT3", text: "CT3. Biểu trưng và thông tin cần rõ ràng, dễ nhận biết trên mạng xã hội và các ấn phẩm số.", textEn: "CT3. The logo and information must be clear and easily recognizable on social media and digital publications.", type: 'likert', required: true },
    { id: "CT4", text: "CT4. Bộ nhận diện thương hiệu cần gợi được mối liên hệ với văn hóa Việt Nam nhưng vẫn có cảm giác hiện đại.", textEn: "CT4. The brand identity needs to evoke a connection with Vietnamese culture while maintaining a modern feel.", type: 'likert', required: true },
    { id: "CT5", text: "CT5. Hình ảnh, màu sắc và kiểu chữ cần giúp phân biệt Liên đoàn với các đoàn biểu diễn hoặc tổ chức khác.", textEn: "CT5. Images, colors, and typography need to help distinguish the Federation from other performance teams or organizations.", type: 'likert', required: true },
    {
      id: "P1",
      text: "P1. Theo Anh/Chị, xin chọn tối thiểu bốn giá trị cần được ưu tiên trong bộ nhận diện thương hiệu của Liên đoàn Lân Sư Rồng Việt Nam:",
      textEn: "P1. In your opinion, please select at least four values to be prioritized in the Federation's brand identity:",
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
      optionsEn: [
        "Official status and organizational prestige",
        "Martial spirit and discipline",
        "Professionalism in sporting environment",
        "Community engagement",
        "Solemnity / Formality",
        "Dynamism and modernity",
        "Connection with Vietnamese art heritage",
        "Representability in international activities",
        "Recognizability and memorability"
      ],
      minSelect: 4,
      allowOther: true,
      required: true
    },
    {
      id: "P2",
      text: "P2. Theo Anh/Chị, xin chọn tối đa ba hạng mục cần được ưu tiên triển khai trong bộ nhận diện thương hiệu của Liên đoàn:",
      textEn: "P2. In your opinion, please select up to three items to be prioritized for implementation in the Federation's brand identity:",
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
      optionsEn: [
        "Logo and Federation name",
        "Color system and typography",
        "Supporting patterns/graphics",
        "Tournament attire and uniforms",
        "Flags, banners, backdrops, and tournament spaces",
        "Medals, trophies, certificates, and badges",
        "Social media posts, videos, and digital graphics",
        "Website or information platforms",
        "Identity guidelines manual"
      ],
      minSelect: 1,
      maxSelect: 3,
      allowOther: true,
      required: true
    },
    {
      id: "P3",
      text: "P3. Anh/Chị có ý kiến hoặc đề xuất nào khác về bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam không?",
      textEn: "P3. Do you have any other comments or suggestions regarding the brand identity of the Vietnam Lion and Dragon Dance Federation?",
      type: 'textarea',
      required: false
    }
  ]
};

export const INTERVIEW_QUESTIONS: Record<string, SurveyQuestionConfig[]> = {
  "QT-LĐ": [
    { id: "QT-I01", text: "Câu 1. Theo Anh/Chị, trong giai đoạn 2023-2028, Liên đoàn ưu tiên những nhiệm vụ nào và muốn xây dựng hình ảnh tổ chức theo định hướng nào?\n(VD: Phát triển phong trào; Đào tạo vận động viên, huấn luyện viên và trọng tài; Tổ chức thi đấu; Chuẩn hóa chuyên môn; Kết nối đơn vị thành viên; Bảo tồn và phát huy giá trị văn hóa; Hợp tác, giao lưu quốc tế; Truyền thông và xây dựng hình ảnh tổ chức).", textEn: "Question 1. In your opinion, in the 2023-2028 period, what tasks does the Federation prioritize and what image does it want to build?\n(e.g., Movement development; training athletes, coaches, and referees; organizing tournaments; professional standardization; member connection; cultural preservation; international cooperation; communication and image building).", type: 'textarea', required: false },
    { id: "QT-I02", text: "Câu 2. Trong khoảng 5 năm tới, Anh/Chị mong muốn công chúng, hội viên, đối tác và cơ quan quản lý nhận biết Liên đoàn là một tổ chức như thế nào?\n(VD: Chính thống; Chuyên nghiệp; Kỷ luật; Thượng võ; Văn hóa; Gắn kết cộng đồng; Năng động; Hiện đại; Có năng lực hội nhập quốc tế).", textEn: "Question 2. In the next 5 years, how do you want the public, members, partners, and regulators to recognize the Federation?\n(e.g., Official; Professional; Disciplined; Martial; Cultural; Community-oriented; Dynamic; Modern; Internationally capable).", type: 'textarea', required: false },
    { id: "QT-I03", text: "Câu 3. Theo Anh/Chị, bộ nhận diện thương hiệu và hoạt động truyền thông hiện hành của Liên đoàn có những yếu tố nào cần được kế thừa trong giải pháp mới?\n(VD: Tên gọi; Chữ viết tắt; Biểu trưng; Màu sắc; Dấu hiệu quốc gia; Hình ảnh Lân, Sư hoặc Rồng; Sự quen thuộc trong cộng đồng; Những ứng dụng đang được sử dụng hiệu quả).", textEn: "Question 3. In your opinion, which elements of the current brand identity and communication activities should be inherited in the new solution?\n(e.g., Name; Abbreviation; Logo; Colors; National signs; Images of Lion, Sư, or Dragon; Familiarity in community; Effectively used applications).", type: 'textarea', required: false },
    { id: "QT-I04", text: "Câu 4. Trong việc sử dụng nhận diện hiện hành, Liên đoàn gặp những khó khăn nào tại hoạt động thi đấu, sự kiện, văn bản, kết nối đơn vị thành viên hoặc truyền thông số?\n(VD: Biểu trưng ở kích thước nhỏ; Cờ, banner và backdrop; Trang phục; Huy chương, chứng nhận, thẻ; Sự thống nhất giữa các giải đấu; Tính đồng bộ của đơn vị thành viên; Tốc độ triển khai thông tin trên nền tảng số; Thiếu quy chuẩn sử dụng).", textEn: "Question 4. What difficulties does the Federation face in using the current identity in tournament activities, events, documents, member connections, or digital media?\n(e.g., Logo at small size; Flags, banners, and backdrops; Attire; Medals, certificates, badges; Consistency across tournaments; Synchronization of member units; Speed of info dissemination on digital platforms; Lack of standards).", type: 'textarea', required: false },
    { id: "QT-I05", text: "Câu 5. Theo Anh/Chị, biểu trưng chính thức của Liên đoàn cần thể hiện quan hệ giữa Lân, Sư và Rồng theo nguyên tắc nào?\n(VD: Có cần thể hiện đồng thời cả ba hình tượng trong biểu trưng chính không?; Thành tố nào cần là trọng tâm?; Rồng cần hiện diện ở mức độ nào?; Sư có cần thành hình tượng trực tiếp hay hiện diện qua tên gọi và hệ ứng dụng?; Có yếu tố nào cần tránh để biểu trưng không trở nên phức tạp?)", textEn: "Question 5. In your opinion, by what principles should the Federation's official logo express the relationship between Lion, Sư, and Dragon?\n(e.g., Should all three images be displayed simultaneously in the main logo?; Which element should be the focus?; To what extent should the Dragon be present?; Does Sư need to be a direct image or present through name and application?; What elements should be avoided to prevent the logo from becoming complex?)", type: 'textarea', required: false },
    { id: "QT-I06", text: "Câu 6. Theo Anh/Chị, trong tên gọi và hoạt động thi đấu của Liên đoàn, Rồng nên được thể hiện ở mức độ nào trong biểu trưng hoặc bộ nhận diện thương hiệu của Liên đoàn??\n(VD: Hình tượng trực tiếp; Đường nét, chuyển động, thế bao hoặc khoảng âm; Dấu hiệu phụ hoặc họa tiết hỗ trợ; Hệ ứng dụng theo từng nhóm hoạt động; Quan hệ giữa Rồng trong biểu trưng và Rồng biểu diễn).", textEn: "Question 6. In your opinion, in the name and tournament activities of the Federation, to what extent should the Dragon be expressed in the logo or brand identity?\n(e.g., Direct image; Lines, movement, enclosing space, or negative space; Auxiliary signs or supporting patterns; Application system for each activity group; Relationship between the Dragon in the logo and the performing Dragon).", type: 'textarea', required: false },
    { id: "QT-I07", text: "Câu 7. Theo Anh/Chị, việc sử dụng Lân thời Nguyễn làm nguồn tạo hình cho bộ nhận diện thương hiệu có những điểm phù hợp và những giới hạn nào?\n(VD: Tính trang trọng, kỷ luật hoặc tinh thần văn hóa; Mức độ hiện đại hóa; Mối liên hệ giữa di sản và thể thao; Các yếu tố tạo hình hoặc biểu tượng cần tránh; Khả năng tiếp nhận của người thực hành và công chúng).", textEn: "Question 7. In your opinion, what are the suitable aspects and limitations of using the Nguyen Dynasty Lion as a source of design for the brand identity?\n(e.g., Solemnity, discipline, or cultural spirit; Level of modernization; Connection between heritage and sports; Avoided visual or symbolic elements; Acceptability by practitioners and the public).", type: 'textarea', required: false },
    { id: "QT-I08", text: "Câu 8. Nếu bộ nhận diện thương hiệu được đánh giá phù hợp, Liên đoàn cần ưu tiên triển khai ở những hạng mục nào? Việc triển khai cần có những nhóm nào tham gia thẩm định, phê duyệt và quản lý sử dụng?\n(Biểu trưng; Cờ và backdrop; Trang phục; Huy chương và chứng nhận; Truyền thông số; Sổ tay nhận diện; Ban Chấp hành; Đại diện đơn vị thành viên; Cộng đồng thực hành; Chuyên gia thiết kế; Chuyên gia văn hóa - di sản; Cơ quan quản lý liên quan).", textEn: "Question 8. If the brand identity is evaluated as suitable, in which categories should the Federation prioritize implementation? Which groups should participate in evaluation, approval, and management?\n(Logo; Flags and backdrops; Uniforms; Medals and certificates; Digital media; Identity manual; Executive Committee; Representatives of member units; Practicing community; Design experts; Cultural-heritage experts; Relevant management agencies).", type: 'textarea', required: false },
    { id: "QT-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Anh/Chị có khuyến nghị nào khác để giải pháp nhận diện đề xuất phù hợp với định hướng phát triển và điều kiện hoạt động thực tế của Liên đoàn không?", textEn: "Question 9. From the discussed contents, do you have any other recommendations to make the proposed identity solution suitable for the development direction and actual operating conditions of the Federation?", type: 'textarea', required: false }
  ],
  "CĐ-TH": [
    { id: "TH-I01", text: "Câu 1. Anh/Chị đang tham gia hoạt động Lân Sư Rồng với vai trò nào? Trong công việc hoặc hoạt động của mình, Anh/Chị thường gặp hình ảnh, biểu trưng hoặc thông tin của Liên đoàn ở đâu?\n(VD: Tập luyện; Thi đấu; Biểu diễn; Tổ chức giải; Đào tạo; Truyền thông đoàn; Cờ, trang phục, huy chương, chứng nhận, banner hoặc bài đăng số).", textEn: "Question 1. In what role are you participating in Lion and Dragon Dance activities? In your work or activities, where do you usually encounter the Federation's image, logo, or information?\n(e.g., Practice; Tournament; Performance; Organizing tournament; Training; Team communication; Flags, uniforms, medals, certificates, banners, or digital posts).", type: 'textarea', required: false },
    { id: "TH-I02", text: "Câu 2. Trong những lần Anh/Chị tiếp xúc hoặc sử dụng sản phẩm nhận diện hiện hành của Liên đoàn, yếu tố nào dễ nhận ra hoặc có giá trị cần giữ lại? Yếu tố nào gây khó khăn khi sử dụng hoặc tiếp nhận?\n(VD: Tên gọi; Biểu trưng; Màu sắc; Cách đặt logo trên cờ, áo, banner; Độ rõ ở khoảng cách xa; Độ rõ trên màn hình điện thoại; Tính thống nhất giữa các giải hoặc đơn vị).", textEn: "Question 2. In your contacts with or usage of the Federation's current identity products, which elements are easily recognizable or have value to be retained? Which elements cause difficulties in use or receipt?\n(e.g., Name; Logo; Colors; Logo placement on flags, shirts, banners; Clarity at a distance; Clarity on phone screen; Uniformity between tournaments or units).", type: 'textarea', required: false },
    { id: "TH-I03", text: "Câu 3. Nếu Liên đoàn có bộ nhận diện thương hiệu mới, Anh/Chị cho rằng nên ưu tiên áp dụng trước ở những hạng mục nào? Vì sao?\n(VD: Cờ; Trang phục thi đấu; Huy chương và chứng nhận; Banner, backdrop, sân khấu; Poster và ấn phẩm giải đấu; Bài đăng mạng xã hội; Website hoặc nền tảng thông tin).", textEn: "Question 3. If the Federation has a new brand identity, in which categories do you think it should be prioritized first? Why?\n(e.g., Flags; Tournament attire; Medals and certificates; Banners, backdrops, stages; Posters and tournament publications; Social media posts; Website or info platform).", type: 'textarea', required: false },
    { id: "TH-I04", text: "Câu 4. Theo Anh/Chị, để sử dụng tốt trên cờ, trang phục, huy chương và không gian giải đấu, biểu trưng cần đáp ứng những yêu cầu nào?\n(VD: Nhìn rõ từ xa; Ít chi tiết; Dễ in, thêu hoặc sản xuất; Có màu tương phản tốt; Dễ nhận biết khi thu nhỏ; Sử dụng ở dạng đơn sắc; Phù hợp với chuyển động và không gian thi đấu).", textEn: "Question 4. In your opinion, to perform well on flags, uniforms, medals, and tournament spaces, what requirements must the logo meet?\n(e.g., Visible from a distance; Few details; Easy to print, embroider, or produce; Good color contrast; Easily recognizable when scaled down; Monochrome use; Suitable for motion and tournament space).", type: 'textarea', required: false },
    { id: "TH-I05", text: "Câu 5. Theo Anh/Chị, khi nhìn vào biểu trưng hoặc bộ nhận diện thương hiệu của Liên đoàn, người thực hành cần nhận ra điều gì về Lân, Sư và Rồng? Có yếu tố nào cần được nhấn mạnh hoặc cần tránh?\n(VD: Lân là nguồn tạo hình chủ đạo; Rồng là thành tố đại diện hoạt động; Sư thể hiện qua tên gọi, nội dung và hệ ứng dụng; Cần hay không cần ba hình tượng xuất hiện đồng thời trong logo; Tránh nhầm lẫn với đầu đạo cụ Nam Sư hoặc Bắc Sư; Tránh biểu trưng quá nhiều chi tiết).", textEn: "Question 5. In your opinion, when looking at the logo or brand identity of the Federation, what should practitioners recognize about Lion, Sư, and Dragon? What elements should be emphasized or avoided?\n(e.g., Lion is the primary source; Dragon is the representative element of activity; Sư is expressed through name, content, and applications; Need or no need for three images to appear simultaneously in logo; Avoid confusion with Southern Sư or Northern Sư prop heads; Avoid too many details in logo).", type: 'textarea', required: false },
    { id: "TH-I06", text: "Câu 6. Theo Anh/Chị, việc ứng dụng Lân trong mỹ thuật thời Nguyễn làm nguồn tạo hình cho nhận diện Liên đoàn có phù hợp và gần gũi với cộng đồng thực hành Lân Sư Rồng hiện nay không? Nếu có thì cần thể hiện như thế nào?\n(VD: Giữ sự trang trọng nhưng không quá cổ; Thể hiện tính năng động và tinh thần thể thao; Cần nhận ra Lân ở mức độ nào; Có cần gợi Rồng trong hệ đồ họa; Yếu tố nào khiến thiết kế trở nên xa lạ hoặc khó tiếp nhận).", textEn: "Question 6. In your opinion, is applying the Nguyen Dynasty Lion as a source of design for the Federation's identity appropriate and close to the current Lion and Dragon Dance community? If so, how should it be expressed?\n(e.g., Keep it solemn but not too ancient; Show dynamism and sportsmanship; To what level should the Lion be recognized; Is it necessary to evoke the Dragon in the graphic system; What elements make the design feel foreign or difficult to accept).", type: 'textarea', required: false },
    { id: "TH-I07", text: "Câu 7. Anh/Chị có đề xuất nào khác để bộ nhận diện thương hiệu mới phù hợp hơn với người thực hành Lân Sư Rồng và các hoạt động thực tế của Liên đoàn không?\nAnh/Chị có muốn bổ sung hoặc điều chỉnh nội dung nào không?", textEn: "Question 7. Do you have any other suggestions to make the new brand identity more suitable for Lion and Dragon Dance practitioners and the practical activities of the Federation? Do you want to add or adjust any content?", type: 'textarea', required: false }
  ],
  "CG-MT": [
    { id: "DS-I01", text: "Câu 1. Theo Thầy/Cô, khi khảo sát một hiện vật hoặc đồ án trang trí thuộc thời Nguyễn, những căn cứ nào cần được ưu tiên để xác định hình tượng đó là Lân?\n(VD: Cấu trúc đầu, sừng, mắt, mũi, miệng, bờm; Thân, chân, móng, đuôi và dáng thế; Chất liệu và kỹ thuật tạo tác; Vị trí xuất hiện; Quan hệ với mô-típ hỗ trợ ;Hồ sơ hiện vật, văn bản hoặc nguồn nghiên cứu).", textEn: "Question 1. In your opinion, when surveying an artifact or decoration design of the Nguyen Dynasty, what criteria should be prioritized to identify that image as a Lion (Lan)?\n(e.g., Head structure, horns, eyes, nose, mouth, mane; Body, legs, claws, tail, and posture; Material and crafting technique; Location of appearance; Relationship with supporting motifs; Artifact files, texts, or research sources).", type: 'textarea', required: false },
    { id: "DS-I02", text: "Câu 2. Trong thực tế mỹ thuật Việt Nam có sự giao thoa về danh xưng và hình thái linh vật, việc phân biệt Lân thời Nguyễn với Nghê, Long Mã, sư tử trang trí hoặc các hình thức lai ghép cần lưu ý những vấn đề nào?\n(VD: Đặc điểm hình thái; Chức năng bảo hộ hoặc trang trí; Không gian cung đình, tín ngưỡng, dân gian; Bố cục và mô-típ đi kèm; Tư liệu đối chiếu; Những trường hợp không nên định danh quá sớm).", textEn: "Question 2. Since there is overlapping terminology and morphology of mythical creatures in Vietnamese fine arts, what issues should be noted when distinguishing the Nguyen Dynasty Lion from Nghê, Long Ma, decorative lions, or hybridized forms?\n(e.g., Morphological features; Protective or decorative function; Imperial, religious, or folk spaces; Composition and accompanying motifs; Reference documents; Cases where identification should not be rushed).", type: 'textarea', required: false },
    { id: "DS-I03", text: "Câu 3. Trong hệ mẫu Lân thời Nguyễn, theo Thầy/Cô, những nhóm đặc trưng tạo hình nào có giá trị nhận biết cao và cần được ưu tiên khảo sát?\n(VD: Đầu và sừng; Bờm, thân, chân, đuôi; Dáng đứng, dáng chầu, dáng chuyển động.\nĐường nét, nhịp điệu, tỷ lệ; Mây, lửa, hoa lá, quả hoặc mô-típ phụ trợ; Quan hệ giữa hình tượng với vật liệu và mặt kiến trúc).", textEn: "Question 3. In the Nguyen Dynasty Lion patterns, which groups of visual characteristics have high recognition value and should be prioritized for survey?\n(e.g., Head and horns; Mane, body, legs, tail; Standing, adoration, or movement postures; Lines, rhythm, proportions; Clouds, fire, foliage, fruit, or auxiliary motifs; Relationship between the image, materials, and architectural surface).", type: 'textarea', required: false },
    { id: "DS-I04", text: "Câu 4. Theo Thầy/Cô, chất liệu, vị trí đặt và không gian kiến trúc tác động như thế nào đến việc nhận diện và diễn giải Lân thời Nguyễn?\n(VD: Tượng đồng, đá, gỗ; Nề vữa, đắp nổi, khảm sành sứ; Cung điện, lăng tẩm, miếu thờ; Cổng, bình phong, nhà bia, đầu hồi; Trục nghi lễ, không gian tưởng niệm, không gian trang trí).", textEn: "Question 4. In your opinion, how do materials, placements, and architectural spaces affect the identification and interpretation of the Nguyen Dynasty Lion?\n(e.g., Bronze, stone, wood statues; mortar, relief, porcelain inlay; Palaces, tombs, temples; Gates, screens, stele houses, gables; Ritual axis, memorial space, decorative space).", type: 'textarea', required: false },
    { id: "DS-I05", text: "Câu 5. Theo Thầy/Cô, các ý nghĩa thường gắn với Lân như điềm lành, thời bình, đạo trị, trật tự cung đình hoặc lòng trung quân cần được diễn giải theo nguyên tắc nào để tránh suy diễn?\n(VD: Mối quan hệ giữa nghĩa chung của linh vật và nghĩa ở từng hiện vật; Căn cứ từ nguồn lịch sử mỹ thuật; Bối cảnh kiến trúc và chức năng công trình; Quan hệ với hệ Tứ linh; Những ý nghĩa không nên gán khi thiếu tư liệu).", textEn: "Question 5. Under what principles should meanings associated with the Lion (good omen, peacetime, path of governance, imperial order, loyalty) be interpreted to avoid speculation?\n(e.g., Relationship between the general meaning and the specific artifact's meaning; Basis in art history; Architectural context and function of the building; Relation to the Four Mythical Creatures; Meanings that should not be assigned without documentation).", type: 'textarea', required: false },
    { id: "DS-I06", text: "Câu 6. Theo Thầy/Cô, việc đối sánh Lân thời Nguyễn với kỳ lân trong một số tư liệu Hoa ngữ cần được thực hiện và giới hạn như thế nào?\n(VD: Tương đồng về tên gọi và cấu trúc hình thái; Sự tiếp nhận, lựa chọn và điều chỉnh trong mỹ thuật Việt Nam; Tránh cách hiểu nguồn gốc đơn tuyến; Không đồng nhất tương đồng với sao chép; Không xem mọi khác biệt là bằng chứng tuyệt đối của bản địa hóa).", textEn: "Question 6. How should the comparison of the Nguyen Dynasty Lion with the Qilin in Chinese documents be performed and limited?\n(e.g., Similarities in name and morphology; Reception, selection, and adjustment in Vietnamese fine arts; Avoiding single-line origin explanations; Not equating similarity with copy; Not treating every difference as absolute proof of localization).", type: 'textarea', required: false },
    { id: "DS-I07", text: "Câu 7. Theo Thầy/Cô, khi chuyển hóa hình tượng Lân thời Nguyễn vào bộ nhận diện thương hiệu, những yếu tố nào cần được bảo toàn, những yếu tố nào có thể giản lược và những yếu tố nào cần tránh?\n(Cấu trúc nhận biết; Nhịp đường nét; Tỷ lệ và dáng thế; Mô-típ hỗ trợ; Chất liệu, màu sắc và bề mặt; Giá trị biểu tượng; Nguy cơ sao chép, phục dựng hoặc mô phỏng bề mặt).", textEn: "Question 7. When transforming the Nguyen Dynasty Lion into the brand identity, what elements should be preserved, simplified, or avoided?\n(Recognizable structure; Rhythm of lines; Proportions and posture; Supporting motifs; Material, color, and surface; Symbolic value; Risk of copying, recreating, or surface simulation).", type: 'textarea', required: false },
    { id: "DS-I08", text: "Câu 8. Đề tài xác định Lân thời Nguyễn là nguồn tạo hình chủ đạo; Rồng là thành tố cần được xem xét để đáp ứng yêu cầu đại diện tổ chức; Sư được duy trì ở cấp độ tên gọi và hệ ứng dụng. Theo Thầy/Cô, cách tổ chức này có phù hợp không? Những vấn đề nào cần lưu ý khi tích hợp Rồng vào bộ nhận diện thương hiệu nhưng vẫn giữ vai trò hạt nhân của Lân thời Nguyễn?\n(Lân là hạt nhân nguồn; Rồng là thành tố đại diện tổ chức; Sư không nhất thiết thành hình tượng riêng trong logo; Tránh ghép ba đầu linh vật; Tránh sao chép đầu đạo cụ biểu diễn; Rồng xuất hiện qua nhịp nét, hướng chuyển động, thế bao hoặc đồ họa hỗ trợ).", textEn: "Question 8. The thesis identifies the Nguyen Dynasty Lion as the primary visual source, the Dragon as a necessary element for representation, and Sư maintained at the name and application level. Is this setup appropriate? What should be noted when integrating the Dragon while keeping the Nguyen Dynasty Lion as the core?\n(Lion as the core source; Dragon as the organization representative; Sư not necessarily a separate logo image; Avoid merging three heads; Avoid copying performance prop heads; Dragon appearing via rhythm of lines, motion, enclosing space, or supporting graphics).", type: 'textarea', required: false },
    { id: "DS-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Thầy/Cô có khuyến nghị nào khác về hệ mẫu hiện vật, cách phân tích hoặc hướng chuyển hóa hình tượng Lân thời Nguyễn trong đề tài này không?", textEn: "Question 9. Do you have any other recommendations regarding the artifact system, analysis methods, or the direction of transforming the Nguyen Dynasty Lion image in this thesis?", type: 'textarea', required: false }
  ],
  "CG-TK": [
    { id: "TK-I01", text: "Câu 1. Theo Anh/Chị, một bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam cần giải quyết những bài toán chiến lược nào trước khi bắt đầu phát triển biểu trưng và hệ đồ họa?\n(VD: Vị thế tổ chức ở quy mô quốc gia; Mối quan hệ giữa văn hóa, cộng đồng, thể thao và truyền thông; Khác biệt với đoàn biểu diễn, câu lạc bộ hoặc tổ chức Lân Sư Rồng khác; Tính chính thống, chuyên nghiệp và khả năng hội nhập; Nhóm công chúng và điểm tiếp xúc ưu tiên).", textEn: "Question 1. What strategic problems do you think a brand identity for the Federation must solve before developing the logo and graphic system?\n(e.g., National organizational scale; Relationship between culture, community, sports, and media; Distinction from other performance teams or clubs; Official status, professionalism, and integration capacity; Priority audience and touchpoints).", type: 'textarea', required: false },
    { id: "TK-I02", text: "Câu 2. Theo Anh/Chị, trong một dự án nhận diện cho tổ chức hoạt động trên các nhóm ứng dụng như Liên đoàn, các thành tố nào cần được xác lập trước và theo trình tự nào?\n(VD: Định hướng bản sắc; Biểu trưng; Hệ màu; Kiểu chữ; Họa tiết hoặc đồ họa hỗ trợ; Hệ thống bố cục; Quy chuẩn sử dụng; Ứng dụng tiêu biểu; Sổ tay nhận diện).", textEn: "Question 2. In an identity project for an organization operating across application groups like the Federation, which components should be established first and in what order?\n(e.g., Identity direction; Logo; Color system; Typography; Patterns or supporting graphics; Layout system; Usage standards; Typical applications; Identity manual).", type: 'textarea', required: false },
    { id: "TK-I03", text: "Câu 3. Đề tài dự kiến trích xuất đặc trưng từ hình tượng Lân trong mỹ thuật thời Nguyễn để phát triển biểu trưng và hệ đồ họa. Theo Anh/Chị, quá trình này cần thực hiện theo nguyên tắc nào để vừa duy trì mối liên hệ với nguồn di sản, vừa bảo đảm tính đương đại?\n(VD: Chọn cấu trúc nhận biết thay vì sao chép hình ảnh; Phân rã đầu, sừng, bờm, thân, đuôi và nhịp đường nét; Xác định đặc trưng cốt lõi và đặc trưng phụ trợ; Giản lược tỷ lệ, mảng và chi tiết; Kiểm tra khả năng nhận biết ở kích thước nhỏ; Tránh mô phỏng hoa văn cổ như yếu tố trang trí bề mặt).", textEn: "Question 3. The project plans to extract features from the Nguyen Dynasty Lion to develop the logo and graphic system. By what principles should this be done to maintain a connection with heritage while ensuring modernity?\n(e.g., Choose recognizable structures instead of copying images; Deconstruct head, horns, mane, body, tail, and line rhythms; Identify core and auxiliary features; Simplify proportions, shapes, and details; Check recognizability at small sizes; Avoid simulating ancient patterns as surface decorations).", type: 'textarea', required: false },
    { id: "TK-I04", text: "Câu 4. Theo Anh/Chị, những loại dữ liệu nào nên được ưu tiên cho biểu trưng chính, và những loại dữ liệu nào phù hợp hơn để phát triển pattern, màu sắc, bố cục hoặc hệ đồ họa hỗ trợ?\n(VD: Cấu trúc đầu, sừng, bờm; Đường cong thân, đuôi và nhịp vận động; Mây, lửa, hoa lá và mô-típ phụ trợ; Chất liệu khảm sành sứ, pháp lam hoặc đồng; Bố cục chầu, đối xứng hoặc liên hoàn; Giá trị biểu tượng và thông điệp).", textEn: "Question 4. What types of data should be prioritized for the primary logo, and which are more suitable for developing patterns, colors, layouts, or supporting graphics?\n(e.g., Head, horns, mane structure; Body, tail curves and movement rhythm; Clouds, fire, foliage, and auxiliary motifs; Porcelain inlay, enamel, or bronze materials; Adoration, symmetrical, or continuous layouts; Symbolic values and messages).", type: 'textarea', required: false },
    { id: "TK-I05", text: "Câu 5. Theo Anh/Chị, nguyên tắc lấy Lân thời Nguyễn làm chủ đạo, Rồng đại diện cho Liên đoàn, và Sư qua tên gọi/ứng dụng có phù hợp không? Nên tích hợp Rồng thế nào để tránh biến biểu trưng thành bộ minh họa nhiều linh vật?\n(VD: Đường uốn, hướng chuyển động, thế bao hoặc khoảng âm; Họa tiết hoặc dấu hiệu phụ; Dấu hiệu dùng trong hệ ứng dụng thay vì biểu trưng chính; Mức độ nhận biết cần thiết của Rồng; Tránh ghép ba đầu linh vật ngang hàng; Tránh sao chép đầu Rồng biểu diễn).", textEn: "Question 5. Is the principle of using Nguyen Dynasty Lion as primary, Dragon representing the Federation, and Sư via name/application appropriate? How should the Dragon be integrated to avoid making the logo a multi-beast illustration?\n(e.g., Curved lines, movement direction, enclosing or negative space; Auxiliary patterns or signs; Signs in the application system instead of the main logo; Required recognizability of the Dragon; Avoid merging three heads; Avoid copying performing Dragon heads).", type: 'textarea', required: false },
    { id: "TK-I06", text: "Câu 6. Theo Anh/Chị, những rủi ro tạo hình nào thường xuất hiện khi thiết kế nhận diện từ chất liệu truyền thống và linh vật văn hóa?\n(VD: Quá nhiều chi tiết; Khó nhận biết ở kích thước nhỏ; Lạm dụng mô-típ trang trí; Lẫn lộn giữa linh vật truyền thống và đạo cụ biểu diễn; Pha trộn quá nhiều biểu tượng; Thiếu khác biệt với biểu trưng của các đoàn hoặc giải đấu; Màu sắc và kiểu chữ không thống nhất; Hệ ứng dụng không có khả năng mở rộng).", textEn: "Question 6. What visual risks often appear when designing identities from traditional materials and cultural mythical creatures?\n(e.g., Too many details; Hard to recognize at small sizes; Overuse of decorative motifs; Confusion between traditional creatures and performance props; Mixing too many symbols; Lack of distinction from other teams or tournaments; Inconsistent colors/typography; Inextensible application system).", type: 'textarea', required: false },
    { id: "TK-I07", text: "Câu 7. Theo Anh/Chị, biểu trưng và bộ nhận diện thương hiệu cần đáp ứng những điều kiện kỹ thuật nào để vận hành ổn định trên trang phục, cờ, huy chương, banner, backdrop, chứng nhận và nhóm ứng dụng số?\n(VD: Kích thước tối thiểu; Phiên bản ngang, dọc, rút gọn; Phiên bản đơn sắc và âm bản; Tỷ lệ logo - chữ; Tương phản màu; Khả năng in, thêu, cắt decal hoặc gia công; Khả năng hiển thị trên màn hình nhỏ; Hệ lưới và phân cấp thông tin).", textEn: "Question 7. What technical conditions must the logo and brand identity meet to operate stably on uniforms, flags, medals, banners, backdrops, certificates, and digital application groups?\n(e.g., Minimum size; Horizontal, vertical, simplified versions; Monochrome and negative versions; Logo-text ratio; Color contrast; Print, embroidery, decal cut, or manufacturing capability; Display capability on small screens; Grid system and information hierarchy).", type: 'textarea', required: false },
    { id: "TK-I08", text: "Câu 8. Theo Anh/Chị, một giải pháp nhận diện ứng dụng từ di sản cần được đánh giá theo những tiêu chí nào? Những nhóm đối tượng nào cần tham gia kiểm chứng trước khi hoàn thiện?\n(VD: Tính thẩm mỹ; Tính bản sắc; Khả năng nhận biết; Tính đại diện tổ chức ;Khả năng ứng dụng; Tính nhất quán; Khả năng mở rộng; Đại diện Liên đoàn ;Cộng đồng thực hành; Chuyên gia mỹ thuật, di sản; Chuyên gia thiết kế, truyền thông; Công chúng tiếp nhận).", textEn: "Question 8. By what criteria should a heritage-applied identity solution be evaluated? Which target groups should participate in validation before finalization?\n(e.g., Aesthetics; Identity; Recognizability; Representation; Applicability; Consistency; Extensibility; Federation representatives; Practicing community; Fine art and heritage experts; Design and communication experts; Public audience).", type: 'textarea', required: false },
    { id: "TK-I09", text: "Câu 9. Từ các nội dung vừa trao đổi, Anh/Chị có khuyến nghị nào khác về chiến lược, nguyên tắc tạo hình hoặc điều kiện triển khai bộ nhận diện thương hiệu cho Liên đoàn Lân Sư Rồng Việt Nam không?", textEn: "Question 9. Do you have any other recommendations regarding strategy, design principles, or implementation conditions of the brand identity for the Federation?", type: 'textarea', required: false }
  ]
};

export const TRANSLATIONS = {
  vi: {
    websiteTitle: "BẢNG KHẢO SÁT VÀ PHỎNG VẤN THU THẬP Ý KIẾN VỀ BỘ NHẬN DIỆN THƯƠNG HIỆU LIÊN ĐOÀN LÂN SƯ RỒNG VIỆT NAM",
    headerTitle: "PHIẾU THÔNG TIN VÀ ĐỒNG THUẬN THAM GIA KHẢO SÁT/PHỎNG VẤN",
    thesisName: "“Ứng dụng hình tượng Lân trong mỹ thuật thời Nguyễn vào thiết kế bộ nhận diện thương hiệu Liên đoàn Lân Sư Rồng Việt Nam”",
    studentName: "Phạm Nguyễn Vân Anh",
    institution: "Trường Đại học Văn Lang",
    instructions: "Hướng dẫn",
    ready: "Sẵn sàng →",
    back: "Quay lại",
    backToEdit: "← Quay lại chỉnh sửa",
    continue: "Tiếp tục →",
    reviewResponses: "Xem lại phản hồi →",
    startSurvey: "Bắt đầu khảo sát →",
    submitSurvey: "Gửi khảo sát",
    submitting: "Đang gửi khảo sát...",
    participantGroup: "VUI LÒNG CHỌN NHÓM THAM GIA PHÙ HỢP *",
    participantCode: "Mã người tham gia (Tự động):",
    fullName: "Họ và tên (Không bắt buộc)",
    titleUnit: "Chức danh / Đơn vị (Không bắt buộc)",
    participationForm: "Hình thức tham gia *",
    publicWarning: "* Nhóm Công chúng, khán giả (KG-ĐT) chỉ áp dụng hình thức Bảng hỏi khảo sát.",
    consentTitle: "Xác nhận đồng thuận",
    consentWarning: "Vui lòng chọn đầy đủ các ô xác nhận đồng thuận tham gia và cách trích dẫn ý kiến trước khi bắt đầu.",
    consentInfo: "Tôi xác nhận đã được thông tin về mục đích nghiên cứu và tự nguyện tham gia. *",
    consentData: "Tôi đồng ý để dữ liệu được sử dụng cho luận văn dưới dạng mã hóa. *",
    consentCitation: "Cách trích dẫn ý kiến: Chỉ sử dụng dữ liệu tổng hợp, không trích dẫn trực tiếp *",
    recordOption: "Tùy chọn ghi âm phỏng vấn:",
    recordYes: "Tôi đồng ý cho ghi âm phỏng vấn.",
    recordNo: "Tôi không đồng ý cho ghi âm phỏng vấn.",
    recordNa: "Không áp dụng, tôi chỉ tham gia bảng hỏi.",
    partA: "Phần A · Khảo sát ý kiến chung",
    partB: "Phần B · Khảo sát theo nhóm",
    partC: "Phần C · Phỏng vấn sâu nhóm",
    playAudio: "🔊 Nhấn loa để nghe đọc câu hỏi (Bắt buộc trả lời)",
    playAudioOptional: "🔊 Bấm loa để nghe đọc câu hỏi",
    otherOption: "Ý kiến khác",
    otherPlaceholder: "Nhập nội dung khác của bạn tại đây...",
    minSelect: "* Yêu cầu chọn tối thiểu {count} phương án.",
    maxSelect: "* Có thể chọn tối đa {count} phương án.",
    typeFeedback: "Gõ ý kiến đóng góp của bạn vào đây...",
    recordFeedback: "Ghi âm đóng góp của bạn:",
    recordVoice: "Ghi âm giọng nói đóng góp phỏng vấn:",
    reviewTitle: "Kiểm tra phản hồi của bạn",
    reviewGroup: "Khảo sát theo nhóm",
    reviewInterview: "Ý kiến đóng góp phỏng vấn sâu",
    notApplicable: "Không áp dụng / Khác",
    noOptions: "(Không chọn lựa chọn nào)",
    empty: "(Trống)",
    noWrittenAnswer: "(Không có câu trả lời viết)",
    recording: "Bản ghi âm:",
    completed: "Hoàn thành!",
    thankYou: "Cảm ơn đã khảo sát",
    successDesc: "Phản hồi khảo sát của bạn đã được lưu giữ thành công để phục vụ công tác nghiên cứu luận văn.",
    yourCode: "Mã người tham gia của bạn:",
    closeTab: "Bạn có thể đóng tab trình duyệt này an toàn.",
    footerNote: "*Ghi chú: Người tham gia có quyền yêu cầu không sử dụng thông tin nhận diện cá nhân trong luận văn.",
    cameraConsentQuestion: "Bạn có đồng ý bật camera trong quá trình phỏng vấn để hỗ trợ nghiên cứu không?",
    cameraConsentNote: "Không bắt buộc.",
    cameraConsentYes: "Đồng ý bật camera",
    cameraConsentNo: "Không đồng ý",
    cameraStatusEnabled: "Đã bật camera",
    cameraStatusDisabled: "Người dùng không bật camera",
    recordFace: "Ghi hình và âm đóng góp phỏng vấn:"
  },
  en: {
    websiteTitle: "SURVEY AND INTERVIEW FOR FEEDBACK ON THE BRAND IDENTITY OF THE VIETNAM LION AND DRAGON DANCE FEDERATION",
    headerTitle: "INFORMATION AND CONSENT FORM FOR SURVEY/INTERVIEW",
    thesisName: "“Applying the Lion (Lan) Image in Nguyen Dynasty Fine Arts to the Design of the Brand Identity for the Vietnam Lion and Dragon Dance Federation”",
    studentName: "Pham Nguyen Van Anh",
    institution: "Van Lang University",
    instructions: "Instructions",
    ready: "Ready →",
    back: "Back",
    backToEdit: "← Back to Edit",
    continue: "Continue →",
    reviewResponses: "Review Responses →",
    startSurvey: "Start Survey →",
    submitSurvey: "Submit Survey",
    submitting: "Submitting Survey...",
    participantGroup: "PLEASE SELECT A SUITABLE PARTICIPATION GROUP *",
    participantCode: "Participant Code (Auto):",
    fullName: "Full Name (Optional)",
    titleUnit: "Title / Unit (Optional)",
    participationForm: "Participation Format *",
    publicWarning: "* Public and Audience (KG-ĐT) only applies to Survey Questionnaire format.",
    consentTitle: "Consent Confirmation",
    consentWarning: "Please check all consent boxes and citation preference before starting.",
    consentInfo: "I confirm that I have been informed about the research purpose and participate voluntarily. *",
    consentData: "I agree to let the data be used for the thesis in encrypted form. *",
    consentCitation: "Citation method: Only use aggregated data, no direct citation *",
    recordOption: "Interview Recording Option:",
    recordYes: "I agree to have the interview recorded.",
    recordNo: "I do not agree to have the interview recorded.",
    recordNa: "Not applicable, I only participate in the questionnaire.",
    partA: "Part A · General Survey",
    partB: "Part B · Group-specific Survey",
    partC: "Part C · In-depth Interview for Group",
    playAudio: "🔊 Press the speaker to listen to the question (Required answer)",
    playAudioOptional: "🔊 Press the speaker to listen to the question",
    otherOption: "Other opinion",
    otherPlaceholder: "Enter your other opinion here...",
    minSelect: "* Selection of at least {count} options required.",
    maxSelect: "* Selection of up to {count} options allowed.",
    typeFeedback: "Type your feedback here...",
    recordFeedback: "Record your feedback:",
    recordVoice: "Record interview voice response:",
    reviewTitle: "Review Your Responses",
    reviewGroup: "Group-specific Survey",
    reviewInterview: "In-depth Interview Feedback",
    notApplicable: "Not applicable / Other",
    noOptions: "(No options selected)",
    empty: "(Empty)",
    noWrittenAnswer: "(No written answer)",
    recording: "Recording:",
    completed: "Completed!",
    thankYou: "Thank you for participating",
    successDesc: "Your response has been successfully saved for the thesis research.",
    yourCode: "Your participant code:",
    closeTab: "You can safely close this browser tab.",
    footerNote: "*Note: Participants have the right to request not to use their personal identity details in the thesis.",
    cameraConsentQuestion: "Do you agree to turn on the camera during the interview to support the research?",
    cameraConsentNote: "Optional.",
    cameraConsentYes: "Agree to turn on camera",
    cameraConsentNo: "Disagree",
    cameraStatusEnabled: "Camera enabled",
    cameraStatusDisabled: "User did not turn on camera",
    recordFace: "Record video and voice response:"
  }
};
