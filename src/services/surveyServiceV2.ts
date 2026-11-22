import { supabaseV2, isSupabaseV2Configured } from './supabaseClient';

// ==========================================
// SQL SETUP INSTRUCTIONS FOR SUPABASE V2
// ==========================================
/*
CREATE TABLE IF NOT EXISTS lan_su_rong_v2_submissions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_code       text UNIQUE NOT NULL,
  group_code             text NOT NULL,
  phieu_id               text NOT NULL,
  dot                    text DEFAULT 'Kiem_chung',
  ma_dot_1               text,
  full_name              text,
  title_unit             text,
  speciality             text,
  years_exp              text,
  has_participated_before boolean,
  has_seen_new_logo      boolean,
  has_seen_hue_lion      text,
  independence_confirmed boolean DEFAULT false,
  consent_agreed         boolean DEFAULT false,
  consent_record         boolean,
  answers                jsonb DEFAULT '{}',
  open_answers           jsonb DEFAULT '{}',
  interview_answers      jsonb DEFAULT '{}',
  submitted_at           timestamptz DEFAULT now()
);

ALTER TABLE lan_su_rong_v2_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON lan_su_rong_v2_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select" ON lan_su_rong_v2_submissions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon update" ON lan_su_rong_v2_submissions FOR UPDATE TO anon USING (true);

-- BUCKET POLICIES FOR brand_identity_images & lan_su_rong_v2_audios:
CREATE POLICY "Allow anon upload brand images" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'brand_identity_images');
CREATE POLICY "Allow anon select brand images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'brand_identity_images');
CREATE POLICY "Allow anon delete brand images" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'brand_identity_images');
CREATE POLICY "Allow anon upload audios" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'lan_su_rong_v2_audios');
CREATE POLICY "Allow anon select audios" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'lan_su_rong_v2_audios');
*/

export interface V2SubmissionRecord {
  id: string;
  participantCode: string; // e.g. KC-CG-MT-01
  groupCode: string;
  phieuId: string;
  dot: string; // 'Kiem_chung'
  maDot1?: string;
  profile: {
    fullName?: string;
    titleUnit?: string;
    speciality?: string;
    yearsExp?: string;
    hasParticipatedBefore?: boolean;
    hasSeenNewLogo?: boolean;
    hasSeenHueLion?: string;
    independenceConfirmed?: boolean;
    frequencyLSR?: string;
  };
  consentAgreed: boolean;
  consentRecord: boolean;
  answers: Record<string, any>; // maps question IDs (D1, D2, N1, N2, NB1, etc.) to values
  notes: Record<string, string>; // maps question IDs to notes
  openAnswers: Record<string, string>; // Part C/D/E open questions
  interviewAnswers: Record<string, { text: string; audioUrl: string | null }>;
  submittedAt: string;
}

const LS_KEY_V2 = 'lan_su_rong_v2_submissions';
const LS_COUNTERS_V2 = 'lan_su_rong_v2_counters';

const INITIAL_COUNTERS: Record<string, number> = {
  'CG-MT': 0,
  'CG-TK': 0,
  'QT-LD': 0,
  'CD-TH': 0,
  'KG-DT': 0,
};

export class BrandSurveyV2Service {

  // Generates code with prefix KC-, formatted with 2 digits: KC-CG-MT-01
  static async getNextParticipantCode(groupCode: string): Promise<string> {
    const cleanGroup = groupCode.replace('QT-LĐ', 'QT-LD').replace('CĐ-TH', 'CD-TH').replace('KG-ĐT', 'KG-DT');
    
    if (isSupabaseV2Configured()) {
      try {
        const { count, error } = await supabaseV2
          .from('lan_su_rong_v2_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('group_code', cleanGroup);
        if (error) throw error;
        const nextNum = (count || 0) + 1;
        const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
        return `KC-${cleanGroup}-${padded}`;
      } catch (e) {
        console.error('[V2] Count error, falling back to local counter:', e);
      }
    }

    const raw = localStorage.getItem(LS_COUNTERS_V2);
    const counters: Record<string, number> = raw ? JSON.parse(raw) : { ...INITIAL_COUNTERS };
    const nextNum = (counters[cleanGroup] || 0) + 1;
    const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    return `KC-${cleanGroup}-${padded}`;
  }

  // Save submission
  static async saveSubmission(submission: V2SubmissionRecord): Promise<void> {
    if (isSupabaseV2Configured()) {
      try {
        const row = {
          participant_code: submission.participantCode,
          group_code: submission.groupCode,
          phieu_id: submission.phieuId,
          dot: 'Kiem_chung',
          ma_dot_1: submission.maDot1 || null,
          full_name: submission.profile.fullName || null,
          title_unit: submission.profile.titleUnit || null,
          speciality: submission.profile.speciality || null,
          years_exp: submission.profile.yearsExp || null,
          has_participated_before: submission.profile.hasParticipatedBefore ?? null,
          has_seen_new_logo: submission.profile.hasSeenNewLogo ?? null,
          has_seen_hue_lion: submission.profile.hasSeenHueLion || null,
          independence_confirmed: submission.profile.independenceConfirmed ?? false,
          consent_agreed: submission.consentAgreed,
          consent_record: submission.consentRecord,
          answers: { ...submission.answers, _notes: submission.notes },
          open_answers: submission.openAnswers,
          interview_answers: submission.interviewAnswers,
          submitted_at: new Date().toISOString(),
        };

        const { error } = await supabaseV2
          .from('lan_su_rong_v2_submissions')
          .upsert(row, { onConflict: 'participant_code' });
        
        if (error) {
          console.error('[V2 Supabase Error Details]:', error.message, error.details, error.hint, error.code);
          throw error;
        }
        console.log('[V2] Saved to Supabase V2 successfully.');
        return;
      } catch (e: any) {
        console.error('[V2] Error saving to Supabase V2, falling back to LocalStorage:', e?.message || e);
      }
    }

    // LocalStorage fallback
    const raw = localStorage.getItem(LS_KEY_V2);
    const list: V2SubmissionRecord[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(s => s.participantCode === submission.participantCode);
    if (idx >= 0) list[idx] = submission;
    else list.push(submission);
    localStorage.setItem(LS_KEY_V2, JSON.stringify(list));

    // Update local counter
    const rawC = localStorage.getItem(LS_COUNTERS_V2);
    const counters: Record<string, number> = rawC ? JSON.parse(rawC) : { ...INITIAL_COUNTERS };
    const num = parseInt(submission.participantCode.split('-').pop() || '1', 10);
    counters[submission.groupCode] = Math.max(counters[submission.groupCode] || 0, num);
    localStorage.setItem(LS_COUNTERS_V2, JSON.stringify(counters));
  }

  // Get all submissions
  static async getSubmissions(): Promise<V2SubmissionRecord[]> {
    if (isSupabaseV2Configured()) {
      try {
        const { data, error } = await supabaseV2
          .from('lan_su_rong_v2_submissions')
          .select('*')
          .order('submitted_at', { ascending: true });
        
        if (error) throw error;
        return (data || []).map(row => ({
          id: row.id,
          participantCode: row.participant_code,
          groupCode: row.group_code,
          phieuId: row.phieu_id,
          dot: row.dot || 'Kiem_chung',
          maDot1: row.ma_dot_1 || undefined,
          profile: {
            fullName: row.full_name || undefined,
            titleUnit: row.title_unit || undefined,
            speciality: row.speciality || undefined,
            yearsExp: row.years_exp || undefined,
            hasParticipatedBefore: row.has_participated_before ?? undefined,
            hasSeenNewLogo: row.has_seen_new_logo ?? undefined,
            hasSeenHueLion: row.has_seen_hue_lion || undefined,
            independenceConfirmed: row.independence_confirmed ?? false,
          },
          consentAgreed: row.consent_agreed,
          consentRecord: row.consent_record,
          answers: row.answers || {},
          notes: (row.answers && row.answers._notes) || {},
          openAnswers: row.open_answers || {},
          interviewAnswers: row.interview_answers || {},
          submittedAt: new Date(row.submitted_at).toLocaleString('vi-VN'),
        }));
      } catch (e) {
        console.error('[V2] Fetch error, loading local:', e);
      }
    }

    const raw = localStorage.getItem(LS_KEY_V2);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((item: any) => ({
            ...item,
            profile: item.profile || {},
            answers: item.answers || {},
            openAnswers: item.openAnswers || {},
            interviewAnswers: item.interviewAnswers || {},
          }))
        : [];
    } catch {
      return [];
    }
  }

  // Smart image URL lookup
  static getImageUrl(fileName: string): string {
    if (!isSupabaseV2Configured()) return '';
    const { data } = supabaseV2.storage
      .from('brand_identity_images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  // Upload image to Supabase V2 storage
  static async uploadImage(fileName: string, file: File): Promise<{ url: string | null; error: string | null }> {
    if (!isSupabaseV2Configured()) {
      return { url: null, error: 'Database Supabase V2 chưa được cấu hình trong .env.' };
    }
    try {
      const cleanName = fileName.replace(/[^a-zA-Z0-9_.\-]/g, '_');
      const { data, error } = await supabaseV2.storage
        .from('brand_identity_images')
        .upload(cleanName, file, {
          contentType: file.type || 'image/png',
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw error;
      const { data: urlData } = supabaseV2.storage
        .from('brand_identity_images')
        .getPublicUrl(data.path);
      return { url: urlData.publicUrl, error: null };
    } catch (e: any) {
      console.error('[V2] Upload error:', e);
      return { url: null, error: e.message || 'Lỗi khi tải ảnh lên.' };
    }
  }

  // List images
  static async listImages(): Promise<{ name: string; url: string }[]> {
    if (!isSupabaseV2Configured()) return [];
    try {
      const { data, error } = await supabaseV2.storage
        .from('brand_identity_images')
        .list('', { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      return (data || []).map(item => ({
        name: item.name,
        url: BrandSurveyV2Service.getImageUrl(item.name),
      }));
    } catch (e) {
      console.error('[V2] List images error:', e);
      return [];
    }
  }

  // Delete image
  static async deleteImage(fileName: string): Promise<boolean> {
    if (!isSupabaseV2Configured()) return false;
    try {
      const { error } = await supabaseV2.storage
        .from('brand_identity_images')
        .remove([fileName]);
      return !error;
    } catch {
      return false;
    }
  }

  // Reset local submissions (dev)
  static resetLocalSubmissions(): void {
    localStorage.removeItem(LS_KEY_V2);
    localStorage.removeItem(LS_COUNTERS_V2);
  }

  // Upload interview audio
  static async uploadAudio(fileName: string, audioBlob: Blob): Promise<string | null> {
    if (!isSupabaseV2Configured()) return null;
    try {
      const clean = fileName.replace(/[^a-zA-Z0-9_.\-]/g, '_');
      const { data, error } = await supabaseV2.storage
        .from('lan_su_rong_v2_audios')
        .upload(`interviews/${clean}`, audioBlob, {
          contentType: audioBlob.type || 'audio/wav',
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw error;
      const { data: urlData } = supabaseV2.storage
        .from('lan_su_rong_v2_audios')
        .getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (e) {
      console.error('[V2] Audio upload error:', e);
      return null;
    }
  }
}
