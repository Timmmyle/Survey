import { PositionQuestions, EvaluationResult } from './types';

export const INITIAL_POSITIONS: string[] = [
  'Software Engineer',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer'
];

export const INITIAL_QUESTIONS_BY_POSITION: PositionQuestions[] = [
  {
    position: 'Software Engineer',
    questions: [
      { id: 'se-1', text: 'Khả năng giải quyết vấn đề bằng thuật toán và tư duy logic?' },
      { id: 'se-2', text: 'Kinh nghiệm thiết kế hệ thống và sử dụng các framework liên quan?' },
      { id: 'se-3', text: 'Hiểu biết và kinh nghiệm áp dụng quy trình CI/CD, Git và viết Unit Test?' },
      { id: 'se-4', text: 'Cách tiếp cận khi debug một lỗi phức tạp trên production?' },
      { id: 'se-5', text: 'Khả năng giao tiếp kỹ thuật và làm việc nhóm?' }
    ]
  },
  {
    position: 'Product Manager',
    questions: [
      { id: 'pm-1', text: 'Khả năng phân tích số liệu để đưa ra quyết định phát triển sản phẩm?' },
      { id: 'pm-2', text: 'Quy trình ưu tiên tính năng sản phẩm (Prioritization Frameworks)?' },
      { id: 'pm-3', text: 'Kỹ năng quản lý backlog và viết tài liệu đặc tả sản phẩm (PRD)?' },
      { id: 'pm-4', text: 'Cách xử lý mâu thuẫn ý kiến giữa đội ngũ kỹ thuật và Stakeholders?' },
      { id: 'pm-5', text: 'Tư duy chiến lược và mức độ nhạy bén với thị trường?' }
    ]
  },
  {
    position: 'UI/UX Designer',
    questions: [
      { id: 'design-1', text: 'Quy trình nghiên cứu người dùng và xây dựng User Persona?' },
      { id: 'design-2', text: 'Khả năng thiết kế từ wireframe thô đến hi-fi mockup chất lượng cao?' },
      { id: 'design-3', text: 'Hiểu biết về Design System và cách duy trì tính nhất quán giao diện?' },
      { id: 'design-4', text: 'Kinh nghiệm làm việc phối hợp và bàn giao thiết kế cho Dev team (Dev handoff)?' },
      { id: 'design-5', text: 'Cách giải quyết khi Stakeholders yêu cầu sửa đổi thiết kế trái với UI/UX best practices?' }
    ]
  },
  {
    position: 'QA Engineer',
    questions: [
      { id: 'qa-1', text: 'Khả năng xây dựng Test Plan và viết Test Cases bao phủ tốt nghiệp vụ?' },
      { id: 'qa-2', text: 'Kinh nghiệm viết script test tự động (Automation testing: Selenium, Playwright...)?' },
      { id: 'qa-3', text: 'Tư duy phân tích nguyên nhân gốc rễ (Root Cause Analysis) khi phát hiện lỗi?' },
      { id: 'qa-4', text: 'Kỹ năng phối hợp với Developers để tái hiện và sửa lỗi nhanh chóng?' },
      { id: 'qa-5', text: 'Hiểu biết về các loại kiểm thử: Performance, Security, API testing?' }
    ]
  }
];

export const INITIAL_EVALUATIONS: EvaluationResult[] = [
  {
    id: 'eval-1',
    candidate: {
      firstName: 'Nguyễn Thị',
      lastName: 'An',
      position: 'Software Engineer',
      phone: '0987654321',
      email: 'an.nguyen@gmail.com',
      interviewDate: '2026-08-20'
    },
    scores: {
      'se-1': 5,
      'se-2': 4,
      'se-3': 4,
      'se-4': 4,
      'se-5': 5
    },
    audioUrl: null,
    transcript: 'Chào anh chị, em là Nguyễn Thị An. Em có kinh nghiệm làm React và Node.js được 2 năm. Em từng tối ưu hóa ứng dụng giúp giảm tải kích thước gói bundle đi 25%. Em cũng quen thuộc với Git và CI/CD.',
    completedAt: '20/08/2026 15:30:22',
    status: 'Đang được xét duyệt'
  },
  {
    id: 'eval-2',
    candidate: {
      firstName: 'Lê Văn',
      lastName: 'Bình',
      position: 'Product Manager',
      phone: '0912345678',
      email: 'binh.le@hotmail.com',
      interviewDate: '2026-08-18'
    },
    scores: {
      'pm-1': 5,
      'pm-2': 5,
      'pm-3': 5,
      'pm-4': 4,
      'pm-5': 5
    },
    audioUrl: null,
    transcript: 'Tôi tên là Lê Văn Bình. Tôi có 5 năm làm quản trị sản phẩm công nghệ. Tôi quen thuộc với framework RICE để phân tích và ra quyết định ưu tiên tính năng sản phẩm. Tôi luôn nỗ lực kết nối tốt DEV với Stakeholders.',
    completedAt: '18/08/2026 10:15:40',
    status: 'Đã tuyển'
  },
  {
    id: 'eval-3',
    candidate: {
      firstName: 'Phạm Hồng',
      lastName: 'Sơn',
      position: 'QA Engineer',
      phone: '0933445566',
      email: 'son.pham@yahoo.com',
      interviewDate: '2026-08-15'
    },
    scores: {
      'qa-1': 2,
      'qa-2': 2,
      'qa-3': 3,
      'qa-4': 2,
      'qa-5': 1
    },
    audioUrl: null,
    transcript: 'Chào mọi người, tôi là Phạm Hồng Sơn. Tôi có kinh nghiệm viết test case thủ công cơ bản. Tôi chưa có nhiều cơ hội làm việc với automation test bằng Playwright hay Selenium.',
    completedAt: '15/08/2026 16:45:10',
    status: 'Không tuyển'
  }
];
