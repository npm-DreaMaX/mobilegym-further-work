import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaobaoStore } from '../state';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { IcNavBack, IcAlert } from '../res/icons';
import type { Address } from '../types';

const AddressEditPage: React.FC = () => {
  const s = useTaobaoStrings();
  const { bindBack, back } = useTaobaoGestures();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const addresses = useTaobaoStore(st => st.addresses) as Address[];
  const addAddress = useTaobaoStore(st => st.addAddress);
  const updateAddress = useTaobaoStore(st => st.updateAddress);

  const existingAddress = useMemo(() => {
    if (!editId) return null;
    return addresses.find(a => a.id === editId) ?? null;
  }, [editId, addresses]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill when editing
  useEffect(() => {
    if (existingAddress) {
      setName(existingAddress.name);
      setPhone(existingAddress.phone);
      setProvince(existingAddress.province);
      setCity(existingAddress.city);
      setDistrict(existingAddress.district);
      setDetail(existingAddress.detail);
      setIsDefault(existingAddress.isDefault);
    }
  }, [existingAddress]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError(s.address_name + '不能为空');
      return false;
    }
    if (!phone.trim()) {
      setError(s.address_phone + '不能为空');
      return false;
    }
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError('请输入正确的手机号');
      return false;
    }
    if (!province.trim()) {
      setError(s.address_province + '不能为空');
      return false;
    }
    if (!city.trim()) {
      setError(s.address_city + '不能为空');
      return false;
    }
    if (!district.trim()) {
      setError(s.address_district + '不能为空');
      return false;
    }
    if (!detail.trim()) {
      setError(s.address_detail + '不能为空');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editId && existingAddress) {
      updateAddress(editId, {
        name: name.trim(),
        phone: phone.trim(),
        province: province.trim(),
        city: city.trim(),
        district: district.trim(),
        detail: detail.trim(),
        isDefault,
      });
    } else {
      addAddress({
        name: name.trim(),
        phone: phone.trim(),
        province: province.trim(),
        city: city.trim(),
        district: district.trim(),
        detail: detail.trim(),
        isDefault,
      });
    }

    back();
  };

  const pageTitle = editId ? s.address_edit : s.address_add;

  return (
    <div className="h-full w-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 flex items-center border-b border-gray-100">
        <button {...bindBack()} className="mr-3 p-1 -ml-1">
          <IcNavBack size={22} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">{pageTitle}</h1>
      </div>

      <div data-scroll-container="main" data-scroll-direction="vertical" className="flex-1 overflow-y-auto">
        {/* Form */}
        <div className="bg-white mt-3 mx-3 rounded-lg overflow-hidden">
          {/* Name */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0">{s.address_name}</label>
            <input
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="请输入收货人姓名"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0">{s.address_phone}</label>
            <input
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="请输入手机号"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Province */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0">{s.address_province}</label>
            <input
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="请输入省/直辖市"
              value={province}
              onChange={e => setProvince(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0">{s.address_city}</label>
            <input
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="请输入市"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>

          {/* District */}
          <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0">{s.address_district}</label>
            <input
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
              placeholder="请输入区/县"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </div>

          {/* Detail */}
          <div className="flex items-start border-b border-gray-100 px-4 py-3.5">
            <label className="w-20 text-sm text-gray-600 flex-shrink-0 pt-0.5">{s.address_detail}</label>
            <textarea
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent resize-none min-h-[48px]"
              placeholder="请输入详细地址（街道、门牌号等）"
              value={detail}
              onChange={e => setDetail(e.target.value)}
            />
          </div>

          {/* Is default */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-gray-600">设为默认地址</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-orange-400 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-3 mt-3 px-4 py-3 bg-red-50 rounded-lg flex items-center gap-2">
            <IcAlert size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-500">{error}</span>
          </div>
        )}

        {/* Save button */}
        <div className="px-3 mt-6">
          <button
            className="w-full py-3 bg-orange-500 text-white text-sm font-medium rounded-lg active:bg-orange-600"
            onClick={handleSave}
            data-action="addressEdit.form.save.submit"
          >
            {s.address_save}
          </button>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default AddressEditPage;
