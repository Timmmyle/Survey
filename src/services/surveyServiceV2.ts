/*
 * ============================================================
 * SUPABASE V2 — SQL SETUP (run this in your V2 project's SQL Editor)
 * ============================================================
 *
 * TABLE: lan_su_rong_v2_submissions
 * Storage buckets needed:
 *   - brand_identity_images  (public)
 *   - lan_su_rong_v2_audios  (public)
 *
 * CREATE TABLE IF NOT EXISTS lan_su_rong_v2_submissions (
 *   id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   participant_code       text UNIQUE NOT NULL,
 *   group_code             text NOT NULL,
 *   phieu_id               text NOT NULL,
 *   full_name              text,
 *   title_unit             text,
 *   speciality             text,
 *   years_exp              text,
 *   has_participated_before boolean,
 *   independence_confirmed boolean DEFAULT false,
 *   consent_agreed         boolean DEFAULT false,
 *   consent_record         boolean,
 *   semantic_answers       jsonb DEFAULT '{}',
 *   open_answers           jsonb DEFAULT '{}',
 *   interview_answers      jsonb DEFAULT '{}',
 *   recognition_answers    jsonb DEFAULT '{}',
 *   submitted_at           timestamptz DEFAULT now()
 * );
 * ALTER TABLE lan_su_rong_v2_submissions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow anon insert" ON lan_su_rong_v2_submissions FOR INSERT TO anon WITH CHECK (true);
 * CREATE POLICY "Allow anon select" ON lan_su_rong_v2_submissions FOR SELECT TO anon USING (true);
 * CREATE POLICY "Allow anon update" ON lan_su_rong_v2_submissions FOR UPDATE TO anon USING (true);
 *
 * ============================================================
 */

import { supabaseV2, isSupabaseV2Configured } from './supabaseClient';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface V2SemanticAnswer {
  value: number | null; // 1-5, or null = "Không đủ cơ sở đánh giá"
  note: string;
}

export interface V2Submission {
  id: string;
  participantCode: string;
  groupCode: string;
  phieuId: string;
  fullName?: string;
  titleUnit?: string;
  speciality?: string;
  yearsExp?: string;
  hasParticipatedBefore?: boolean;
  independenceConfirmed: boolean;
  consentAgreed: boolean;
  consentRecord: boolean;
  semanticAnswers: Record<string, V2SemanticAnswer>;    // D1, D2... → {value, note}
  openAnswers: Record<string, string>;                   // Part C open text
  interviewAnswers: Record<string, { text: string; audioUrl: string | null }>;
  recognitionAnswers?: Record<string, string>;           // Phiếu 5 recognition choices
  submittedAt: string;
}

// ==========================================
// LOCAL STORAGE KEYS (fallback)
// ==========================================
const LS_KEY_V2 = 'lan_su_rong_v2_submissions';
const LS_COUNTERS_V2 = 'lan_su_rong_v2_counters';

const INITIAL_COUNTERS: Record<string, number> = {
  'CG-MT': 0,
  'CG-TK': 0,
  'QT-LĐ': 0,
  'CĐ-TH': 0,
  'KG-ĐT': 0,
};

// ==========================================
// V2 SURVEY SERVICE
// ==========================================

export class BrandSurveyV2Service {

  // ---- Participant Code ----
  static async getNextParticipantCode(groupCode: string): Promise<string> {
    if (isSupabaseV2Configured()) {
      try {
        const { count, error } = await supabaseV2
          .from('lan_su_rong_v2_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('group_code', groupCode);
        if (error) throw error;
        return `${groupCode}-V2-${(count || 0) + 1}`;
      } catch (e) {
        console.error('[V2] Count error, fallback local:', e);
      }
    }
    const raw = localStorage.getItem(LS_COUNTERS_V2);
    const counters: Record<string, number> = raw ? JSON.parse(raw) : { ...INITIAL_COUNTERS };
    return `${groupCode}-V2-${(counters[groupCode] || 0) + 1}`;
  }

  // ---- Save Submission ----
  static async saveSubmission(submission: V2Submission): Promise<void> {
    if (isSupabaseV2Configured()) {
      try {
        const row = {
          participant_code: submission.participantCode,
          group_code: submission.groupCode,
          phieu_id: submission.phieuId,
          full_name: submission.fullName || null,
          title_unit: submission.titleUnit || null,
          speciality: submission.speciality || null,
          years_exp: submission.yearsExp || null,
          has_participated_before: submission.hasParticipatedBefore ?? null,
          independence_confirmed: submission.independenceConfirmed,
          consent_agreed: submission.consentAgreed,
          consent_record: submission.consentRecord,
          semantic_answers: submission.semanticAnswers,
          open_answers: submission.openAnswers,
          interview_answers: submission.interviewAnswers,
          recognition_answers: submission.recognitionAnswers || {},
          submitted_at: new Date().toISOString(),
        };
        const { error } = await supabaseV2
          .from('lan_su_rong_v2_submissions')
          .upsert(row, { onConflict: 'participant_code' });
        if (error) throw error;
        console.log('[V2] Submission saved to Supabase V2.');
        return;
      } catch (e) {
        console.error('[V2] Supabase insert error, saving locally:', e);
      }
    }

    // Local Storage fallback
    const raw = localStorage.getItem(LS_KEY_V2);
    const submissions: V2Submission[] = raw ? JSON.parse(raw) : [];
    const idx = submissions.findIndex(s => s.participantCode === submission.participantCode);
    if (idx >= 0) submissions[idx] = submission;
    else submissions.push(submission);
    localStorage.setItem(LS_KEY_V2, JSON.stringify(submissions));

    // Increment counter
    const rawC = localStorage.getItem(LS_COUNTERS_V2);
    const counters: Record<string, number> = rawC ? JSON.parse(rawC) : { ...INITIAL_COUNTERS };
    const num = parseInt(submission.participantCode.split('-V2-').pop() || '1', 10);
    counters[submission.groupCode] = Math.max(counters[submission.groupCode] || 0, num);
    localStorage.setItem(LS_COUNTERS_V2, JSON.stringify(counters));
  }

  // ---- Get All Submissions ----
  static async getSubmissions(): Promise<V2Submission[]> {
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
          fullName: row.full_name || undefined,
          titleUnit: row.title_unit || undefined,
          speciality: row.speciality || undefined,
          yearsExp: row.years_exp || undefined,
          hasParticipatedBefore: row.has_participated_before ?? undefined,
          independenceConfirmed: row.independence_confirmed,
          consentAgreed: row.consent_agreed,
          consentRecord: row.consent_record,
          semanticAnswers: row.semantic_answers || {},
          openAnswers: row.open_answers || {},
          interviewAnswers: row.interview_answers || {},
          recognitionAnswers: row.recognition_answers || {},
          submittedAt: new Date(row.submitted_at).toLocaleString('vi-VN'),
        }));
      } catch (e) {
        console.error('[V2] Fetch error, loading local:', e);
      }
    }
    const raw = localStorage.getItem(LS_KEY_V2);
    return raw ? JSON.parse(raw) : [];
  }

  // ---- Image URL from V2 Storage ----
  static getImageUrl(fileName: string): string {
    if (!isSupabaseV2Configured()) return '';
    const { data } = supabaseV2.storage
      .from('brand_identity_images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  // ---- Upload Image (admin) ----
  static async uploadImage(fileName: string, file: File): Promise<{ url: string | null; error: string | null }> {
    if (!isSupabaseV2Configured()) {
      return { url: null, error: 'Supabase V2 chưa được cấu hình.' };
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
      return { url: null, error: e.message || 'Upload thất bại.' };
    }
  }

  // ---- List Images in Storage ----
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

  // ---- Delete Image ----
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

  // ---- Reset (admin dev tool) ----
  static resetLocalSubmissions(): void {
    localStorage.removeItem(LS_KEY_V2);
    localStorage.removeItem(LS_COUNTERS_V2);
  }

  // ---- Upload Audio (interview recording) ----
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
