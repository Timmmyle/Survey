import React, { useState } from 'react';
import { CandidateInfo } from '../types';
import { User, Phone, Mail, Calendar, Briefcase, ChevronRight } from 'lucide-react';

interface CandidateFormProps {
  positions: string[];
  onSubmit: (info: CandidateInfo) => void;
  initialInfo?: CandidateInfo;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  positions,
  onSubmit,
  initialInfo,
}) => {
  const [formData, setFormData] = useState<CandidateInfo>(
    initialInfo || {
      firstName: '',
      lastName: '',
      position: positions[0] || '',
      phone: '',
      email: '',
      interviewDate: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Họ không được bỏ trống';
    if (!formData.lastName.trim()) newErrors.lastName = 'Tên không được bỏ trống';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được bỏ trống';
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được bỏ trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-800">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Interview Evaluation System</h1>
        <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
          Chào mừng ứng viên. Vui lòng hoàn thành biểu mẫu bên dưới với thông tin liên hệ chính xác và vị trí mong muốn ứng tuyển trước khi bắt đầu phỏng vấn.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Điền thông tin cá nhân</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Họ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Nhập họ ứng viên"
              className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all duration-200 ${
                errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
          </div>

          {/* Last name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Nhập tên ứng viên"
              className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all duration-200 ${
                errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              Vị trí ứng tuyển <span className="text-red-500">*</span>
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white cursor-pointer font-medium text-slate-700"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Interview Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Ngày phỏng vấn
            </label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm text-slate-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại liên lạc"
              className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all duration-200 ${
                errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5 mt-4">
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-md shadow-indigo-100"
          >
            Xác nhận thông tin
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

