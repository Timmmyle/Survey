import React, { useState } from 'react';
import { CandidateInfo } from '../types';
import { Edit2, Save, User, Briefcase, Phone, Mail, Calendar, X } from 'lucide-react';

interface CandidateInfoCardProps {
  candidate: CandidateInfo;
  positions: string[];
  onUpdate: (updatedCandidate: CandidateInfo) => void;
}

export const CandidateInfoCard: React.FC<CandidateInfoCardProps> = ({
  candidate,
  positions,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<CandidateInfo>({ ...candidate });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdited((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!edited.firstName.trim()) newErrors.firstName = 'Họ không được bỏ trống';
    if (!edited.lastName.trim()) newErrors.lastName = 'Tên không được bỏ trống';
    if (!edited.email.trim()) {
      newErrors.email = 'Email không được bỏ trống';
    } else if (!/\S+@\S+\.\S+/.test(edited.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!edited.phone.trim()) newErrors.phone = 'Số điện thoại không được bỏ trống';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(edited);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEdited({ ...candidate });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-lg">Thông tin ứng viên</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm rounded-lg transition-colors cursor-pointer font-medium"
            >
              <Save className="h-4 w-4" />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-sm rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Họ</label>
              <input
                type="text"
                name="firstName"
                value={edited.firstName}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tên</label>
              <input
                type="text"
                name="lastName"
                value={edited.lastName}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vị trí tuyển dụng</label>
              <select
                name="position"
                value={edited.position}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white"
              >
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Ngày phỏng vấn</label>
              <input
                type="date"
                name="interviewDate"
                value={edited.interviewDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={edited.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={edited.phone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                  errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ứng viên</p>
                <p className="font-semibold text-slate-800 text-base">{candidate.firstName} {candidate.lastName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vị trí ứng tuyển</p>
                <p className="font-semibold text-slate-800 text-base">{candidate.position}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
                <p className="text-slate-700 font-medium text-sm">{candidate.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Số điện thoại</p>
                <p className="text-slate-700 font-medium text-sm">{candidate.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-100 pt-3 mt-1">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ngày phỏng vấn</p>
                <p className="text-slate-700 font-medium text-sm">
                  {candidate.interviewDate
                    ? new Date(candidate.interviewDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Chưa được lên lịch'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

