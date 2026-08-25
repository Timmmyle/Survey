import { Survey, SurveyQuestion, SurveyResponse, Participant, BrandSurveySubmission } from '../types';

const STORAGE_KEYS = {
  SURVEYS: 'survey_app_surveys',
  QUESTIONS: 'survey_app_questions',
  RESPONSES: 'survey_app_responses',
  BRAND_SUBMISSIONS: 'lan_su_rong_submissions_v3',
  BRAND_COUNTERS: 'lan_su_rong_group_counters_v3',
};

// ==========================================
// MOCK DATA FOR RECRUITER SURVEY FLOW
// ==========================================
const MOCK_SURVEY: Survey = {
  id: 'survey-mock-1',
  title: 'Khảo sát Năng lực & Giao tiếp Ứng viên',
  description: 'Biểu mẫu đánh giá nhanh năng lực chuyên môn và kỹ năng giao tiếp truyền đạt. Khảo sát bao gồm các câu hỏi trắc nghiệm, tự luận ngắn và ghi âm giọng nói.',
  status: 'Published',
  createdAt: '24/08/2026 09:00:00',
  updatedAt: '24/08/2026 10:30:00',
};

const MOCK_QUESTIONS: SurveyQuestion[] = [
  { id: 'q-1', surveyId: 'survey-mock-1', type: 'Short Text', title: 'Họ và tên của bạn là gì?', description: 'Nhập đầy đủ cả họ và tên đệm.', required: true, order: 1 },
  { id: 'q-2', surveyId: 'survey-mock-1', type: 'Single Choice', title: 'Số năm kinh nghiệm làm việc thực tế của bạn?', required: true, options: ['Dưới 1 năm', 'Từ 1 - 3 năm', 'Từ 3 - 5 năm', 'Trên 5 năm'], order: 2 },
  { id: 'q-3', surveyId: 'survey-mock-1', type: 'Multiple Choice', title: 'Những công nghệ/công cụ nào bạn thành thạo nhất?', description: 'Có thể chọn nhiều đáp án phù hợp.', required: false, options: ['React / Next.js', 'Node.js / Express', 'TypeScript', 'Docker / Kubernetes', 'Git / GitHub CI-CD'], order: 3 },
  { id: 'q-4', surveyId: 'survey-mock-1', type: 'Yes / No', title: 'Bạn có sẵn sàng làm việc onsite toàn thời gian tại văn phòng không?', required: true, order: 4 },
  { id: 'q-5', surveyId: 'survey-mock-1', type: 'Rating / Scale', title: 'Tự đánh giá mức độ tự tin của bạn khi giải quyết một bug phức tạp trên Production?', description: 'Thang điểm từ 1 (Rất yếu) đến 5 (Cực kỳ tự tin).', required: true, order: 5 },
  { id: 'q-6', surveyId: 'survey-mock-1', type: 'Long Text', title: 'Mục tiêu phát triển sự nghiệp trong 2 năm tới của bạn là gì?', description: 'Viết ngắn gọn từ 2-4 dòng.', required: true, order: 6 },
  { id: 'q-7', surveyId: 'survey-mock-1', type: 'Voice Answer', title: 'Hãy ghi âm phần giới thiệu ngắn về bản thân và một dự án nổi bật bạn tâm đắc nhất.', description: 'Hãy nói rõ ràng, mạch lạc trong khoảng 30-60 giây.', required: true, order: 7 },
];

const MOCK_RESPONSES: SurveyResponse[] = [
  {
    id: 'resp-1',
    surveyId: 'survey-mock-1',
    submittedAt: '24/08/2026 14:15:30',
    answers: {
      'q-1': 'Phạm Minh Đức',
      'q-2': 'Từ 1 - 3 năm',
      'q-3': ['React / Next.js', 'TypeScript', 'Git / GitHub CI-CD'],
      'q-4': 'Yes',
      'q-5': 4,
      'q-6': 'Tôi mong muốn nâng cao khả năng thiết kế hệ thống lớn và học thêm kỹ năng quản lý nhóm. Trong 2 năm tới, tôi hướng tới vị trí Senior Developer/Team Lead.',
      'q-7': 'mock_audio_duc.wav (Bản ghi thử nghiệm: Chào anh chị, tôi có 2 năm kinh nghiệm làm Frontend Developer. Dự án tôi tâm đắc nhất là xây dựng hệ thống CRM phục vụ 10.000 user hàng ngày...)',
    },
  },
];

export class SurveyService {
  static initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.SURVEYS)) {
      localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([MOCK_SURVEY]));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(MOCK_QUESTIONS));
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(MOCK_RESPONSES));
    }
  }

  static getSurveys(): Survey[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    return data ? JSON.parse(data) : [];
  }

  static getSurvey(id: string): Survey | undefined {
    return this.getSurveys().find((s) => s.id === id);
  }

  static getQuestions(surveyId: string): SurveyQuestion[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const questions: SurveyQuestion[] = data ? JSON.parse(data) : [];
    return questions.filter((q) => q.surveyId === surveyId).sort((a, b) => a.order - b.order);
  }

  static saveSurvey(survey: Survey, questions: SurveyQuestion[]) {
    this.initialize();
    const surveys = this.getSurveys();
    const existingIndex = surveys.findIndex((s) => s.id === survey.id);
    if (existingIndex >= 0) {
      surveys[existingIndex] = { ...survey, updatedAt: new Date().toLocaleString('vi-VN') };
    } else {
      surveys.push(survey);
    }
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));

    const allQuestionsData = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let allQuestions: SurveyQuestion[] = allQuestionsData ? JSON.parse(allQuestionsData) : [];
    allQuestions = allQuestions.filter((q) => q.surveyId !== survey.id);
    allQuestions.push(...questions);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(allQuestions));
  }

  static deleteSurvey(id: string) {
    this.initialize();
    const surveys = this.getSurveys().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));

    const questionsData = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const questions: SurveyQuestion[] = questionsData ? JSON.parse(questionsData) : [];
    const filteredQuestions = questions.filter((q) => q.surveyId !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filteredQuestions));

    const responsesData = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const responses: SurveyResponse[] = responsesData ? JSON.parse(responsesData) : [];
    const filteredResponses = responses.filter((r) => r.surveyId !== id);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(filteredResponses));
  }

  static getResponses(surveyId: string): SurveyResponse[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const responses: SurveyResponse[] = data ? JSON.parse(data) : [];
    return responses.filter((r) => r.surveyId === surveyId);
  }

  static saveResponse(response: SurveyResponse) {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const responses: SurveyResponse[] = data ? JSON.parse(data) : [];
    responses.push(response);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  }
}

// ==========================================
// LÂN SƯ RỒNG BRAND SURVEY SERVICE LAYER
// ==========================================

import { supabase, isSupabaseConfigured } from './supabaseClient';

const INITIAL_BRAND_SUBMISSIONS: BrandSurveySubmission[] = [];

const INITIAL_BRAND_COUNTERS: Record<string, number> = {
  'QT-LĐ': 0,
  'CĐ-TH': 0,
  'CG-MT': 0,
  'CG-TK': 0,
  'KG-ĐT': 0,
};

export class BrandSurveyService {
  private static initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.BRAND_SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.BRAND_SUBMISSIONS, JSON.stringify(INITIAL_BRAND_SUBMISSIONS));
      localStorage.setItem(STORAGE_KEYS.BRAND_COUNTERS, JSON.stringify(INITIAL_BRAND_COUNTERS));
    }
  }

  // Get next participant code without incrementing it in database (prevents skipping indices if tab is closed)
  static async getNextParticipantCode(groupCode: string): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const { count, error } = await supabase
          .from('lan_su_rong_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('group_code', groupCode);
        
        if (error) throw error;
        return `${groupCode}-${(count || 0) + 1}`;
      } catch (e) {
        console.error('Error fetching count from Supabase, falling back to local counter:', e);
      }
    }

    this.initialize();
    const countersData = localStorage.getItem(STORAGE_KEYS.BRAND_COUNTERS);
    const counters: Record<string, number> = countersData ? JSON.parse(countersData) : {};
    
    const currentCount = counters[groupCode] || 0;
    return `${groupCode}-${currentCount + 1}`;
  }

  // Save the final survey submission and increment the group order index
  static async saveSubmission(submission: BrandSurveySubmission): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const row = {
          participant_code: submission.participant.code,
          group_code: submission.participant.groupCode,
          full_name: submission.participant.fullName || null,
          title_unit: submission.participant.titleUnit || null,
          participation_form: submission.participant.participationForm,
          consent_agreed: submission.participant.consentAgreed,
          consent_record: submission.participant.consentRecord,
          likert_answers: submission.likertAnswers,
          interview_answers: submission.interviewAnswers,
          submitted_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('lan_su_rong_submissions')
          .insert(row);
        
        if (error) throw error;
        console.log('Successfully saved submission to Supabase.');
        return;
      } catch (e) {
        console.error('Error inserting row in Supabase, saving locally:', e);
      }
    }

    this.initialize();
    
    // Save submission
    const submissions = this.getSubmissionsLocal();
    submissions.push(submission);
    localStorage.setItem(STORAGE_KEYS.BRAND_SUBMISSIONS, JSON.stringify(submissions));

    // Increment corresponding group counter
    const countersData = localStorage.getItem(STORAGE_KEYS.BRAND_COUNTERS);
    const counters: Record<string, number> = countersData ? JSON.parse(countersData) : {};
    
    const groupCode = submission.participant.groupCode;
    const currentNumberStr = submission.participant.code.split('-').pop() || '1';
    const currentNumber = parseInt(currentNumberStr, 10);
    
    counters[groupCode] = Math.max(counters[groupCode] || 0, currentNumber);
    localStorage.setItem(STORAGE_KEYS.BRAND_COUNTERS, JSON.stringify(counters));
  }

  // Upload recorded audio to Supabase Storage bucket 'lan_su_rong_audios'
  static async uploadAudio(fileName: string, audioBlob: Blob): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9_\.-]/g, '_');
      const { data, error } = await supabase.storage
        .from('lan_su_rong_audios')
        .upload(`interviews/${cleanFileName}`, audioBlob, {
          contentType: 'audio/wav',
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('lan_su_rong_audios')
        .getPublicUrl(data.path);
        
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Audio upload error:', e);
      return null;
    }
  }

  // Retrieve all submitted answers
  static async getSubmissions(): Promise<BrandSurveySubmission[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('lan_su_rong_submissions')
          .select('*')
          .order('submitted_at', { ascending: true });
        
        if (error) throw error;
        
        return (data || []).map((row) => ({
          id: row.id,
          participant: {
            id: row.id,
            code: row.participant_code,
            groupCode: row.group_code,
            fullName: row.full_name || undefined,
            titleUnit: row.title_unit || undefined,
            participationForm: row.participation_form,
            consentAgreed: row.consent_agreed,
            consentRecord: row.consent_record,
            createdAt: new Date(row.submitted_at).toLocaleString('vi-VN'),
          },
          likertAnswers: row.likert_answers,
          interviewAnswers: row.interview_answers,
          submittedAt: new Date(row.submitted_at).toLocaleString('vi-VN'),
        }));
      } catch (e) {
        console.error('Error fetching submissions from Supabase, loading local ones:', e);
      }
    }

    return this.getSubmissionsLocal();
  }

  private static getSubmissionsLocal(): BrandSurveySubmission[] {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEYS.BRAND_SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  }

  // Clear all submissions to reset prototype stats
  static resetSubmissions() {
    localStorage.setItem(STORAGE_KEYS.BRAND_SUBMISSIONS, JSON.stringify(INITIAL_BRAND_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.BRAND_COUNTERS, JSON.stringify(INITIAL_BRAND_COUNTERS));
  }
}
